-- Drop view and functions first to avoid column reordering issues
DROP VIEW IF EXISTS public.all_monsters;
DROP FUNCTION IF EXISTS public.search_monsters;
DROP FUNCTION IF EXISTS public.get_random_monsters;

-- Add ability score modifier columns to official_monsters table
ALTER TABLE official_monsters
  ADD COLUMN IF NOT EXISTS strength_mod INTEGER DEFAULT 0 CHECK (strength_mod >= -5 AND strength_mod <= 5),
  ADD COLUMN IF NOT EXISTS dexterity_mod INTEGER DEFAULT 0 CHECK (dexterity_mod >= -5 AND dexterity_mod <= 5),
  ADD COLUMN IF NOT EXISTS constitution_mod INTEGER DEFAULT 0 CHECK (constitution_mod >= -5 AND constitution_mod <= 5),
  ADD COLUMN IF NOT EXISTS intelligence_mod INTEGER DEFAULT 0 CHECK (intelligence_mod >= -5 AND intelligence_mod <= 5),
  ADD COLUMN IF NOT EXISTS wisdom_mod INTEGER DEFAULT 0 CHECK (wisdom_mod >= -5 AND wisdom_mod <= 5),
  ADD COLUMN IF NOT EXISTS charisma_mod INTEGER DEFAULT 0 CHECK (charisma_mod >= -5 AND charisma_mod <= 5);

-- Add ability score modifier columns to user_monsters table
ALTER TABLE user_monsters
  ADD COLUMN IF NOT EXISTS strength_mod INTEGER DEFAULT 0 CHECK (strength_mod >= -5 AND strength_mod <= 5),
  ADD COLUMN IF NOT EXISTS dexterity_mod INTEGER DEFAULT 0 CHECK (dexterity_mod >= -5 AND dexterity_mod <= 5),
  ADD COLUMN IF NOT EXISTS constitution_mod INTEGER DEFAULT 0 CHECK (constitution_mod >= -5 AND constitution_mod <= 5),
  ADD COLUMN IF NOT EXISTS intelligence_mod INTEGER DEFAULT 0 CHECK (intelligence_mod >= -5 AND intelligence_mod <= 5),
  ADD COLUMN IF NOT EXISTS wisdom_mod INTEGER DEFAULT 0 CHECK (wisdom_mod >= -5 AND wisdom_mod <= 5),
  ADD COLUMN IF NOT EXISTS charisma_mod INTEGER DEFAULT 0 CHECK (charisma_mod >= -5 AND charisma_mod <= 5);

-- Populate ability score modifiers for official monsters
UPDATE official_monsters
SET
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
WHERE strength_mod = 0 AND dexterity_mod = 0;

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

-- Recreate all_monsters view with ability modifiers
CREATE VIEW public.all_monsters AS
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
    icon_url,
    art_url,
    xp,
    strength_mod,
    dexterity_mod,
    constitution_mod,
    intelligence_mod,
    wisdom_mod,
    charisma_mod,
    'official' as monster_type,
    NULL::UUID as user_id,
    true as is_public,
    false as is_official,
    created_at,
    updated_at
FROM public.official_monsters

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
    icon_url,
    art_url,
    xp,
    strength_mod,
    dexterity_mod,
    constitution_mod,
    intelligence_mod,
    wisdom_mod,
    charisma_mod,
    'custom' as monster_type,
    user_id,
    is_public,
    false as is_official,
    created_at,
    updated_at
FROM public.user_monsters
WHERE is_public = true;

