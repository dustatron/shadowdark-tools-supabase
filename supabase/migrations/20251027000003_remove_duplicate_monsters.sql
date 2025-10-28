-- Remove duplicate monsters from official_monsters table
-- Keep the oldest record for each unique monster name

-- First, identify duplicates
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO duplicate_count
  FROM (
    SELECT name, COUNT(*) as count
    FROM official_monsters
    GROUP BY name
    HAVING COUNT(*) > 1
  ) duplicates;

  RAISE NOTICE 'Found % duplicate monster names', duplicate_count;
END $$;

-- Delete duplicates, keeping only the oldest record (lowest id)
DELETE FROM official_monsters
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC, id ASC) as rn
    FROM official_monsters
  ) ranked
  WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
ALTER TABLE official_monsters
  ADD CONSTRAINT official_monsters_name_unique UNIQUE (name);

-- Verify no duplicates remain
DO $$
DECLARE
  remaining_duplicates INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO remaining_duplicates
  FROM (
    SELECT name, COUNT(*) as count
    FROM official_monsters
    GROUP BY name
    HAVING COUNT(*) > 1
  ) duplicates;

  IF remaining_duplicates > 0 THEN
    RAISE EXCEPTION 'Still have % duplicate monster names after cleanup', remaining_duplicates;
  ELSE
    RAISE NOTICE 'Successfully removed all duplicates. Table now has unique monster names.';
  END IF;
END $$;
