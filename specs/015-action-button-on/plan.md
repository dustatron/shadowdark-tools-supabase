# Implementation Plan: Action Menu Button Component

**Branch**: `015-action-button-on` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-action-button-on/spec.md`

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

Replace separate favorite and edit buttons on monster detail pages with a unified action menu dropdown component. Button shows dropdown with context-aware actions: toggle favorite (heart icon), add to adventure list (opens modal), add to deck (disabled for monsters), and edit (owner only). Component must be reusable across entity types (monsters, spells) and only visible to authenticated users. Implements clean UI consolidation while maintaining full action functionality.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router)
**Primary Dependencies**: React 19, shadcn/ui (Radix UI primitives), Tailwind CSS 3.4+, Lucide React icons, Zod validation, react-hook-form
**Storage**: Supabase (PostgreSQL) - user_favorites, user_lists, list_items tables with RLS
**Testing**: Vitest 3.2+ (unit/integration), Playwright 1.55 (E2E), @testing-library/react 16.3
**Target Platform**: Web (Vercel deployment, modern browsers)
**Project Type**: web (Next.js App Router with components/ and app/ directories)
**Performance Goals**: <300ms for favorite toggle, <500ms for list modal load, <2s page load
**Constraints**: Mobile-responsive (touch-friendly), keyboard accessible (ARIA compliant), authenticated users only
**Scale/Scope**: Component reusability (2-3 entity types), modal state management, optimistic UI updates

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Component-First ✅

- **Status**: PASS
- **Compliance**: Feature implemented as reusable React components (`EntityActionMenu`, `ListSelectorModal`) with clear responsibilities and independent testability

### II. API-First ✅

- **Status**: PASS
- **Compliance**: Uses existing REST endpoints (favorites, lists APIs) with JSON request/response patterns and proper error handling

### III. Test-First (NON-NEGOTIABLE) ✅

- **Status**: PASS
- **Compliance**: TDD workflow enforced - component tests, integration tests for modal/actions, E2E tests for user workflows (favorite toggle, list selection)

### IV. Integration Testing ✅

- **Status**: PASS
- **Compliance**: E2E coverage for auth-gated component visibility, favorite state persistence, list modal interactions, error handling

### V. Simplicity ✅

- **Status**: PASS
- **Compliance**: MVP approach - reuses existing APIs, no over-engineering, explicit component patterns, minimal state complexity

### VI. Data Integrity ✅

- **Status**: PASS
- **Compliance**: Zod validation for list creation, RLS enforces user ownership, duplicate prevention for list items, optimistic updates with rollback

### VII. Community Safety ✅

- **Status**: PASS
- **Compliance**: Auth-gated features (no guest access), operates on user-owned content with existing moderation system

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

**Structure Decision**: Next.js App Router structure (web application)

```
app/                      # Next.js App Router pages
├── monsters/[id]/        # Monster detail pages
└── spells/[slug]/        # Spell detail pages

components/               # React components
├── entity-action-menu.tsx       # Main action menu component
├── list-selector-modal.tsx      # List selection dialog
└── ui/                          # shadcn/ui primitives

lib/                     # Utilities
├── supabase/            # Client creators
└── validations/         # Zod schemas

__tests__/              # Test files
├── components/         # Component unit tests
├── integration/        # Integration tests
└── e2e/               # Playwright E2E tests
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

The /tasks command will generate implementation tasks following TDD principles:

1. **Test Tasks First** (from contracts/ and quickstart.md):
   - Component unit tests for `EntityActionMenu` [P]
   - Component unit tests for `ListSelectorModal` [P]
   - Integration tests for favorite toggle with API [P]
   - Integration tests for list operations with API [P]
   - E2E tests for quickstart scenarios 1-11

2. **Component Implementation Tasks**:
   - Create `EntityActionMenu` component skeleton (make tests pass)
   - Create `ListSelectorModal` component skeleton (make tests pass)
   - Implement favorite toggle mutation hook
   - Implement list selection logic and modal state
   - Add keyboard navigation and ARIA attributes

3. **Integration Tasks**:
   - Replace favorite/edit buttons in monster detail page with `EntityActionMenu`
   - Add `EntityActionMenu` to spell detail page (reusability validation)
   - Verify existing API endpoints work correctly (favorites, lists)
   - Test RLS policies for user ownership

4. **Refinement Tasks**:
   - Add optimistic updates with rollback
   - Implement error handling and user feedback (toasts)
   - Add loading states and skeleton loaders
   - Mobile responsiveness validation
   - Accessibility audit (keyboard nav, ARIA, focus)

**Ordering Strategy**:

- **TDD Order**: All test tasks before implementation tasks
- **Dependency Order**:
  - Hooks/utilities before components
  - Components before page integration
  - Core functionality before refinements
- **Parallel Execution**: Mark [P] for:
  - Independent component tests
  - Independent integration tests
  - Monster vs Spell page updates (can be done simultaneously)

**Estimated Task Count**: 20-25 tasks

**Task Categories**:

- Test creation: 8-10 tasks
- Component implementation: 6-8 tasks
- Integration: 3-4 tasks
- Refinement/polish: 3-5 tasks

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
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
