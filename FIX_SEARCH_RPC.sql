-- Fix for Search Error: PGRST202
-- The error occurs because the live database function signature doesn't match the code.
-- The code expects 'include_spells' parameter, but the database function is missing it.
-- Run this SQL in your Supabase SQL Editor to update the function.

-- 1. Drop the old function to avoid ambiguity (optional but recommended)
-- We use DROP FUNCTION IF EXISTS with the likely old signature to clean up.
-- Note: The argument types and order must match exactly what's in the DB for DROP to work.
-- If this DROP fails, you can ignore it and just run the CREATE OR REPLACE below.
DROP FUNCTION IF EXISTS public.search_all_content(text, text, boolean, boolean, boolean, integer);

-- 2. Create the updated function with include_spells
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
            AND similarity(m.name, search_query) > 0.3
            AND (
                source_filter = 'all'
                OR (source_filter = 'core' AND m.monster_type = 'official')
                OR (source_filter = 'user' AND m.monster_type = 'custom')
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
            AND similarity(mi.name, search_query) > 0.3
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
            '/spells/' || s.id::TEXT as detail_url,
            similarity(s.name, search_query) as relevance,
            NULL::TEXT as description
        FROM public.all_spells s
        WHERE
            include_spells = true
            AND similarity(s.name, search_query) > 0.3
            AND (
                source_filter = 'all'
                OR (source_filter = 'core' AND s.spell_type = 'official')
                OR (source_filter = 'user' AND s.spell_type = 'user')
            )

        UNION ALL

        -- Equipment (always official, no user content)
        SELECT
            e.id::TEXT as id,
            e.name as name,
            'equipment'::TEXT as content_type,
            'official'::TEXT as source,
            '/equipment/' || e.id::TEXT as detail_url,
            similarity(e.name, search_query) as relevance,
            NULL::TEXT as description
        FROM public.equipment e
        WHERE
            include_equipment = true
            AND similarity(e.name, search_query) > 0.3
            AND source_filter != 'user' -- Equipment has no user content
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

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.search_all_content TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_content TO anon;

-- 4. Add comment
COMMENT ON FUNCTION public.search_all_content IS 'Unified fuzzy search across monsters, magic items, equipment, and spells with filtering options';