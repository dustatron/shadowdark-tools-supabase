# Data Model: Magic Items

**Feature**: Magic Items (Read-Only Starter)
**Date**: 2025-11-17

## Entity: MagicItem

### Description

Represents an official Shadowdark magic item from the core rulebook. Magic items are unique treasures with special properties that Game Masters can award to player characters.

### Fields

| Field       | Type        | Required | Constraints                             | Description                                            |
| ----------- | ----------- | -------- | --------------------------------------- | ------------------------------------------------------ |
| id          | UUID        | Yes      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique identifier                                      |
| name        | TEXT        | Yes      | NOT NULL, LENGTH > 0                    | Display name (e.g., "Ring of Invisibility")            |
| slug        | TEXT        | Yes      | UNIQUE, NOT NULL, LOWERCASE, NO SPACES  | URL-friendly identifier (e.g., "ring_of_invisibility") |
| description | TEXT        | Yes      | NOT NULL, LENGTH > 0                    | Flavor text describing appearance and function         |
| traits      | JSONB       | No       | DEFAULT '[]'::jsonb                     | Array of trait objects (see Trait entity)              |
| created_at  | TIMESTAMPTZ | Yes      | DEFAULT NOW()                           | Record creation timestamp                              |
| updated_at  | TIMESTAMPTZ | Yes      | DEFAULT NOW()                           | Record update timestamp                                |

### Indexes

```sql
CREATE UNIQUE INDEX idx_magic_items_slug ON official_magic_items(slug);
CREATE INDEX idx_magic_items_name_trgm ON official_magic_items USING GIN (name gin_trgm_ops);
CREATE INDEX idx_magic_items_description_trgm ON official_magic_items USING GIN (description gin_trgm_ops);
CREATE INDEX idx_magic_items_traits ON official_magic_items USING GIN (traits);
```

### Validation Rules

#### TypeScript (Zod Schema)

```typescript
const MagicItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9_-]+$/),
  description: z.string().min(1).max(2000),
  traits: z.array(TraitSchema).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
```

#### Database (CHECK Constraints)

```sql
ALTER TABLE official_magic_items
  ADD CONSTRAINT check_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  ADD CONSTRAINT check_slug_format CHECK (slug ~ '^[a-z0-9_-]+$'),
  ADD CONSTRAINT check_description_not_empty CHECK (LENGTH(TRIM(description)) > 0),
  ADD CONSTRAINT check_traits_is_array CHECK (jsonb_typeof(traits) = 'array');
```

