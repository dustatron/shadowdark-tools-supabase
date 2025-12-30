# Research: Migrate DB Functions to TypeScript Services

## Overview

This research documents the analysis of existing PostgreSQL RPC functions and the approach to migrate them to TypeScript service functions.

## Current State Analysis

### Functions to Migrate (Priority 1 - Production Code)

#### 1. `search_monsters`

**Location**: `supabase/migrations/20251027000005_add_modifiers_properly.sql:169-278`
**Called from**:

- `app/api/search/monsters/route.ts:65,82`
- `app/api/encounters/generate/route.ts:57`

**Parameters**:

- `search_query TEXT` - fuzzy search term
- `min_challenge_level INTEGER` - filter min CL
- `max_challenge_level INTEGER` - filter max CL
- `monster_types TEXT[]` - type filter array
- `location_tags TEXT[]` - location filter array
- `source_filter TEXT` - source name filter
- `limit_count INTEGER` - pagination limit
- `offset_count INTEGER` - pagination offset

**Returns**: 27 columns including all monster fields + `relevance REAL`

**Key Logic**:

- Uses `to_tsvector` + `plainto_tsquery` for full-text search
- Uses `similarity()` (pg_trgm) for fuzzy matching with 0.3 threshold
- Relevance = `ts_rank_cd()` + `similarity()`
- Queries `all_monsters` view (UNION of official + public user monsters)
- JSONB array filtering for type/location tags

**Decision**: Migrate to TypeScript
**Rationale**:

- Complex filtering logic is easier to maintain in TS
- Can add unit tests without database
- Full IDE support for debugging
- Note: Will still use pg_trgm `similarity()` via raw SQL or fallback to ILIKE

---

#### 2. `search_all_content`

**Location**: `supabase/migrations/20251209045257_update_search_all_content_rpc.sql:11-125`
**Called from**: `app/api/search/route.ts:56`

**Parameters**:

- `search_query TEXT`
- `source_filter TEXT` - 'all', 'core', 'user'
- `include_monsters BOOLEAN`
- `include_magic_items BOOLEAN`
- `include_equipment BOOLEAN`
- `include_spells BOOLEAN`
- `result_limit INTEGER`

**Returns**: id, name, content_type, source, detail_url, relevance, description

**Key Logic**:

- UNION ALL across 4 views: all_monsters, all_magic_items, all_spells, equipment
- Uses `similarity()` + ILIKE for fuzzy matching
- Constructs detail_url from type + id/slug
- Orders by relevance DESC

**Decision**: Migrate to TypeScript
**Rationale**:

- Pattern already established in `getAdventureListItems()` - parallel queries per type
- Can optimize with conditional queries (skip types not requested)
- Easier to add new content types

---

#### 3. `create_audit_log`

**Location**: `supabase/migrations/20250921000008_create_flags_audit_logs.sql:123-159`
**Called from**:

- `app/api/admin/users/[id]/route.ts:154`
- `app/api/admin/flags/[id]/route.ts:110`

**Parameters**:

- `p_action_type TEXT`
- `p_target_id UUID`
- `p_target_type TEXT`
- `p_details JSONB`
- `p_notes TEXT`

**Key Logic**:

- Verifies user is admin via `auth.uid()` check
- Inserts into `audit_logs` table
- Returns created log UUID

**Decision**: Migrate to TypeScript
**Rationale**:

- Simple insert operation
- Admin check already done in API routes before calling
- Remove duplicate authorization check
- Better type safety for audit log entries

---

### Functions to Migrate (Priority 2 - Test/Admin)

#### 4. `get_random_monsters`

**Location**: `supabase/migrations/20251027000005_add_modifiers_properly.sql:281-340`
**Called from**: Tests only

**Decision**: Migrate to TypeScript
**Rationale**: Simple `ORDER BY random() LIMIT n` query

---

#### 5. `search_spells`

**Location**: `supabase/migrations/20250921000018_create_spell_search_function.sql`
**Called from**: Not currently used in production

**Decision**: Migrate to TypeScript (when spell search feature added)
**Rationale**: Similar pattern to search_monsters

---

### Functions to KEEP in Database (Triggers/Internal)

| Function                      | Reason to Keep                                 |
| ----------------------------- | ---------------------------------------------- |
| `handle_new_user`             | Auth trigger - must run on user creation event |
| `handle_updated_at`           | Timestamp trigger                              |
| `update_group_combined_stats` | Insert/update trigger                          |
| `update_deck_timestamp`       | Insert trigger                                 |
| `update_username_slug`        | Insert/update trigger                          |
| `check_deck_size_limit`       | Constraint validation trigger                  |
| `check_duplicate_flag`        | Constraint validation trigger                  |
| `resolve_flag_with_audit`     | Transaction with atomicity requirement         |
| `generate_username_slug`      | Utility used by triggers                       |
| `create_audit_log_partition`  | Admin partition management                     |

---

## Existing Pattern Reference

The project already has one TypeScript service: `lib/services/adventure-list-items.ts`

**Pattern Summary**:

1. Accept `SupabaseClient` as first param
2. Fetch base data
3. Group by type for batching
4. `Promise.all()` for parallel fetches
5. Merge and return enriched data

---

## Technical Decisions

### Fuzzy Search Approach

**Decision**: Use PostgreSQL `similarity()` via Supabase text search + ILIKE fallback

**Rationale**:

- pg_trgm extension is already enabled
- Supabase supports `.textSearch()` for full-text
- For fuzzy matching, use `.ilike()` or raw filter with `similarity > 0.3`

**Alternative Considered**: Client-side fuzzy (fuse.js)
**Rejected Because**: Would require fetching all data first, defeats pagination

---

### Relevance Scoring

**Decision**: Calculate in TypeScript after fetch

**Rationale**:

- Can use simple name matching score
- Order by relevance in application layer
- Simpler than replicating ts_rank_cd

**Implementation**:

```typescript
const relevance = query
  ? name.toLowerCase().includes(query.toLowerCase())
    ? 1
    : 0.5
  : 1;
```

For more accurate scoring, can add Levenshtein distance calculation.

---

### Service File Structure

```
lib/services/
├── adventure-list-items.ts  # Existing
├── monster-search.ts        # NEW: searchMonsters(), getRandomMonsters()
├── unified-search.ts        # NEW: searchAllContent()
├── audit.ts                 # NEW: createAuditLog()
└── spell-search.ts          # NEW: searchSpells() (future)
```

---

## Risks and Mitigations

| Risk                             | Mitigation                                                 |
| -------------------------------- | ---------------------------------------------------------- |
| Performance regression           | Benchmark before/after, use EXPLAIN ANALYZE                |
| Breaking API response structure  | Maintain exact field names, add integration tests          |
| Missing edge cases               | Extract test cases from existing DB function tests         |
| Fuzzy search quality degradation | Keep similarity threshold at 0.3, test with sample queries |

---

## Dependencies

- `pg_trgm` extension (already enabled)
- Views: `all_monsters`, `all_spells`, `all_magic_items`
- Tables: `equipment`, `audit_logs`
- Existing types in `lib/types/`

---

## Next Steps

1. Create `lib/services/audit.ts` (simplest, low risk)
2. Create `lib/services/monster-search.ts`
3. Create `lib/services/unified-search.ts`
4. Update API routes to use new services
5. Remove RPC calls from routes
6. Update/fix any failing tests
