-- Add slug column to get_adventure_list_items function return type

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

    -- Get monsters (no slug)
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

    -- Get spells (with slug)
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

    -- Get magic items (with slug)
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

    -- Get equipment (no slug)
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

    -- Get encounter tables (no slug)
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
