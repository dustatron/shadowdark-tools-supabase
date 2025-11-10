# Data Model: Spell Card Deck Builder

**Date**: 2025-11-04
**Feature**: 008-deck-building-for

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌─────────────────┐
│ auth.users   │       │    decks     │       │   deck_items    │
│              │       │              │       │                 │
│ - id (PK)    │◄──────┤ - user_id    │       │ - deck_id (FK)  │
└──────────────┘       │ - name       │◄──────┤ - spell_id (FK) │
                       │ - created_at │       │ - position      │
                       │ - updated_at │       │ - added_at      │
                       └──────────────┘       └─────────────────┘
                                                      │
                                                      ▼
                                              ┌─────────────────┐
                                              │ official_spells │
                                              │   OR            │
                                              │  user_spells    │
                                              └─────────────────┘
```

## Entities

### Deck

User-owned collection of spell cards.

**Table**: `decks`

**Fields**:
| Field | Type | Constraints | Description |
| ------------ | ------------ | ------------------------------ | ------------------------------------ |
| id | UUID | PRIMARY KEY, DEFAULT uuid() | Unique deck identifier |
| user_id | UUID | NOT NULL, FK → auth.users(id) | Owner of the deck |
| name | TEXT | NOT NULL, CHECK (length > 0) | User-provided deck name |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Deck creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last modification timestamp |

**Validation Rules**:

- Name must be non-empty string (trimmed)
- Name max length: 100 characters
- User can have multiple decks (no limit for MVP)
- Deck must belong to authenticated user

**State Transitions**:

```
[New] → name provided → [Draft]
[Draft] → spells added → [Active]
[Active] → all spells removed → [Empty]
[Any State] → user deletes → [Deleted]
```

**Zod Schema**:

```typescript
const DeckSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  created_at: z.date(),
  updated_at: z.date(),
});

const CreateDeckSchema = DeckSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

const UpdateDeckSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
});
```

### DeckItem

Junction table linking decks to spells.

**Table**: `deck_items`

**Fields**:
| Field | Type | Constraints | Description |
| ---------- | ----------- | ----------------------------- | --------------------------------- |
| id | UUID | PRIMARY KEY, DEFAULT uuid() | Unique item identifier |
| deck_id | UUID | NOT NULL, FK → decks(id) | Parent deck |
| spell_id | UUID | NOT NULL | Reference to spell |
| position | INT | NULL | Order in deck (future feature) |
| added_at | TIMESTAMPTZ | DEFAULT NOW() | When spell was added |

**Constraints**:

- UNIQUE (deck_id, spell_id) - Prevents duplicate spells
- CHECK (SELECT COUNT(\*) FROM deck_items WHERE deck_id = $1) <= 52
- ON DELETE CASCADE for deck_id (delete items when deck deleted)
- ON DELETE CASCADE for spell_id (remove items when spell deleted)

**Validation Rules**:

- Maximum 52 items per deck
- Spell must exist in official_spells OR user_spells
- Spell must be unique within deck
- Position reserved for future ordering feature (nullable for MVP)

**Zod Schema**:

```typescript
const DeckItemSchema = z.object({
  id: z.string().uuid(),
  deck_id: z.string().uuid(),
  spell_id: z.string().uuid(),
  position: z.number().int().positive().nullable(),
  added_at: z.date(),
});

const AddSpellSchema = z.object({
  spell_id: z.string().uuid(),
});

const DeckWithItemsSchema = DeckSchema.extend({
  items: z.array(DeckItemSchema).max(52),
  spell_count: z.number().int().min(0).max(52),
});
```

### Spell (Existing Entity)

Reference to existing spell data. Not modified by this feature.

**Tables**: `official_spells` | `user_spells`

**Relevant Fields**:
| Field | Type | Description |
| ----------- | ---- | ----------------------------------- |
| id | UUID | Spell identifier |
| name | TEXT | Spell name (for card title) |
| level | INT | Spell level (0-9) |
| duration | TEXT | Spell duration |
| range | TEXT | Spell range |
| description | TEXT | Full spell description (may be long)|

**Usage**: Read-only for deck building. Spells selected from existing spell list.

## Database Constraints

### Check Constraints

```sql
-- Deck name not empty
ALTER TABLE decks
ADD CONSTRAINT deck_name_not_empty
CHECK (char_length(trim(name)) > 0);

-- Deck name max length
ALTER TABLE decks
ADD CONSTRAINT deck_name_max_length
CHECK (char_length(name) <= 100);
```

### Unique Constraints

```sql
-- Prevent duplicate spells in deck
CREATE UNIQUE INDEX deck_items_unique
ON deck_items(deck_id, spell_id);
```

### Foreign Key Constraints

```sql
-- Deck belongs to user
ALTER TABLE decks
ADD CONSTRAINT fk_deck_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Deck item belongs to deck
ALTER TABLE deck_items
ADD CONSTRAINT fk_deck_item_deck
FOREIGN KEY (deck_id)
REFERENCES decks(id)
ON DELETE CASCADE;

-- Deck item references spell (polymorphic via triggers/app logic)
-- Note: spell_id can reference either official_spells or user_spells
-- Validation handled at application level (Zod schema)
```

### Triggers

```sql
-- Update updated_at timestamp on deck modification
CREATE TRIGGER update_deck_timestamp
BEFORE UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enforce 52 card limit
CREATE TRIGGER enforce_deck_size_limit
BEFORE INSERT ON deck_items
FOR EACH ROW
EXECUTE FUNCTION check_deck_size_limit();

-- Function to check deck size
CREATE OR REPLACE FUNCTION check_deck_size_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM deck_items WHERE deck_id = NEW.deck_id) >= 52 THEN
    RAISE EXCEPTION 'Deck cannot exceed 52 cards';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS) Policies

