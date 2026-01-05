-- Migration: Add magic item support to deck_items
-- Feature: 018-we-already-have (Magic Item Cards in Decks)

-- Add item_type discriminator column
ALTER TABLE deck_items
ADD COLUMN item_type text NOT NULL DEFAULT 'spell'
CHECK (item_type IN ('spell', 'magic_item'));

-- Add magic_item_id column for magic item references
ALTER TABLE deck_items
ADD COLUMN magic_item_id uuid;

-- Make spell_id nullable (for magic item entries)
ALTER TABLE deck_items
ALTER COLUMN spell_id DROP NOT NULL;

-- Add constraint: exactly one ID must be set based on item_type
ALTER TABLE deck_items
ADD CONSTRAINT deck_items_one_item_check
CHECK (
  (item_type = 'spell' AND spell_id IS NOT NULL AND magic_item_id IS NULL)
  OR
  (item_type = 'magic_item' AND magic_item_id IS NOT NULL AND spell_id IS NULL)
);

-- Add comments for documentation
COMMENT ON COLUMN deck_items.item_type IS 'Type of item: spell or magic_item';
COMMENT ON COLUMN deck_items.magic_item_id IS 'Reference to official_magic_items or user_magic_items';
