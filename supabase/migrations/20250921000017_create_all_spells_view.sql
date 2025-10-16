-- Create a view that combines official and user spells
CREATE OR REPLACE VIEW public.all_spells AS
SELECT
    id,
    name,
    slug,
    description,
    classes,
    duration,
    range,
    tier,
    source,
    author_notes,
    icon_url,
    art_url,
    'official'::TEXT as spell_type,
    NULL::UUID as user_id,
    NULL::UUID as creator_id,
    NULL::BOOLEAN as is_public,
    created_at,
    updated_at
FROM public.official_spells

UNION ALL

SELECT
    id,
    name,
    slug,
    description,
    classes,
    duration,
    range,
    tier,
    source,
    author_notes,
    icon_url,
    art_url,
    'user'::TEXT as spell_type,
    user_id,
    creator_id,
    is_public,
    created_at,
    updated_at
FROM public.user_spells;

-- Grant access to the view
GRANT SELECT ON public.all_spells TO authenticated;
GRANT SELECT ON public.all_spells TO anon;
