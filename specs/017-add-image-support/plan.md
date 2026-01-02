# Implementation Plan: Magic Item Image Support

**Branch**: `017-add-image-support` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-add-image-support/spec.md`

## Summary

Add image support to user-created magic items. Users can upload custom images (15MB max) to Cloudinary or select from 15 default fantasy icons from game-icons.net. Images display at multiple sizes via Cloudinary URL transforms: thumbnail for lists, medium for cards, large for detail pages, high-quality for PDF export.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15, React 19
**Primary Dependencies**: Cloudinary (existing), react-hook-form, Zod, shadcn/ui
**Storage**: Supabase PostgreSQL (add `image_url` column to `user_magic_items`)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web (Next.js App Router)
**Performance Goals**: <2s page loads, thumbnails load within 500ms
**Constraints**: 15MB max upload, Cloudinary free tier limits (25GB storage)
**Scale/Scope**: ~200 magic items initially, ~1000 users

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status  | Notes                                                    |
| ----------------------- | ------- | -------------------------------------------------------- |
| I. Component-First      | ✅ PASS | MagicItemImagePicker is self-contained, reusable         |
| II. API-First           | ✅ PASS | REST endpoints updated with image_url field              |
| III. Test-First         | ⚠️ TBD  | Tests defined in quickstart.md, to be written in Phase 2 |
| IV. Integration Testing | ⚠️ TBD  | E2E scenarios defined, to be implemented                 |
| V. Simplicity           | ✅ PASS | Reuses existing Cloudinary pattern, minimal new code     |
| VI. Data Integrity      | ✅ PASS | Zod validation on image_url, URL format constraint       |
| VII. Community Safety   | ✅ PASS | Skipped for MVP per user decision                        |

**Initial Constitution Check**: PASS (no violations)

## Project Structure

### Documentation (this feature)

```
specs/017-add-image-support/
├── plan.md              # This file (/plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/           # Phase 1 output ✅
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code Changes

```
# New Files
lib/utils/cloudinary.ts                          # Transform URL helper
lib/config/default-magic-item-images.ts          # Default icons config
components/magic-items/MagicItemImagePicker.tsx  # Image picker UI

# Modified Files
supabase/migrations/xxx_add_magic_item_images.sql
lib/types/magic-items.ts
lib/schemas/magic-items.ts
components/magic-items/MagicItemForm.tsx
components/magic-items/MagicItemCard.tsx
app/magic-items/[slug]/page.tsx
app/api/user/magic-items/route.ts
app/api/user/magic-items/[id]/route.ts
```

**Structure Decision**: Web application (Next.js App Router - existing structure)

## Phase 0: Research (Complete)

See [research.md](./research.md) for full details.

**Key Decisions**:

- Use existing Cloudinary integration (already working for avatars)
- 15MB upload limit (client-side validation)
- URL-based transforms at runtime (no storage duplication)
- game-icons.net for default icons (CC BY 3.0, needs attribution)
- Hardcoded config for default icons list
- `image_url TEXT NULL` column on `user_magic_items` only

## Phase 1: Design (Complete)

See:

- [data-model.md](./data-model.md) - Entity changes, migration SQL
- [contracts/api-contracts.md](./contracts/api-contracts.md) - API updates
- [quickstart.md](./quickstart.md) - Validation scenarios

**Key Artifacts**:

1. Database migration adding `image_url` column
2. Updated TypeScript types and Zod schemas
3. Cloudinary transform helper utility
4. MagicItemImagePicker component spec
5. API endpoint updates for image_url field

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Database layer first**:
   - Migration for image_url column
   - Update all_magic_items view

2. **Type/Schema layer**:
   - Update TypeScript types
   - Update Zod schemas

3. **Utility layer**:
   - Create cloudinary.ts helper
   - Create default-magic-item-images.ts config
   - Upload default icons to Cloudinary

4. **Component layer** (with tests):
   - Create MagicItemImagePicker component
   - Write unit tests for component

5. **Form integration**:
   - Update MagicItemForm to include image picker
   - Update form default values and submission

6. **API layer**:
   - Update POST /api/user/magic-items
   - Update PUT /api/user/magic-items/[id]

7. **Display layer**:
   - Update MagicItemCard for thumbnails
   - Update detail page for larger images

8. **Attribution**:
   - Add game-icons.net attribution to footer

9. **E2E tests**:
   - Test create with default icon
   - Test create with upload
   - Test edit image

**Ordering Strategy**:

- TDD order: Tests before implementation where practical
- Dependency order: DB → Types → Utils → Components → API → Display
- Mark [P] for parallel tasks (types + utils can parallelize)

**Estimated Output**: ~20 tasks in tasks.md

## Complexity Tracking

_No complexity deviations required. Design follows existing patterns._

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
