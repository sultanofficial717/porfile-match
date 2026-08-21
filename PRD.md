# PRD — Opportunity Discovery & Matching Platform (MVP v0.1)

## 1. Scope of this MVP

This version **removes the web scraper** from the critical path. Opportunities
(jobs, internships, scholarships, fellowships) are entered manually by
**Recruiters** through a dashboard, then reviewed by an **Admin**, then
matched to students.

The scraper becomes an additional *opportunity source* later — it will feed
into the exact same `opportunities` table, so nothing here needs to change
when it's added. See `architecture.md` §6 for the slot it plugs into.

**In scope now:**
- Student signup + profile builder
- Student preferences (opportunity types, min match %, notification settings)
- Recruiter signup + dashboard to create/manage opportunities
- Admin dashboard to approve recruiters, review/approve opportunities, manage users
- Matching engine (hard eligibility + semantic score via embeddings)
- Personalized match list on student dashboard
- Email notification on strong match

**Explicitly out of scope for now:**
- Automated scraping / source monitoring
- CV auto-import/parsing (manual profile entry only)
- Application tracking / recruiter-side decision pipeline
- Daily/weekly digest emails (immediate only)

---

## 2. User Roles

| Role | Description |
|---|---|
| **Student** | Builds profile, sets preferences, receives matches |
| **Recruiter** | Represents a company/org, posts opportunities | 
| **Admin** | Approves recruiters, moderates opportunities, manages platform |

A recruiter account must be **approved by an Admin** before they can publish
a live opportunity (prevents spam/fraudulent postings on a manual-entry MVP).

---

## 3. Student Profile

### 3.1 Personal Info
Name, email, phone, location, country, headline, bio.

### 3.2 Education (repeatable)
Institution, degree, field of study, GPA/CGPA + scale, start date,
graduation date, current-student flag.

### 3.3 Skills (repeatable)
Skill name, level (Beginner/Intermediate/Advanced), years of experience.

### 3.4 Experience (repeatable)
Organization, position, start/end date, description, skills used, achievements.

### 3.5 Projects (repeatable)
Name, description, technologies, role, project URL, GitHub URL.

### 3.6 Certifications / Courses (repeatable)
Certifications: name, issuer, date, credential ID/URL.
Courses: name, provider, completion date, skills learned.

### 3.7 Community, Leadership, Achievements (repeatable, optional)
Same shape as the full-platform PRD — org/role/duration/description.

### 3.8 Preferences (new — required step in onboarding)
This is the step that decides *what kind of opportunities the student wants
to be matched against at all*, before eligibility/semantic scoring runs.

