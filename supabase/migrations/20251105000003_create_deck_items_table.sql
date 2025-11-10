-- Migration: Create deck_items junction table
-- Feature: 008-deck-building-for
-- Date: 2025-11-05

-- Create deck_items junction table
CREATE TABLE IF NOT EXISTS deck_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  spell_id UUID NOT NULL,
  position INT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint to prevent duplicate spells in a deck
  CONSTRAINT deck_items_unique UNIQUE (deck_id, spell_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deck_items_deck_id ON deck_items(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_items_spell_id ON deck_items(spell_id);

-- Enable Row Level Security
ALTER TABLE deck_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own deck items"
ON deck_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_items.deck_id
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add to own decks"
ON deck_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_items.deck_id
    AND decks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove from own decks"
ON deck_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_items.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Function to enforce 52 card limit
CREATE OR REPLACE FUNCTION check_deck_size_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM deck_items WHERE deck_id = NEW.deck_id) >= 52 THEN
    RAISE EXCEPTION 'Deck cannot exceed 52 cards';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce 52 card limit
CREATE TRIGGER enforce_deck_size_limit
BEFORE INSERT ON deck_items
FOR EACH ROW
EXECUTE FUNCTION check_deck_size_limit();

-- Comments
COMMENT ON TABLE deck_items IS 'Junction table linking decks to spells (max 52 per deck)';
COMMENT ON COLUMN deck_items.id IS 'Unique item identifier';
COMMENT ON COLUMN deck_items.deck_id IS 'Parent deck reference';
COMMENT ON COLUMN deck_items.spell_id IS 'Spell reference (official_spells or user_spells)';
COMMENT ON COLUMN deck_items.position IS 'Order in deck (reserved for future feature)';
COMMENT ON COLUMN deck_items.added_at IS 'When spell was added to deck';
