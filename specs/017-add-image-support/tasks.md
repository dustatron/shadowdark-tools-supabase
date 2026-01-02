# Tasks: Magic Item Image Support

**Input**: Design documents from `/specs/017-add-image-support/`
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Exact file paths included in each task

---

## Phase 3.1: Database & Types Setup

- [ ] T001 Create migration `supabase/migrations/20260101000001_add_magic_item_images.sql` - Add `image_url TEXT NULL` column to `user_magic_items` table with length constraint, update `all_magic_items` view to include image_url (NULL for official items)

- [ ] T002 [P] Update TypeScript types in `lib/types/magic-items.ts` - Add `image_url?: string | null` to `UserMagicItem` and `AllMagicItem` interfaces

- [ ] T003 [P] Update Zod schemas in `lib/schemas/magic-items.ts` - Add `image_url: z.string().url().max(500).nullable().optional()` to `MagicItemCreateSchema` and `MagicItemUpdateSchema`

---

## Phase 3.2: Utilities & Config

- [ ] T004 [P] Create Cloudinary helper `lib/utils/cloudinary.ts` with:
  - `getTransformedImageUrl(url: string, size: 'thumb' | 'card' | 'detail' | 'pdf'): string`
  - Transform presets: thumb (80x80), card (200x200), detail (400x400), pdf (600w)
  - Handle both full Cloudinary URLs and public_id references

- [ ] T005 [P] Create default icons config `lib/config/default-magic-item-images.ts` with:
  - `DefaultMagicItemImage` interface: `{ id, name, publicId, category }`
  - `DEFAULT_MAGIC_ITEM_IMAGES` array with 15 icons:
    - Weapons: sword, dagger, staff, wand
    - Jewelry: ring, amulet, necklace
    - Equipment: armor, shield, boots, cloak, helmet
    - Consumables: potion, scroll
    - Misc: gem, orb
  - Placeholder publicIds (to be replaced after uploading to Cloudinary)

---

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before component implementation**

- [ ] T006 [P] Unit test Cloudinary helper `__tests__/unit/cloudinary.test.ts`:
  - Test `getTransformedImageUrl` returns correct URL with transforms
  - Test all size presets (thumb, card, detail, pdf)
  - Test handles both full URLs and public_ids
  - Tests should FAIL (no implementation yet)

