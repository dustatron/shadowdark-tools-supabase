-- ============================================
-- Migration: Create Encounter Tables
-- Description: Tables for random encounter table generation and management
-- Date: 2025-10-22
-- ============================================

-- ============================================
-- Table: encounter_tables
-- ============================================
CREATE TABLE encounter_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 3),
  description VARCHAR(500),
  die_size INTEGER NOT NULL CHECK (die_size >= 2 AND die_size <= 1000),
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_slug VARCHAR(8) UNIQUE,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for encounter_tables
CREATE INDEX idx_encounter_tables_user_id ON encounter_tables(user_id);
CREATE UNIQUE INDEX idx_encounter_tables_public_slug ON encounter_tables(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_encounter_tables_created_at ON encounter_tables(created_at DESC);

-- Updated timestamp trigger for encounter_tables
CREATE TRIGGER update_encounter_tables_updated_at
  BEFORE UPDATE ON encounter_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Table: encounter_table_entries
-- ============================================
CREATE TABLE encounter_table_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES encounter_tables(id) ON DELETE CASCADE,
  roll_number INTEGER NOT NULL CHECK (roll_number >= 1),
  monster_id UUID, -- Soft reference (no FK constraint)
  monster_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_roll_per_table UNIQUE (table_id, roll_number),
  CONSTRAINT unique_monster_per_table UNIQUE (table_id, monster_id) WHERE monster_id IS NOT NULL
);

-- Indexes for encounter_table_entries
CREATE INDEX idx_encounter_entries_table_id ON encounter_table_entries(table_id);
CREATE INDEX idx_encounter_entries_roll_number ON encounter_table_entries(table_id, roll_number);

-- Updated timestamp trigger for encounter_table_entries
CREATE TRIGGER update_encounter_entries_updated_at
  BEFORE UPDATE ON encounter_table_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies: encounter_tables
-- ============================================

-- Enable RLS
ALTER TABLE encounter_tables ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view their own tables
CREATE POLICY "Users can view own tables"
ON encounter_tables FOR SELECT
USING (user_id = auth.uid());

-- SELECT: Anyone can view public tables
CREATE POLICY "Anyone can view public tables"
ON encounter_tables FOR SELECT
USING (is_public = true);

-- INSERT: Users can create tables (enforce ownership)
CREATE POLICY "Users can create own tables"
ON encounter_tables FOR INSERT
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can only update their own tables
CREATE POLICY "Users can update own tables"
ON encounter_tables FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only delete their own tables
CREATE POLICY "Users can delete own tables"
ON encounter_tables FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- RLS Policies: encounter_table_entries
-- ============================================

-- Enable RLS
ALTER TABLE encounter_table_entries ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view entries for tables they can access
CREATE POLICY "Users can view entries for accessible tables"
ON encounter_table_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM encounter_tables
    WHERE id = encounter_table_entries.table_id
    AND (user_id = auth.uid() OR is_public = true)
  )
);

-- INSERT: Users can create entries for their own tables
CREATE POLICY "Users can create entries for own tables"
ON encounter_table_entries FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM encounter_tables
    WHERE id = encounter_table_entries.table_id
    AND user_id = auth.uid()
  )
);

-- UPDATE: Users can update entries in their own tables
CREATE POLICY "Users can update entries in own tables"
ON encounter_table_entries FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM encounter_tables
    WHERE id = encounter_table_entries.table_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM encounter_tables
    WHERE id = encounter_table_entries.table_id
    AND user_id = auth.uid()
  )
);

-- DELETE: Users can delete entries from their own tables
CREATE POLICY "Users can delete entries from own tables"
ON encounter_table_entries FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM encounter_tables
    WHERE id = encounter_tables.id
    AND id = encounter_table_entries.table_id
    AND user_id = auth.uid()
  )
);
