-- Migration: Create decks table for spell card deck builder
-- Feature: 008-deck-building-for
-- Date: 2025-11-05

-- Create decks table
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT deck_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT deck_name_max_length CHECK (char_length(name) <= 100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON decks(user_id);
CREATE INDEX IF NOT EXISTS idx_decks_updated_at ON decks(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own decks"
ON decks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own decks"
ON decks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks"
ON decks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks"
ON decks FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_deck_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deck_timestamp
BEFORE UPDATE ON decks
FOR EACH ROW
EXECUTE FUNCTION update_deck_timestamp();

-- Comments
COMMENT ON TABLE decks IS 'User-owned spell card decks';
COMMENT ON COLUMN decks.id IS 'Unique deck identifier';
COMMENT ON COLUMN decks.user_id IS 'Owner of the deck';
COMMENT ON COLUMN decks.name IS 'User-provided deck name (1-100 chars)';
COMMENT ON COLUMN decks.created_at IS 'Deck creation timestamp';
COMMENT ON COLUMN decks.updated_at IS 'Last modification timestamp';
