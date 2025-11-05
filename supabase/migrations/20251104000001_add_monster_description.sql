-- Add description field to monster tables
-- Description is a brief visual description of the monster (1-2 sentences)

ALTER TABLE public.official_monsters
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.user_monsters
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update the all_monsters view to include description
CREATE OR REPLACE VIEW public.all_monsters AS
SELECT
    id,
    name,
    description,
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
    description,
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

-- Add description to search index
DROP INDEX IF EXISTS idx_user_monsters_search;
CREATE INDEX idx_user_monsters_search ON public.user_monsters USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(source, '') || ' ' ||
        COALESCE(author_notes, '')
    )
);

DROP INDEX IF EXISTS idx_official_monsters_search;
CREATE INDEX idx_official_monsters_search ON public.official_monsters USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(source, '') || ' ' ||
        COALESCE(author_notes, '')
    )
);
