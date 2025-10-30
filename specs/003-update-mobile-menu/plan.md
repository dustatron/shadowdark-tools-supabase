# Implementation Plan: Enhanced Mobile Navigation Menu

**Branch**: `003-update-mobile-menu` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-update-mobile-menu/spec.md`

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

**Primary Requirement**: Enhance the mobile navigation menu to display all user account options (Dashboard, Profile, Settings, Logout) as direct menu items when authenticated, eliminating the need for nested dropdown interaction and improving discoverability.

**Technical Approach**: Modify the existing Navbar component's mobile menu section to conditionally render user-specific menu items inline when authenticated, while maintaining the desktop dropdown behavior unchanged. This is a frontend-only change requiring component refactoring and visual design updates.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15 (App Router)
**Primary Dependencies**: React 19, shadcn/ui (Radix UI primitives), Tailwind CSS, next-themes, Lucide React icons
**Storage**: N/A (frontend-only feature, uses existing Supabase auth state)
**Testing**: Vitest for component tests, Playwright for E2E tests
**Target Platform**: Web browsers (mobile and desktop viewports)
**Project Type**: Web application (Next.js frontend with Supabase backend)
**Performance Goals**: Smooth animations (<16ms frame time for 60fps), instant menu interactions
**Constraints**: Mobile viewport breakpoint at 768px, touch-friendly tap targets (44x44px minimum), maintain existing desktop behavior
**Scale/Scope**: Single component modification affecting all authenticated mobile users

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Core Principles Alignment

**I. Component-First** ✅

- Feature implemented as modification to existing reusable `Navbar` component
- Clear responsibility: Mobile menu rendering logic
- Self-contained with props-based configuration

**II. API-First** ✅

- N/A - Frontend-only feature, no new API endpoints
- Uses existing Supabase auth state

**III. Test-First (NON-NEGOTIABLE)** ✅

- Component tests will be written for mobile menu rendering states
- E2E tests for mobile navigation flows
- Tests written before implementation

**IV. Integration Testing** ✅

- E2E tests will cover authenticated/guest user mobile navigation
- Auth state integration tested with existing flows

**V. Simplicity** ✅

- MVP approach: Single component modification
- No new dependencies required
- Reuses existing shadcn/ui components and patterns

**VI. Data Integrity** ✅

- N/A - No data validation required
- Uses existing auth state without modification

**VII. Community Safety** ✅

- N/A - UI-only feature, no user-generated content

### Development Standards Compliance

- ✅ Next.js 15 App Router with TypeScript
- ✅ shadcn/ui components (Popover, Button, Separator)
- ✅ Tailwind CSS for styling
- ✅ Responsive design (mobile-first)
- ✅ Maintains existing project structure

### Quality Assurance

- ✅ Component unit tests (Vitest)
- ✅ E2E tests for navigation flows (Playwright)
- ✅ Accessibility: Touch-friendly targets, keyboard navigation
- ✅ No security impact (frontend-only, uses existing auth)

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

**Structure Decision**: Next.js App Router structure (existing)

This project follows Next.js 15 App Router conventions:

```
app/                    # Next.js pages and layouts
components/             # React components (modification target)
  ├── navigation/       # Navigation-specific components
  │   └── app-navbar.tsx    # Main navbar component (to be modified)
  └── ui/              # shadcn/ui components
      └── navbar.tsx        # Base navbar component (to be modified)
__tests__/             # Test files
  └── components/      # Component tests
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

This is a frontend-only feature with no API endpoints or database changes. Tasks will be generated from:

1. **Component Contracts** (`contracts/component-contracts.md`):
   - Each component contract → component test suite task
   - Navbar component modifications → implementation task
   - AppNavbar component modifications → implementation task

2. **User Stories** (from `spec.md`):
   - Each acceptance scenario → E2E test task
   - Guest user flow → E2E test
   - Authenticated user flow → E2E test
   - Admin user flow → E2E test

3. **Quickstart Validation** (`quickstart.md`):
   - Manual validation checklist → QA task
   - Performance validation → performance test task

**Task Categories**:

1. **Test Creation Tasks** (TDD - Write First):
   - Component unit tests for Navbar [P]
   - Component unit tests for AppNavbar [P]
   - E2E test for guest user mobile navigation
   - E2E test for authenticated user mobile navigation
   - E2E test for admin user mobile navigation

2. **Implementation Tasks** (After Tests):
   - Modify `navbar.tsx` to support mobileMenuItems prop
   - Modify `app-navbar.tsx` to generate mobile menu items
   - Update mobile menu rendering logic
   - Implement theme toggle in mobile menu
   - Style updates for mobile menu items

3. **Integration & Validation**:
   - Run all tests and fix failures
   - Manual quickstart validation
   - Performance validation (60fps check)
   - Accessibility validation (keyboard, touch targets)

**Ordering Strategy**:

1. **Phase 1: Test Creation (TDD - Red)**
   - [P] Write Navbar component tests
   - [P] Write AppNavbar component tests
   - [P] Write E2E tests (can run in parallel)
   - All tests MUST fail initially (no implementation yet)

2. **Phase 2: Component Implementation (Green)**
   - Update Navbar component (makes Navbar tests pass)
   - Update AppNavbar component (makes AppNavbar tests pass)
   - Both components can be worked on in parallel initially
   - Integration testing after both complete

3. **Phase 3: E2E & Validation (Green + Refactor)**
   - Run E2E tests (should pass with component implementation)
   - Manual quickstart validation
   - Performance & accessibility checks
   - Refactor if needed

**Estimated Output**: 12-15 numbered, ordered tasks in tasks.md

**Task Complexity**:

- Component tests: ~2-3 hours (TDD setup, mock auth state)
- E2E tests: ~2-3 hours (Playwright scenarios, auth setup)
- Component implementation: ~3-4 hours (refactoring existing components)
- Validation & polish: ~1-2 hours (quickstart, accessibility)
- **Total Estimate**: 8-12 hours for complete implementation

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

- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented: N/A (no violations) ✅

**Artifacts Generated**:

- [x] `research.md` - Technical research and decisions ✅
- [x] `data-model.md` - Component state and data flow ✅
- [x] `contracts/component-contracts.md` - Component contracts and test specs ✅
- [x] `quickstart.md` - Manual validation guide ✅
- [x] `CLAUDE.md` - Updated agent context ✅

---

_Based on Constitution v1.3.0 - See `.specify/memory/constitution.md`_