- [ ] T007 [P] Unit test MagicItemImagePicker `__tests__/unit/MagicItemImagePicker.test.tsx`:
  - Test renders default icons grid
  - Test clicking default icon calls onChange
  - Test upload tab shows file input
  - Test file size validation (15MB limit)
  - Test file type validation (image only)
  - Test clear button removes selection
  - Tests should FAIL (component doesn't exist)

---

## Phase 3.4: Component Implementation

- [ ] T008 Create `components/magic-items/MagicItemImagePicker.tsx`:
  - Props: `value?: string`, `onChange: (url: string | null) => void`, `userId: string`, `disabled?: boolean`
  - Two tabs: "Default Icons" and "Upload Custom"
  - Default Icons tab: grid of clickable icons from config, show selection state
  - Upload tab: file input, 15MB validation, image-only validation, upload to Cloudinary
  - Preview of selected image with "Remove" button
  - Loading state during upload
  - Error handling with toast notifications
  - Reuse Cloudinary upload pattern from AvatarUpload.tsx

---

## Phase 3.5: Form Integration

- [ ] T009 Update `components/magic-items/MagicItemForm.tsx`:
  - Add `image_url` to form defaultValues (from initialData or null)
  - Import and add MagicItemImagePicker as new Card section between "Basic Information" and "Traits"
  - Connect picker to form via `form.watch('image_url')` and `form.setValue('image_url', ...)`
  - Include image_url in form submission data

---

## Phase 3.6: API Updates

- [ ] T010 Update `app/api/user/magic-items/route.ts`:
  - POST handler: Accept `image_url` in validated body, include in insert statement
  - GET handler: Ensure image_url is included in select (should be automatic with `select('*')`)

- [ ] T011 Update `app/api/user/magic-items/[id]/route.ts`:
  - PUT handler: Accept `image_url` in update body, include in update statement when provided
  - Handle `image_url: null` to clear image
  - GET handler: Ensure image_url returned

---

## Phase 3.7: Display Components

- [ ] T012 [P] Update `components/magic-items/MagicItemCard.tsx`:
  - Import `getTransformedImageUrl` from cloudinary helper
  - Add 80x80 thumbnail to left side of card (or placeholder icon if no image)
  - Use `thumb` size transform
  - Handle missing/failed images gracefully with fallback

- [ ] T013 [P] Update `app/magic-items/[slug]/page.tsx`:
  - Import `getTransformedImageUrl`
  - Add 400x400 image in header area (or placeholder if no image)
  - Use `detail` size transform
  - Ensure image loads before/with content

---

## Phase 3.8: Attribution & Polish

- [ ] T014 Add game-icons.net attribution to footer:
  - Update `components/layout/Footer.tsx` (or equivalent footer component)
  - Add text: "Icons by" with link to https://game-icons.net
  - Style to match existing footer

- [ ] T015 Upload default icons to Cloudinary:
  - Download 15 icons from game-icons.net (sword, ring, etc.)
  - Upload to Cloudinary folder `shadowdark/default-magic-items/`
  - Update `lib/config/default-magic-item-images.ts` with actual publicIds

---

## Phase 3.9: E2E Tests

- [ ] T016 [P] E2E test create with default icon `__tests__/e2e/magic-items-image.spec.ts`:
  - Navigate to /magic-items/create
  - Fill form, select default icon, submit
  - Verify detail page shows image

- [ ] T017 [P] E2E test create with upload `__tests__/e2e/magic-items-image-upload.spec.ts`:
  - Navigate to /magic-items/create
  - Fill form, upload test image, submit
  - Verify detail page shows uploaded image

- [ ] T018 E2E test edit image `__tests__/e2e/magic-items-image-edit.spec.ts`:
  - Create item with image
  - Edit item, change image
  - Verify detail page shows new image

---

## Phase 3.10: Validation

- [ ] T019 Apply migration to local Supabase: `supabase db push` or `supabase migration up`

- [ ] T020 Run all tests: `npm test` (unit) and `npm run test:e2e` (Playwright)

- [ ] T021 Execute quickstart.md scenarios manually - verify all 8 scenarios pass

- [ ] T022 Run lint and format: `npm run lint && npm run format`

---

## Dependencies

```
T001 (migration) → T010, T011 (API needs column to exist)
T002, T003 (types/schemas) → T008, T009 (component needs types)
T004 (cloudinary util) → T008, T012, T013 (all need transforms)
T005 (default icons config) → T008 (picker needs icons list)
T006, T007 (tests) → T008 (TDD: tests before implementation)
T008 (picker component) → T009 (form needs component)
T009 (form) → T010, T011 (API needs form to test)
T010, T011 (API) → T016-T018 (E2E needs working API)
T015 (upload icons) → T016 (E2E needs real icons)
```

---

## Parallel Execution Examples

### Parallel Group 1: Types, Schemas, Utils (after T001)

```
# Launch T002-T005 together:
Task: "Update TypeScript types in lib/types/magic-items.ts"
Task: "Update Zod schemas in lib/schemas/magic-items.ts"
Task: "Create Cloudinary helper lib/utils/cloudinary.ts"
Task: "Create default icons config lib/config/default-magic-item-images.ts"
```

### Parallel Group 2: Unit Tests (after T004, T005)

```
# Launch T006-T007 together:
Task: "Unit test Cloudinary helper __tests__/unit/cloudinary.test.ts"
Task: "Unit test MagicItemImagePicker __tests__/unit/MagicItemImagePicker.test.tsx"
```

### Parallel Group 3: Display Updates (after T004)

```
# Launch T012-T013 together:
Task: "Update MagicItemCard with thumbnail"
Task: "Update detail page with larger image"
```

### Parallel Group 4: E2E Tests (after T015)

```
# Launch T016-T017 together (T018 depends on these):
Task: "E2E test create with default icon"
Task: "E2E test create with upload"
```

---

## Validation Checklist

- [x] All contracts have corresponding API tasks (T010, T011)
- [x] All entities have model/type tasks (T002, T003)
- [x] All tests come before implementation (T006, T007 before T008)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

---

## Notes

- [P] tasks = different files, no dependencies
- Verify unit tests FAIL before implementing T008
- Commit after each task
- T015 (upload icons) can be done anytime before E2E tests
- Migration must be applied before testing API endpoints
