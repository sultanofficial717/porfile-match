# Design / UX Flows — MVP

This covers screen-by-screen flow and field-level layout (wireframe-level,
not visual styling) for the three role experiences.

---

## 1. Student — Onboarding Wizard

Multi-step wizard, progress bar at top, "Save & continue later" allowed
after step 1.

**Step 1 — Account & Personal Info**
Name, email (pre-filled from auth), phone, location, country, headline,
short bio (textarea, ~300 char).

**Step 2 — Education**
Repeatable card: Institution, Degree, Field of study, GPA + scale,
Start date, Graduation date, "Currently studying" toggle.
`+ Add another education` button.

**Step 3 — Skills**
Tag-input: type skill name → select level (Beginner/Intermediate/Advanced)
→ years of experience (number). Rendered as chips once added, editable.

**Step 4 — Experience & Projects** (combined step, two sub-sections)
Experience: Org, Position, Start/End date, Description, Skills used (reuse
skill tags), Achievements (bullet list).
Projects: Name, Description, Technologies (tags), Role, Project URL,
GitHub URL.
Both repeatable, both optional (can skip with "I don't have this yet").

**Step 5 — Certifications & Courses** (optional step, skippable)
Same repeatable-card pattern as above.

**Step 6 — Preferences** ⚠️ required, cannot skip
This is the step that didn't exist in the original scraper-first design
and is now load-bearing for matching.

```
┌─────────────────────────────────────────────┐
│  What kind of opportunities are you looking  │
│  for? (select all that apply)                │
│                                               │
│  [x] Full-time Job                           │
│  [x] Internship                              │
│  [ ] Scholarship                             │
│  [ ] Fellowship                              │
│  [ ] Competition        (coming soon)        │
│  [ ] Research           (coming soon)        │
│                                               │
│  ── shown only if Job/Internship selected ── │
│  Work mode:  ( ) Remote ( ) On-site           │
│              ( ) Hybrid  (•) Any              │
│                                               │
│  Preferred locations: [ tag input ]           │
│                                               │
│  Minimum match score to notify me:           │
│  [ slider: 85% ─────●─── 99% ]  (default 92) │
│                                               │
│  [x] Email me when a strong match is found   │
│                                               │
│  [ Finish Setup ]                            │
└─────────────────────────────────────────────┘
```

Validation: at least one opportunity type must be checked before
"Finish Setup" activates.

**Step 7 — Confirmation**
"Your profile is live. We'll email you when we find a strong match."
Shows profile completion % and a nudge to fill any skipped optional
sections (higher completion → better matching, stated explicitly).

---

## 2. Student — Dashboard (post-onboarding)

```
┌────────────────────────────────────────────────────┐
│  Welcome back, Ali          Profile: 82% complete → │
├────────────────────────────────────────────────────┤
│  New Matches                                        │
│  ┌──────────────────────────────────────────────┐  │
│  │ 94%  AI Research Intern — ABC Technologies    │  │
│  │      Internship · Islamabad · Deadline Sep 30 │  │
│  ├──────────────────────────────────────────────┤  │
│  │ 92%  Data Science Scholarship — XYZ Fund      │  │
│  │      Scholarship · Remote · Deadline Oct 12   │  │
│  └──────────────────────────────────────────────┘  │
│                                                       │
│  [ Edit Preferences ]   [ Edit Profile ]             │
└────────────────────────────────────────────────────┘
```

Clicking a match opens the **Match Explanation view**:
match score, why-matched checklist (✓ items), preferred-but-missing
(○ items), full requirements, deadline, Apply button (external link or
in-platform, per opportunity setting).

---

## 3. Recruiter — Onboarding

Simple 2-step: (1) work email + password, (2) org name, org website,
recruiter's role/title. Submits → "Pending admin approval" screen.
Recruiter can still explore the dashboard UI in read-only/draft mode
while pending, but cannot publish.

---

## 4. Recruiter — Dashboard Home

