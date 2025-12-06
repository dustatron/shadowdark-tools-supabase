# Data Model: User-Generated Magic Items

**Feature**: 012-for-magic-items
**Date**: 2025-12-05

## Entities

### user_magic_items

User-created magic items with ownership and visibility.

| Column      | Type        | Constraints                                      | Description                  |
| ----------- | ----------- | ------------------------------------------------ | ---------------------------- |
| id          | UUID        | PK, DEFAULT gen_random_uuid()                    | Unique identifier            |
| user_id     | UUID        | NOT NULL, FK→user_profiles(id) ON DELETE CASCADE | Owner                        |
| name        | TEXT        | NOT NULL, CHECK LENGTH > 0                       | Display name                 |
| slug        | TEXT        | NOT NULL, UNIQUE(user_id, slug)                  | URL-safe identifier per user |
| description | TEXT        | NOT NULL, CHECK LENGTH > 0                       | Item description             |
| traits      | JSONB       | NOT NULL, DEFAULT '[]', CHECK is_array           | Trait objects array          |
| is_public   | BOOLEAN     | NOT NULL, DEFAULT false                          | Visibility flag              |
| created_at  | TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                          | Creation timestamp           |
| updated_at  | TIMESTAMPTZ | NOT NULL, DEFAULT NOW()                          | Last modified                |

### Trait Object Structure (JSONB)

```json
{
  "name": "Benefit" | "Curse" | "Bonus" | "Personality",
  "description": "Effect description text"
}
```

## Views

### all_magic_items

Combined view of official and public user magic items.

```sql
SELECT
  id, name, slug, description, traits,
  'official' as item_type,
  NULL::UUID as user_id,
  NULL as creator_name,
  created_at, updated_at
FROM official_magic_items

UNION ALL

SELECT
  umi.id, umi.name, umi.slug, umi.description, umi.traits,
  'custom' as item_type,
  umi.user_id,
  up.display_name as creator_name,
  umi.created_at, umi.updated_at
FROM user_magic_items umi
JOIN user_profiles up ON umi.user_id = up.id
WHERE umi.is_public = true
```

## Indexes

| Index                          | Columns               | Type                        | Purpose             |
| ------------------------------ | --------------------- | --------------------------- | ------------------- |
| idx_user_magic_items_user_id   | user_id               | B-tree                      | Owner lookup        |
| idx_user_magic_items_slug      | user_id, slug         | B-tree                      | Unique URL lookup   |
| idx_user_magic_items_name_trgm | name                  | GIN (pg_trgm)               | Fuzzy search        |
| idx_user_magic_items_is_public | is_public             | B-tree (partial WHERE true) | Public items filter |
| idx_user_magic_items_search    | name, description FTS | GIN                         | Full-text search    |

## RLS Policies

### Select

- Owner can read own items
- Anyone can read public items
- Admins can read all

### Insert

- User can insert if user_id = auth.uid()

### Update

- Owner can update own items
- Admins can update any

### Delete

- Owner can delete own items
- Admins can delete any

## Relationships

```
user_profiles (1) ──→ (N) user_magic_items
                          ↓
                    all_magic_items (view)
                          ↑
                    official_magic_items
```

## Validation Rules

1. **name**: Required, non-empty after trim
2. **slug**: Auto-generated from name, lowercase alphanumeric + hyphen/underscore
3. **description**: Required, non-empty after trim
4. **traits**: Must be valid JSON array of trait objects
5. **is_public**: Boolean, defaults to false
