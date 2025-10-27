-- Populate ability score modifiers for official monsters
-- Based on challenge level, with variation by monster type

-- For most monsters, use a simple CL-based formula
-- Low CL monsters (1-2): mostly 0, some +1
-- Mid CL monsters (3-5): +1 to +2
-- High CL monsters (6-8): +2 to +3
-- Very High CL monsters (9-10): +3 to +4

UPDATE official_monsters
SET
  -- Physical abilities (STR, DEX, CON) generally scale with CL
  strength_mod = CASE
    WHEN challenge_level <= 1 THEN 0
    WHEN challenge_level <= 3 THEN 1
    WHEN challenge_level <= 5 THEN 2
    WHEN challenge_level <= 7 THEN 3
    WHEN challenge_level <= 9 THEN 4
    ELSE 5
  END,

  dexterity_mod = CASE
    WHEN challenge_level <= 1 THEN 0
    WHEN challenge_level <= 3 THEN 1
    WHEN challenge_level <= 5 THEN 1
    WHEN challenge_level <= 7 THEN 2
    WHEN challenge_level <= 9 THEN 3
    ELSE 4
  END,

  constitution_mod = CASE
    WHEN challenge_level <= 1 THEN 0
    WHEN challenge_level <= 3 THEN 1
    WHEN challenge_level <= 5 THEN 2
    WHEN challenge_level <= 7 THEN 2
    WHEN challenge_level <= 9 THEN 3
    ELSE 4
  END,

  -- Mental abilities (INT, WIS, CHA) scale more conservatively
  intelligence_mod = CASE
    WHEN challenge_level <= 2 THEN 0
    WHEN challenge_level <= 5 THEN 1
    WHEN challenge_level <= 8 THEN 2
    ELSE 3
  END,

  wisdom_mod = CASE
    WHEN challenge_level <= 2 THEN 0
    WHEN challenge_level <= 5 THEN 1
    WHEN challenge_level <= 8 THEN 2
    ELSE 3
  END,

  charisma_mod = CASE
    WHEN challenge_level <= 2 THEN 0
    WHEN challenge_level <= 5 THEN 1
    WHEN challenge_level <= 8 THEN 1
    ELSE 2
  END
WHERE strength_mod = 0 AND dexterity_mod = 0; -- Only update defaults

-- Special cases: Beasts typically have lower INT
UPDATE official_monsters
SET
  intelligence_mod = GREATEST(intelligence_mod - 2, -2),
  charisma_mod = GREATEST(charisma_mod - 1, -1)
WHERE tags->>'type' LIKE '%beast%'
  AND intelligence_mod > -2;

-- Special cases: Undead typically have lower CHA, higher CON
UPDATE official_monsters
SET
  constitution_mod = LEAST(constitution_mod + 1, 5),
  charisma_mod = GREATEST(charisma_mod - 2, -2)
WHERE tags->>'type' LIKE '%undead%'
  AND charisma_mod > -2;

-- Special cases: Celestials/Angels have higher CHA
UPDATE official_monsters
SET
  charisma_mod = LEAST(charisma_mod + 2, 5)
WHERE tags->>'type' LIKE '%celestial%'
  OR name ILIKE '%angel%'
  AND charisma_mod < 5;

-- Special cases: Constructs have no mental stats
UPDATE official_monsters
SET
  intelligence_mod = -5,
  wisdom_mod = -5,
  charisma_mod = -5
WHERE tags->>'type' LIKE '%construct%';

-- Note: These are baseline values. Can be refined per-monster later.
