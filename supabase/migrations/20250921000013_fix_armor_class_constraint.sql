-- Fix armor class constraint to allow up to AC 25
-- This fixes the issue with The Tarrasque (AC 22)

-- Drop the existing constraint
ALTER TABLE public.official_monsters
DROP CONSTRAINT IF EXISTS official_monsters_armor_class_check;

-- Add the updated constraint allowing AC up to 25
ALTER TABLE public.official_monsters
ADD CONSTRAINT official_monsters_armor_class_check
CHECK (armor_class >= 1 AND armor_class <= 25);
