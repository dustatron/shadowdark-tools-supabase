# Implementation Plan: Random Encounter Tables

**Branch**: `002-random-encounter-tables` | **Date**: 2025-10-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-random-encounter-tables/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Game Masters can create random encounter tables by selecting from official, custom, and community monsters with configurable die sizes (d4-d100 or custom 2-1000). Tables support advanced filtering (level range, alignment, movement types, text search), animated dice rolling with highlighted results, full monster stat block display with favoriting, and public sharing with copyable URLs. Monster data is preserved as snapshots to maintain table integrity even when source monsters are deleted or modified.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15 (App Router), React 19
**Primary Dependencies**: Mantine UI, Emotion CSS-in-JS, @tabler/icons-react, React Hook Form, Zod, @tanstack/react-query
**Storage**: Supabase (PostgreSQL with Row Level Security), JSONB for monster snapshots
**Testing**: Vitest 3.2.4 (unit/integration), Playwright 1.55 (E2E), @testing-library/react 16.3
**Target Platform**: Web (desktop + mobile responsive), Vercel deployment
**Project Type**: web (frontend + backend via Next.js App Router API routes)
**Performance Goals**: <2s page loads, <500ms search/filter operations, <300ms DB queries, smooth dice animation (60fps)
**Constraints**: Unique monster selection per table, monster data snapshots for historical accuracy, public URL uniqueness, RLS for multi-tenancy
**Scale/Scope**: Supports 10k+ users, tables with up to 1000 entries (custom die size), complex monster filtering, real-time UI updates

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Component-First ✓

- **Status**: PASS
- **Evidence**: Feature breaks down into reusable components: EncounterTableForm, MonsterFilterPanel, DiceRoller, TableEntryList, MonsterDetailPanel, ShareDialog, TableCard
- **Testing Plan**: Each component independently testable with Vitest

### II. API-First ✓

- **Status**: PASS
- **Evidence**: RESTful API design with clear contracts:
  - POST /api/encounter-tables (create)
  - GET /api/encounter-tables (list user tables)
  - GET /api/encounter-tables/[id] (get single table)
  - PATCH /api/encounter-tables/[id] (update settings/filters)
  - DELETE /api/encounter-tables/[id] (delete)
  - POST /api/encounter-tables/[id]/generate (regenerate all entries)
  - POST /api/encounter-tables/[id]/entries/[roll]/replace (replace single entry)
  - POST /api/encounter-tables/[id]/roll (perform roll)
  - PATCH /api/encounter-tables/[id]/share (toggle public status)
  - GET /api/encounter-tables/public/[slug] (view public table)
  - POST /api/encounter-tables/public/[slug]/copy (copy to user collection)

### III. Test-First (NON-NEGOTIABLE) ✓

- **Status**: PASS
- **Strategy**: TDD workflow enforced:
  1. Contract tests from OpenAPI specs (fail initially)
  2. Integration tests for user scenarios (15 acceptance criteria)
  3. E2E tests for critical flows (create → filter → generate → roll → share)
  4. Unit tests for utilities (dice roller, monster filtering, snapshot creation)
- **Coverage Target**: 40% minimum (focus on business logic and data integrity)

### IV. Integration Testing ✓

- **Status**: PASS
- **Critical Flows**:
  - Database operations (table CRUD, RLS policies, JSONB snapshots)
  - Authentication (user ownership, public access, copy operations)
  - Monster filtering (complex queries with level/alignment/movement/search)
  - Dice rolling (randomness, result highlighting, monster display)
  - Public sharing (slug generation, uniqueness validation, access control)

### V. Simplicity ✓

- **Status**: PASS
- **MVP Approach**: Core functionality only, no premature optimization
- **YAGNI Validation**: All 35 requirements traceable to user scenarios
- **Shadowdark Specifics**: Monster data structure follows existing schema, reuses monster detail components

### VI. Data Integrity ✓

- **Status**: PASS
- **Validation Points**:
  - Zod schemas for all API inputs (table creation, filter updates, entry replacement)
  - Database constraints (die size range 2-1000, unique public slugs, required table name)
  - Monster snapshot validation (preserve complete stat blocks in JSONB)
  - Business rules (unique monsters per table, sufficient monsters for die size)
- **Shadowdark Compliance**: Challenge Level validation reuses existing monster schema rules

### VII. Community Safety ✓

- **Status**: PASS
- **Safeguards**:
  - Tables default to private (is_public = false)
  - Explicit opt-in for public sharing (user action required)
  - Public tables read-only except for owner
  - Copied tables independent from originals (no shared state)
  - Future: Extend existing flagging system to tables (out of scope for MVP)

### Overall Assessment: PASS ✓

All constitutional principles satisfied. No deviations requiring justification.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single Next.js project) - Next.js App Router handles both frontend and backend via API routes

**Actual Project Structure**:

```
app/
├── api/
│   └── encounter-tables/
│       ├── route.ts                    # GET (list), POST (create)
│       ├── [id]/
│       │   ├── route.ts                # GET, PATCH, DELETE
│       │   ├── generate/route.ts       # POST (regenerate all entries)
│       │   ├── entries/[roll]/route.ts # PATCH (replace single entry)
│       │   ├── roll/route.ts           # POST (perform dice roll)
│       │   └── share/route.ts          # PATCH (toggle public)
│       └── public/
│           └── [slug]/
│               ├── route.ts            # GET (view public table)
│               └── copy/route.ts       # POST (copy to user collection)
├── encounter-tables/
│   ├── page.tsx                        # List view
│   ├── new/page.tsx                    # Create form
│   ├── [id]/
│   │   ├── page.tsx                    # Table detail + roll interface
│   │   └── settings/page.tsx           # Edit settings/filters
│   └── public/[slug]/page.tsx          # Public table view
├── components/
│   └── encounter-tables/
│       ├── EncounterTableForm.tsx      # Creation/settings form
│       ├── MonsterFilterPanel.tsx      # Filter UI
│       ├── DiceRoller.tsx              # Animated dice component
│       ├── TableEntryList.tsx          # Roll results display
│       ├── MonsterDetailPanel.tsx      # Monster stat block
│       ├── ShareDialog.tsx             # Public sharing UI
│       └── TableCard.tsx               # List item component
└── lib/
    ├── encounter-tables/
    │   ├── types.ts                    # TypeScript types
    │   ├── schemas.ts                  # Zod validation schemas
    │   ├── queries.ts                  # Supabase query helpers
    │   └── utils.ts                    # Business logic utilities
    └── supabase/
        └── migrations/
            └── YYYYMMDD_encounter_tables.sql

tests/
├── integration/
│   └── encounter-tables.test.ts        # API contract tests
├── e2e/
│   └── encounter-tables.spec.ts        # Playwright E2E tests
└── unit/
    └── encounter-tables/
        ├── dice-roller.test.ts
        ├── monster-filter.test.ts
        └── snapshot.test.ts
```

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Load Base Template**: Load `.specify/templates/tasks-template.md` as foundation
2. **Generate from Artifacts**:
   - **From data-model.md**: Database migration tasks (tables, indexes, RLS policies, triggers)
   - **From contracts/openapi.yaml**: Contract test tasks for all 11 endpoints
   - **From quickstart.md**: E2E test tasks for 15 acceptance scenarios + edge cases
   - **From research.md**: Utility implementation tasks (dice roller, slug generation, monster filtering)

3. **Task Categories** (TDD order):
   - **Database Layer**: Migration files, RLS policies, indexes
   - **Type Definitions**: Zod schemas, TypeScript interfaces
   - **Backend Utilities**: Monster filtering, snapshot creation, slug generation
   - **Contract Tests**: One task per endpoint (initially failing)
   - **API Implementation**: Route handlers to make contract tests pass
   - **Frontend Utilities**: Dice roller animation, form validation helpers
   - **React Components**: UI components (form, list, detail panel, dice, share dialog)
   - **Page Implementation**: Next.js pages with server components
   - **E2E Tests**: Critical user flows from quickstart scenarios

4. **Dependency Chain**:
   ```
   Database → Types → Utilities → Contract Tests → API Routes → Components → Pages → E2E Tests
                                                     ↓
                                          Contract Tests Pass
                                                     ↓
                                          E2E Tests Pass
   ```

**Ordering Strategy**:

- **Strict TDD**: Tests written before implementation for each layer
- **Parallel Opportunities [P]**:
  - Multiple contract test files (independent)
  - Multiple component implementations (after shared utils ready)
  - Multiple page implementations (after components ready)
- **Sequential Dependencies**:
  - Database before all code
  - Types before utilities
  - Utilities before API routes
  - API routes before components
  - Components before pages
  - Unit/integration tests before E2E tests

**Task Estimation**:

- Database: 4 tasks (migration, policies, indexes, verification)
- Types/Schemas: 3 tasks (Zod schemas, TypeScript types, validation)
- Backend Utilities: 5 tasks (monster filter, snapshot, slug, uniqueness, roll logic)
- Contract Tests: 11 tasks (one per endpoint)
- API Routes: 11 tasks (implement endpoints)
- Frontend Utilities: 3 tasks (dice animation, form helpers, error handling)
- Components: 7 tasks (form, filter panel, dice roller, entry list, detail panel, share dialog, table card)
- Pages: 5 tasks (list, create, detail, settings, public view)
- E2E Tests: 8 tasks (critical flows from quickstart)
- Documentation: 2 tasks (update README, API docs)

**Total Estimated Tasks**: ~59 tasks

**Parallel Execution Groups**:

- Group 1 [P]: All 11 contract test files (after types ready)
- Group 2 [P]: All 11 API route implementations (after contract tests written)
- Group 3 [P]: All 7 component files (after utilities ready)
- Group 4 [P]: All 5 page files (after components ready)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command) - 61 tasks in tasks.md
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none - all principles satisfied)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