```
┌────────────────────────────────────────────────────┐
│  ABC Technologies                 [ + New Opportunity ]│
├────────────────────────────────────────────────────┤
│  Active: 3     Pending review: 1     Matched: 47     │
├────────────────────────────────────────────────────┤
│  Title                Type       Status    Matches   │
│  AI Research Intern   Internship Published   28       │
│  Backend Engineer     Job        Published   19       │
│  Fall Fellowship      Fellowship Review       —       │
└────────────────────────────────────────────────────┘
```

---

## 5. Recruiter — Create Opportunity Form

Single-page form, sectioned, matching the structured-requirements
principle from the PRD (free text is only for description —
everything the matching engine reads is a structured field).

```
┌─── Basics ───────────────────────────────────────────┐
│ Title:            [___________________________]      │
│ Type:             ( ) Job (•) Internship             │
│                   ( ) Scholarship ( ) Fellowship      │
│ Organization:      [ABC Technologies      ] (locked)  │
│ Location:          [___________]   [ ] Remote         │
│ Description:        [ rich text box ]                 │
│ Responsibilities:    [ rich text box ]                 │
├─── Requirements (used for matching) ─────────────────┤
│ Minimum GPA:            [3.0    ]  (optional)          │
│ Required degree/field:  [ tag input: CS, AI, Data Sci ]│
│ Minimum experience:     [0    ] years  (optional)      │
│ Required skills:        [ tag input: Python, ML ]      │
│ Preferred skills:       [ tag input: PyTorch, TF ]     │
│ Academic year required: [ 3rd year+  ▾ ] (optional)    │
├─── Logistics ─────────────────────────────────────────┤
│ Compensation/Stipend:   [___________] (optional)       │
│ Application deadline:   [ date picker ] (required)     │
│ Apply via:  ( ) External URL  ( ) In-platform          │
│              [___________________________]             │
├────────────────────────────────────────────────────────┤
│         [ Save as Draft ]   [ Submit for Review ]       │
└──────────────────────────────────────────────────────┘
```

"Submit for Review" moves status → `submitted`, locks editing until
admin acts (Approve/Request changes/Reject).

---

## 6. Admin — Recruiter Approval Queue

```
┌────────────────────────────────────────────────────┐
│ Pending Recruiters (3)                               │
├────────────────────────────────────────────────────┤
│ Bilal Khan — ABC Technologies — bilal@abctech.com    │
│   [ View ]  [ Approve ]  [ Reject ]                  │
├────────────────────────────────────────────────────┤
│ Sana Malik — XYZ Fund — sana@xyzfund.org             │
│   [ View ]  [ Approve ]  [ Reject ]                  │
└────────────────────────────────────────────────────┘
```

## 7. Admin — Opportunity Review Queue

```
┌────────────────────────────────────────────────────┐
│ Submitted: Fall Fellowship — XYZ Fund                │
│                                                        │
│ Type: Fellowship   Deadline: Oct 12  Source: manual   │
│ [ Full field view exactly as recruiter submitted it ]  │
│ Duplicate check: no match found                       │
│                                                         │
│ [ Approve → Publish ]  [ Request changes ]  [ Reject ] │
└────────────────────────────────────────────────────┘
```

## 8. Admin — Global Dashboard

```
┌────────────────────────────────────────────────────┐
│ Students: 1,204   Recruiters: 38   Opportunities: 96  │
├────────────────────────────────────────────────────┤
│ By type:  Jobs 41 · Internships 30 · Scholarships 15 │
│           Fellowships 10                              │
├────────────────────────────────────────────────────┤
│ Matches generated: 3,410   Emails sent: 3,200         │
│ Match rate (opps w/ ≥1 match): 88%                    │
├────────────────────────────────────────────────────┤
│ [ Manage Users ]  [ Manage Opportunities ]            │
└────────────────────────────────────────────────────┘
```

---

## 9. Design Notes

- Match score is always shown as a colored badge (e.g. green ≥90%,
  yellow 80–89%) — consistent across student dashboard, recruiter match
  counts, and admin metrics.
- Recruiter and Admin dashboards intentionally reuse the same table/list
  UI pattern as the student match list — one component, different data
  source, to keep the MVP build fast.
- All "coming soon" opportunity types (competition, research, etc.) stay
  visible-but-disabled in the Preferences UI rather than hidden, so
  re-enabling them later needs no UI redesign — only schema/backend work.
