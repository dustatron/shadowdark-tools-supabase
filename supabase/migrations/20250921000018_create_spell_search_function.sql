-- Create RPC function for searching spells with filters
CREATE OR REPLACE FUNCTION public.search_spells(
    search_query TEXT DEFAULT NULL,
    min_tier INTEGER DEFAULT NULL,
    max_tier INTEGER DEFAULT NULL,
    spell_classes TEXT[] DEFAULT NULL,
    spell_durations TEXT[] DEFAULT NULL,
    spell_ranges TEXT[] DEFAULT NULL,
    spell_sources TEXT[] DEFAULT NULL,
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    classes JSONB,
    duration TEXT,
    range TEXT,
    tier INTEGER,
    source TEXT,
    author_notes TEXT,
    icon_url TEXT,
    art_url TEXT,
    spell_type TEXT,
    user_id UUID,
    creator_id UUID,
    is_public BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_val INTEGER;
    base_query TEXT;
    where_conditions TEXT[];
    where_clause TEXT;
    final_query TEXT;
BEGIN
    -- Calculate offset
    offset_val := (page_number - 1) * page_size;

    -- Initialize where conditions array
    where_conditions := ARRAY[]::TEXT[];

    -- Add search query condition
    IF search_query IS NOT NULL AND search_query != '' THEN
        where_conditions := array_append(
            where_conditions,
            format(
                'to_tsvector(''english'', COALESCE(s.name, '''') || '' '' || COALESCE(s.description, '''') || '' '' || COALESCE(s.source, '''') || '' '' || COALESCE(s.author_notes, '''')) @@ plainto_tsquery(''english'', %L)',
                search_query
            )
        );
    END IF;

    -- Add tier filters
    IF min_tier IS NOT NULL THEN
        where_conditions := array_append(
            where_conditions,
            format('s.tier >= %s', min_tier)
        );
    END IF;

    IF max_tier IS NOT NULL THEN
        where_conditions := array_append(
            where_conditions,
            format('s.tier <= %s', max_tier)
        );
    END IF;

    -- Add class filter
    IF spell_classes IS NOT NULL AND array_length(spell_classes, 1) > 0 THEN
        where_conditions := array_append(
            where_conditions,
            format(
                's.classes ?| ARRAY[%s]',
                (SELECT string_agg(quote_literal(c), ',') FROM unnest(spell_classes) c)
            )
        );
    END IF;

    -- Add duration filter
    IF spell_durations IS NOT NULL AND array_length(spell_durations, 1) > 0 THEN
        where_conditions := array_append(
            where_conditions,
            format(
                's.duration = ANY(ARRAY[%s])',
                (SELECT string_agg(quote_literal(d), ',') FROM unnest(spell_durations) d)
            )
        );
    END IF;

    -- Add range filter
    IF spell_ranges IS NOT NULL AND array_length(spell_ranges, 1) > 0 THEN
        where_conditions := array_append(
            where_conditions,
            format(
                's.range = ANY(ARRAY[%s])',
                (SELECT string_agg(quote_literal(r), ',') FROM unnest(spell_ranges) r)
            )
        );
    END IF;

    -- Add source filter
    IF spell_sources IS NOT NULL AND array_length(spell_sources, 1) > 0 THEN
        where_conditions := array_append(
            where_conditions,
            format(
                's.source = ANY(ARRAY[%s])',
                (SELECT string_agg(quote_literal(src), ',') FROM unnest(spell_sources) src)
            )
        );
    END IF;

    -- Build WHERE clause
    IF array_length(where_conditions, 1) > 0 THEN
        where_clause := 'WHERE ' || array_to_string(where_conditions, ' AND ');
    ELSE
        where_clause := '';
    END IF;

    -- Build and execute the final query
    final_query := format('
        SELECT
            s.*,
            COUNT(*) OVER() as total_count
        FROM public.all_spells s
        %s
        ORDER BY s.tier ASC, s.name ASC
        LIMIT %s OFFSET %s
    ', where_clause, page_size, offset_val);

    RETURN QUERY EXECUTE final_query;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_spells TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_spells TO anon;
