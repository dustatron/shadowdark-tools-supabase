# Data Model: Equipment Image Support

**Date**: 2026-01-06
**Feature**: 021-update-equipment-details

## Schema Changes

### Migration: Add image_url to equipment tables

```sql
-- Add image_url column to equipment (official) table
ALTER TABLE equipment
ADD COLUMN image_url TEXT;

-- Add image_url column to user_equipment table
ALTER TABLE user_equipment
ADD COLUMN image_url TEXT
CONSTRAINT user_equipment_image_url_length CHECK (image_url IS NULL OR length(image_url) <= 500);

COMMENT ON COLUMN user_equipment.image_url IS 'Cloudinary URL or default icon public_id for equipment image';
```

## Entity: Equipment (Official)

| Field         | Type        | Constraints     | Description                       |
| ------------- | ----------- | --------------- | --------------------------------- |
| id            | UUID        | PK, default gen | Unique identifier                 |
| name          | TEXT        | NOT NULL        | Equipment name                    |
| item_type     | TEXT        | NOT NULL        | armor/weapon/gear                 |
| cost          | JSONB       | NOT NULL        | {amount, currency}                |
| attack_type   | TEXT        | nullable        | For weapons                       |
| range         | TEXT        | nullable        | For weapons                       |
| damage        | TEXT        | nullable        | For weapons                       |
| armor         | TEXT        | nullable        | For armor                         |
| properties    | TEXT[]      | nullable        | Equipment properties              |
| slot          | INTEGER     | default 1       | Inventory slots                   |
| quantity      | TEXT        | nullable        | Quantity notation                 |
| **image_url** | TEXT        | nullable        | **NEW: Cloudinary URL/public_id** |
| created_at    | TIMESTAMPTZ | default now()   |                                   |
| updated_at    | TIMESTAMPTZ | default now()   |                                   |

## Entity: UserEquipment

| Field         | Type        | Constraints               | Description                       |
| ------------- | ----------- | ------------------------- | --------------------------------- |
| id            | UUID        | PK, default gen           | Unique identifier                 |
| user_id       | UUID        | FK -> user_profiles       | Owner                             |
| name          | TEXT        | NOT NULL, len > 0         | Equipment name                    |
| slug          | TEXT        | NOT NULL, unique per user | URL slug                          |
| description   | TEXT        | nullable                  | User notes                        |
| item_type     | TEXT        | CHECK (armor/weapon/gear) | Type                              |
| cost          | JSONB       | NOT NULL, object type     | {amount, currency}                |
| attack_type   | TEXT        | nullable                  | For weapons                       |
| range         | TEXT        | nullable                  | For weapons                       |
| damage        | TEXT        | nullable                  | For weapons                       |
| armor         | TEXT        | nullable                  | For armor                         |
| properties    | TEXT[]      | NOT NULL, default {}      | Properties                        |
| slot          | INTEGER     | CHECK 0-10, default 1     | Slots                             |
| quantity      | TEXT        | nullable                  | Quantity                          |
| is_public     | BOOLEAN     | default false             | Visibility                        |
| **image_url** | TEXT        | nullable, max 500         | **NEW: Cloudinary URL/public_id** |
| created_at    | TIMESTAMPTZ | default now()             |                                   |
| updated_at    | TIMESTAMPTZ | default now()             |                                   |

## Entity: DefaultEquipmentImage (TypeScript config only)

```typescript
interface DefaultEquipmentImage {
  id: string; // Unique identifier (e.g., "sword", "rope")
  name: string; // Display name (e.g., "Sword", "Rope")
  publicId: string; // Cloudinary public_id
  category: "weapon" | "armor" | "gear" | "misc";
}
```

## Zod Schema Updates

```typescript
// lib/schemas/equipment.ts - additions

export const EquipmentCreateSchema = z.object({
  // ... existing fields ...
  image_url: z.string().max(500).nullable().optional(),
});
```

## TypeScript Type Updates

```typescript
// lib/types/equipment.ts - additions

export interface EquipmentItem {
  // ... existing fields ...
  image_url?: string | null;
}

export interface UserEquipment {
  // ... existing fields ...
  image_url?: string | null;
}
```

## Validation Rules

1. **image_url**: Optional, max 500 characters
2. Accepts either:
   - Full Cloudinary URL (custom uploads)
   - Cloudinary public_id (default icons)
3. No file type validation at DB level (handled at upload time)

## Relationships

- No new foreign key relationships
- image_url is a simple string reference to Cloudinary asset
