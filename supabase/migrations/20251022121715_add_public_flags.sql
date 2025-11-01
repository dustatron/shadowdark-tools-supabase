-- Add is_public flag to user_monsters if not exists
ALTER TABLE user_monsters
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Add is_public flag to user_spells if not exists
ALTER TABLE user_spells
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Note: is_public for encounter_tables added in later migration (20251022180000)

-- Update RLS policies to allow public content viewing
DROP POLICY IF EXISTS "Users can view public monsters" ON user_monsters;
CREATE POLICY "Users can view public monsters"
  ON user_monsters FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view public spells" ON user_spells;
CREATE POLICY "Users can view public spells"
  ON user_spells FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

-- Note: RLS policies for encounter_tables created in later migration (20251022180000)