-- Migration: Fix equipment search to include public user equipment
-- Date: 2026-01-06
-- Description: Creates all_equipment view and updates adventure list constraints

-- 1. Create all_equipment view
DROP VIEW IF EXISTS public.all_equipment;

CREATE VIEW public.all_equipment AS
SELECT
    id,
    name,
    NULL::TEXT as slug,
    NULL::TEXT as description,
    item_type,
    cost,
    attack_type,
    range,
    damage,
    armor,
    properties,
    slot,
    quantity,
    'official' as source_type,
    NULL::UUID as user_id,
    NULL::TEXT as creator_name,
    true as is_public,
    created_at,
    updated_at,
    NULL::TEXT as uuid
FROM public.equipment

UNION ALL

SELECT
    ue.id,
    ue.name,
    ue.slug,
    ue.description,
    ue.item_type,
    ue.cost,
    ue.attack_type,
    ue.range,
    ue.damage,
    ue.armor,
    ue.properties,
    ue.slot,
    ue.quantity,
    'custom' as source_type,
    ue.user_id,
    up.display_name as creator_name,
    ue.is_public,
    ue.created_at,
    ue.updated_at,
    NULL::TEXT as uuid
FROM public.user_equipment ue
JOIN public.user_profiles up ON ue.user_id = up.id
WHERE ue.is_public = true;

-- Grant access
GRANT SELECT ON public.all_equipment TO authenticated;
GRANT SELECT ON public.all_equipment TO anon;

-- 2. Update adventure_list_items constraint
ALTER TABLE public.adventure_list_items
DROP CONSTRAINT IF EXISTS adventure_list_items_item_type_check;

ALTER TABLE public.adventure_list_items
ADD CONSTRAINT adventure_list_items_item_type_check
CHECK (item_type IN ('monster', 'spell', 'magic_item', 'equipment', 'user_equipment', 'encounter_table'));

-- 3. Update get_adventure_list_items function
DROP FUNCTION IF EXISTS public.get_adventure_list_items(UUID);

CREATE OR REPLACE FUNCTION public.get_adventure_list_items(list_uuid UUID)
RETURNS TABLE (
    id UUID,
    list_id UUID,
    item_type TEXT,
    item_id UUID,
    quantity INTEGER,
    notes TEXT,
    name TEXT,
    description TEXT,
    slug TEXT,
    details JSONB
) AS $$
BEGIN
    RETURN QUERY

    -- Get monsters
    SELECT
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        COALESCE(om.name, um.name) AS name,
        '' AS description,
        NULL::TEXT AS slug,
        jsonb_build_object(
            'challenge_level', COALESCE(om.challenge_level, um.challenge_level),
            'hit_points', COALESCE(om.hit_points, um.hit_points),
            'armor_class', COALESCE(om.armor_class, um.armor_class),
            'source', COALESCE(om.source, um.source)
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.official_monsters om ON ali.item_id = om.id AND ali.item_type = 'monster'
    LEFT JOIN public.user_monsters um ON ali.item_id = um.id AND ali.item_type = 'monster'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'monster'

    UNION ALL

    -- Get spells
    SELECT
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        COALESCE(os.name, us.name) AS name,
        COALESCE(os.description, us.description) AS description,
        COALESCE(os.slug, us.slug) AS slug,
        jsonb_build_object(
            'tier', COALESCE(os.tier, us.tier),
            'classes', COALESCE(os.classes, us.classes),
            'duration', COALESCE(os.duration, us.duration),
            'range', COALESCE(os.range, us.range),
            'source', COALESCE(os.source, us.source)
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.official_spells os ON ali.item_id = os.id AND ali.item_type = 'spell'
    LEFT JOIN public.user_spells us ON ali.item_id = us.id AND ali.item_type = 'spell'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'spell'

    UNION ALL

    -- Get magic items
    SELECT
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        COALESCE(omi.name, umi.name) AS name,
        COALESCE(omi.description, umi.description) AS description,
        COALESCE(omi.slug, umi.slug) AS slug,
        jsonb_build_object(
            'traits', COALESCE(omi.traits, umi.traits)
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.official_magic_items omi ON ali.item_id = omi.id AND ali.item_type = 'magic_item'
    LEFT JOIN public.user_magic_items umi ON ali.item_id = umi.id AND ali.item_type = 'magic_item'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'magic_item'

    UNION ALL

    -- Get equipment
    SELECT
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        e.name AS name,
        '' AS description,
        NULL::TEXT AS slug,
        jsonb_build_object(
            'item_type', e.item_type,
            'cost', e.cost,
            'attack_type', e.attack_type,
            'range', e.range,
            'damage', e.damage,
            'armor', e.armor,
            'properties', e.properties,
            'slot', e.slot,
            'quantity', e.quantity
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.equipment e ON ali.item_id = e.id AND ali.item_type = 'equipment'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'equipment'

    UNION ALL

    -- Get user equipment
    SELECT
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        ue.name AS name,
        COALESCE(ue.description, '') AS description,
        ue.slug AS slug,
        jsonb_build_object(
            'item_type', ue.item_type,
            'cost', ue.cost,
            'attack_type', ue.attack_type,
            'range', ue.range,
            'damage', ue.damage,
            'armor', ue.armor,
            'properties', ue.properties,
            'slot', ue.slot,
            'quantity', ue.quantity,
            'user_id', ue.user_id,
            'is_public', ue.is_public
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.user_equipment ue ON ali.item_id = ue.id AND ali.item_type = 'user_equipment'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'user_equipment'

    UNION ALL

    -- Get encounter tables
    SELECT
        ali.id,
        ali.list_id,
        ali.item_type,
        ali.item_id,
        ali.quantity,
        ali.notes,
        et.name AS name,
        et.description AS description,
        NULL::TEXT AS slug,
        jsonb_build_object(
            'die_size', et.die_size,
            'is_public', et.is_public,
            'filters', et.filters,
            'public_slug', et.public_slug
        ) AS details
    FROM public.adventure_list_items ali
    LEFT JOIN public.encounter_tables et ON ali.item_id = et.id AND ali.item_type = 'encounter_table'
    WHERE ali.list_id = list_uuid AND ali.item_type = 'encounter_table';

END;
$$ LANGUAGE plpgsql;

COMMENT ON VIEW public.all_equipment IS 'Combined view of official and public user equipment';
COMMENT ON FUNCTION public.get_adventure_list_items(UUID) IS 'Retrieves all items in an adventure list including user equipment';