-- Update search_monsters function to include ability modifiers
CREATE OR REPLACE FUNCTION public.search_monsters(
    search_query TEXT DEFAULT NULL,
    min_challenge_level INTEGER DEFAULT NULL,
    max_challenge_level INTEGER DEFAULT NULL,
    monster_types TEXT[] DEFAULT NULL,
    location_tags TEXT[] DEFAULT NULL,
    source_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    challenge_level INTEGER,
    hit_points INTEGER,
    armor_class INTEGER,
    speed TEXT,
    attacks JSONB,
    abilities JSONB,
    treasure JSONB,
    tags JSONB,
    source TEXT,
    author_notes TEXT,
    icon_url TEXT,
    art_url TEXT,
    xp INTEGER,
    strength_mod INTEGER,
    dexterity_mod INTEGER,
    constitution_mod INTEGER,
    intelligence_mod INTEGER,
    wisdom_mod INTEGER,
    charisma_mod INTEGER,
    monster_type TEXT,
    user_id UUID,
    is_public BOOLEAN,
    is_official BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    relevance REAL
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        am.id,
        am.name,
        am.challenge_level,
        am.hit_points,
        am.armor_class,
        am.speed,
        am.attacks,
        am.abilities,
        am.treasure,
        am.tags,
        am.source,
        am.author_notes,
        am.icon_url,
        am.art_url,
        am.xp,
        am.strength_mod,
        am.dexterity_mod,
        am.constitution_mod,
        am.intelligence_mod,
        am.wisdom_mod,
        am.charisma_mod,
        am.monster_type,
        am.user_id,
        am.is_public,
        am.is_official,
        am.created_at,
        am.updated_at,
        CASE
            WHEN search_query IS NULL THEN 1.0
            ELSE ts_rank_cd(
                to_tsvector('english',
                    COALESCE(am.name, '') || ' ' ||
                    COALESCE(am.source, '') || ' ' ||
                    COALESCE(am.author_notes, '')
                ),
                plainto_tsquery('english', search_query)
            ) + similarity(am.name, search_query)
        END as relevance
    FROM public.all_monsters am
    WHERE
        (search_query IS NULL OR (
            to_tsvector('english',
                COALESCE(am.name, '') || ' ' ||
                COALESCE(am.source, '') || ' ' ||
                COALESCE(am.author_notes, '')
            ) @@ plainto_tsquery('english', search_query)
            OR similarity(am.name, search_query) > 0.3
        ))
        AND (min_challenge_level IS NULL OR am.challenge_level >= min_challenge_level)
        AND (max_challenge_level IS NULL OR am.challenge_level <= max_challenge_level)
        AND (monster_types IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(monster_types)))
            FROM jsonb_array_elements_text(am.tags->'type') as tag_value
        ))
        AND (location_tags IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(location_tags)))
            FROM jsonb_array_elements_text(am.tags->'location') as tag_value
        ))
        AND (source_filter IS NULL OR am.source ILIKE '%' || source_filter || '%')
    ORDER BY
        CASE WHEN search_query IS NULL THEN am.name ELSE NULL END,
        CASE WHEN search_query IS NOT NULL THEN relevance END DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update get_random_monsters function to include ability modifiers
CREATE OR REPLACE FUNCTION public.get_random_monsters(
    count_limit INTEGER DEFAULT 1,
    min_challenge_level INTEGER DEFAULT NULL,
    max_challenge_level INTEGER DEFAULT NULL,
    monster_types TEXT[] DEFAULT NULL,
    location_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    challenge_level INTEGER,
    hit_points INTEGER,
    armor_class INTEGER,
    speed TEXT,
    attacks JSONB,
    abilities JSONB,
    treasure JSONB,
    tags JSONB,
    source TEXT,
    author_notes TEXT,
    icon_url TEXT,
    art_url TEXT,
    xp INTEGER,
    strength_mod INTEGER,
    dexterity_mod INTEGER,
    constitution_mod INTEGER,
    intelligence_mod INTEGER,
    wisdom_mod INTEGER,
    charisma_mod INTEGER,
    monster_type TEXT,
    user_id UUID,
    is_public BOOLEAN,
    is_official BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        am.id,
        am.name,
        am.challenge_level,
        am.hit_points,
        am.armor_class,
        am.speed,
        am.attacks,
        am.abilities,
        am.treasure,
        am.tags,
        am.source,
        am.author_notes,
        am.icon_url,
        am.art_url,
        am.xp,
        am.strength_mod,
        am.dexterity_mod,
        am.constitution_mod,
        am.intelligence_mod,
        am.wisdom_mod,
        am.charisma_mod,
        am.monster_type,
        am.user_id,
        am.is_public,
        am.is_official,
        am.created_at,
        am.updated_at
    FROM public.all_monsters am
    WHERE
        (min_challenge_level IS NULL OR am.challenge_level >= min_challenge_level)
        AND (max_challenge_level IS NULL OR am.challenge_level <= max_challenge_level)
        AND (monster_types IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(monster_types)))
            FROM jsonb_array_elements_text(am.tags->'type') as tag_value
        ))
        AND (location_tags IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(location_tags)))
            FROM jsonb_array_elements_text(am.tags->'location') as tag_value
        ))
    ORDER BY RANDOM()
    LIMIT count_limit;
END;
$$ LANGUAGE plpgsql STABLE;
