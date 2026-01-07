# Research: Equipment Image Support

**Date**: 2026-01-06
**Feature**: 021-update-equipment-details

## Summary

Equipment image support follows the established magic items pattern. All technical decisions are resolved by referencing the existing implementation.

## Decisions

### 1. Image Storage Strategy

**Decision**: Store Cloudinary public_id or full URL in `image_url` column (TEXT, nullable, max 500 chars)

**Rationale**: Matches magic items pattern. Cloudinary handles image optimization and transformations. Supports both default icons (stored as public_id) and custom uploads (stored as full URL).

**Alternatives Rejected**:

- File system storage: Not scalable, deployment complications
- Base64 in database: Bloated DB, slow queries

### 2. Default Icons Configuration

**Decision**: Create `lib/config/default-equipment-images.ts` that reuses applicable icons from magic items config and adds equipment-specific icons

**Rationale**:

- Many existing icons apply (sword, armor, shield, boots, helmet, backpack, rope)
- Equipment has different category needs (weapons, armor, gear vs magic items' weapon/jewelry/equipment/consumable/misc)
- Separate config allows tailored categorization

**Icons to Add** (from game-icons.net, need Cloudinary upload):

- torch
- lantern
- rations/bread
- waterskin
- bedroll
- grappling-hook
- crowbar
- hammer (already exists)
- rope (already exists)
- backpack (already exists as light-backpack)

### 3. Image Picker Component

**Decision**: Create `EquipmentImagePicker` component modeled on `MagicItemImagePicker`

**Rationale**: Same UX pattern ensures consistency. Two tabs: Default Icons + Upload Custom. Same 15MB limit, same file type validation, same Cloudinary upload flow.

**Key Differences from Magic Items**:

- Different categories (armor, weapon, gear, misc)
- No `is_ai_generated` field needed for equipment
- Different Cloudinary folder path (`shadowdark/equipment/{userId}`)

### 4. Database Migration

**Decision**: Single migration adding `image_url TEXT` to both `equipment` and `user_equipment` tables

**Rationale**: Simple ALTER TABLE. No constraints needed beyond length (implicit TEXT limit). Matches magic items schema.

### 5. API Updates

**Decision**: Update existing equipment API routes to accept `image_url` in create/update

**Rationale**: Minimal changes - just add field to schema and pass through to DB.

### 6. Component Updates

**Decision**: Update `EquipmentCard` and `EquipmentForm` to display/edit images

**Rationale**: Follow magic items component structure exactly:

- Card: Add thumbnail section with fallback icon
- Form: Add Image card with picker component

## Technical Patterns Reference

### Files to Model From (Magic Items)

| Purpose         | Magic Items File                                  | Equipment Target                                |
| --------------- | ------------------------------------------------- | ----------------------------------------------- |
| Image config    | `lib/config/default-magic-item-images.ts`         | `lib/config/default-equipment-images.ts`        |
| Image picker    | `components/magic-items/MagicItemImagePicker.tsx` | `components/equipment/EquipmentImagePicker.tsx` |
| Card w/ image   | `components/magic-items/MagicItemCard.tsx`        | Update `components/equipment/EquipmentCard.tsx` |
| Form w/ picker  | `components/magic-items/MagicItemForm.tsx`        | Update `components/equipment/EquipmentForm.tsx` |
| Zod schema      | `lib/schemas/magic-items.ts` (image_url field)    | Update `lib/schemas/equipment.ts`               |
| Type definition | `lib/types/magic-items.ts`                        | Update `lib/types/equipment.ts`                 |

### Cloudinary Utility

Already exists at `lib/utils/cloudinary.ts`:

- `getTransformedImageUrl(url, size)` - handles both public_id and full URLs
- Size presets: thumb (80x80), card (200x200), detail (400x400), pdf (600w)

No changes needed - fully reusable.

## Unknowns Resolved

| Unknown                 | Resolution                                              |
| ----------------------- | ------------------------------------------------------- |
| Icon storage location   | Cloudinary under `shadowdark/default-equipment/` folder |
| Image field in schema   | `image_url: z.string().max(500).nullable().optional()`  |
| Upload folder structure | `shadowdark/equipment/{userId}` for custom uploads      |
| Default icon categories | armor, weapon, gear, misc                               |

## Next Steps

1. Create database migration for image_url columns
2. Create default-equipment-images.ts config (upload new icons to Cloudinary first)
3. Create EquipmentImagePicker component
4. Update EquipmentCard with thumbnail
5. Update EquipmentForm with image picker
6. Update Zod schema and TypeScript types
7. Update API routes to handle image_url