### Example Data

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ring of Invisibility",
  "slug": "ring_of_invisibility",
  "description": "A simple, gold band polished to a warm shine.",
  "traits": [
    {
      "name": "Benefit",
      "description": "Once per day, the ring can cast the invisibility spell (pg. 63) on you."
    },
    {
      "name": "Curse",
      "description": "There is a cumulative 1% chance each time you rest that your sleep is ruined by apocalyptic nightmares, and you gain no benefit from resting. This resets to a 1% chance each time it triggers."
    }
  ],
  "created_at": "2025-11-17T12:00:00Z",
  "updated_at": "2025-11-17T12:00:00Z"
}
```

## Entity: Trait

### Description

A trait is a specific property or characteristic of a magic item. Each trait has a type (name) and detailed effect description. Magic items can have zero or more traits of various types.

### Structure (JSONB Array Element)

| Field       | Type   | Required | Constraints          | Description                                                   |
| ----------- | ------ | -------- | -------------------- | ------------------------------------------------------------- |
| name        | string | Yes      | NOT NULL, LENGTH > 0 | Trait type (e.g., "Benefit", "Curse", "Bonus", "Personality") |
| description | string | Yes      | NOT NULL, LENGTH > 0 | Detailed explanation of the trait's effect                    |

### Valid Trait Types

- **Benefit**: Positive effect or power
- **Curse**: Negative consequence or drawback
- **Bonus**: Numerical modifier (e.g., "+1 sword", "+3 AC")
- **Personality**: Sentient item's character traits and motivations

### Validation Rules

#### TypeScript (Zod Schema)

```typescript
const TraitSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(1000),
});
```

#### JSONB Validation (PostgreSQL Function)

```sql
CREATE OR REPLACE FUNCTION validate_magic_item_traits(traits JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check that traits is an array
  IF jsonb_typeof(traits) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Check each trait has name and description
  RETURN NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(traits) AS trait
    WHERE NOT (
      trait ? 'name' AND
      trait ? 'description' AND
      jsonb_typeof(trait->'name') = 'string' AND
      jsonb_typeof(trait->'description') = 'string' AND
      LENGTH(trait->>'name') > 0 AND
      LENGTH(trait->>'description') > 0
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Example Data

```json
[
  {
    "name": "Benefit",
    "description": "Your Strength stat becomes 18 (+4) while wearing these gauntlets."
  },
  {
    "name": "Bonus",
    "description": "+2 bastard sword. Cannot be wielded by undead."
  },
  {
    "name": "Curse",
    "description": "You constantly have the sensation of being watched."
  },
  {
    "name": "Personality",
    "description": "Lawful. Grim, suspicious. Forged as a failsafe against the Witch-Kings if they should fall to darkness, which they did. Demands they be slain."
  }
]
```

## Entity: UserFavorite (Extended)

### Description

Tracks user-favorited content across monsters, spells, and magic items. Existing table extended to support magic items.

### Changes Required

#### Add Enum Value

```sql
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'magic_item';
```

#### Fields (Reference)

| Field        | Type              | Required | Constraints                          | Description               |
| ------------ | ----------------- | -------- | ------------------------------------ | ------------------------- |
| id           | UUID              | Yes      | PRIMARY KEY                          | Unique identifier         |
| user_id      | UUID              | Yes      | FOREIGN KEY (auth.users)             | User who favorited        |
| content_id   | UUID              | Yes      | NOT NULL                             | ID of favorited item      |
| content_type | content_type_enum | Yes      | 'monster' \| 'spell' \| 'magic_item' | Type of favorited content |
| created_at   | TIMESTAMPTZ       | Yes      | DEFAULT NOW()                        | When favorited            |

#### Composite Unique Constraint

```sql
ALTER TABLE user_favorites
  ADD CONSTRAINT unique_user_content UNIQUE (user_id, content_id, content_type);
```

## Relationships

### MagicItem → Trait

- **Type**: One-to-Many (embedded JSONB array)
- **Cardinality**: 1 MagicItem has 0..N Traits
- **Implementation**: JSONB array in `official_magic_items.traits`
- **Rationale**: Traits are value objects, never queried independently

### User → MagicItem (via UserFavorite)

- **Type**: Many-to-Many
- **Cardinality**: 1 User favorites 0..N MagicItems, 1 MagicItem favorited by 0..N Users
- **Junction Table**: `user_favorites` with content_type = 'magic_item'
- **Rationale**: Existing favorites architecture, reusable pattern

## State Transitions

### Read-Only Phase (Current)

- **States**: N/A (static data)
- **Transitions**: None
- **Operations**: SELECT only

### Future User-Created Phase

- **States**: draft, published, flagged, deleted
- **Transitions**: draft → published → flagged → deleted
- **Operations**: INSERT, UPDATE, DELETE (via RLS policies)

## Migration Strategy

### Step 1: Create Table

```sql
CREATE TABLE official_magic_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9_-]+$'),
  description TEXT NOT NULL CHECK (LENGTH(TRIM(description)) > 0),
  traits JSONB DEFAULT '[]'::jsonb CHECK (jsonb_typeof(traits) = 'array'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 2: Create Indexes

```sql
CREATE UNIQUE INDEX idx_magic_items_slug ON official_magic_items(slug);
CREATE INDEX idx_magic_items_name_trgm ON official_magic_items USING GIN (name gin_trgm_ops);
CREATE INDEX idx_magic_items_search ON official_magic_items USING GIN (
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
);
```

### Step 3: Seed Data

```sql
-- Generated INSERT statements from starter-data/magic-items.json
-- Use script to convert JSON to SQL INSERT statements
INSERT INTO official_magic_items (name, slug, description, traits) VALUES
  ('Alabaster Destrier', 'alabaster_destrier', 'A smooth, pearly statuette of a running horse.', '[{"name":"Benefit","description":"Once per day, the wielder can speak the command word..."}]'::jsonb),
  ('Amulet Of Secrecy', 'amulet_of_secrecy', 'A heavy, flat pendant carved with a lidded eye.', '[{"name":"Benefit","description":"You can''t be detected by divination magic..."},{"name":"Curse","description":"You constantly have the sensation of being watched."}]'::jsonb),
  -- ... (150 total items)
;
```

### Step 4: Add RLS Policies

```sql
ALTER TABLE official_magic_items ENABLE ROW LEVEL SECURITY;

-- Everyone can read official magic items
CREATE POLICY "Public read access" ON official_magic_items
  FOR SELECT USING (true);
```

### Step 5: Extend UserFavorites

```sql
-- Add magic_item to content_type enum
ALTER TYPE content_type_enum ADD VALUE IF NOT EXISTS 'magic_item';

-- Policies already support any content_type, no changes needed
```

## Query Patterns

### List All Items (Alphabetical)

```sql
SELECT id, name, slug, description, traits
FROM official_magic_items
ORDER BY name ASC
LIMIT 50 OFFSET 0;
```

### Search Items (Fuzzy)

```sql
SELECT id, name, slug, description, traits,
  similarity(name || ' ' || description, 'invisibility') AS score
FROM official_magic_items
WHERE name % 'invisibility' OR description % 'invisibility'
ORDER BY score DESC, name ASC
LIMIT 50;
```

### Get Single Item

```sql
SELECT id, name, slug, description, traits
FROM official_magic_items
WHERE slug = 'ring_of_invisibility';
```

### Check if Favorited

```sql
SELECT EXISTS (
  SELECT 1 FROM user_favorites
  WHERE user_id = $1
    AND content_id = $2
    AND content_type = 'magic_item'
);
```

### Get User's Favorited Items

```sql
SELECT mi.*
FROM official_magic_items mi
JOIN user_favorites uf ON uf.content_id = mi.id
WHERE uf.user_id = $1
  AND uf.content_type = 'magic_item'
ORDER BY uf.created_at DESC;
```

## Data Volume & Performance

### Current Scale

- **Items**: ~150 official magic items
- **Traits per item**: Average 1.5, max 4
- **Storage**: ~300KB total (JSON + text)

### Expected Queries

- **List page**: ~10 queries/min
- **Search**: ~5 queries/min
- **Detail page**: ~20 queries/min
- **Favorites toggle**: ~2 queries/min

### Performance Targets

- **List query**: <100ms
- **Search query**: <300ms
- **Single item**: <50ms
- **Favorites check**: <20ms

### Scaling Considerations

- GIN indexes handle fuzzy search efficiently
- JSONB traits avoid JOIN overhead
- Read-only = no write lock contention
- Future: Consider materialized view for search
