# Implementation Plan: Shadowdark Monster Manager Web Application

**Branch**: `001-create-a-plan` | **Date**: 2025-09-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-create-a-plan/spec.md`

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

This feature implements a comprehensive web application for Shadowdark Game Masters to search, manage, and generate encounters with monsters. The application provides official monster databases, custom monster creation, encounter list management, random table generation, and community sharing features. Built as a Next.js web application with Supabase backend following constitutional requirements for component-first architecture, test-driven development, and data integrity.

## Technical Context

**Language/Version**: TypeScript/JavaScript with Next.js 15+, React 19
**Primary Dependencies**: Next.js (App Router), Supabase (@supabase/ssr), shadcn/ui, Tailwind CSS, Zod, React Hook Form
**Storage**: Supabase (PostgreSQL) with Row Level Security, JSONB for complex monster data structures
**Testing**: Vitest (unit/integration), Playwright (E2E), 40% minimum coverage target
**Target Platform**: Web browsers (desktop/mobile), deployed on Vercel
**Project Type**: web - determines source structure follows Next.js App Router conventions
**Performance Goals**: Page loads <2s, search results <500ms, infinite scrolling for large datasets
**Constraints**: Supabase free tier initially, Shadowdark licensing compliance, guest user limits
**Scale/Scope**: 500+ users in 6 months, 10k+ monsters, community content moderation required

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**I. Component-First**: ✅ PASS - React component architecture with reusable UI components for monsters, lists, encounters
**II. API-First**: ✅ PASS - RESTful API design with Supabase endpoints, JSON data exchange, proper HTTP status codes
**III. Test-First**: ✅ PASS - TDD approach with Vitest + Playwright, 40% coverage target, tests before implementation
**IV. Integration Testing**: ✅ PASS - Database operations, auth flows, search functionality, encounter generation all covered

**Note (2025-01-17)**: API contract tests removed. While the Test-First principle remains via unit tests and E2E tests, the slow/brittle contract tests that required full server+database setup were replaced with:
- Unit tests for route handlers (mocked dependencies)
- E2E tests for critical user flows (Playwright)
- Manual testing during development

The contract tests served their purpose by revealing missing endpoints (POST /api/monsters, /api/monsters/random, UUID validation) which are now implemented.
**V. Simplicity**: ✅ PASS - MVP-focused approach, explicit Shadowdark rules, structured logging, no premature optimization
**VI. Data Integrity**: ✅ PASS - Zod validation at API boundaries, Shadowdark rule enforcement, database constraints
**VII. Community Safety**: ✅ PASS - Content flagging system, admin moderation, private-by-default content

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

**Structure Decision**: Option 2 - Web Application (Next.js App Router with current structure)

```
# Actual Next.js Structure (already exists)
app/                    # Next.js App Router pages and layouts
├── auth/              # Authentication pages
├── dashboard/         # Main application pages
├── admin/             # Admin pages
├── globals.css        # Global styles
└── layout.tsx         # Root layout

components/            # Reusable React components
├── ui/               # shadcn/ui base components
├── monsters/         # Monster-specific components
├── lists/            # List management components
└── encounters/       # Encounter generation components

lib/                  # Utilities and configurations
├── supabase/         # Supabase client configurations
├── utils.ts          # Utility functions
└── validations/      # Zod schemas

middleware.ts         # Auth and routing middleware
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

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

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
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

---

_Based on Constitution v2.1.1 - See `/memory/constitution.md`_
