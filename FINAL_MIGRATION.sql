Here is the final, correct SQL script. Please copy the entire content of this file and run it in your remote Supabase database's SQL Editor.

```sql
-- Migration: Create search_all_content() function for unified search
-- Feature: 014-turn-the-home (Central Home Page Search)
-- Date: 2025-12-08

-- Ensure pg_trgm extension is enabled
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Add trigram index on equipment.name if not exists
CREATE INDEX IF NOT EXISTS idx_equipment_name_trgm
ON public.equipment USING GIN (name gin_trgm_ops);

-- Add trigram index on official_spells.name if not exists
CREATE INDEX IF NOT EXISTS idx_official_spells_name_trgm
ON public.official_spells USING GIN (name gin_trgm_ops);

-- Add trigram index on user_spells.name if not exists
CREATE INDEX IF NOT EXISTS idx_user_spells_name_trgm
ON public.user_spells USING GIN (name gin_trgm_ops);

-- Create unified search function
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

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.search_all_content TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_content TO anon;

-- Comments
COMMENT ON FUNCTION public.search_all_content IS 'Unified fuzzy search across monsters, magic items, and equipment with filtering options';
```

After you have successfully applied this SQL, please try searching for 'alarm' again.
