# Research: Central Home Page Search

## Database Analysis

### Existing Tables & Views

| Entity      | Official Table         | User Table          | Combined View     | Has Fuzzy Search         |
| ----------- | ---------------------- | ------------------- | ----------------- | ------------------------ |
| Monsters    | `official_monsters`    | `user_monsters`     | `all_monsters`    | Yes (pg_trgm + tsvector) |
| Magic Items | `official_magic_items` | `user_magic_items`  | `all_magic_items` | Yes (pg_trgm)            |
| Equipment   | `equipment`            | N/A (no user items) | N/A               | Yes (tsvector on name)   |
| Spells      | `official_spells`      | `user_spells`       | `all_spells`      | Yes (tsvector)           |

### Key Schema Details

**Monsters (`all_monsters` view)**:

- `id`: UUID
- `name`: TEXT
- `monster_type`: 'official' | 'custom'
- `is_public`: BOOLEAN
- Detail route: `/monsters/[id]`

**Magic Items (`all_magic_items` view)**:

- `id`: UUID
- `name`: TEXT
- `slug`: TEXT (URL-safe)
- `item_type`: 'official' | 'custom'
- `is_public`: BOOLEAN
- Detail route: `/magic-items/[slug]`

**Equipment (`equipment` table)**:

- `id`: UUID
- `name`: TEXT
- `item_type`: TEXT (category like "Weapon", "Armor")
- No user-generated content (Core only)
- Detail route: `/equipment/[id]`

### Existing Search Functions

1. **`search_monsters()`** - Full fuzzy search with filters
   - Uses `similarity()` + `ts_rank_cd()` for relevance
   - Threshold: `similarity(name, query) > 0.3`
   - Supports pagination via `limit_count`, `offset_count`

2. **`search_spells()`** - Full-text search with filters
   - Uses `plainto_tsquery` for text matching
   - Supports pagination via `page_number`, `page_size`

3. **Magic Items** - No dedicated search function yet
   - Has trigram index: `idx_magic_items_name_trgm`

4. **Equipment** - Basic full-text search
   - Has index: `idx_equipment_name`

## Technical Decisions

### Decision 1: Unified Search API

**Decision**: Create single `/api/search` endpoint that queries all content types

**Rationale**:

- Simpler client implementation (one fetch instead of three)
- Can optimize with parallel queries in single request
- Easier to add new content types later

**Alternatives Rejected**:

- Separate API calls per type: More network requests, harder to mix/sort results

### Decision 2: Database-level Unified Search Function

**Decision**: Create `search_all_content()` PostgreSQL function

**Rationale**:

- Leverage existing pg_trgm indexes
- Single DB round-trip for all content types
- Can use UNION ALL for efficient combining
- Consistent relevance scoring across types

**Alternatives Rejected**:

- Client-side combining: Extra data transfer, inconsistent relevance
- Multiple API endpoints: More complexity, harder pagination

### Decision 3: Result Structure

**Decision**: Return unified results with type discriminator

```typescript
type SearchResult = {
  id: string;
  name: string;
  type: "monster" | "magic_item" | "equipment";
  source: "official" | "user";
  detailUrl: string;
  relevance: number;
};
```

**Rationale**: Single type makes frontend rendering simple with switch/case

### Decision 4: Filter Implementation

**Decision**: Server-side filtering via query parameters

**Rationale**:

- Database can use indexes for filtering
- Reduces data transfer
- Consistent with existing patterns (monsters page)

### Decision 5: Form Submit vs Live Search

**Decision**: Form submit with Enter key (per user request)

**Rationale**:

- User explicitly requested submit button
- Reduces API calls vs debounced live search
- Standard form semantics

## Detail Page Routes Confirmed

| Content Type | Route Pattern         | Identifier  |
| ------------ | --------------------- | ----------- |
| Monsters     | `/monsters/[id]`      | UUID        |
| Magic Items  | `/magic-items/[slug]` | slug string |
| Equipment    | `/equipment/[id]`     | UUID        |

## Source Filter Mapping

| Filter Value | Query Condition                                        |
| ------------ | ------------------------------------------------------ |
| "all"        | No filter applied                                      |
| "core"       | `monster_type = 'official'` / `item_type = 'official'` |
| "user"       | `monster_type = 'custom'` / `item_type = 'custom'`     |

Note: Equipment has no user-generated content, so "user" filter will exclude all equipment.

## Performance Considerations

1. **Existing indexes can be reused**:
   - `idx_official_monsters_name` (GIN trigram)
   - `idx_magic_items_name_trgm` (GIN trigram)
   - `idx_equipment_name` (GIN tsvector)

2. **Pagination**: Use LIMIT/OFFSET with configurable limits (25, 50, 100)

3. **Relevance scoring**: Use existing `similarity()` function pattern

## Questions Resolved

All technical unknowns have been resolved through codebase analysis.
