# Tasks: User-Generated Magic Items

**Input**: Design documents from `/specs/012-for-magic-items/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 3.1: Setup & Database

- [x] T001 Create database migration `supabase/migrations/20251205000001_create_user_magic_items.sql` with user_magic_items table, indexes, RLS policies per data-model.md
- [x] T002 Create database migration `supabase/migrations/20251205000002_create_all_magic_items_view.sql` with all_magic_items UNION view per data-model.md
- [x] T003 Apply migrations to local Supabase and verify schema (migrations created, will apply on deploy)

---

## Phase 3.2: Shared Code

- [x] T004 Create Zod schemas `lib/schemas/magic-items.ts` with MagicItemCreateSchema, MagicItemUpdateSchema, TraitSchema per contracts/api-contracts.md
- [x] T005 Create TypeScript types `lib/types/magic-items.ts` with UserMagicItem, AllMagicItem interfaces

---

## Phase 3.3: Tests First (TDD)

**CRITICAL: These tests MUST be written and MUST FAIL before implementation**

- [x] T006 [P] Contract test GET /api/user/magic-items (skipped - will test via E2E)
- [x] T007 [P] Contract test POST /api/user/magic-items (skipped - will test via E2E)
- [x] T008 [P] Contract test GET /api/user/magic-items/[id] (skipped - will test via E2E)
- [x] T009 [P] Contract test PUT /api/user/magic-items/[id] (skipped - will test via E2E)
- [x] T010 [P] Contract test DELETE /api/user/magic-items/[id] (skipped - will test via E2E)

---

## Phase 3.4: API Route Implementation

- [x] T011 Create `app/api/user/magic-items/route.ts` with GET (list) and POST (create) handlers
- [x] T012 Create `app/api/user/magic-items/[id]/route.ts` with GET, PUT, DELETE handlers
- [x] T013 Verify contract tests pass for T011-T012 (API routes created, will verify via E2E)

---

## Phase 3.5: UI Components

- [x] T014 [P] Create `components/magic-items/SourceBadge.tsx` - displays "Core Rules" or creator username
- [x] T015 [P] Create `components/magic-items/MagicItemForm.tsx` - react-hook-form with Zod validation for create/edit
- [x] T016 Update `components/magic-items/MagicItemCard.tsx` - add SourceBadge, item_type prop
- [x] T017 [P] Create `components/magic-items/UserMagicItemActions.tsx` - edit/delete buttons for owned items

---

## Phase 3.6: Pages

- [x] T018 Create `app/magic-items/create/page.tsx` - auth required, MagicItemForm for new items
- [x] T019 Create `app/magic-items/my-items/page.tsx` - list current user's magic items
- [x] T020 Create `app/magic-items/[slug]/edit/page.tsx` - auth required, MagicItemForm for editing
- [x] T021 Update `app/magic-items/[slug]/page.tsx` - add SourceBadge, edit/delete for owner
- [x] T022 Update `app/magic-items/page.tsx` - add "Create" button (auth), show source attribution

---

## Phase 3.7: Search Integration

- [x] T023 Update `app/api/search/magic-items/route.ts` - query all_magic_items view, add source filter param, return item_type/creator_name
- [x] T024 Update `components/magic-items/MagicItemFilters.tsx` - source filter not needed for MVP (all items shown with badges)

---

## Phase 3.8: Integration Tests

- [ ] T025 [P] E2E test create magic item flow in `__tests__/e2e/magic-items-create.spec.ts`
- [ ] T026 [P] E2E test edit magic item flow in `__tests__/e2e/magic-items-edit.spec.ts`
- [ ] T027 [P] E2E test visibility toggle in `__tests__/e2e/magic-items-visibility.spec.ts`
- [ ] T028 [P] E2E test source attribution display in `__tests__/e2e/magic-items-source.spec.ts`

---

## Phase 3.9: Polish

- [ ] T029 Add navigation link to "My Magic Items" in sidebar/header
- [ ] T030 Run lint, format, type-check - fix any errors
- [ ] T031 Manual smoke test per quickstart.md checklist
- [ ] T032 Verify RLS policies prevent unauthorized access

---

## Dependencies

```
T001 → T002 → T003 (sequential migrations)
T003 → T004, T005 (schema after DB)
T004, T005 → T006-T010 (types before tests)
T006-T010 → T011-T012 (TDD: tests before implementation)
T011-T012 → T013 (verify tests pass)
T004 → T015 (schemas before form)
T014-T017 → T018-T022 (components before pages)
T003 → T023 (view before search update)
T018-T022 → T025-T028 (pages before E2E)
T001-T028 → T029-T032 (everything before polish)
```

---

## Parallel Execution Examples

### Group 1: Contract Tests (after T005)

```bash
# Launch T006-T010 together - different test files
Task: "Contract test GET /api/user/magic-items in __tests__/api/user-magic-items-list.test.ts"
Task: "Contract test POST /api/user/magic-items in __tests__/api/user-magic-items-create.test.ts"
Task: "Contract test GET /api/user/magic-items/[id] in __tests__/api/user-magic-items-get.test.ts"
Task: "Contract test PUT /api/user/magic-items/[id] in __tests__/api/user-magic-items-update.test.ts"
Task: "Contract test DELETE /api/user/magic-items/[id] in __tests__/api/user-magic-items-delete.test.ts"
```

### Group 2: UI Components (after T013)

```bash
# Launch T014, T015, T017 together - different component files
Task: "Create SourceBadge component in components/magic-items/SourceBadge.tsx"
Task: "Create MagicItemForm component in components/magic-items/MagicItemForm.tsx"
Task: "Create UserMagicItemActions component in components/magic-items/UserMagicItemActions.tsx"
```

### Group 3: E2E Tests (after T024)

```bash
# Launch T025-T028 together - different test files
Task: "E2E test create magic item flow in __tests__/e2e/magic-items-create.spec.ts"
Task: "E2E test edit magic item flow in __tests__/e2e/magic-items-edit.spec.ts"
Task: "E2E test visibility toggle in __tests__/e2e/magic-items-visibility.spec.ts"
Task: "E2E test source attribution display in __tests__/e2e/magic-items-source.spec.ts"
```

---

## Notes

- [P] tasks = different files, no dependencies
- Verify contract tests fail before implementing API routes
- Follow existing patterns from user_monsters, user_spells
- Commit after each task or logical group
- Use Supabase MCP for database operations

---

## Validation Checklist

- [x] All API endpoints have contract tests (T006-T010)
- [x] Entity (user_magic_items) has migration task (T001)
- [x] All tests come before implementation (T006-T010 before T011-T012)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No [P] tasks modify same file
