-- Update favorites table to support magic_item and equipment types

-- Drop the old constraint
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_item_type_check;

-- Add new constraint including magic_item and equipment
ALTER TABLE favorites
ADD CONSTRAINT favorites_item_type_check
CHECK (item_type IN ('monster', 'spell', 'magic_item', 'equipment'));

-- Add comment for documentation
COMMENT ON COLUMN favorites.item_type IS 'Type of item being favorited: monster, spell, magic_item, or equipment';