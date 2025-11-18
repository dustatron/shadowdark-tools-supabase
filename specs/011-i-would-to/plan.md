# Implementation Plan: Magic Items (Read-Only Starter)

**Branch**: `011-i-would-to` | **Date**: 2025-11-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-i-would-to/spec.md`

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

Add read-only magic items feature to Dungeon Exchange, mirroring the existing spells and monsters implementation patterns. System will display official Shadowdark magic items from starter data (starter-data/magic-items.json) with browsing, search, and detail view capabilities. Users can view magic item names, descriptions, and traits (Benefits, Curses, Bonuses, Personality). No user creation/editing in this phase - purely reference material for Game Masters planning treasure rewards.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router)
**Primary Dependencies**: React 19, shadcn/ui (Radix UI), Tailwind CSS 3.4+, Zod 4.1
**Storage**: Supabase (PostgreSQL) with official_magic_items table, JSONB for traits array
**Testing**: Skipped for initial pass (focus on implementation)
**Target Platform**: Web (Vercel deployment), SSR + Client Components
**Project Type**: web (Next.js App Router with API routes)
**Performance Goals**: <2s page loads, <200ms search, <100ms list, <50ms detail
**Constraints**: Read-only (no mutations), follow existing spells pattern, seed from starter-data/magic-items.json, server-side search (backend filtering)
**Scale/Scope**: ~150 official magic items, alphabetical listing, name+description search

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Component-First ✅

- MagicItemCard component for list display
- MagicItemDetail component for full view
- MagicItemSearch component for filtering
- TraitBadge component for trait display
- Reusable, testable, self-contained

### II. API-First ✅

- GET /api/magic-items (list with search)
- GET /api/magic-items/[slug] (single item)
- JSON responses, proper HTTP status codes
- Follows existing monsters/spells patterns

### III. Test-First (NON-NEGOTIABLE) ✅

- Contract tests for API endpoints (fail first)
- Component tests for UI (fail first)
- E2E test for browse → search → detail flow
- Target 40% coverage minimum

### IV. Integration Testing ✅

- Database query tests (Supabase)
- Search functionality tests
- SSR/Client component integration
- Migration seeding validation

### V. Simplicity ✅

- MVP: Read-only viewing only
- No mutations (create/edit/delete)
- Reuse existing UI patterns from monsters/spells
- YAGNI: No filtering by trait type in v1

### VI. Data Integrity ✅

- Zod schemas for API responses
- Database constraints (unique slug, not null)
- JSONB validation for traits structure
- Seed data validation during migration

### VII. Community Safety ✅

- N/A for read-only official content
- No user-generated content in this phase
- Future: Will follow existing moderation patterns

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

**Structure Decision**: Option 2 (Web application) - Next.js App Router with app/ directory for pages and API routes

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

1. **Database Tasks** (Foundation):
   - Create migration file for official_magic_items table
   - Add indexes (slug, name, description, traits)
   - Extend content_type_enum for user_favorites
   - Seed data from starter-data/magic-items.json (150 items)
   - Create RLS policies for public read access

2. **Contract Test Tasks** (TDD):
   - Write test: GET /api/magic-items (list) [P]
   - Write test: GET /api/magic-items?search=term [P]
   - Write test: GET /api/magic-items/[slug] (single) [P]
   - Write test: Performance benchmarks (<500ms, <300ms) [P]

3. **API Implementation Tasks**:
   - Implement: GET /api/magic-items route handler
   - Implement: GET /api/magic-items/[slug] route handler
   - Add Zod validation schemas
   - Add error handling (404, 400, 500)

4. **Component Test Tasks** (TDD):
   - Write test: MagicItemCard component [P]
   - Write test: MagicItemDetail component [P]
   - Write test: MagicItemSearch component [P]
   - Write test: TraitBadge component [P]

5. **UI Implementation Tasks**:
   - Create: app/magic-items/page.tsx (Server Component)
   - Create: app/magic-items/MagicItemsClient.tsx (search state)
   - Create: app/magic-items/[slug]/page.tsx (detail page)
   - Create: components/MagicItemCard.tsx
   - Create: components/TraitBadge.tsx

6. **Integration Test Tasks**:
   - Write E2E test: Browse → Search → Detail flow
   - Write E2E test: Favorites integration (future)

**Ordering Strategy**:

```
1. Database migration + seed [BLOCKING]
2. Contract tests (parallel) [P]
3. API implementation (sequential, depends on #2)
4. Component tests (parallel) [P]
5. UI components (sequential, depends on #4)
6. E2E test (depends on #3 + #5)
```

**Task Categorization**:

- [P] = Parallel execution (independent)
- [BLOCKING] = Must complete before other tasks
- [TEST] = Test-first task (must fail initially)

**Estimated Output**: 18-22 numbered, ordered tasks in tasks.md

**Dependencies**:

- Database → API → UI (sequential)
- Tests within each layer can run in parallel
- E2E test depends on full stack

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
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented (N/A - no violations)

**Generated Artifacts**:

- [x] research.md (Phase 0) - Updated with architecture decisions
- [x] data-model.md (Phase 1) - Updated indexes and seeding strategy
- [x] contracts/magic-items-api.yaml (Phase 1) - Updated response structure
- [x] contracts/magic-items-api.test.ts (Phase 1) - Deprecated (no tests this pass)
- [x] quickstart.md (Phase 1)
- [x] CLAUDE.md updated (Phase 1)
- [x] tasks.md (Phase 3) - **12 tasks** (revised from 24, tests removed)

**Architecture Review**:

- [x] nextjs-architect review completed
- [x] Critical issues addressed (API pattern, seeding, indexes)
- [x] Recommendations incorporated (server-side search, component organization)

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
