-- Verification queries for Dungeon Exchange deployment

-- 1. Check all tables are created
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verify official monsters data
SELECT
    COUNT(*) as total_monsters,
    MIN(challenge_level) as min_cl,
    MAX(challenge_level) as max_cl,
    COUNT(DISTINCT source) as unique_sources
FROM official_monsters;

-- 3. Test search function
SELECT
    name,
    challenge_level,
    hit_points,
    armor_class
FROM search_monsters('goblin', 1, 5, NULL, NULL, NULL, 5, 0);

-- 4. Test random monster function
SELECT
    name,
    challenge_level,
    source
FROM get_random_monsters(3, 1, 10);

-- 5. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verify indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. Check tag types and locations
SELECT 'tag_types' as table_name, COUNT(*) as count FROM tag_types
UNION ALL
SELECT 'tag_locations' as table_name, COUNT(*) as count FROM tag_locations;

-- 8. Test database functions
SELECT public.update_search_statistics();
SELECT * FROM public.get_database_stats();

-- 9. Verify view creation
SELECT COUNT(*) as total_public_monsters FROM all_monsters;

-- 10. Sample monster data
SELECT
    name,
    challenge_level,
    xp,
    tags->'type' as monster_types,
    tags->'location' as locations
FROM official_monsters
ORDER BY challenge_level, name
LIMIT 10;