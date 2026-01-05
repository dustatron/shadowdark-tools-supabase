# Implementation Plan: User Equipment CRUD

**Branch**: `019-update-equipment-to` | **Date**: 2025-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-update-equipment-to/spec.md`

## Summary

Implement full CRUD operations for user-created equipment items, mirroring existing magic items/spells/monsters patterns. Uses TanStack Query (useMutation) for API calls, Supabase for persistence with RLS, and react-hook-form with Zod for form validation.

## Technical Context

**Language/Version**: TypeScript 5, Node.js 18+
**Primary Dependencies**: Next.js 15, React 19, TanStack Query 5, react-hook-form 7, Zod 4, shadcn/ui
**Storage**: Supabase (PostgreSQL with RLS)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Vercel, modern browsers
**Project Type**: web (Next.js App Router)
**Performance Goals**: <500ms list load, <1s create/update
**Constraints**: Follow existing patterns from magic-items feature
**Scale/Scope**: MVP - single user equipment management

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status | Notes                                          |
| ----------------------- | ------ | ---------------------------------------------- |
| I. Component-First      | PASS   | EquipmentForm component, reusable              |
| II. API-First           | PASS   | RESTful /api/user/equipment endpoints          |
| III. Test-First         | PASS   | Contract tests before implementation           |
| IV. Integration Testing | PASS   | E2E tests for CRUD flows                       |
| V. Simplicity           | PASS   | Follows existing patterns, no over-engineering |
| VI. Data Integrity      | PASS   | Zod schemas, DB constraints                    |
| VII. Community Safety   | PASS   | RLS policies, is_public default false          |

## Project Structure

### Documentation (this feature)

```
specs/019-update-equipment-to/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── user-equipment-api.yaml
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code (to be created)

```
app/
├── api/user/equipment/
│   ├── route.ts              # GET list, POST create
│   └── [id]/route.ts         # GET, PUT, DELETE
├── equipment/
│   ├── create/page.tsx       # Create form page
│   └── [slug]/edit/page.tsx  # Edit form page
├── dashboard/equipment/
│   └── page.tsx              # My Equipment page

components/equipment/
├── EquipmentForm.tsx         # Create/edit form
└── UserEquipmentActions.tsx  # Edit/delete buttons

lib/
├── schemas/equipment.ts      # Zod validation
├── types/equipment.ts        # Type updates
└── hooks/use-equipment-mutations.ts  # TanStack mutations

supabase/migrations/
├── YYYYMMDD_create_user_equipment.sql
├── YYYYMMDD_create_all_equipment_view.sql
└── YYYYMMDD_update_adventure_list_items.sql
```

**Structure Decision**: Option 2 (Web application) - Next.js App Router

## Phase 0: Outline & Research

**Status**: Complete

Research findings documented in [research.md](./research.md):

- Database pattern: Follow user_magic_items exactly
- API pattern: /api/user/equipment with same auth/validation
- TanStack pattern: useMutation with fetch, queryClient invalidation
- Form pattern: Separate EquipmentForm with react-hook-form + Zod
- Cascade delete: Trigger on user_equipment delete → adventure_list_items

**Output**: research.md with all patterns resolved

## Phase 1: Design & Contracts

**Status**: Complete

1. **Data model**: [data-model.md](./data-model.md)
   - user_equipment table with RLS
   - all_equipment view
   - Cascade delete trigger
   - Zod schemas

2. **API contracts**: [contracts/user-equipment-api.yaml](./contracts/user-equipment-api.yaml)
   - OpenAPI 3.0 spec
   - All CRUD endpoints defined
   - Request/response schemas

3. **Quickstart**: [quickstart.md](./quickstart.md)
   - Validation scenarios
   - API curl examples
   - Database validation queries

**Output**: data-model.md, contracts/, quickstart.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Database migrations first (user_equipment table, view, trigger)
- Zod schemas and types
- API routes (test → implement pattern)
- Form component
- Page components (create, edit, my-equipment)
- Integration with existing equipment pages

**Ordering Strategy**:

1. DB migrations (sequential - dependencies)
2. Types and schemas [P] (parallel)
3. API route tests → implementation
4. Form component tests → implementation
5. Page components
6. Integration tests

**Estimated Output**: ~20 numbered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No violations - all patterns follow existing codebase conventions_

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | -          | -                                    |

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
- [x] Complexity deviations documented (none needed)

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
