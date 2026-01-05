# Tasks: User Equipment CRUD

**Input**: Design documents from `/specs/019-update-equipment-to/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/
**Total Tasks**: 28 tasks across 8 phases

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Database Setup

- [x] T001 Create user_equipment table migration in supabase/migrations/20250105_create_user_equipment.sql
- [x] T002 Create all_equipment view migration in supabase/migrations/20250105_create_all_equipment_view.sql (depends on T001)
- [x] T003 Update adventure_list_items constraint in supabase/migrations/20250105_update_adventure_list_items.sql
- [x] T004 Update get_adventure_list_items function in supabase/migrations/20250105_update_get_adventure_list_items.sql

## Phase 3.2: Types and Schemas

- [x] T005 [P] Update equipment types in lib/types/equipment.ts to include UserEquipment interface
- [x] T006 [P] Create Zod schemas in lib/schemas/equipment.ts (EquipmentCreateSchema, EquipmentUpdateSchema, generateSlug)

## Phase 3.3: API Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [ ] T007 [P] Contract test GET /api/user/equipment in **tests**/api/user/equipment/list.test.ts
- [ ] T008 [P] Contract test POST /api/user/equipment in **tests**/api/user/equipment/create.test.ts
- [ ] T009 [P] Contract test GET /api/user/equipment/[id] in **tests**/api/user/equipment/get.test.ts
- [ ] T010 [P] Contract test PUT /api/user/equipment/[id] in **tests**/api/user/equipment/update.test.ts
- [ ] T011 [P] Contract test DELETE /api/user/equipment/[id] in **tests**/api/user/equipment/delete.test.ts

## Phase 3.4: API Implementation (ONLY after tests are failing)

- [x] T012 Implement GET and POST in app/api/user/equipment/route.ts
- [x] T013 Implement GET, PUT, DELETE in app/api/user/equipment/[id]/route.ts

## Phase 3.5: Component Implementation

- [x] T014 Create EquipmentForm component in components/equipment/EquipmentForm.tsx
- [x] T015 Create UserEquipmentActions component in components/equipment/UserEquipmentActions.tsx
- [x] T016 [P] Create TanStack Query hooks in lib/hooks/use-equipment-mutations.ts

## Phase 3.6: Page Implementation

- [x] T017 Create equipment create page in app/equipment/create/page.tsx
- [x] T018 Create equipment edit page in app/equipment/[slug]/edit/page.tsx
- [x] T019 Create My Equipment dashboard page in app/dashboard/equipment/page.tsx
- [x] T020 Update equipment detail page in app/equipment/[id]/EquipmentDetailClient.tsx to show edit button for owned items

## Phase 3.7: Integration

- [ ] T021 Add "Create Equipment" button to main equipment page in app/equipment/page.tsx
- [ ] T022 Update equipment list/table components to show user equipment with creator attribution
- [ ] T023 Add "My Equipment" link to dashboard navigation

## Phase 3.8: Polish

- [ ] T024 [P] Unit tests for equipment schema validation in **tests**/schemas/equipment.test.ts
- [ ] T025 [P] Unit tests for slug generation in **tests**/utils/equipment-slug.test.ts
- [ ] T026 Run quickstart validation scenarios
- [ ] T027 Test cascade delete with adventure lists
- [ ] T028 Performance check: equipment list < 500ms, create < 1s

## Dependencies

- Database migrations (T001-T004) must run in order
- T002 depends on T001 (view needs table)
- API tests (T007-T011) before implementation (T012-T013)
- T012-T013 depend on T005-T006 (types/schemas)
- Component tests before pages (T014-T016 before T017-T020)
- Integration (T021-T023) after pages
- Polish (T024-T028) last

## Parallel Execution Examples

```bash
# After database setup, run types and schemas in parallel:
Task: "Update equipment types in lib/types/equipment.ts"
Task: "Create Zod schemas in lib/schemas/equipment.ts"

# Run all API tests in parallel:
Task: "Contract test GET /api/user/equipment"
Task: "Contract test POST /api/user/equipment"
Task: "Contract test GET /api/user/equipment/[id]"
Task: "Contract test PUT /api/user/equipment/[id]"
Task: "Contract test DELETE /api/user/equipment/[id]"

# Run polish unit tests in parallel:
Task: "Unit tests for equipment schema validation"
Task: "Unit tests for slug generation"
```

## Notes

- Follow existing patterns from user_magic_items implementation
- Use fetch-based mutations with TanStack Query, not direct Supabase client
- Ensure RLS policies match the pattern (owner read/write, public read for is_public=true)
- Slug generation should handle uniqueness per user
- Delete button needs confirmation dialog like magic items
- Toast notifications with sonner on success/error

## Validation Checklist

- [x] All API endpoints have corresponding contract tests
- [x] user_equipment entity has model task (T001)
- [x] all_equipment view has creation task (T002)
- [x] All tests come before implementation (T007-T011 before T012-T013)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No parallel task modifies same file as another [P] task
- [x] E2E tests removed as requested
