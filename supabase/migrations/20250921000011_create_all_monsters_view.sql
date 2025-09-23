-- Create all_monsters view combining official and public custom monsters
CREATE OR REPLACE VIEW public.all_monsters AS
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
    'custom' as monster_type,
    user_id,
    is_public,
    false as is_official,
    created_at,
    updated_at
FROM public.user_monsters
WHERE is_public = true;

-- Create a function for searching all monsters
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
        -- Text search
        (search_query IS NULL OR (
            to_tsvector('english',
                COALESCE(am.name, '') || ' ' ||
                COALESCE(am.source, '') || ' ' ||
                COALESCE(am.author_notes, '')
            ) @@ plainto_tsquery('english', search_query)
            OR similarity(am.name, search_query) > 0.3
        ))
        -- Challenge level range
        AND (min_challenge_level IS NULL OR am.challenge_level >= min_challenge_level)
        AND (max_challenge_level IS NULL OR am.challenge_level <= max_challenge_level)
        -- Monster type filter
        AND (monster_types IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(monster_types)))
            FROM jsonb_array_elements_text(am.tags->'type') as tag_value
        ))
        -- Location tags filter
        AND (location_tags IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(location_tags)))
            FROM jsonb_array_elements_text(am.tags->'location') as tag_value
        ))
        -- Source filter
        AND (source_filter IS NULL OR am.source ILIKE '%' || source_filter || '%')
    ORDER BY
        CASE WHEN search_query IS NULL THEN am.name ELSE NULL END,
        CASE WHEN search_query IS NOT NULL THEN relevance END DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get random monster(s)
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
        am.monster_type,
        am.user_id,
        am.is_public,
        am.is_official,
        am.created_at,
        am.updated_at
    FROM public.all_monsters am
    WHERE
        -- Challenge level range
        (min_challenge_level IS NULL OR am.challenge_level >= min_challenge_level)
        AND (max_challenge_level IS NULL OR am.challenge_level <= max_challenge_level)
        -- Monster type filter
        AND (monster_types IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(monster_types)))
            FROM jsonb_array_elements_text(am.tags->'type') as tag_value
        ))
        -- Location tags filter
        AND (location_tags IS NULL OR (
            SELECT bool_or(tag_value IN (SELECT unnest(location_tags)))
            FROM jsonb_array_elements_text(am.tags->'location') as tag_value
        ))
    ORDER BY RANDOM()
    LIMIT count_limit;
END;
$$ LANGUAGE plpgsql STABLE;