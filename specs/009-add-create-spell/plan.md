# Implementation Plan: Create Custom Spell

**Branch**: `009-add-create-spell` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-add-create-spell/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → ✅ Loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → ✅ Project Type: web (Next.js 15 App Router)
   → ✅ Structure Decision: Next.js App Router with app/ directory
3. Fill Constitution Check section
   → ✅ Based on SD GM Tools Constitution v1.4.0
4. Evaluate Constitution Check section
   → ✅ No violations detected
   → ✅ Progress Tracking: Initial Constitution Check PASS
5. Execute Phase 0 → research.md
   → ✅ Reference monster creation pattern
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, CLAUDE.md
   → ✅ Mirror monster CRUD implementation
7. Re-evaluate Constitution Check
   → ✅ Post-Design Constitution Check
8. Plan Phase 2 → Task generation approach described
9. ✅ STOP - Ready for /tasks command
```

## Summary

Enable authenticated users to create, read, update, and delete custom spells for Shadowdark campaigns. Implementation mirrors existing monster creation pattern with form validation, public/private toggle, and globally unique name enforcement. Uses Next.js 15 App Router, Supabase database with RLS policies, shadcn/ui forms, and Zod validation.

## Technical Context

**Language/Version**: TypeScript 5 with Next.js 15
**Primary Dependencies**: React 19, @supabase/ssr, react-hook-form 7.63, Zod 4.1.11, shadcn/ui (Radix UI)
**Storage**: Supabase PostgreSQL with existing `user_spells` and `official_spells` tables
**Testing**: Vitest 3.2.4 (unit), Playwright 1.55 (E2E)
**Target Platform**: Web (Vercel deployment, Next.js App Router)
**Project Type**: web (frontend + backend in Next.js App Router)
**Performance Goals**: Form submission <500ms, spell list rendering <2s with 1000+ spells
**Constraints**: Globally unique spell names, RLS policies enforced, Shadowdark tier validation (1-5)
**Scale/Scope**: Unlimited spells per user, public/private visibility, CRUD operations

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ I. Component-First

- Reusable `SpellForm` component (mirrors `MonsterForm`)
- `SpellCard` for list views
- Self-contained with Zod validation schemas

### ✅ II. API-First

- RESTful endpoints: POST /api/spells, GET /api/spells, GET /api/spells/[id], PUT /api/spells/[id], DELETE /api/spells/[id]
- JSON request/response, proper HTTP status codes
- Mirrors monster API pattern

### ✅ III. Test-First (NON-NEGOTIABLE)

- Vitest unit tests for Zod schemas
- Playwright E2E tests for create/edit/delete flows
- Target 40%+ coverage

### ✅ IV. Integration Testing

- Database operations (create, read, update, delete)
- Authentication flows (protected routes)
- Name uniqueness validation
- RLS policy enforcement

### ✅ V. Simplicity

- MVP feature set, mirrors monster creation
- Explicit Shadowdark tier validation (1-5)
- No image upload (simplified scope)

### ✅ VI. Data Integrity

- Zod schemas at all boundaries
- Shadowdark tier range validation (1-5)
- Global name uniqueness constraint
- User ownership validation

### ✅ VII. Community Safety

- Public/private toggle (defaults to private)
- User-owned content only (no editing official spells)
- Future: leverage existing flagging system

**Status**: ✅ PASS - No violations, follows existing monster pattern

## Project Structure

### Documentation (this feature)

```
specs/009-add-create-spell/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── POST-spells.json
│   ├── GET-spells.json
│   ├── GET-spells-id.json
│   ├── PUT-spells-id.json
│   └── DELETE-spells-id.json
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)

```
app/
├── spells/
│   ├── page.tsx              # List page (existing)
│   ├── [slug]/page.tsx       # Detail page (existing)
│   └── create/
│       ├── page.tsx          # NEW - Create spell page
│       └── layout.tsx        # NEW - Protected route layout
├── api/
│   └── spells/
│       ├── route.ts          # NEW - POST (create), GET (list)
│       └── [id]/
│           └── route.ts      # NEW - GET, PUT, DELETE

components/
├── spells/
│   ├── SpellForm.tsx         # NEW - Form component
│   ├── SpellCard.tsx         # Existing (may need updates)
│   └── SpellList.tsx         # Existing (may need updates)
└── ui/                       # shadcn/ui components (existing)

lib/
├── validations/
│   └── spell.ts              # NEW - Zod schemas
└── supabase/
    ├── server.ts             # Existing
    └── client.ts             # Existing

__tests__/
├── unit/
│   └── spell-validation.test.ts  # NEW
└── e2e/
    └── spell-crud.spec.ts        # NEW
```

**Structure Decision**: Next.js App Router (web application) - mirrors existing monster implementation

## Phase 0: Outline & Research

**Objective**: Analyze existing monster creation implementation to mirror patterns for spell creation.

### Research Tasks

1. **Database Schema Analysis**
   - Decision: Use existing `user_spells` table (already has required fields)
   - Rationale: Table already exists with proper structure (name, tier, classes, school, duration, range, effect, is_public, user_id)
   - Action: Verify RLS policies exist and match monster pattern

