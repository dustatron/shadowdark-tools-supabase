# Data Model: Magic Item Image Support

## Entity Changes

### UserMagicItem (Modified)

Adds optional image support to user-created magic items.

| Field       | Type | Nullable | Description                              |
| ----------- | ---- | -------- | ---------------------------------------- |
| `image_url` | TEXT | YES      | Cloudinary URL or default icon public_id |

**Validation Rules**:

- If provided, must be a valid URL (https://) or a known default icon identifier
- Optional field - null means no image
- Maximum URL length: 500 characters

### AllMagicItemsView (Modified)

View updated to include image_url column.

| Field       | Type | Source                                               |
| ----------- | ---- | ---------------------------------------------------- |
| `image_url` | TEXT | NULL for official items, actual value for user items |

## New Entities

### DefaultMagicItemImage (Config)

Not stored in database - defined in TypeScript config file.

| Field      | Type   | Description                                       |
| ---------- | ------ | ------------------------------------------------- |
| `id`       | string | Unique identifier (e.g., "sword", "ring")         |
| `name`     | string | Display name (e.g., "Sword", "Ring")              |
| `publicId` | string | Cloudinary public_id for the icon                 |
| `category` | string | Category grouping (weapon, jewelry, potion, etc.) |

**Initial Categories**:

- Weapons: sword, dagger, staff, wand
- Jewelry: ring, amulet, necklace
- Equipment: armor, shield, boots, cloak, helmet
- Consumables: potion, scroll
- Misc: gem, orb

## Database Migration

```sql
-- Add image_url column to user_magic_items
ALTER TABLE public.user_magic_items
ADD COLUMN image_url TEXT NULL;

-- Add constraint for URL format if provided
ALTER TABLE public.user_magic_items
ADD CONSTRAINT user_magic_item_image_url_length
CHECK (image_url IS NULL OR LENGTH(image_url) <= 500);

-- Update all_magic_items view to include image_url
CREATE OR REPLACE VIEW public.all_magic_items AS
SELECT
    id, name, slug, description, traits,
    'official' as item_type,
    NULL::UUID as user_id,
    NULL::TEXT as creator_name,
    NULL::TEXT as image_url,  -- Official items have no images yet
    true as is_public,
    created_at, updated_at
FROM public.official_magic_items

UNION ALL

SELECT
    umi.id, umi.name, umi.slug, umi.description, umi.traits,
    'custom' as item_type,
    umi.user_id,
    up.display_name as creator_name,
    umi.image_url,  -- Include image_url for user items
    umi.is_public,
    umi.created_at, umi.updated_at
FROM public.user_magic_items umi
JOIN public.user_profiles up ON umi.user_id = up.id
WHERE umi.is_public = true;
```

## TypeScript Types

### Updated Types

```typescript
// lib/types/magic-items.ts
export interface UserMagicItem extends BaseMagicItem {
  user_id: string;
  is_public: boolean;
  item_type: "custom";
  image_url?: string | null; // NEW
}

export interface AllMagicItem extends BaseMagicItem {
  item_type: "official" | "custom";
  user_id: string | null;
  creator_name: string | null;
  is_public: boolean;
  image_url?: string | null; // NEW
}
```

### New Types

```typescript
// lib/types/cloudinary.ts
export interface ImageTransformSize {
  width: number;
  height?: number;
  crop?: "fill" | "fit" | "scale";
  quality?: number | "auto";
  format?: "auto" | "webp" | "png" | "jpg";
}

export type ImageSize = "thumb" | "card" | "detail" | "pdf";

// lib/config/default-magic-item-images.ts
export interface DefaultMagicItemImage {
  id: string;
  name: string;
  publicId: string;
  category: "weapon" | "jewelry" | "equipment" | "consumable" | "misc";
}
```

## Schema Updates

```typescript
// lib/schemas/magic-items.ts
export const MagicItemCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  traits: z.array(TraitSchema),
  is_public: z.boolean(),
  image_url: z.string().url().max(500).nullable().optional(), // NEW
});
```

## State Transitions

### Image Selection Flow

```
[No Image] -> [Default Selected] -> [Custom Uploaded]
     ↑              ↓                      ↓
     ←──── [Removed/Cleared] ←─────────────┘
```

**States**:

1. **No Image**: `image_url = null`
2. **Default Selected**: `image_url = "default:{id}"` or Cloudinary public_id
3. **Custom Uploaded**: `image_url = "https://res.cloudinary.com/..."`