- **Opportunity types wanted** (multi-select, at least one required):
  - ☐ Full-time Job
  - ☐ Internship
  - ☐ Scholarship
  - ☐ Fellowship
  - (competition/research/training/volunteer — reserved for later, shown as
    disabled/"coming soon" in MVP UI so schema doesn't need to change)
- **Work mode** (for jobs/internships only): Remote / On-site / Hybrid / Any
- **Preferred locations**: free text or multi-select (city/country)
- **Minimum match score threshold**: default 92%, editable 85–99%
- **Notification email**: on/off (default on)
- **Email frequency**: Immediate only for MVP (field exists, other options
  disabled)

A student cannot finish onboarding without completing Preferences — it's
what the matching engine filters on before it even runs eligibility.

### 3.9 Profile Completion
Dashboard shows a completion % to encourage a fuller profile (better
matching quality). Minimum to "activate" matching: personal info + at least
one education entry + at least 3 skills + preferences.

---

## 4. Recruiter Dashboard

### 4.1 Recruiter Onboarding
Recruiter signs up with work email, company/organization name, role/title.
Account status = `pending` until Admin approves.

### 4.2 Create Opportunity
This is the manual-entry replacement for the scraper pipeline. One form,
one opportunity, structured the same way an auto-extracted opportunity
would be — so both paths land in the same table.

**Fields (all captured in the Create Opportunity form):**

- Title
- Organization (defaults to recruiter's org, editable if agency-style)
- **Type**: Job / Internship / Scholarship / Fellowship (required, single-select)
- Description (rich text)
- Responsibilities / What you'll do
- Location + Remote flag
- **Requirements block** (structured, not free text — this feeds hard
  eligibility directly):
  - Minimum GPA (optional number)
  - Required degree(s)/field(s) of study (optional, multi)
  - Minimum experience (years, optional)
  - Required skills (multi-add, tag-style)
  - Preferred skills (multi-add, tag-style — used in semantic/explanation,
    not hard eligibility)
  - Academic year requirement (optional, e.g. "3rd year+")
- Compensation / stipend (optional, salary or stipend range)
- Application deadline (date, required)
- Application URL or "Apply within platform" toggle
- Status: Draft / Submitted for review / Published / Closed / Expired

### 4.3 Manage Opportunities
List of the recruiter's own postings with status, match count (# students
who crossed threshold), views, applications-via-platform-link-clicks.
Edit / close / duplicate-as-new actions.

### 4.4 Recruiter Dashboard Home
- Active opportunities count
- Pending admin review count
- Total matched students across all postings
- Simple engagement numbers (opened/clicked, once email analytics exist)

---

## 5. Admin Dashboard

### 5.1 Recruiter Approval Queue
List of pending recruiter signups → Approve / Reject, with optional note.

### 5.2 Opportunity Review Queue
Every opportunity submitted by a recruiter lands here before it goes live
(manual entry still needs a moderation gate, same principle as the
auto-scraped "AI Extraction Confidence" review in the full PRD).

Shown per opportunity: all submitted fields, recruiter/org identity,
duplicate-check flag (simple title+org+deadline match against existing
opportunities). Actions: **Approve → Published**, **Request changes**,
**Reject**.

### 5.3 User Management
- Students: search, view profile summary, deactivate if needed
- Recruiters: search, view org, approve/suspend
- Role assignment

### 5.4 Opportunity Management
Global list of all opportunities (any status), force-close, force-expire,
edit directly, view match statistics per opportunity.

### 5.5 Platform Metrics (MVP-lite version of full PRD §65–67)
- Total students / recruiters / opportunities
- Opportunities by type (job/internship/scholarship/fellowship)
- Matches generated
- Emails sent
- Match rate (% of opportunities producing ≥1 match above threshold)

---

## 6. Matching Engine (unchanged in principle from full PRD)

Runs whenever an opportunity is **Published** (instead of "whenever
scraper discovers new opportunity"):

```
Opportunity Published
       ↓
For each active student whose Preferences include this opportunity Type
       ↓
Hard Eligibility Check (GPA, degree, experience, academic year)
       ↓ PASS
Semantic Matching (student profile embedding vs opportunity embedding)
       ↓
Final Score = weighted(eligibility, semantic, skill overlap)
       ↓
Score >= student's threshold?
       ↓ YES
Personalized Email (dedup-checked)
```

Preferences gate matching *before* eligibility runs — a student who didn't
opt into "Scholarship" never gets scored against scholarship postings at
all, regardless of how well they'd match.

---

## 7. Email Notification

Same rules as the full PRD (§39–44): personalized, one opportunity per
email, includes why-matched + missing-preferred + deadline + apply link,
deduplicated so the same student/opportunity pair never emails twice.

---

## 8. MVP Build Order

1. Auth + roles (student/recruiter/admin) — Supabase Auth
2. Student profile builder + preferences step
3. Recruiter signup + Create Opportunity form
4. Admin approval queues (recruiter + opportunity)
5. Matching engine (eligibility → embeddings → score → threshold)
6. Email service integration + dedup log
7. Student dashboard (match list + explanation view)
8. Recruiter/Admin metrics views

Scraper, CV import, and application tracking are Phase 2+, and plug into
the existing `opportunities` and `applications` tables without schema
changes (see `database-schema.md`).
