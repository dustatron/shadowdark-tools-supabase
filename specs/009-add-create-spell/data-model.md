# Data Model: Create Custom Spell

**Feature**: 009-add-create-spell
**Date**: 2025-11-12

## Entities

### UserSpell

User-created custom spell for Shadowdark campaigns.

**Table**: `public.user_spells` (existing)

**Fields**:

| Field          | Type        | Constraints                      | Description                                               |
| -------------- | ----------- | -------------------------------- | --------------------------------------------------------- |
| `id`           | UUID        | PRIMARY KEY, auto-generated      | Unique spell identifier                                   |
| `name`         | TEXT        | NOT NULL                         | Spell name (must be globally unique - enforced in app)    |
| `slug`         | TEXT        | NOT NULL, UNIQUE(user_id, slug)  | URL-friendly version of name                              |
| `description`  | TEXT        | NOT NULL                         | Spell effect/mechanics (maps to "effect" in requirements) |
| `classes`      | JSONB       | NOT NULL, default '[]'           | Array of spell classes ["wizard", "priest"]               |
| `duration`     | TEXT        | NOT NULL                         | Spell duration (free text)                                |
| `range`        | TEXT        | NOT NULL                         | Spell range (free text)                                   |
| `tier`         | INTEGER     | NOT NULL, CHECK (1-5)            | Spell power level (Shadowdark standard)                   |
| `source`       | TEXT        | NOT NULL, default 'Custom'       | Spell source attribution                                  |
| `author_notes` | TEXT        | nullable                         | Optional notes/school (maps to "school" in requirements)  |
| `icon_url`     | TEXT        | nullable                         | Spell icon URL (unused for MVP)                           |
| `art_url`      | TEXT        | nullable                         | Spell art URL (unused for MVP)                            |
| `user_id`      | UUID        | NOT NULL, FK → auth.users(id)    | Owner of the spell                                        |
| `creator_id`   | UUID        | nullable, FK → user_profiles(id) | Creator profile reference                                 |
| `is_public`    | BOOLEAN     | NOT NULL, default false          | Public visibility toggle                                  |
| `created_at`   | TIMESTAMPTZ | NOT NULL, auto                   | Creation timestamp                                        |
| `updated_at`   | TIMESTAMPTZ | NOT NULL, auto-updated           | Last update timestamp                                     |

**Relationships**:

- Belongs to `auth.users` via `user_id` (CASCADE delete)
- Belongs to `user_profiles` via `creator_id` (SET NULL on delete)

**Validation Rules** (Zod schemas):

- Name: 1-100 characters, globally unique (case-insensitive)
- Tier: Integer 1-5 (Shadowdark constraint)
- Classes: Non-empty array of "wizard" | "priest"
- Duration: Non-empty string
- Range: Non-empty string
- Description: Non-empty string
- is_public: Boolean, defaults to false

**State Transitions**:

1. **Draft → Public**: User creates private spell, toggles `is_public = true`
2. **Public → Draft**: User toggles `is_public = false` (visible only to owner)
3. **Edit**: User updates any field (only owner can edit)
4. **Delete**: User deletes spell (only owner can delete)

**Access Control** (RLS Policies):

- **SELECT**: `user_id = auth.uid() OR is_public = true`
- **INSERT**: `user_id = auth.uid()`
- **UPDATE**: `user_id = auth.uid()` (or admin)
- **DELETE**: `user_id = auth.uid()` (or admin)

---

### OfficialSpell

Read-only spell from official Shadowdark content.

**Table**: `public.official_spells` (existing)

**Fields**: Same as UserSpell except:

- No `user_id`, `creator_id`, `is_public` fields
- Always publicly visible

**Purpose**:

- Reference data for players
- Name uniqueness validation (all_spells view)

**Access Control**:

- SELECT only (no mutations)

---

### AllSpells (View)

Unified view combining official and user spells.

**View**: `public.all_spells` (existing)

**Definition**:

```sql
SELECT ... FROM official_spells
WHERE spell_type = 'official'
UNION ALL
SELECT ... FROM user_spells
WHERE spell_type = 'user'
```

**Purpose**:

- Global name uniqueness checks
- Unified spell search
- Public spell browsing

**Fields**:

- All UserSpell fields
- `spell_type`: 'official' | 'user' (discriminator)

**Access Control**:

