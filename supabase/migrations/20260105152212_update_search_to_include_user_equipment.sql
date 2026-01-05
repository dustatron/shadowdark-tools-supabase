-- Update search_all_content function to include user-created equipment
-- Previous version only searched official equipment, now includes all_equipment view

-- Drop existing function
DROP FUNCTION IF EXISTS public.search_all_content(text, text, boolean, boolean, boolean, boolean, integer);

-- Create updated function with user equipment support
CREATE OR REPLACE FUNCTION public.search_all_content(
    search_query TEXT,
    source_filter TEXT DEFAULT 'all',
    include_monsters BOOLEAN DEFAULT true,
    include_magic_items BOOLEAN DEFAULT true,
    include_equipment BOOLEAN DEFAULT true,
    include_spells BOOLEAN DEFAULT true,
    result_limit INTEGER DEFAULT 25
)
RETURNS TABLE (
    id TEXT,
    name TEXT,
    content_type TEXT,
    source TEXT,
    detail_url TEXT,
    relevance REAL,
    description TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH combined_results AS (
        -- Monsters
        SELECT
            m.id::TEXT as id,
            m.name as name,
            'monster'::TEXT as content_type,
            CASE WHEN m.monster_type = 'official' THEN 'official' ELSE 'user' END as source,
            '/monsters/' || m.id::TEXT as detail_url,
            similarity(m.name, search_query) as relevance,
            NULL::TEXT as description
        FROM public.all_monsters m
        WHERE
            include_monsters = true
            AND (similarity(m.name, search_query) > 0.3 OR m.name ILIKE '%' || search_query || '%')
            AND (
                source_filter = 'all'
                OR (source_filter = 'core' AND m.monster_type = 'official')
                OR (source_filter = 'user' AND m.monster_type = 'user')
            )

        UNION ALL

        -- Magic Items
        SELECT
            mi.slug::TEXT as id,
            mi.name as name,
            'magic_item'::TEXT as content_type,
            CASE WHEN mi.item_type = 'official' THEN 'official' ELSE 'user' END as source,
            '/magic-items/' || mi.slug as detail_url,
            similarity(mi.name, search_query) as relevance,
            LEFT(mi.description, 100) as description
        FROM public.all_magic_items mi
        WHERE
            include_magic_items = true
            AND (similarity(mi.name, search_query) > 0.3 OR mi.name ILIKE '%' || search_query || '%')
            AND (
                source_filter = 'all'
                OR (source_filter = 'core' AND mi.item_type = 'official')
                OR (source_filter = 'user' AND mi.item_type = 'custom')
            )

        UNION ALL

        -- Spells
        SELECT
            s.id::TEXT as id,
            s.name as name,
            'spell'::TEXT as content_type,
            CASE WHEN s.spell_type = 'official' THEN 'official' ELSE 'user' END as source,
            '/spells/' || s.slug as detail_url,
            similarity(s.name, search_query) as relevance,
            NULL::TEXT as description
        FROM public.all_spells s
        WHERE
            include_spells = true
            AND (similarity(s.name, search_query) > 0.3 OR s.name ILIKE '%' || search_query || '%')
            AND (
                source_filter = 'all'
                OR (source_filter = 'core' AND s.spell_type = 'official')
                OR (source_filter = 'user' AND s.spell_type = 'user')
            )

        UNION ALL

        -- Equipment (now includes user equipment via all_equipment view)
        SELECT
            e.id::TEXT as id,
            e.name as name,
            'equipment'::TEXT as content_type,
            CASE WHEN e.source_type = 'official' THEN 'official' ELSE 'user' END as source,
            '/equipment/' || e.id::TEXT as detail_url,
            similarity(e.name, search_query) as relevance,
            LEFT(e.description, 100) as description
        FROM public.all_equipment e
        WHERE
            include_equipment = true
            AND (similarity(e.name, search_query) > 0.3 OR e.name ILIKE '%' || search_query || '%')
            AND (
                source_filter = 'all'
                OR (source_filter = 'core' AND e.source_type = 'official')
                OR (source_filter = 'user' AND e.source_type = 'custom')
            )
    )
    SELECT
        cr.id,
        cr.name,
        cr.content_type,
        cr.source,
        cr.detail_url,
        cr.relevance,
        cr.description
    FROM combined_results cr
    ORDER BY cr.relevance DESC
    LIMIT result_limit;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_all_content TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_content TO anon;

-- Update comment
COMMENT ON FUNCTION public.search_all_content IS 'Unified fuzzy search across monsters, magic items, equipment (including user-created), and spells with filtering options';