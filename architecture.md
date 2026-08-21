# Architecture — Opportunity Discovery & Matching Platform (MVP)

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind + shadcn/ui | Student, Recruiter, Admin all live in one app, route-gated by role |
| Backend | Next.js Server Actions / Route Handlers | No separate API server needed for MVP |
| Auth | **Supabase Auth** | Email/password + role stored in `profiles.role` |
| Database | **Supabase Postgres** | Single managed Postgres instance |
| Vector search | **Supabase pgvector extension** | Same Postgres instance, no separate vector DB |
| File storage | **Supabase Storage** | Resume/CV uploads (kept even though auto-parsing is deferred), org logos |
| Embeddings | Pluggable provider (Ollama locally / hosted embedding API in prod) | Abstracted behind one function — see §4 |
| Background jobs | Supabase Edge Functions + `pg_cron` | Runs matching job on opportunity publish, handles deadline expiry sweep |
| Email | Transactional email provider (Resend / Postmark / SES) | Triggered from Edge Function after match created |

Dropping the custom Postgres+pgvector self-hosting from the original plan
and using Supabase for both cuts infra work to near-zero for MVP — auth,
DB, vector index, storage, and cron all live in one managed service.

---

## 2. High-Level System Diagram

```
                         NEXT.JS APP
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                      │
        ▼                     ▼                      ▼
   Student UI           Recruiter UI            Admin UI
        │                     │                      │
        └──────────────┬──────┴──────────┬───────────┘
                        │                 │
                        ▼                 ▼
                 Supabase Auth     Supabase Postgres
                        │                 │
                        │        ┌────────┴────────┐
                        │        ▼                 ▼
                        │    pgvector          Row-level
                        │   (embeddings)        Security
                        │        │
                        └────────┼──────────────────┐
                                 ▼                   ▼
                        Embedding Provider     Supabase Storage
                        (Ollama / hosted)       (CV/logo files)
                                 │
                                 ▼
                     Edge Function: Matching Engine
                                 │
                                 ▼
                     Edge Function: Email Sender
                                 │
                                 ▼
                        Transactional Email API
                                 │
                                 ▼
                             Student
```

---

## 3. Data Flow — Manual Opportunity → Match → Email

```
Recruiter submits Opportunity (status=submitted)
        │
        ▼
Admin approves (status=published)
        │
        ▼
DB trigger / Edge Function fires: "opportunity.published"
        │
        ▼
Generate opportunity embedding (title+description+requirements → vector)
        │
        ▼
Query: students whose preferences.opportunity_types includes this type
        │
        ▼
For each candidate student:
    Hard Eligibility Check (SQL — GPA/degree/experience/year, all indexed columns)
        │  PASS
        ▼
    Semantic Score = cosine_similarity(opportunity_vector, student_vector)  [pgvector]
        │
        ▼
    Final Score = weighted(eligibility=binary gate, semantic, skill_overlap)
        │
        ▼
    Final Score >= student.min_match_threshold ?
        │ YES
        ▼
    Insert row into `matches`
        │
        ▼
    Dedup check against `email_log` (student_id, opportunity_id)
        │ not yet sent
        ▼
    Send personalized email → log to `email_log`
```

This entire flow is one Edge Function triggered on the Postgres row
`UPDATE opportunities SET status = 'published'`, using a Postgres trigger
→ `pg_net`/webhook → Edge Function. No separate job queue needed at MVP
scale.

---

## 4. Embedding Provider Abstraction

Do not hard-code a specific embedding model or vendor. One interface,
swappable implementation:

```ts
// lib/embeddings.ts
interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

// Local dev: OllamaProvider (OLLAMA_BASE_URL, OLLAMA_EMBEDDING_MODEL)
// Prod: HostedProvider (any API returning fixed-dim vectors)
```

Vector dimension must match the `pgvector` column definition
(`vector(N)`) — pick this once based on the chosen model and keep it
consistent between student and opportunity embeddings, since cosine
similarity requires matching dimensionality.

---

## 5. Role-Gated Routing (Next.js)

```
/app
  /(student)
    /onboarding          → profile builder + preferences wizard
    /dashboard            → match list
    /opportunities/[id]   → match explanation view
  /(recruiter)
    /recruiter/onboarding → org signup, pending-approval state
    /recruiter/dashboard  → opportunity list + metrics
    /recruiter/opportunities/new    → Create Opportunity form
    /recruiter/opportunities/[id]/edit
  /(admin)
    /admin/recruiters     → approval queue
    /admin/opportunities  → review queue + global management
    /admin/users          → student/recruiter management
    /admin/metrics        → platform KPIs
```

Middleware checks `profiles.role` (student/recruiter/admin) on every
route group and redirects unauthorized access. Recruiter routes
additionally check `profiles.recruiter_status = 'approved'` before
allowing opportunity publishing (drafts still allowed pre-approval).

---

## 6. Reserved Slot for the Scraper (Phase 2)

The scraper is deliberately **not built now**, but the schema and
pipeline are shaped so it drops in without redesign:

```
                 ┌─────────────────────────┐
                 │   opportunities table    │
                 └─────────────────────────┘
                      ▲                ▲
                      │                │
        ┌─────────────┘                └─────────────┐
        │                                             │
 Recruiter Dashboard                         Scraper Pipeline (later)
 (manual entry, MVP)                    (Source → Fetch → Extract →
        │                                Normalize → same schema)
        │                                             │
        └───────────────────┬────────────────────────┘
                             ▼
                  Admin Review Queue
             (same table for both origins,
              opportunities.source = 'recruiter' | 'scraper')
                             ▼
                   Published → Matching Engine
```

Key design choice enabling this: `opportunities.source_type` column
(`manual` / `scraped`) and `opportunities.source_id` (nullable FK to a
future `opportunity_sources` table). The matching engine, admin review
queue, and email pipeline are all indifferent to where the opportunity
came from — they only read from `opportunities` once it's `published`.
When the scraper is built, it writes into the same table with
`status='submitted'` and flows through the exact same admin review →
publish → match pipeline already in place.

---

## 7. Environment Configuration

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

EMBEDDING_PROVIDER=ollama | hosted
OLLAMA_BASE_URL=
OLLAMA_EMBEDDING_MODEL=
HOSTED_EMBEDDING_API_KEY=
HOSTED_EMBEDDING_API_URL=

EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=

DEFAULT_MATCH_THRESHOLD=92
```

---

## 8. Security Notes

- **Row-Level Security (RLS)** on all Supabase tables from day one:
  students can only read/write their own profile rows; recruiters can
  only read/write opportunities where `recruiter_id = auth.uid()`;
  admin role bypasses via a service-role check.
- Recruiter-submitted opportunities are **never auto-published** — admin
  approval gate is a security/spam control as much as a quality control.
- CV/resume files in Supabase Storage are private buckets, signed URLs
  only.
