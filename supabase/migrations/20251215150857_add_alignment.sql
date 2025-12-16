-- Add alignment field to monsters
-- Alignment values: L (Lawful), N (Neutral), C (Chaotic)

-- Add column to official_monsters
ALTER TABLE official_monsters
  ADD COLUMN IF NOT EXISTS alignment TEXT CHECK (alignment IN ('L', 'N', 'C'));

-- Add column to user_monsters
ALTER TABLE user_monsters
  ADD COLUMN IF NOT EXISTS alignment TEXT CHECK (alignment IN ('L', 'N', 'C'));

-- Update all_monsters view to include alignment
DROP VIEW IF EXISTS all_monsters;
CREATE VIEW all_monsters AS
SELECT
  id,
  name,
  challenge_level,
  hit_points,
  armor_class,
  speed,
  attacks,
  abilities,
  treasure,
  tags,
  source,
  author_notes,
  description,
  tactics,
  wants,
  gm_notes,
  icon_url,
  art_url,
  xp,
  strength_mod,
  dexterity_mod,
  constitution_mod,
  intelligence_mod,
  wisdom_mod,
  charisma_mod,
  alignment,
  'official' as monster_type,
  NULL as user_id,
  TRUE as is_official,
  TRUE as is_public,
  created_at,
  updated_at
FROM official_monsters
UNION ALL
SELECT
  id,
  name,
  challenge_level,
  hit_points,
  armor_class,
  speed,
  attacks,
  abilities,
  treasure,
  tags,
  source,
  author_notes,
  description,
  tactics,
  wants,
  gm_notes,
  icon_url,
  art_url,
  xp,
  strength_mod,
  dexterity_mod,
  constitution_mod,
  intelligence_mod,
  wisdom_mod,
  charisma_mod,
  alignment,
  'user' as monster_type,
  user_id,
  FALSE as is_official,
  is_public,
  created_at,
  updated_at
FROM user_monsters
WHERE is_public = TRUE;
