-- Relax ability modifier constraints to allow exceptional monsters
-- Some epic monsters (like Archdevil with CHA +7) exceed the standard -5 to +5 range

-- Drop and recreate constraints for official_monsters
ALTER TABLE official_monsters
  DROP CONSTRAINT IF EXISTS official_monsters_strength_mod_check,
  DROP CONSTRAINT IF EXISTS official_monsters_dexterity_mod_check,
  DROP CONSTRAINT IF EXISTS official_monsters_constitution_mod_check,
  DROP CONSTRAINT IF EXISTS official_monsters_intelligence_mod_check,
  DROP CONSTRAINT IF EXISTS official_monsters_wisdom_mod_check,
  DROP CONSTRAINT IF EXISTS official_monsters_charisma_mod_check;

ALTER TABLE official_monsters
  ADD CONSTRAINT official_monsters_strength_mod_check CHECK (strength_mod >= -10 AND strength_mod <= 10),
  ADD CONSTRAINT official_monsters_dexterity_mod_check CHECK (dexterity_mod >= -10 AND dexterity_mod <= 10),
  ADD CONSTRAINT official_monsters_constitution_mod_check CHECK (constitution_mod >= -10 AND constitution_mod <= 10),
  ADD CONSTRAINT official_monsters_intelligence_mod_check CHECK (intelligence_mod >= -10 AND intelligence_mod <= 10),
  ADD CONSTRAINT official_monsters_wisdom_mod_check CHECK (wisdom_mod >= -10 AND wisdom_mod <= 10),
  ADD CONSTRAINT official_monsters_charisma_mod_check CHECK (charisma_mod >= -10 AND charisma_mod <= 10);

-- Do the same for user_monsters to maintain consistency
ALTER TABLE user_monsters
  DROP CONSTRAINT IF EXISTS user_monsters_strength_mod_check,
  DROP CONSTRAINT IF EXISTS user_monsters_dexterity_mod_check,
  DROP CONSTRAINT IF EXISTS user_monsters_constitution_mod_check,
  DROP CONSTRAINT IF EXISTS user_monsters_intelligence_mod_check,
  DROP CONSTRAINT IF EXISTS user_monsters_wisdom_mod_check,
  DROP CONSTRAINT IF EXISTS user_monsters_charisma_mod_check;

ALTER TABLE user_monsters
  ADD CONSTRAINT user_monsters_strength_mod_check CHECK (strength_mod >= -10 AND strength_mod <= 10),
  ADD CONSTRAINT user_monsters_dexterity_mod_check CHECK (dexterity_mod >= -10 AND dexterity_mod <= 10),
  ADD CONSTRAINT user_monsters_constitution_mod_check CHECK (constitution_mod >= -10 AND constitution_mod <= 10),
  ADD CONSTRAINT user_monsters_intelligence_mod_check CHECK (intelligence_mod >= -10 AND intelligence_mod <= 10),
  ADD CONSTRAINT user_monsters_wisdom_mod_check CHECK (wisdom_mod >= -10 AND wisdom_mod <= 10),
  ADD CONSTRAINT user_monsters_charisma_mod_check CHECK (charisma_mod >= -10 AND charisma_mod <= 10);
