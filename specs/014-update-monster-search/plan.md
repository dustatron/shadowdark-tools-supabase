# Implementation Plan: Monster Search View Toggle

**Branch**: `014-update-monster-search` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-update-monster-search/spec.md`

## Summary

Add toggle between card view and table view for monster search results. Users can switch views via a toggle control in the filter bar. Table view provides sortable columns (Name, CL, HP, AC) with clickable rows that navigate to monster details. View preference persists via URL parameter with localStorage fallback.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 15
**Primary Dependencies**: shadcn/ui, @tanstack/react-table, Tailwind CSS, Lucide React
**Storage**: N/A (frontend-only feature, view preference in URL + localStorage)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (responsive - desktop + mobile)
**Project Type**: Web (Next.js App Router)
**Performance Goals**: View toggle <100ms, table render <500ms for 100 monsters
**Constraints**: Mobile-friendly (horizontal scroll on small screens)
**Scale/Scope**: Works with paginated results (20-100 items per page)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status | Notes                                                    |
| ----------------------- | ------ | -------------------------------------------------------- |
| I. Component-First      | PASS   | MonsterTable is a new reusable component                 |
| II. API-First           | N/A    | No new API endpoints needed                              |
| III. Test-First         | PASS   | Unit tests for MonsterTable, integration test for toggle |
| IV. Integration Testing | PASS   | E2E test for view toggle flow planned                    |
| V. Simplicity           | PASS   | Minimal changes, leverages existing patterns             |
| VI. Data Integrity      | N/A    | No data changes                                          |
| VII. Community Safety   | N/A    | Display-only feature                                     |

## Project Structure

### Documentation (this feature)

```
specs/014-update-monster-search/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Type changes documentation
├── quickstart.md        # Manual test guide
├── contracts/           # Component contracts
│   └── README.md
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (repository root)

```
# Files to MODIFY
lib/types/monsters.ts                     # Add ViewMode type, update FilterValues
app/monsters/page.tsx                     # Parse view param
app/monsters/MonstersClient.tsx           # Handle view state
src/components/monsters/MonsterFilters.tsx # Add view toggle
src/components/monsters/MonsterList.tsx    # Conditional render

# Files to CREATE
src/components/monsters/MonsterTable.tsx   # New table view component

# Files to INSTALL (dependency)
package.json                               # Add @tanstack/react-table
```

**Structure Decision**: Web application (Next.js App Router)

## Phase 0: Outline & Research

**Status**: COMPLETE

Research documented in [research.md](./research.md):

1. **View persistence**: URL param `view=table|cards` with localStorage fallback
2. **Table implementation**: @tanstack/react-table with shadcn Table primitives
3. **Mobile handling**: Horizontal scroll, hide secondary columns on small screens
4. **Existing patterns**: Follows FilterValues/URL serialization pattern

All NEEDS CLARIFICATION markers resolved.

## Phase 1: Design & Contracts

**Status**: COMPLETE

Artifacts generated:

- [data-model.md](./data-model.md) - Type changes for ViewMode
- [contracts/README.md](./contracts/README.md) - Component prop contracts
- [quickstart.md](./quickstart.md) - Manual test steps

Key design decisions:

- Extend FilterValues with `view: ViewMode` field
- Toggle button group in MonsterFilters header area
- MonsterList conditionally renders MonsterCard grid or MonsterTable
- Client-side sorting via TanStack Table (no API changes)

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Dependency installation** - Add @tanstack/react-table
2. **Type definitions** - Update lib/types/monsters.ts with ViewMode
3. **Component creation** - MonsterTable.tsx with TanStack Table
4. **Component updates** - MonsterFilters (toggle), MonsterList (conditional render)
5. **State wiring** - MonstersClient handles view state from URL
6. **Tests** - Unit tests for MonsterTable, E2E for toggle flow

**Ordering Strategy**:

```
1. Install dependency [P]
2. Update types [P]
3. Create MonsterTable component
4. Write MonsterTable unit tests
5. Update MonsterFilters with toggle
6. Update MonsterList conditional render
7. Wire view state in MonstersClient
8. Update page.tsx to parse view param
9. Write E2E test for view toggle
10. Manual QA via quickstart.md
```

[P] = Parallelizable tasks

**Estimated Output**: ~15 tasks in tasks.md

## Complexity Tracking

_No violations - feature is simple and follows existing patterns_

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | -          | -                                    |

## Progress Tracking

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
- [x] Complexity deviations documented (none)

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