- SELECT only (read-only view)
- Respects underlying table RLS policies

---

## Data Flow

### Create Spell Flow

```
1. User submits form data
   ↓
2. Validate with Zod schema (client + server)
   ↓
3. Check name uniqueness in all_spells view
   ↓ (if unique)
4. Generate slug from name
   ↓
5. INSERT into user_spells with user_id
   ↓
6. Return created spell
```

### Update Spell Flow

```
1. User submits updated fields
   ↓
2. Validate with Zod partial schema
   ↓
3. If name changed: check uniqueness
   ↓
4. UPDATE user_spells WHERE id AND user_id
   ↓ (RLS enforces ownership)
5. Return updated spell
```

### Delete Spell Flow

```
1. User requests delete
   ↓
2. DELETE FROM user_spells WHERE id
   ↓ (RLS enforces ownership)
3. Return 204 No Content
```

### Read Spell Flow

```
1. User requests spell by ID
   ↓
2. SELECT FROM user_spells WHERE id
   ↓ (RLS filters: owned OR public)
3. Return spell OR 404
```

---

## Indexes

Existing indexes on `user_spells` (from migration):

- `idx_user_spells_user_id` - User spell lookup
- `idx_user_spells_creator_id` - Creator lookup
- `idx_user_spells_name` - GIN trigram for fuzzy search
- `idx_user_spells_slug` - Composite (user_id, slug)
- `idx_user_spells_tier` - Tier filtering
- `idx_user_spells_classes` - GIN for JSONB array search
- `idx_user_spells_is_public` - Public spell filtering
- `idx_user_spells_search` - Full-text search (name, description, source, notes)

**Performance Targets**:

- Name uniqueness check: <50ms
- Spell creation: <200ms
- List query (with filters): <500ms

---

## Field Mapping Reference

| Requirement Field | Database Field | Notes                |
| ----------------- | -------------- | -------------------- |
| Name              | `name`         | Direct mapping       |
| Tier              | `tier`         | Direct mapping       |
| Class             | `classes`      | JSONB array          |
| School            | `author_notes` | Optional notes field |
| Duration          | `duration`     | Direct mapping       |
| Range             | `range`        | Direct mapping       |
| Effect            | `description`  | **Key mapping**      |
| Public/Private    | `is_public`    | Boolean toggle       |

---

## Schema Compatibility

**No migrations required**:

- Table `user_spells` exists with all fields
- RLS policies complete
- Indexes optimized
- Triggers configured (updated_at)

**Application-level additions**:

- Global name uniqueness validation (query `all_spells`)
- Slug generation utility
- Zod validation schemas

---

## Type Definitions

TypeScript types inferred from Zod schemas:

```typescript
// lib/validations/spell.ts
export type SpellCreate = {
  name: string;
  tier: number;
  classes: ("wizard" | "priest")[];
  duration: string;
  range: string;
  description: string;
  author_notes?: string;
  is_public: boolean;
};

export type SpellUpdate = Partial<SpellCreate>;

export type Spell = SpellCreate & {
  id: string;
  slug: string;
  source: string;
  user_id: string;
  creator_id: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## Error Scenarios

| Scenario               | Response                                                    | HTTP Status      |
| ---------------------- | ----------------------------------------------------------- | ---------------- |
| Name already exists    | `{ error: "Spell name already exists" }`                    | 409 Conflict     |
| Invalid tier (0, 6)    | `{ error: "Tier must be between 1 and 5", details: [...] }` | 400 Bad Request  |
| Empty classes array    | `{ error: "At least one class required", details: [...] }`  | 400 Bad Request  |
| Unauthenticated create | `{ error: "Authentication required" }`                      | 401 Unauthorized |
| Update non-owned spell | `{ error: "Forbidden" }` (RLS blocks query)                 | 403 Forbidden    |
| Spell not found        | `{ error: "Spell not found" }`                              | 404 Not Found    |

---

## Future Considerations

**Out of scope for MVP**:

- `icon_url`, `art_url` fields (image upload deferred)
- Spell versioning/history
- Spell favoriting/bookmarking
- Community ratings
- Spell collections/grimoires

**Extensibility**:

- Fields exist for future image uploads
- `creator_id` enables attribution features
- `source` field supports third-party attribution
- JSONB `classes` allows easy addition of new spell-casting classes
