# Implementation Plan: Admin Abilities - Magic Item Editing

**Branch**: `020-update-site-logic` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-update-site-logic/spec.md`

## Summary

Enable admin users to edit any magic item (official and user-created) with a warning modal for official content. Leverages existing `user_profiles.is_admin` flag and established RLS/API patterns.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router)
**Primary Dependencies**: React 19, shadcn/ui, Supabase, Zod, React Hook Form
**Storage**: Supabase PostgreSQL with Row Level Security
**Testing**: Vitest (unit), Playwright (E2E) - 40% coverage target
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web application (Next.js monolith)
**Performance Goals**: <2s page loads, <500ms API responses
**Constraints**: RLS-first security, preserve existing patterns
**Scale/Scope**: Single admin capability, ~8 files modified, 1 new component

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status | Notes                                                              |
| ----------------------- | ------ | ------------------------------------------------------------------ |
| I. Component-First      | PASS   | New `OfficialEditWarning` component, modifying existing components |
| II. API-First           | PASS   | New API route for official items follows REST patterns             |
| III. Test-First         | PASS   | E2E tests for admin edit flow planned                              |
| IV. Integration Testing | PASS   | Auth + DB operations will have integration tests                   |
| V. Simplicity           | PASS   | Minimal changes, follows existing patterns                         |
| VI. Data Integrity      | PASS   | Same Zod validation for admin edits                                |
| VII. Community Safety   | PASS   | Admin access controlled via user_profiles.is_admin                 |

**Initial Check**: PASS - No violations

## Project Structure

### Documentation (this feature)

```
specs/020-update-site-logic/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (completed)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code Changes

```
# Files to Modify
supabase/migrations/                              # New migration for official_magic_items UPDATE policy
app/magic-items/[slug]/page.tsx                   # Pass isAdmin to client
app/magic-items/[slug]/MagicItemDetailClient.tsx  # Accept isAdmin prop
app/magic-items/[slug]/edit/page.tsx              # Admin access to all items
components/magic-items/MagicItemActionMenu.tsx    # Check isAdmin for edit
components/entity-action-menu.tsx                 # Support isAdmin override

# Files to Add
app/api/official/magic-items/[id]/route.ts        # Admin update endpoint
components/magic-items/OfficialEditWarning.tsx    # Warning dialog
__tests__/e2e/admin-magic-item-edit.spec.ts       # E2E tests
```

**Structure Decision**: Existing Next.js App Router structure (no new directories needed)

## Phase 0: Research (COMPLETE)

See [research.md](./research.md) for full analysis.

**Key Decisions**:

1. Use existing `is_admin` flag in `user_profiles`
2. Add UPDATE policy to `official_magic_items` for admins
3. Pass `isAdmin` as prop from server components
4. Use `AlertDialog` for official item warning

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

### 1.1 Data Model Changes

See [data-model.md](./data-model.md)

### 1.2 API Contracts

See [contracts/](./contracts/)

### 1.3 Quickstart Test Scenarios

See [quickstart.md](./quickstart.md)

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Database Tasks** (sequential):
   - Migration for official_magic_items UPDATE policy

2. **API Tasks** (can be parallel after DB):
   - Create `/api/official/magic-items/[id]/route.ts`
   - Add admin check helper function

3. **Frontend Tasks** (sequential, depends on API):
   - Create `OfficialEditWarning` dialog component
   - Modify `entity-action-menu.tsx` for isAdmin support
   - Modify `MagicItemActionMenu` for admin edit
   - Modify detail page to pass isAdmin
   - Modify edit page for admin access

4. **Test Tasks** (parallel with implementation):
   - E2E test: Admin can edit user magic item
   - E2E test: Admin can edit official item with warning
   - E2E test: Non-admin cannot edit others' items

**Ordering Strategy**:

- TDD: Write E2E test scenarios first (can run against existing behavior to verify they fail)
- Dependencies: DB → API → Frontend
- Mark [P] for parallel execution

**Estimated Output**: 12-15 numbered, ordered tasks in tasks.md

## Complexity Tracking

_No violations - simple feature using existing patterns_

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |

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
- [x] Complexity deviations documented (none needed)

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
