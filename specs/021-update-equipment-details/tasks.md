# Tasks: Equipment Image Support

**Input**: Design documents from `/specs/021-update-equipment-details/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/equipment-api.md, quickstart.md

## Task Format

- **[P]**: Can run in parallel (different files, no dependencies)
- All paths relative to repository root

---

## Phase 3.1: Setup & Database

- [x] T001 Create migration file `supabase/migrations/YYYYMMDDHHMMSS_add_equipment_image_url.sql` with ALTER TABLE for both `equipment` and `user_equipment` tables (add `image_url TEXT` column with constraint on user_equipment)

- [x] T002 Apply migration to Supabase using `npx supabase db push` and verify columns exist

---

## Phase 3.2: Schema & Types (Parallel)

- [x] T003 [P] Update Zod schema in `lib/schemas/equipment.ts` - add `image_url: z.string().max(500).nullable().optional()` to EquipmentCreateSchema

- [x] T004 [P] Update TypeScript types in `lib/types/equipment.ts` - add `image_url?: string | null` to EquipmentItem and UserEquipment interfaces

---

## Phase 3.3: Configuration

- [x] T005 Create `lib/config/default-equipment-images.ts` with DefaultEquipmentImage interface and DEFAULT_EQUIPMENT_IMAGES array. Categories: weapon, armor, gear, misc. Reuse applicable icons from magic items (sword, dagger, armor, shield, boots, helmet, rope, backpack) with adjusted publicId paths pointing to `shadowdark/default-equipment/`

---

## Phase 3.4: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.5

- [x] T006 [P] Create unit test `__tests__/components/equipment/EquipmentImagePicker.test.tsx` - test default icon selection, custom upload handling, remove image functionality, disabled state. Model on `__tests__/components/magic-items/MagicItemImagePicker.test.tsx`

---

## Phase 3.5: Core Components

- [x] T007 Create `components/equipment/EquipmentImagePicker.tsx` - model on MagicItemImagePicker with categories (weapon, armor, gear, misc), Cloudinary upload to `shadowdark/equipment/{userId}`, no is_ai_generated field

- [x] T008 Update `components/equipment/EquipmentCard.tsx` - add thumbnail section (80x80) using `getTransformedImageUrl(item.image_url, "thumb")`, fallback to equipment type icon (Sword for weapon, Shield for armor, ScrollText for gear)

- [x] T009 Update `components/equipment/EquipmentForm.tsx` - add Image card with EquipmentImagePicker in right column (2-column layout like MagicItemForm), wire value/onChange to form state

---

## Phase 3.6: API Routes

- [ ] T010 [P] Update `app/api/user/equipment/route.ts` - POST handler: add image_url to insert object, ensure it's included in select

- [ ] T011 [P] Update `app/api/user/equipment/[id]/route.ts` - PUT handler: add image_url to updates object when provided

- [ ] T012 [P] Update `app/api/equipment/route.ts` - ensure image_url is included in select for both official and user equipment queries

---

## Phase 3.7: Integration & Polish

- [ ] T013 Generate updated TypeScript types from Supabase using `npx supabase gen types typescript --project-id anradzoxmwjpzlldneac > lib/database.types.ts`

- [ ] T014 Run `npm run build` to verify no TypeScript errors

- [ ] T015 Run `npm run lint` and fix any linting issues

- [ ] T016 Manual testing per quickstart.md verification steps (create with default icon, upload custom, edit, remove, card display)

---

## Dependencies

```
T001 → T002 (migration must be created before applied)
T002 → T003, T004 (DB must exist before schema updates)
T003, T004 → T005 (types before config)
T005 → T006 (config before tests)
T006 → T007 (tests before implementation - TDD)
T007 → T008, T009 (picker before card/form)
T003, T004 → T010, T011, T012 (schema before API)
T007, T008, T009, T010, T011, T012 → T013, T014, T015 (implementation before polish)
T014, T015 → T016 (build/lint before manual test)
```

## Parallel Execution Examples

### Batch 1: Schema & Types (after T002)

```
Task: "Update Zod schema in lib/schemas/equipment.ts with image_url field"
Task: "Update TypeScript types in lib/types/equipment.ts with image_url field"
```

### Batch 2: API Routes (after T003, T004)

```
Task: "Update POST handler in app/api/user/equipment/route.ts for image_url"
Task: "Update PUT handler in app/api/user/equipment/[id]/route.ts for image_url"
Task: "Update GET handler in app/api/equipment/route.ts for image_url"
```

## File Summary

| Task | File                                                         | Action     |
| ---- | ------------------------------------------------------------ | ---------- |
| T001 | supabase/migrations/\*.sql                                   | CREATE     |
| T002 | (Supabase CLI)                                               | RUN        |
| T003 | lib/schemas/equipment.ts                                     | UPDATE     |
| T004 | lib/types/equipment.ts                                       | UPDATE     |
| T005 | lib/config/default-equipment-images.ts                       | CREATE     |
| T006 | **tests**/components/equipment/EquipmentImagePicker.test.tsx | CREATE     |
| T007 | components/equipment/EquipmentImagePicker.tsx                | CREATE     |
| T008 | components/equipment/EquipmentCard.tsx                       | UPDATE     |
| T009 | components/equipment/EquipmentForm.tsx                       | UPDATE     |
| T010 | app/api/user/equipment/route.ts                              | UPDATE     |
| T011 | app/api/user/equipment/[id]/route.ts                         | UPDATE     |
| T012 | app/api/equipment/route.ts                                   | UPDATE     |
| T013 | lib/database.types.ts                                        | REGENERATE |
| T014 | (build check)                                                | RUN        |
| T015 | (lint check)                                                 | RUN        |
| T016 | (manual testing)                                             | RUN        |

## Validation Checklist

- [x] API contract (equipment-api.md) covered by T010, T011, T012
- [x] Data model entities covered by T001, T003, T004
- [x] Test task (T006) comes before implementation (T007)
- [x] Parallel tasks are truly independent (different files)
- [x] Each task specifies exact file path
- [x] Quickstart scenarios covered by T016

---

**Total Tasks**: 16
**Estimated Parallel Batches**: 4 (after sequential dependencies)
