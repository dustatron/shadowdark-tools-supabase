# Implementation Plan: Migrate from Top Navigation to Left Sidebar

**Branch**: `010-i-want-to` | **Date**: 2025-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-i-want-to/spec.md`

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

Replace the existing horizontal top navigation bar with shadcn/ui's vertical left sidebar component. Maintain all navigation functionality (public links, user dashboard, authentication controls, theme toggle) while providing a modern, collapsible sidebar experience. Desktop users get icon/full-label collapsible sidebar with state persistence. Mobile users get overlay sidebar toggled via hamburger button. All 18 functional requirements from spec must be preserved including role-based menu visibility, keyboard shortcuts, and accessibility.

## Technical Context

**Language/Version**: TypeScript 5 with Next.js 15 (App Router), React 19
**Primary Dependencies**: shadcn/ui (Radix UI primitives), Tailwind CSS 3.4, next-themes 0.4, Lucide React 0.545
**Storage**: Cookie-based sidebar state persistence, localStorage fallback
**Testing**: Vitest 3.2 (unit/integration), Playwright 1.55 (E2E), target 40% coverage
**Target Platform**: Web browsers (desktop + mobile responsive), Vercel deployment
**Project Type**: Web application (Next.js App Router structure)
**Performance Goals**: <100ms sidebar toggle animation, no layout shift on load, <300ms navigation transitions
**Constraints**: Must maintain all existing navigation functionality, preserve auth context, support keyboard navigation (cmd/ctrl+b)
**Scale/Scope**: 33 existing pages across app/, dashboard routes require layout updates, ~18 navigation links + user menu items

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Component-First ✅

- **Status**: PASS
- **Rationale**: Sidebar is a reusable React component (`app-sidebar.tsx`) with clear navigation responsibility. Composable structure using shadcn/ui primitives (SidebarProvider, SidebarMenu, SidebarContent). Replaces existing `AppNavbar` component with modular sidebar architecture.

### II. API-First ✅

- **Status**: PASS (N/A - Frontend only)
- **Rationale**: No new API endpoints required. This is a pure UI/UX refactor replacing navigation components. All existing API contracts maintained.

### III. Test-First (NON-NEGOTIABLE) ✅

- **Status**: PASS (with plan)
- **Rationale**: Will create component tests for sidebar interactions (collapse/expand, mobile toggle), E2E tests for navigation flows, and accessibility tests for keyboard shortcuts. Tests written before implementation following TDD cycle.

### IV. Integration Testing ✅

- **Status**: PASS (with plan)
- **Rationale**: E2E tests will validate auth flows (guest vs authenticated menus), role-based visibility (admin sections), navigation across pages, and mobile/desktop responsive behavior. Critical user workflows maintained.

### V. Simplicity ✅

- **Status**: PASS
- **Rationale**: Using battle-tested shadcn/ui Sidebar component (no custom implementation). Minimal state management (collapsed/expanded preference). Direct replacement of existing navbar without architectural changes. Following YAGNI - no premature features.

### VI. Data Integrity ✅

- **Status**: PASS (N/A - No data changes)
- **Rationale**: No database schema changes. User context and auth state validation unchanged. Sidebar preferences stored client-side only.

### VII. Community Safety ✅

- **Status**: PASS (N/A - No new content)
- **Rationale**: No new user-generated content features. Existing moderation and safety features unchanged.

### Overall Constitution Compliance

**Initial Check**: ✅ PASS - All principles satisfied or N/A
**Complexity Deviations**: None - using standard shadcn/ui patterns

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

**Structure Decision**: [DEFAULT to Option 1 unless Technical Context indicates web/mobile app]

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

The /tasks command will generate an ordered, dependency-aware task list following TDD principles:

1. **Test Tasks First** (following Constitution Principle III):
   - Unit tests for AppSidebar component filtering logic
   - Unit tests for theme toggle behavior
   - Integration tests for sidebar state persistence
   - E2E tests for navigation flows (guest, authenticated, admin)
   - E2E tests for mobile/desktop responsive behavior
   - E2E tests for keyboard navigation and accessibility

2. **Component Implementation Tasks**:
   - Install shadcn/ui Sidebar component via CLI
   - Create AppSidebar component with navigation structure
   - Create navigation link configuration
   - Create user menu item filtering logic
   - Implement active route indication with usePathname()
   - Integrate theme toggle into sidebar footer

3. **Layout Integration Tasks**:
   - Update app/layout.tsx with SidebarProvider
   - Remove old AppNavbar component and imports
   - Remove old Navbar UI component
   - Update all page layouts to work with sidebar
   - Handle dashboard layout restructuring (user noted need)

4. **State Management Tasks**:
   - Verify cookie-based persistence works
   - Test mobile vs desktop state separation
   - Validate keyboard shortcut (cmd/ctrl+b)

5. **Polish & Cleanup Tasks**:
   - Add skip link for accessibility
   - Verify all icons imported correctly
   - Test performance (< 100ms toggle animation)
   - Run regression tests on existing features
   - Update documentation/README if needed

**Ordering Strategy**:

- **Phase A (Tests)**: Write failing tests first [P] - parallel where independent
- **Phase B (Foundation)**: Install sidebar, create base component structure
- **Phase C (Features)**: Implement filtering, routing, state management [P] where possible
- **Phase D (Integration)**: Update layouts, remove old components
- **Phase E (Validation)**: Run tests, fix failures, validate quickstart

**Estimated Task Count**: 30-35 tasks

**Parallelization Opportunities**:

- Multiple test files can be written in parallel [P]
- Component creation tasks that don't depend on each other [P]
- Documentation tasks [P]

**Critical Path** (must be sequential):

1. Install shadcn sidebar → 2. Create AppSidebar → 3. Update layout → 4. Remove old navbar

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**Status**: ✅ No complexity violations

This feature adheres to all constitutional principles with no deviations requiring justification.

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
  - ✅ research.md created with 8 technical decisions
  - ✅ All unknowns resolved (sidebar variant, persistence, breakpoints, icons, etc.)
- [x] Phase 1: Design complete (/plan command)
  - ✅ data-model.md created with component interfaces
  - ✅ contracts/component-interfaces.ts created with TypeScript contracts
  - ✅ contracts/test-scenarios.md created with 24 test scenarios
  - ✅ quickstart.md created with 10-step validation guide
  - ✅ CLAUDE.md updated with new tech context
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
  - ✅ Task generation strategy documented
  - ✅ Ordering strategy defined (TDD-first, 5 phases)
  - ✅ Parallelization opportunities identified
  - ✅ Estimated 30-35 tasks
- [ ] Phase 3: Tasks generated (/tasks command - NOT EXECUTED YET)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
  - ✅ Component-First: Using shadcn/ui primitives
  - ✅ API-First: N/A (frontend only)
  - ✅ Test-First: TDD plan documented
  - ✅ Integration Testing: E2E tests planned
  - ✅ Simplicity: No premature complexity
  - ✅ Data Integrity: N/A (no DB changes)
  - ✅ Community Safety: N/A (no new content)
- [x] Post-Design Constitution Check: PASS
  - ✅ Design maintains all constitutional principles
  - ✅ No complexity violations introduced
- [x] All NEEDS CLARIFICATION resolved
  - ✅ All technical decisions made in research phase
- [x] Complexity deviations documented
  - ✅ None - using standard patterns

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
