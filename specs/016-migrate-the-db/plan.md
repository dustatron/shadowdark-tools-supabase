# Implementation Plan: Migrate DB Functions to TypeScript Services

**Branch**: `016-migrate-the-db` | **Date**: 2025-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-migrate-the-db/spec.md`

---

## Summary

Migrate 3 PostgreSQL RPC functions (`search_monsters`, `search_all_content`, `create_audit_log`) to TypeScript service functions. This improves maintainability, testability, and enables full IDE support while maintaining backward API compatibility.

---

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15
**Primary Dependencies**: @supabase/supabase-js, Zod
**Storage**: Supabase PostgreSQL (views: all_monsters, all_spells, all_magic_items; tables: equipment, audit_logs)
**Testing**: Vitest (unit), Playwright (e2e)
**Target Platform**: Vercel (Node.js serverless)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: <500ms search response, <200ms audit log creation
**Constraints**: Must maintain exact API response structure
**Scale/Scope**: 3 service files, 4 API routes updated

---

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status  | Notes                                          |
| ----------------------- | ------- | ---------------------------------------------- |
| I. Component-First      | N/A     | Backend services, no UI components             |
| II. API-First           | ✅ PASS | Services expose clear function contracts       |
| III. Test-First         | ✅ PASS | Contract tests defined before implementation   |
| IV. Integration Testing | ✅ PASS | E2E tests for search endpoints planned         |
| V. Simplicity           | ✅ PASS | Direct Supabase queries, no abstraction layers |
| VI. Data Integrity      | ✅ PASS | Zod validation at API boundaries               |
| VII. Community Safety   | N/A     | No public content changes                      |

**Initial Constitution Check**: PASS
**Post-Design Constitution Check**: PASS

---

## Project Structure

### Documentation (this feature)

```
specs/016-migrate-the-db/
├── plan.md              # This file
├── research.md          # ✅ Complete
├── data-model.md        # ✅ Complete
├── quickstart.md        # ✅ Complete
├── contracts/           # ✅ Complete
│   ├── monster-search.ts
│   ├── unified-search.ts
│   └── audit.ts
└── tasks.md             # Created by /tasks command
```

### Source Code (repository root)

```
lib/services/
├── adventure-list-items.ts  # Existing (reference pattern)
├── monster-search.ts        # NEW
├── unified-search.ts        # NEW
└── audit.ts                 # NEW

app/api/
├── search/
│   ├── monsters/route.ts    # UPDATE: use monster-search service
│   └── route.ts             # UPDATE: use unified-search service
├── encounters/
│   └── generate/route.ts    # UPDATE: use monster-search service
└── admin/
    ├── users/[id]/route.ts  # UPDATE: use audit service
    └── flags/[id]/route.ts  # UPDATE: use audit service
```

---

## Phase 0: Research (Complete)

See [research.md](./research.md) for:

- Analysis of existing DB functions
- Fuzzy search approach decision
- Service file structure
- Risks and mitigations

---

## Phase 1: Design (Complete)

See [data-model.md](./data-model.md) for:

- TypeScript service interfaces
- Function signatures
- Validation rules

See [contracts/](./contracts/) for:

- monster-search.ts - searchMonsters(), getRandomMonsters()
- unified-search.ts - searchAllContent()
- audit.ts - createAuditLog()

See [quickstart.md](./quickstart.md) for:

- Verification steps
- Test commands
- Success criteria

---

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Service Implementation Tasks** (TDD order):
   - Write unit tests for each service function
   - Implement service functions to pass tests
   - Order: audit.ts → monster-search.ts → unified-search.ts

2. **API Route Update Tasks**:
   - Update each route to use new service
   - Remove RPC calls
   - Verify response structure unchanged

3. **Integration Test Tasks**:
   - E2E tests for search endpoints
   - Verify encounter generation works

**Ordering Strategy**:

- Start with simplest (audit) to establish pattern
- monster-search before unified-search (unified depends on pattern)
- API updates after corresponding service complete
- Integration tests last

**Task Dependencies**:

```
audit.ts tests [P] ─────► audit.ts impl ─────► admin routes update
monster-search tests [P] ► monster-search impl ► search/monsters route
                                              ► encounters route
unified-search tests ────► unified-search impl ► search route
                                              ► e2e tests
```

**Estimated Output**: ~18 tasks in tasks.md

---

## Complexity Tracking

_No violations - design follows constitutional principles_

---

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [x] Phase 4: Implementation complete (83 tests, 3 services, 5 routes updated)
- [x] Phase 5: Validation passed (build passes, no RPC in prod code)

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none needed)

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
