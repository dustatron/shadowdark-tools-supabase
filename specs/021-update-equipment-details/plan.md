# Implementation Plan: Equipment Image Support

**Branch**: `021-update-equipment-details` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-update-equipment-details/spec.md`

## Summary

Add image support to equipment items, mirroring the existing magic items implementation. Users can select from pre-configured game-icons.net icons or upload custom images via Cloudinary. Images display as thumbnails in equipment cards and full-size in edit forms.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15, React 19
**Primary Dependencies**: Cloudinary (image hosting), shadcn/ui (components), Zod (validation)
**Storage**: Supabase PostgreSQL - add `image_url` column to `equipment` and `user_equipment` tables
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web (Next.js App Router)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Image transforms served via Cloudinary CDN, thumbnails 80x80px
**Constraints**: 15MB max upload, Cloudinary storage limits
**Scale/Scope**: ~36 official equipment items, unlimited user equipment

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status  | Notes                                                                  |
| ----------------------- | ------- | ---------------------------------------------------------------------- |
| I. Component-First      | ✅ PASS | EquipmentImagePicker is reusable, follows MagicItemImagePicker pattern |
| II. API-First           | ✅ PASS | REST endpoints updated with image_url field                            |
| III. Test-First         | ✅ PASS | Will write tests before implementation                                 |
| IV. Integration Testing | ✅ PASS | E2E tests for image upload flow planned                                |
| V. Simplicity           | ✅ PASS | Reusing existing patterns, minimal new code                            |
| VI. Data Integrity      | ✅ PASS | Zod validation on image_url, DB constraint on length                   |
| VII. Community Safety   | N/A     | No public content moderation changes                                   |

## Project Structure

### Documentation (this feature)

```
specs/021-update-equipment-details/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/           # Phase 1 output ✅
│   └── equipment-api.md
└── tasks.md             # Phase 2 output (via /tasks command)
```

### Source Code Changes

```
# Database
supabase/migrations/
└── YYYYMMDDHHMMSS_add_equipment_image_url.sql  # NEW

# Configuration
lib/config/
└── default-equipment-images.ts  # NEW (based on default-magic-item-images.ts)

# Components
components/equipment/
├── EquipmentImagePicker.tsx  # NEW (based on MagicItemImagePicker)
├── EquipmentCard.tsx         # UPDATE - add thumbnail
└── EquipmentForm.tsx         # UPDATE - add image picker

# Schemas & Types
lib/schemas/equipment.ts      # UPDATE - add image_url field
lib/types/equipment.ts        # UPDATE - add image_url field

# API Routes
app/api/user/equipment/route.ts        # UPDATE - handle image_url
app/api/user/equipment/[id]/route.ts   # UPDATE - handle image_url
app/api/equipment/route.ts             # UPDATE - return image_url
```

## Phase 0: Research (Complete)

See [research.md](./research.md) for full findings.

**Key Decisions**:

1. Reuse Cloudinary utility (`lib/utils/cloudinary.ts`) - no changes needed
2. Create separate `default-equipment-images.ts` config with equipment-appropriate categories
3. Model EquipmentImagePicker on MagicItemImagePicker (same UX, different categories)
4. Single migration for both tables
5. No `is_ai_generated` field for equipment (unlike magic items)

## Phase 1: Design (Complete)

### Artifacts Generated

- ✅ [data-model.md](./data-model.md) - Schema changes, entity definitions
- ✅ [contracts/equipment-api.md](./contracts/equipment-api.md) - API contract updates
- ✅ [quickstart.md](./quickstart.md) - Verification steps

### Component Design

**EquipmentImagePicker** (new component):

- Props: `value`, `onChange`, `userId`, `disabled`
- Tabs: "Default Icons" | "Upload Custom"
- Categories: weapon, armor, gear, misc
- Reuses: Cloudinary upload logic, transform utilities

**EquipmentCard** (update):

- Add thumbnail section (80x80) before card content
- Use `getTransformedImageUrl(item.image_url, "thumb")`
- Fallback: Equipment type icon (Sword/Shield/ScrollText based on item_type)

**EquipmentForm** (update):

- Add Image card in right column (2-column layout like MagicItemForm)
- Integrate EquipmentImagePicker component

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Database Tasks** (sequential):
   - Create migration file
   - Apply migration to Supabase

2. **Configuration Tasks** (parallel after DB):
   - Create default-equipment-images.ts config
   - Upload new icons to Cloudinary (rope, torch, lantern, etc.)

3. **Schema/Type Tasks** (parallel):
   - Update Zod schema with image_url
   - Update TypeScript types with image_url

4. **Component Tasks** (sequential):
   - Create EquipmentImagePicker component
   - Update EquipmentCard with thumbnail
   - Update EquipmentForm with image picker

5. **API Tasks** (parallel after schema):
   - Update POST /api/user/equipment
   - Update PUT /api/user/equipment/[id]
   - Update GET /api/equipment (if needed)

6. **Test Tasks** (TDD - tests before implementation where applicable):
   - Unit tests for EquipmentImagePicker
   - E2E test for image upload flow

**Estimated Output**: ~15-18 tasks

## Complexity Tracking

_No complexity violations identified._

## Progress Tracking

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

_Based on Constitution v1.4.0 - See `/memory/constitution.md`_
