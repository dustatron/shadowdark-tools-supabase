# Data Model: Magic Item Cards in Decks

## Schema Changes

### Modified Table: `deck_items`

```sql
-- Add item_type discriminator
ALTER TABLE deck_items
ADD COLUMN item_type text NOT NULL DEFAULT 'spell'
CHECK (item_type IN ('spell', 'magic_item'));

-- Add magic_item_id column
ALTER TABLE deck_items
ADD COLUMN magic_item_id uuid;

-- Make spell_id nullable (for magic item entries)
ALTER TABLE deck_items
ALTER COLUMN spell_id DROP NOT NULL;

-- Add constraint: exactly one ID must be set
ALTER TABLE deck_items
ADD CONSTRAINT deck_items_one_item_check
CHECK (
  (item_type = 'spell' AND spell_id IS NOT NULL AND magic_item_id IS NULL)
  OR
  (item_type = 'magic_item' AND magic_item_id IS NOT NULL AND spell_id IS NULL)
);

-- Add comment
COMMENT ON COLUMN deck_items.item_type IS 'Type of item: spell or magic_item';
COMMENT ON COLUMN deck_items.magic_item_id IS 'Reference to official_magic_items or user_magic_items';
```

### Updated Table Structure

| Column        | Type        | Nullable | Default           | Description                                     |
| ------------- | ----------- | -------- | ----------------- | ----------------------------------------------- |
| id            | uuid        | NO       | gen_random_uuid() | Primary key                                     |
| deck_id       | uuid        | NO       | -                 | FK to decks                                     |
| item_type     | text        | NO       | 'spell'           | 'spell' or 'magic_item'                         |
| spell_id      | uuid        | YES      | -                 | FK to spells (when item_type='spell')           |
| magic_item_id | uuid        | YES      | -                 | FK to magic items (when item_type='magic_item') |
| position      | integer     | YES      | -                 | Order in deck                                   |
| added_at      | timestamptz | NO       | now()             | Timestamp                                       |

### RLS Policy Update

Existing policy covers new column:

```sql
-- Users can manage their own deck items (no change needed)
CREATE POLICY "Users can manage own deck items"
ON deck_items FOR ALL
USING (deck_id IN (SELECT id FROM decks WHERE user_id = auth.uid()));
```

## TypeScript Types

### Zod Schemas (lib/validations/deck.ts)

```typescript
// Item type discriminator
export const DeckItemType = z.enum(["spell", "magic_item"]);
export type DeckItemType = z.infer<typeof DeckItemType>;

// Add Magic Item Schema
export const AddMagicItemSchema = z.object({
  magic_item_id: z.string().uuid("Invalid magic item ID"),
});
export type AddMagicItemInput = z.infer<typeof AddMagicItemSchema>;

// Magic Item for deck (parallel to SpellForDeck)
export const MagicItemForDeckSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  traits: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  image_url: z.string().nullable().optional(),
});
export type MagicItemForDeck = z.infer<typeof MagicItemForDeckSchema>;

// Extended deck response
export const DeckWithItemsSchema = DeckSchema.extend({
  item_count: z.number().int().min(0).max(52),
  spells: z.array(SpellForDeckSchema),
  magic_items: z.array(MagicItemForDeckSchema),
});
export type DeckWithItems = z.infer<typeof DeckWithItemsSchema>;
```

## Entity Relationships

```
decks (1) ──────< deck_items (N)
                      │
                      ├── (item_type='spell') ──> official_spells | user_spells
                      │
                      └── (item_type='magic_item') ──> official_magic_items | user_magic_items
```

## Migration Strategy

1. Add new columns with defaults (non-breaking)
2. Existing rows automatically get `item_type='spell'`
3. No data migration needed
4. New inserts use new schema

## Constraints

- 52 card limit enforced at API level (count all deck_items regardless of type)
- Duplicates allowed (same item can appear multiple times)
- Position field optional, used for future drag-drop ordering