2. **Monster Form Pattern Analysis**
   - Decision: Mirror `MonsterForm` component structure for `SpellForm`
   - Rationale: Consistent UX, proven validation patterns, same tech stack
   - Key patterns to replicate:
     - react-hook-form with zodResolver
     - shadcn/ui Form components
     - Server action for form submission
     - Public/private toggle
     - Success/error toast notifications

3. **API Route Pattern Analysis**
   - Decision: Mirror `/api/monsters` structure for `/api/spells`
   - Rationale: Consistent RESTful conventions, proven error handling
   - Key patterns:
     - Async params handling (Next.js 15)
     - Await createClient() for Supabase
     - Zod validation in POST/PUT
     - Auth checks before mutations
     - Proper HTTP status codes

4. **Validation Strategy**
   - Decision: Zod schemas matching Shadowdark spell rules
   - Rationale: Type-safe, consistent with monster validation
   - Specific rules:
     - Tier: 1-5 integer
     - Classes: "wizard", "priest", or both (array)
     - Name: globally unique (check against all_spells view)
     - Duration/Range: free text (Shadowdark allows flexibility)

**Output**: research.md

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

### 1. Data Model (`data-model.md`)

**Entities**:

- **UserSpell**: Custom spell created by authenticated user
  - Fields: id (uuid), name (text, unique), tier (int 1-5), classes (text[]), school (text, optional), duration (text), range (text), effect (text), is_public (bool), user_id (uuid), created_at, updated_at
  - Validation: Zod schema matching Shadowdark rules
  - Relationships: belongs_to User via user_id
  - State: public/private toggle, owner-only CRUD

- **OfficialSpell**: Read-only spell from official Shadowdark content
  - Fields: same as UserSpell (minus user_id, is_public)
  - Purpose: Name uniqueness checks, reference data

- **AllSpells View**: UNION of user_spells + official_spells
  - Purpose: Global name uniqueness validation

### 2. API Contracts (`/contracts/*.json`)

**Endpoints**:

1. `POST /api/spells` - Create new spell
   - Auth: Required
   - Body: SpellCreateSchema (Zod)
   - Response: 201 + created spell | 400 validation | 401 unauthorized | 409 duplicate name

2. `GET /api/spells` - List spells (user's + public)
   - Auth: Optional (affects results)
   - Query: search, tier, class filters
   - Response: 200 + spell array

3. `GET /api/spells/[id]` - Get single spell
   - Auth: Optional (private only if owner)
   - Response: 200 + spell | 404 not found | 403 forbidden

4. `PUT /api/spells/[id]` - Update spell
   - Auth: Required (owner only)
   - Body: SpellUpdateSchema (Zod)
   - Response: 200 + updated spell | 403 forbidden | 404 not found

5. `DELETE /api/spells/[id]` - Delete spell
   - Auth: Required (owner only)
   - Response: 204 no content | 403 forbidden | 404 not found

### 3. Contract Tests

- `tests/contract/POST-spells.test.ts` - Test create spell contract
- `tests/contract/GET-spells.test.ts` - Test list spells contract
- `tests/contract/spell-validation.test.ts` - Test Zod schemas

### 4. Quickstart Test (`quickstart.md`)

**User Journey**:

1. User navigates to /spells/create (requires auth)
2. User fills spell form (name, tier, class, duration, range, effect)
3. User toggles public/private
4. User submits form
5. System validates (Zod + uniqueness check)
6. System creates spell in user_spells
7. System redirects to spell detail page
8. User sees spell in their spells list
9. User can edit/delete their spell
10. Other users see spell if public

### 5. Update Agent Context

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

**Output**: data-model.md, contracts/\*.json, failing tests, quickstart.md, CLAUDE.md updated

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Database Tasks** (if needed)
   - Verify user_spells table structure
   - Verify RLS policies exist
   - Add migration if missing constraints

2. **Validation Tasks** (test-first)
   - Create Zod schemas for spell CRUD
   - Write unit tests for Zod validation
   - Tests must fail initially

3. **API Route Tasks** (test-first)
   - Write contract tests for each endpoint
   - Implement POST /api/spells
   - Implement GET /api/spells
   - Implement GET /api/spells/[id]
   - Implement PUT /api/spells/[id]
   - Implement DELETE /api/spells/[id]

4. **Component Tasks** (test-first)
   - Create SpellForm component
   - Create spell create page
   - Update spell list page (if needed)
   - Update spell detail page with edit/delete

5. **E2E Tasks**
   - Write E2E test for create spell flow
   - Write E2E test for edit spell flow
   - Write E2E test for delete spell flow
   - Write E2E test for public/private visibility

**Ordering Strategy**:

- Database verification first
- Validation schemas before API routes
- API routes before UI components
- Contract tests before implementation
- E2E tests after all components complete

**Parallel Opportunities** [P]:

- Independent API routes can be built in parallel
- Component creation can parallel API work (mocked)
- Unit tests can parallel implementation

**Estimated Output**: 20-25 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations detected - this section is empty_

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A)

---

_Based on SD GM Tools Constitution v1.4.0 - See `.specify/memory/constitution.md`_
