-- Migration: Create all_magic_items view
-- Feature: 012-for-magic-items
-- Date: 2025-12-05

-- Create all_magic_items view combining official and public user magic items
CREATE OR REPLACE VIEW public.all_magic_items AS
SELECT
    id,
    name,
    slug,
    description,
    traits,
    'official' as item_type,
    NULL::UUID as user_id,
    NULL::TEXT as creator_name,
    true as is_public,
    created_at,
    updated_at
FROM public.official_magic_items

UNION ALL

SELECT
    umi.id,
    umi.name,
    umi.slug,
    umi.description,
    umi.traits,
    'custom' as item_type,
    umi.user_id,
    up.display_name as creator_name,
    umi.is_public,
    umi.created_at,
    umi.updated_at
FROM public.user_magic_items umi
JOIN public.user_profiles up ON umi.user_id = up.id
WHERE umi.is_public = true;

-- Grant access to authenticated and anonymous users
GRANT SELECT ON public.all_magic_items TO authenticated;
GRANT SELECT ON public.all_magic_items TO anon;

-- Comments
COMMENT ON VIEW public.all_magic_items IS 'Combined view of official and public user magic items with source attribution';