### Decks Table

```sql
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Users can view their own decks
CREATE POLICY "Users can view own decks"
ON decks FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own decks
CREATE POLICY "Users can create own decks"
ON decks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own decks
CREATE POLICY "Users can update own decks"
ON decks FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own decks
CREATE POLICY "Users can delete own decks"
ON decks FOR DELETE
USING (auth.uid() = user_id);
```

### Deck Items Table

```sql
ALTER TABLE deck_items ENABLE ROW LEVEL SECURITY;

-- Users can view items in their own decks
CREATE POLICY "Users can view own deck items"
ON deck_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_items.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Users can add items to their own decks
CREATE POLICY "Users can add to own decks"
ON deck_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_items.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Users can remove items from their own decks
CREATE POLICY "Users can remove from own decks"
ON deck_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_items.deck_id
    AND decks.user_id = auth.uid()
  )
);
```

## Indexes

```sql
-- Query decks by user
CREATE INDEX idx_decks_user_id ON decks(user_id);

-- Query deck items by deck
CREATE INDEX idx_deck_items_deck_id ON deck_items(deck_id);

-- Query deck items by spell (for cascade detection)
CREATE INDEX idx_deck_items_spell_id ON deck_items(spell_id);

-- Query decks by updated_at (for recent decks)
CREATE INDEX idx_decks_updated_at ON decks(updated_at DESC);
```

## Sample Queries

### Get user's decks with spell count

```sql
SELECT
  d.id,
  d.name,
  d.created_at,
  d.updated_at,
  COUNT(di.id) as spell_count
FROM decks d
LEFT JOIN deck_items di ON d.id = di.deck_id
WHERE d.user_id = $1
GROUP BY d.id
ORDER BY d.updated_at DESC;
```

### Get deck with all spells

```sql
SELECT
  d.*,
  json_agg(
    json_build_object(
      'id', COALESCE(os.id, us.id),
      'name', COALESCE(os.name, us.name),
      'level', COALESCE(os.level, us.level),
      'duration', COALESCE(os.duration, us.duration),
      'range', COALESCE(os.range, us.range),
      'description', COALESCE(os.description, us.description)
    ) ORDER BY di.added_at
  ) as spells
FROM decks d
LEFT JOIN deck_items di ON d.id = di.deck_id
LEFT JOIN official_spells os ON di.spell_id = os.id
LEFT JOIN user_spells us ON di.spell_id = us.id
WHERE d.id = $1
  AND d.user_id = $2
GROUP BY d.id;
```

### Check if spell already in deck

```sql
SELECT EXISTS(
  SELECT 1 FROM deck_items
  WHERE deck_id = $1
    AND spell_id = $2
);
```

### Add spell to deck (with size check)

```sql
WITH deck_check AS (
  SELECT COUNT(*) as count
  FROM deck_items
  WHERE deck_id = $1
)
INSERT INTO deck_items (deck_id, spell_id)
SELECT $1, $2
WHERE (SELECT count FROM deck_check) < 52
  AND NOT EXISTS (
    SELECT 1 FROM deck_items
    WHERE deck_id = $1 AND spell_id = $2
  )
RETURNING *;
```

## TypeScript Types

```typescript
// Generated from Supabase
export type Database = {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      deck_items: {
        Row: {
          id: string;
          deck_id: string;
          spell_id: string;
          position: number | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          spell_id: string;
          position?: number | null;
          added_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          spell_id?: string;
          position?: number | null;
          added_at?: string;
        };
      };
    };
  };
};

// Application types
export interface Deck {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  spell_count?: number;
}

export interface DeckWithSpells extends Deck {
  spells: Spell[];
}

export interface DeckItem {
  id: string;
  deck_id: string;
  spell_id: string;
  position: number | null;
  added_at: Date;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  duration: string;
  range: string;
  description: string;
}
```

## Migration Files

See `supabase/migrations/` directory for SQL migration files:

1. `YYYYMMDDHHMMSS_create_decks_table.sql`
2. `YYYYMMDDHHMMSS_create_deck_items_table.sql`
3. `YYYYMMDDHHMMSS_add_deck_rls_policies.sql`
4. `YYYYMMDDHHMMSS_add_deck_items_rls_policies.sql`
5. `YYYYMMDDHHMMSS_add_deck_triggers.sql`

## Future Extensibility

### Monster Cards (v2)

**Preparation**:

- `position` column already reserved in `deck_items`
- Schema designed for polymorphic spell_id (can reference monsters)
- Consider: Separate `deck_type` enum ('spell' | 'monster' | 'mixed')

**Changes Required**:

```sql
-- Add deck type
ALTER TABLE decks
ADD COLUMN deck_type TEXT DEFAULT 'spell'
CHECK (deck_type IN ('spell', 'monster', 'mixed'));

-- Add item type
ALTER TABLE deck_items
ADD COLUMN item_type TEXT DEFAULT 'spell'
CHECK (item_type IN ('spell', 'monster'));

-- Update uniqueness constraint
DROP INDEX deck_items_unique;
CREATE UNIQUE INDEX deck_items_unique
ON deck_items(deck_id, spell_id, item_type);
```

### Card Reordering (v2)

**Preparation**:

- `position` column already exists (nullable)
- Populate position on insert: `COALESCE(MAX(position), 0) + 1`
- Update position via drag-drop UI

**Changes Required**:

```sql
-- Make position non-null for v2
ALTER TABLE deck_items
ALTER COLUMN position SET NOT NULL;

-- Update trigger to auto-assign position
CREATE TRIGGER auto_assign_position
BEFORE INSERT ON deck_items
FOR EACH ROW
EXECUTE FUNCTION assign_next_position();
```
