# Data Model: Central Home Page Search

## Entities

### SearchResult (Virtual/API Response)

Unified search result returned by the API. Not persisted - assembled from existing tables.

| Field       | Type    | Description                                   |
| ----------- | ------- | --------------------------------------------- |
| id          | string  | UUID or slug depending on content type        |
| name        | string  | Display name of the item                      |
| type        | enum    | 'monster' \| 'magic_item' \| 'equipment'      |
| source      | enum    | 'official' \| 'user'                          |
| detailUrl   | string  | Full path to detail page                      |
| relevance   | number  | Fuzzy match score (0-1)                       |
| description | string? | Brief description (optional, for magic items) |

### SearchFilters (Request Parameters)

| Field             | Type    | Default  | Description                    |
| ----------------- | ------- | -------- | ------------------------------ |
| q                 | string  | required | Search query (min 3 chars)     |
| source            | enum    | 'all'    | 'all' \| 'core' \| 'user'      |
| includeMonsters   | boolean | true     | Include monsters in results    |
| includeMagicItems | boolean | true     | Include magic items in results |
| includeEquipment  | boolean | true     | Include equipment in results   |
| limit             | number  | 25       | Results per page (25, 50, 100) |

### SearchResponse (API Response)

| Field   | Type           | Description             |
| ------- | -------------- | ----------------------- |
| results | SearchResult[] | Array of matched items  |
| total   | number         | Total matching results  |
| query   | string         | Echo of search query    |
| filters | object         | Echo of applied filters |

## Existing Entities (Referenced)

### Monster (from all_monsters view)

- `id`: UUID
- `name`: TEXT
- `monster_type`: 'official' | 'custom'

### MagicItem (from all_magic_items view)

- `id`: UUID
- `name`: TEXT
- `slug`: TEXT
- `description`: TEXT
- `item_type`: 'official' | 'custom'

### Equipment (from equipment table)

- `id`: UUID
- `name`: TEXT
- `item_type`: TEXT (category)

## Database Function

### search_all_content()

New PostgreSQL function to perform unified search.

**Parameters**:

- `search_query TEXT` - Fuzzy search term
- `source_filter TEXT DEFAULT 'all'` - 'all', 'core', 'user'
- `include_monsters BOOLEAN DEFAULT true`
- `include_magic_items BOOLEAN DEFAULT true`
- `include_equipment BOOLEAN DEFAULT true`
- `result_limit INTEGER DEFAULT 25`

**Returns**: Table with unified result schema

**Implementation Strategy**:

```sql
-- Pseudocode
SELECT name, 'monster' as type, id as identifier, ...
FROM all_monsters WHERE similarity(name, query) > 0.3
UNION ALL
SELECT name, 'magic_item' as type, slug as identifier, ...
FROM all_magic_items WHERE similarity(name, query) > 0.3
UNION ALL
SELECT name, 'equipment' as type, id as identifier, ...
FROM equipment WHERE similarity(name, query) > 0.3
ORDER BY relevance DESC
LIMIT result_limit
```

## Validation Rules

### SearchFilters Validation (Zod)

```typescript
const SearchFiltersSchema = z.object({
  q: z.string().min(3, "Search requires at least 3 characters"),
  source: z.enum(["all", "core", "user"]).default("all"),
  includeMonsters: z.boolean().default(true),
  includeMagicItems: z.boolean().default(true),
  includeEquipment: z.boolean().default(true),
  limit: z.enum(["25", "50", "100"]).default("25").transform(Number),
});
```

### Business Rules

1. At least one content type must be included
2. Query must be at least 3 characters
3. Limit must be 25, 50, or 100
