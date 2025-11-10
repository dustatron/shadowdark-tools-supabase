# Implementation Plan: Spell Card Deck Builder

**Branch**: `008-deck-building-for` | **Date**: 2025-11-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-deck-building-for/spec.md`

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

Build a spell card deck builder allowing users to create custom decks of up to 52 spell cards, then export them as print-ready PDFs in two layouts: individual 2.5"x3.5" cards or 9-card 3x3 grids on 8.5x11" pages. Users can save named decks, auto-save drafts, and manage their deck collections. Future extensibility for monster cards.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15 (App Router), React 19
**Primary Dependencies**: @react-pdf/renderer, React Hook Form, Zod, shadcn/ui (Radix UI), Tailwind CSS
**Storage**: Supabase PostgreSQL with RLS policies
**Testing**: Vitest (unit), Playwright (E2E), @testing-library/react (component)
**Target Platform**: Web (Vercel deployment)
**Project Type**: web (frontend + backend integrated via Next.js App Router)
**Performance Goals**: PDF generation <3s for 52-card deck, page load <2s, real-time card count updates
**Constraints**: PDF exact dimensions (2.5"x3.5" cards), 52 card max, unique spells per deck, auto-save drafts
**Scale/Scope**: User-owned decks, no sharing in MVP, extensible to monster cards v2

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Component-First ✅

- SpellCard component for card rendering
- DeckList component for deck management
- SpellSelector component for adding spells
- PDFExport component for generation
  All self-contained, testable, reusable.

### II. API-First ✅

- `GET /api/decks` - List user decks
- `POST /api/decks` - Create deck
- `GET /api/decks/[id]` - Get deck details
- `PUT /api/decks/[id]` - Update deck (add/remove spells)
- `DELETE /api/decks/[id]` - Delete deck
- `POST /api/decks/[id]/export` - Generate PDF
  RESTful, JSON, proper status codes.

### III. Test-First (NON-NEGOTIABLE) ✅

TDD workflow enforced:

1. Write contract tests for API endpoints
2. Write component tests for UI
3. Write integration tests for deck workflows
4. User approval before implementation
5. Implement to make tests pass
   Target 40% coverage.

### IV. Integration Testing ✅

E2E tests required:

- Auth flow → deck creation
- Deck CRUD operations with DB
- PDF generation workflow
- Auto-save behavior
- Spell deletion cascade

### V. Simplicity ✅

MVP scope only:

- No sharing/collaboration
- No reordering (future)
- Single-sided cards only
- @react-pdf/renderer (not Puppeteer overkill)
  YAGNI applied.

### VI. Data Integrity ✅

Zod validation for:

- Deck name required
- 52 card maximum
- Unique spells per deck
- Valid spell references
  DB constraints + RLS policies.

### VII. Community Safety ✅

Private decks only in MVP (user_id ownership).
No public sharing → no moderation needed yet.
Future: public sharing requires flagging system.

**Initial Check**: PASS ✅

## Project Structure

### Documentation (this feature)

```
specs/008-deck-building-for/
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
app/
├── decks/
│   ├── page.tsx                    # Deck list page
│   ├── [id]/
│   │   └── page.tsx                # Deck detail/edit page
│   └── new/
│       └── page.tsx                # New deck creation
├── api/
│   └── decks/
│       ├── route.ts                # GET (list), POST (create)
│       ├── [id]/
│       │   └── route.ts            # GET, PUT, DELETE
│       └── [id]/export/
│           └── route.ts            # POST (PDF generation)
components/
├── deck/
│   ├── DeckList.tsx
│   ├── DeckForm.tsx
│   ├── SpellSelector.tsx
│   └── SpellCard.tsx
└── pdf/
    ├── PDFDocument.tsx             # @react-pdf/renderer components
    ├── SpellCardPDF.tsx
    └── GridLayout.tsx
lib/
├── validations/
│   └── deck.ts                     # Zod schemas
└── pdf/
    └── generator.ts                # PDF utility functions
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

**Artifacts Generated**:

- [x] research.md - PDF library selection, auto-save strategy, constraints
- [x] data-model.md - Decks & deck_items schema, RLS policies, validation
- [x] contracts/decks-api.md - REST API contracts (7 endpoints)
- [x] quickstart.md - 12 test scenarios with validation queries
- [x] CLAUDE.md - Updated with deck builder context

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
