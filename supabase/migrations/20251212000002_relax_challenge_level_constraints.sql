-- Relax challenge_level constraints to support epic monsters
-- The Tarrasque has level 30, so we need to allow levels beyond 20

-- Drop and recreate constraints for official_monsters
ALTER TABLE official_monsters
  DROP CONSTRAINT IF EXISTS official_monsters_challenge_level_check;

ALTER TABLE official_monsters
  ADD CONSTRAINT official_monsters_challenge_level_check CHECK (challenge_level >= 1 AND challenge_level <= 50);

-- Do the same for user_monsters to maintain consistency
ALTER TABLE user_monsters
  DROP CONSTRAINT IF EXISTS user_monsters_challenge_level_check;

ALTER TABLE user_monsters
  ADD CONSTRAINT user_monsters_challenge_level_check CHECK (challenge_level >= 1 AND challenge_level <= 50);

-- Update list constraints as well
ALTER TABLE user_lists
  DROP CONSTRAINT IF EXISTS user_lists_challenge_level_min_check,
  DROP CONSTRAINT IF EXISTS user_lists_challenge_level_max_check;

ALTER TABLE user_lists
  ADD CONSTRAINT user_lists_challenge_level_min_check CHECK (challenge_level_min >= 1 AND challenge_level_min <= 50),
  ADD CONSTRAINT user_lists_challenge_level_max_check CHECK (challenge_level_max >= 1 AND challenge_level_max <= 50);
