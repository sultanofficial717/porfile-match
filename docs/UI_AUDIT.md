# UI Audit: Frontend Redesign for Opportunity Matching Platform

## Executive Summary

This audit documents the current state of the frontend codebase and identifies components, routes, and functionality that will be kept, modified, or removed as part of the redesign. The primary goal is to remove all admin functionality and transform the UI from a generic SaaS dashboard to a LinkedIn-style "Editorial Noticeboard" design.

## Current Architecture Overview

### Root Level Structure
- **app/** - Main Next.js frontend (App Router)
- **frontend/** - Secondary frontend directory (appears to be duplicate/legacy)
- **backend/** - Express.js API server (DO NOT MODIFY)
- **components/** - Shared React components
- **lib/** - Utility libraries and types
- **prisma/** - Database schema (DO NOT MODIFY)

### Critical Discovery: Duplicate Frontend Structure

The project contains **two frontend directories**:
1. `app/` - Main active frontend with 22 pages
2. `frontend/src/app/` - Secondary frontend with role-based route groups

**Decision**: Focus redesign on `app/` directory as it appears to be the active frontend. The `frontend/` directory may be legacy or for different purposes.

---

## ADMIN CODE TO REMOVE (Priority 1)

### Files to Delete Entirely

#### From `app/` Directory:
- `app/admin/page.tsx` - Main admin dashboard
- `app/admin/settings/page.tsx` - Scoring weights configuration
- `app/api/admin/stats/route.ts` - Admin statistics API
- `app/api/evaluations/route.ts` - Model evaluation API (admin function)
- `app/api/experiments/route.ts` - Multi-model experiment API (admin function)
- `app/experiments/page.tsx` - Multi-model comparison lab UI

#### From `frontend/src/app/` Directory:
- `frontend/src/app/(admin)/admin/page.tsx` - Admin overview
- `frontend/src/app/(admin)/admin/metrics/page.tsx` - Platform metrics
- `frontend/src/app/(admin)/admin/opportunities/page.tsx` - Opportunity moderation
- `frontend/src/app/(admin)/admin/recruiters/page.tsx` - Recruiter approval
- `frontend/src/app/(admin)/admin/users/page.tsx` - User management

### Code References to Remove

#### In `app/page.tsx` (Landing Page):
- Line 38: `const [authModalRole, setAuthModalRole] = useState<"STUDENT" | "RECRUITER" | "ADMIN">("STUDENT");`
- Line 72: `const openAuth = (mode: "signin" | "getstarted", role: "STUDENT" | "RECRUITER" | "ADMIN" = "STUDENT") => {`
- Line 88: `if (user.role === "ADMIN") router.push("/admin");`
- Line 95: `const adminUsers = users.filter((u) => u.role === "ADMIN");`
- Lines 348-430: Entire "ROLE 3: PLATFORM ADMINISTRATOR" section
- All admin persona switcher logic

#### In `app/login/page.tsx`:
- Line 29-30: ADMIN role type definitions
- Line 33: `const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER" | "ADMIN">(initialRole);`
- Lines 81-82: Admin routing logic
- Lines 261-282: Admin role selection UI
- Lines 397, 430, 455, 474, 479: Admin-related UI text

#### In `components/navbar.tsx`:
- Line 38: Admin role type in state
- Lines 110-111: Admin routing logic
- Line 136: Admin role in function signature
- Lines 169-180: `adminLinks` array and routing
- Lines 247, 279-280, 316: Admin nav items and logic

#### In `components/auth-modal.tsx`:
- Line 28: Admin role type
- Line 41: Admin role state
- Lines 103-104: Admin routing
- Lines 311-540: Entire admin role selection UI

#### In `lib/types/index.ts`:
- Line 1: `"ADMIN"` from UserRole type definition

#### In `app/api/opportunities/route.ts`:
- Lines 113-114: Admin fallback logic for opportunity creation

#### In `app/api/opportunities/[id]/verify/route.ts`:
- Lines 11-31: Admin verification logic

#### In `app/api/evaluations/route.ts`:
- Lines 58-59: Admin fallback for evaluation creation

#### In `app/recruiter/page.tsx`:
- Line 37: Admin stats API call
- Lines 101, 106: Admin verification references

#### In `app/recruiter/opportunities/new/page.tsx`:
- Lines 101, 106: Admin verification status and messaging

---

## COMPONENTS TO KEEP & REUSE

### Highly Reusable (Minor Updates Needed)
1. **`components/match-breakdown-modal.tsx`** - Match explanation modal
   - Update: Remove admin-related routing if any
   - Keep: Core matching logic display

2. **`components/match-score-badge.tsx`** - Score display component
   - Update: Redesign to "Fit Stub" format
   - Keep: Basic score calculation logic

### Significant Redesign Needed
1. **`components/navbar.tsx`** - Navigation
   - Complete redesign to LinkedIn-style sticky top bar
   - Remove admin links
   - Add role-specific tab sets
   - Implement mobile bottom navigation

2. **`components/auth-modal.tsx`** - Authentication
   - Remove admin role option
   - Redesign to match new visual identity
   - Simplify to student/recruiter only

### Components to Remove
- None specific to admin (all admin logic is in pages/routes)

---

## PAGES TO KEEP & REDESIGN

### Student Pages (Keep, Redesign)
1. **`app/dashboard/page.tsx`** - Student dashboard
   - Redesign: Three-column feed layout
   - Add: Mixed feed (opportunities, events, posts)
   - Remove: Generic dashboard patterns

2. **`app/profile/page.tsx`** - Student profile
   - Redesign: Stacked sections with edit-in-place
   - Add: "Open to" banner, public view toggle
   - Implement: Ghost sections for empty states

3. **`app/profile/import/page.tsx`** - CV import
   - Keep: Core parsing functionality
   - Redesign: Side-by-side verification UI

4. **`app/opportunities/page.tsx`** - Opportunity discovery
   - Redesign: Split view (list left, detail right)
   - Add: Filters, type tabs, saved searches

5. **`app/opportunities/[id]/page.tsx`** - Opportunity detail
   - Redesign: Gate Check + Fit Stub + highlighter marks
   - Add: Similar opportunities section

6. **`app/resume-optimizer/page.tsx`** - Resume optimizer
   - Keep: Core optimization logic
   - Redesign: Before/after diff display

7. **`app/notifications/page.tsx`** - Notifications
   - Redesign: Inbox-style interface
   - Keep: Core notification logic

8. **`app/events/page.tsx`** - Events
   - Redesign: Event cards with RSVP functionality
   - Keep: Core event management

### Recruiter Pages (Keep, Redesign)
1. **`app/recruiter/page.tsx`** - Recruiter dashboard
   - Redesign: Candidate stream with gate/fit info
   - Remove: Admin approval references
   - Add: Light analytics for own postings

2. **`app/recruiter/candidates/page.tsx`** - Candidate management
   - Redesign: Candidate detail with match breakdown
   - Keep: Core candidate display logic

3. **`app/recruiter/opportunities/new/page.tsx`** - Create opportunity
   - Redesign: Multi-step composer with live match preview
   - Modify: Remove admin verification flow, publish as live
   - Add: "N candidates would match" preview

### Shared Pages (Keep, Redesign)
1. **`app/page.tsx`** - Landing page
   - Complete redesign: Editorial noticeboard style
   - Remove: Admin role section
   - Add: Role-specific value propositions

2. **`app/login/page.tsx`** - Login page
   - Redesign: Match new visual identity
   - Remove: Admin role option

---

## API ROUTES TO KEEP (Frontend Only)

### Keep (No Changes Needed)
- `app/api/auth/session/route.ts` - Session management
- `app/api/match/route.ts` - Matching calculations
- `app/api/notifications/route.ts` - Notifications
- `app/api/events/route.ts` - Events
- `app/api/events/rsvp/route.ts` - Event RSVPs
- `app/api/opportunities/route.ts` - Opportunities CRUD
- `app/api/opportunities/[id]/route.ts` - Opportunity details
- `app/api/students/route.ts` - Student data
- `app/api/students/[id]/route.ts` - Student details
- `app/api/parse-cv/route.ts` - CV parsing
- `app/api/resume-optimizer/route.ts` - Resume optimization
- `app/api/recruiter/invite/route.ts` - Recruiter invitations
- `app/api/settings/route.ts` - User settings
- `app/api/ollama/health/route.ts` - Ollama health check

### Remove (Admin-Only)
- `app/api/admin/stats/route.ts` - Admin statistics
- `app/api/evaluations/route.ts` - Model evaluations
- `app/api/experiments/route.ts` - Model experiments

### Modify (Remove Admin Logic)
- `app/api/opportunities/route.ts` - Remove admin fallback logic
- `app/api/opportunities/[id]/verify/route.ts` - Remove admin verification
- `app/api/evaluations/route.ts` - Remove admin fallback

---

## LIBRARY CODE TO KEEP & MODIFY

### `lib/types/index.ts`
**Changes Required:**
- Remove `"ADMIN"` from UserRole type
- Keep all other types (they're data contracts)

### `lib/ai/embeddings/` (Keep All)
- `gemini.ts` - Google Gemini embeddings
- `index.ts` - Embedding provider interface
- `mock.ts` - Mock embeddings for testing
- `ollama.ts` - Ollama local embeddings
- `qwen.ts` - Qwen embeddings
- `types.ts` - Embedding types

**Reason**: These are core AI functionality used by matching engine, not admin-specific.

### `lib/matching/` (Keep All)
- `document.ts` - Document processing
- `eligibility.ts` - Hard eligibility checks
- `pipeline.ts` - Matching pipeline
- `scoring.ts` - Scoring calculations
- `semantic.ts` - Semantic matching

**Reason**: Core matching logic used by both student and recruiter flows.

### `lib/parsing/cv-parser.ts` (Keep)
**Reason**: CV parsing functionality used by student profile import.

### `lib/db/prisma.ts` (Keep, But Won't Use)
**Reason**: Database client exists but will be replaced by mock data layer. Don't delete, just won't be imported in new frontend.

---

## STYLING & DESIGN SYSTEM

### Current State
- **Framework**: Tailwind CSS
- **Current Style**: Glassmorphism, gradients, rounded-2xl cards, generic SaaS patterns
- **File**: `app/globals.css`

### Required Changes
1. **Complete visual overhaul** to "Editorial Noticeboard" identity
2. **New design tokens** (CSS variables + Tailwind config)
3. **Custom fonts**: Fraunces/Instrument Serif (display), Instrument Sans (UI), mono (data)
4. **Remove**: Glassmorphism, gradients, blurry shadows, emoji icons
5. **Add**: Fit Stub, highlighter marks, gate check stamps, ghost sections, opportunity tickets

---

## DATA LAYER ARCHITECTURE

### Current State
- Direct Prisma calls in API routes
- No separation between UI and data access
- No mock data layer

### Required New Structure
```
data/
  contracts/          # Repository interfaces + Zod schemas
  adapters/mock/      # In-memory implementations
  adapters/api/       # Stub only (returns "not connected")
  fixtures/           # Realistic seed data
  provider.tsx        # Adapter selection logic
```

### Repositories to Create
- Users
- Profiles (Student, Recruiter)
- Opportunities
- Matches
- Applications
- Events/RSVPs
- Notifications
- Invitations

---

## ROUTING STRUCTURE CHANGES

### Current Routes
```
/                    # Landing
/login               # Login
/dashboard           # Student dashboard
/profile             # Student profile
/profile/import       # CV import
/opportunities       # Opportunity list
/opportunities/[id]  # Opportunity detail
/recruiter           # Recruiter dashboard
/recruiter/candidates # Candidate management
/recruiter/opportunities/new # Create opportunity
/events              # Events
/notifications       # Notifications
/experiments         # Model experiments (REMOVE)
/admin               # Admin dashboard (REMOVE)
/admin/settings      # Admin settings (REMOVE)
```

### New Routes (LinkedIn-style)
```
/                    # Landing
/auth/login          # Login
/auth/signup         # Signup
/student/home        # Student home feed
/student/discover    # Opportunity discovery
/student/opportunities/[id] # Opportunity detail
/student/profile     # Student profile
/student/profile/edit # Profile edit
/student/applications # Application timeline
/student/network     # Network/connections
/student/inbox       # Messages
/student/notifications # Notifications
/student/resume-optimizer # Resume tools
/student/preferences # Settings

/recruiter/home      # Recruiter home/candidate stream
/recruiter/opportunities # Manage postings
/recruiter/opportunities/new # Create opportunity
/recruiter/opportunities/[id]/edit # Edit opportunity
/recruiter/candidates # Candidate management
/recruiter/candidates/[id] # Candidate detail
/recruiter/events    # Event management
/recruiter/events/new # Create event
/recruiter/invites   # Fast-track invites
/recruiter/analytics # Light analytics (own postings only)
```

---

## FEATURE MODULES TO CREATE

### Student Features
1. **feed** - Home feed with mixed content
2. **discover** - Opportunity discovery with filters
3. **opportunity** - Opportunity detail and application
4. **matching** - Match display and explanation
5. **profile** - Profile management and display
6. **applications** - Application timeline
7. **network** - Connections and follows
8. **inbox** - Messaging system
9. **notifications** - Notification management
10. **events** - Event discovery and RSVP
11. **resume-optimizer** - Resume improvement tools
12. **preferences** - User settings

### Recruiter Features
1. **recruiter** - Recruiter-specific components
2. **opportunity-composer** - Multi-step opportunity creation
3. **candidate-stream** - Candidate sourcing interface
4. **event-manager** - Event creation and management
5. **invite-system** - Fast-track interview invitations

### Shared Features
1. **auth** - Authentication flows
2. **shared/ui** - Design system primitives
3. **shared/layout** - Layout components

---

## TESTING STRATEGY

### Current State
- Vitest configuration exists
- No evidence of existing frontend tests

### Required Tests
1. **computeMatch() function** - Unit tests for matching logic
2. **Repository implementations** - Mock adapter tests
3. **Component integration** - Key user flows
4. **Responsive design** - Mobile/tablet/desktop testing

---

## MIGRATION STRATEGY

### Phase 0: Admin Removal (PR 0)
1. Delete all admin routes and components
2. Remove admin role from types and enums
3. Update authentication flows
4. Remove admin references from existing pages
5. Verify app builds and runs

### Phase 1: Design System (PR 1)
1. Create design tokens (CSS variables)
2. Configure Tailwind with new tokens
3. Build shared/ui primitives
4. Create /styleguide route
5. Test both themes

### Phase 2: Data Layer (PR 2)
1. Create data contracts and Zod schemas
2. Build mock adapters with fixtures
3. Implement computeMatch() with tests
4. Create provider.tsx for adapter selection
5. Add localStorage persistence

### Phase 3: App Shell (PR 3)
1. Build AppShell component
2. Create role-specific navigation
3. Implement route guards
4. Add mobile bottom navigation
5. Test both role flows

### Phase 4+: Feature Modules (PR 4+)
1. Student features (in priority order)
2. Recruiter features (in priority order)
3. Integration testing
4. Responsive design validation

---

## SUCCESS CRITERIA

### Technical
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ No "admin" references in frontend code (except docs)
- ✅ All existing tests pass
- ✅ New tests for computeMatch() and repositories
- ✅ Mock data layer fully functional
- ✅ Both themes work at 375px, 768px, 1440px

### Functional
- ✅ Full demo click-through for student persona
- ✅ Full demo click-through for recruiter persona
- ✅ No console errors during user flows
- ✅ All mutations work (apply, save, dismiss, etc.)
- ✅ localStorage persistence works
- ✅ Mock API swapping requires no UI changes

### Design
- ✅ No glassmorphism or gradients
- ✅ Custom fonts implemented
- ✅ Fit Stub, highlighter marks, gate checks working
- ✅ Ghost sections for empty states
- ✅ Editorial noticeboard aesthetic achieved
- ✅ WCAG AA contrast compliance
- ✅ Full keyboard navigation

---

## OPEN QUESTIONS & DECISIONS

### 1. Frontend Directory Structure
**Question**: Should we use the existing `app/` directory or migrate to the `frontend/src/app/` structure?

**Recommendation**: Use `app/` directory as it appears to be the active frontend. The `frontend/` directory may be legacy and should be investigated further.

### 2. Role-Based Route Groups
**Question**: Should we use Next.js route groups `(student)` and `(recruiter)`?

**Recommendation**: Yes, this aligns with the existing `frontend/src/app/(admin)` pattern and provides better organization.

### 3. Mock Data Complexity
**Question**: How complex should the mock data be?

**Recommendation**: Highly realistic with at least 25 opportunities, 8 recruiters, 6 events, and varied student profiles to support comprehensive testing.

### 4. Authentication Persistence
**Question**: How should demo authentication work?

**Recommendation**: Use localStorage with persona switcher, as currently implemented, but simplified to student/recruiter only.

---

## NEXT STEPS

1. **Immediate**: Begin PR 0 - Admin code removal
2. **Parallel**: Investigate `frontend/` directory purpose
3. **Follow-up**: Create detailed design specifications
4. **Planning**: Set up feature module structure
5. **Foundation**: Begin design token implementation

---

## APPENDIX: FILE COUNTS

### Files to Delete: 11
- Admin pages: 6
- Admin API routes: 3
- Experiments page: 1
- Experiments API: 1

### Files to Modify: 8
- Landing page: 1
- Login page: 1
- Navbar: 1
- Auth modal: 1
- Types: 1
- API routes (minor): 3

### Files to Keep: 20+
- Student pages: 8
- Recruiter pages: 3
- Shared pages: 2
- Components: 4
- Library code: 10+
- API routes: 10+

### New Files to Create: 50+
- Design system: 15+
- Data layer: 20+
- Feature modules: 15+

---

**Audit completed**: 2026-09-23
**Next phase**: PR 0 - Admin code removal
