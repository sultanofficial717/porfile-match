# Database Schema — MVP (Supabase / Postgres + pgvector)

Naming convention: snake_case tables, `id uuid primary key default gen_random_uuid()`
unless noted. All tables have `created_at timestamptz default now()`;
mutable tables also get `updated_at timestamptz default now()`.

---

## 1. Identity & Roles

```sql
-- profiles: one row per auth.users row (Supabase auth.users is separate)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'recruiter', 'admin')),
  full_name text,
  email text not null,
  created_at timestamptz default now()
);

create table recruiter_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  organization_name text not null,
  organization_website text,
  job_title text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'suspended', 'rejected')),
  approved_by uuid references profiles(id),
  approved_at timestamptz
);
```

---

## 2. Student Profile

```sql
create table student_profiles (
  id uuid primary key references profiles(id) on delete cascade,
  phone text,
  location text,
  country text,
  headline text,
  bio text,
  profile_embedding vector(768),  -- dim matches embedding provider
  profile_completion_pct int default 0,
  updated_at timestamptz default now()
);

create table educations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  gpa numeric(4,2),
  gpa_scale numeric(4,2) default 4.0,
  start_date date,
  graduation_date date,
  is_current boolean default false
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null unique  -- canonical skill list, dedup source
);

create table student_skills (
  student_id uuid references student_profiles(id) on delete cascade,
  skill_id uuid references skills(id),
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  years_experience numeric(3,1),
  primary key (student_id, skill_id)
);

create table experiences (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  organization text not null,
  position text not null,
  start_date date,
  end_date date,
  description text,
  achievements text[]
);

create table experience_skills (
  experience_id uuid references experiences(id) on delete cascade,
  skill_id uuid references skills(id),
  primary key (experience_id, skill_id)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  name text not null,
  description text,
  technologies text[],
  role text,
  project_url text,
  github_url text
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  name text not null,
  issuer text,
  issued_date date,
  credential_id text,
  credential_url text
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  name text not null,
  provider text,
  completed_date date,
  skills_learned text[]
);

create table community_work (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  organization text,
  role text,
  duration text,
  description text
);

create table leadership (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  title text,
  organization text,
  description text
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  title text,
  description text,
  date date
);
```

---

## 3. Student Preferences (new — MVP-required)

```sql
create table student_preferences (
  student_id uuid primary key references student_profiles(id) on delete cascade,
  opportunity_types text[] not null
    check (opportunity_types <@ array['job','internship','scholarship','fellowship',
                                       'competition','research','training','volunteer']),
  work_mode text check (work_mode in ('remote','onsite','hybrid','any')) default 'any',
  preferred_locations text[],
  min_match_threshold int not null default 92 check (min_match_threshold between 70 and 99),
  email_notifications_enabled boolean default true,
  email_frequency text default 'immediate'
    check (email_frequency in ('immediate','daily','weekly')),  -- only 'immediate' active in MVP
  updated_at timestamptz default now()
);

-- constraint enforced at app layer too: at least one opportunity_type required
```

---

## 4. Opportunities

Same table serves both recruiter (manual, MVP) and future scraper
(automated) origins — see `architecture.md` §6.

```sql
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid references recruiter_profiles(id),  -- null if scraped later
  source_type text not null default 'manual' check (source_type in ('manual','scraped')),
  source_id uuid,  -- FK to future opportunity_sources table, nullable for now

  title text not null,
  type text not null check (type in ('job','internship','scholarship','fellowship',
                                      'competition','research','training','volunteer')),
  organization text not null,
  description text,
  responsibilities text,
  location text,
  is_remote boolean default false,

  compensation text,
  application_deadline date not null,
  application_url text,
  apply_in_platform boolean default false,

  status text not null default 'draft'
    check (status in ('draft','submitted','published','rejected','closed','expired')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,

  opportunity_embedding vector(768),

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_opportunities_status on opportunities(status);
create index idx_opportunities_type on opportunities(type);
create index idx_opportunities_deadline on opportunities(application_deadline);
```

```sql
-- structured requirements, used directly by the hard-eligibility filter
create table opportunity_requirements (
  opportunity_id uuid primary key references opportunities(id) on delete cascade,
  min_gpa numeric(4,2),
  min_gpa_scale numeric(4,2) default 4.0,
  required_degrees text[],       -- e.g. {'Computer Science','AI','Data Science'}
  min_experience_years numeric(3,1) default 0,
  min_academic_year int          -- e.g. 3 = "3rd year or above"
);

create table opportunity_skills (
  opportunity_id uuid references opportunities(id) on delete cascade,
  skill_id uuid references skills(id),
  requirement_type text not null check (requirement_type in ('required','preferred')),
  primary key (opportunity_id, skill_id, requirement_type)
);
```

---

## 5. Matching

```sql
create table matches (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,

  eligibility_status text not null check (eligibility_status in ('pass','fail')),
  semantic_score numeric(5,2),
  skill_score numeric(5,2),
  education_score numeric(5,2),
  experience_score numeric(5,2),
  final_score numeric(5,2),

  matching_model text,  -- embedding model identifier, for auditability
  created_at timestamptz default now(),

  unique (student_id, opportunity_id)
);

create index idx_matches_student on matches(student_id);
create index idx_matches_opportunity on matches(opportunity_id);
```

---

## 6. Notifications / Email

```sql
create table email_log (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  recipient_email text not null,
  subject text not null,
  sent_at timestamptz default now(),
  delivery_status text default 'sent' check (delivery_status in ('sent','failed','bounced')),
  opened_at timestamptz,
  clicked_at timestamptz,

  unique (student_id, opportunity_id)  -- enforces dedup at the DB level
);
```

---

## 7. Applications (schema present, tracking UI deferred per PRD)

```sql
create table applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references student_profiles(id) on delete cascade,
  opportunity_id uuid references opportunities(id) on delete cascade,
  status text default 'saved'
    check (status in ('saved','viewed','applied','interview','rejected','selected')),
  updated_at timestamptz default now(),
  unique (student_id, opportunity_id)
);
```

---

## 8. Row-Level Security (RLS) Summary

| Table | Student access | Recruiter access | Admin access |
|---|---|---|---|
| `student_profiles` + children | own rows only (r/w) | none | all (r) |
| `student_preferences` | own row only (r/w) | none | all (r) |
| `opportunities` | published only (r) | own org's rows (r/w) | all (r/w) |
| `opportunity_requirements/skills` | via published opportunity (r) | own org's rows (r/w) | all (r/w) |
| `matches` | own rows only (r) | none | all (r) |
| `email_log` | own rows only (r) | none | all (r) |
| `recruiter_profiles` | none | own row (r/w, status is admin-only) | all (r/w) |

All policies implemented as Supabase RLS policies keyed off `auth.uid()`
matching `profiles.id`, with a separate `is_admin()` helper function used
as an override in the `using` clause.

---

## 9. Notes for Phase 2 (not built now, schema-compatible)

- `opportunity_sources` table (id, name, type, status, last_checked_at,
  next_check_at) — `opportunities.source_id` already reserved for this FK.
- `scrape_jobs` / `scrape_events` tables for scraper run logging.
- `cv_uploads` table + Storage bucket reference, for CV auto-import once
  built (Storage bucket itself can be created now even if parsing isn't).
