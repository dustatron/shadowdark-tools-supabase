-- Performance optimization indexes for the Shadowdark Monster Manager

-- Additional indexes for official_monsters (beyond those in creation script)
CREATE INDEX IF NOT EXISTS idx_official_monsters_xp ON public.official_monsters(xp);
CREATE INDEX IF NOT EXISTS idx_official_monsters_name_text ON public.official_monsters USING GIN (name gin_trgm_ops);

-- Additional indexes for user_monsters (beyond those in creation script)
CREATE INDEX IF NOT EXISTS idx_user_monsters_xp ON public.user_monsters(xp);
CREATE INDEX IF NOT EXISTS idx_user_monsters_name_text ON public.user_monsters USING GIN (name gin_trgm_ops);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_official_monsters_cl_source ON public.official_monsters(challenge_level, source);
CREATE INDEX IF NOT EXISTS idx_user_monsters_cl_public ON public.user_monsters(challenge_level, is_public);
CREATE INDEX IF NOT EXISTS idx_user_monsters_user_cl ON public.user_monsters(user_id, challenge_level);

-- Indexes for user_groups
CREATE INDEX IF NOT EXISTS idx_user_groups_combined_stats ON public.user_groups USING GIN (combined_stats);

-- Indexes for user_lists
CREATE INDEX IF NOT EXISTS idx_user_lists_xp_budget ON public.user_lists(xp_budget) WHERE xp_budget IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_lists_cl_range ON public.user_lists(challenge_level_min, challenge_level_max)
    WHERE challenge_level_min IS NOT NULL AND challenge_level_max IS NOT NULL;

-- Indexes for encounter_tables (created in later migration)

-- Indexes for flags
CREATE INDEX IF NOT EXISTS idx_flags_item_status ON public.flags(flagged_item_type, flagged_item_id, status);
CREATE INDEX IF NOT EXISTS idx_flags_pending ON public.flags(status, created_at) WHERE status = 'pending';

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON public.audit_logs(action_type, timestamp);

-- Function to update search statistics (for query optimization)
CREATE OR REPLACE FUNCTION public.update_search_statistics()
RETURNS void AS $$
BEGIN
    -- Update table statistics to help the query planner
    ANALYZE public.official_monsters;
    ANALYZE public.user_monsters;
    ANALYZE public.user_groups;
    ANALYZE public.user_lists;
    ANALYZE public.list_items;
    -- encounter_tables created in later migration
    ANALYZE public.user_favorites;
    ANALYZE public.flags;
    ANALYZE public.audit_logs;
    ANALYZE public.tag_types;
    ANALYZE public.tag_locations;
    ANALYZE public.user_profiles;
END;
$$ LANGUAGE plpgsql;

-- Function to get database statistics
CREATE OR REPLACE FUNCTION public.get_database_stats()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        schemaname||'.'||tablename as table_name,
        n_tup_ins - n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to refresh materialized view (if we add any later)
CREATE OR REPLACE FUNCTION public.refresh_search_cache()
RETURNS void AS $$
BEGIN
    -- Placeholder for future materialized view refreshes
    -- For now, just update statistics
    PERFORM public.update_search_statistics();
END;
$$ LANGUAGE plpgsql;

-- Partitioning setup for audit_logs (for future scalability)
-- This creates monthly partitions for audit logs to improve performance as data grows
CREATE OR REPLACE FUNCTION public.create_audit_log_partition(partition_date DATE)
RETURNS void AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    -- Calculate partition boundaries (monthly)
    start_date := date_trunc('month', partition_date);
    end_date := start_date + interval '1 month';
    partition_name := 'audit_logs_' || to_char(start_date, 'YYYY_MM');

    -- Create partition if it doesn't exist
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS %I PARTITION OF public.audit_logs
        FOR VALUES FROM (%L) TO (%L)',
        partition_name, start_date, end_date
    );

    -- Create index on the partition
    EXECUTE format('
        CREATE INDEX IF NOT EXISTS idx_%I_timestamp
        ON %I (timestamp)',
        partition_name, partition_name
    );
END;
$$ LANGUAGE plpgsql;

-- Enable partitioning on audit_logs if it gets large
-- (Commented out for now, can be enabled later if needed)
-- ALTER TABLE public.audit_logs PARTITION BY RANGE (timestamp);