# Query Builder Utilities

Reusable utilities for building consistent API query patterns across the application.

## Overview

The query builder utilities extract common pagination, filtering, and sorting logic used across API routes. This eliminates code duplication and ensures consistent behavior.

## Installation

```typescript
import {
  buildPaginationParams,
  buildPaginationMeta,
  buildSearchQuery,
  buildSortQuery,
  buildRangeFilter,
  parseJsonFields,
} from "@/lib/api/query-builder";
```

## Core Functions

### Pagination

#### `buildPaginationParams(searchParams, defaultLimit?, maxLimit?)`

Extract pagination parameters from URL search params using page-based pagination.

```typescript
// GET /api/monsters?page=2&limit=50
const params = buildPaginationParams(request.nextUrl.searchParams);
// { limit: 50, offset: 50, page: 2 }
```

#### `buildPaginationParamsFromOffset(searchParams, defaultLimit?, maxLimit?)`

Extract pagination parameters from URL search params using offset-based pagination.

```typescript
// GET /api/monsters?offset=100&limit=25
const params = buildPaginationParamsFromOffset(request.nextUrl.searchParams);
// { limit: 25, offset: 100, page: 5 }
```

#### `buildPaginationMeta(params, total)`

Build pagination metadata for API responses.

```typescript
const meta = buildPaginationMeta(params, 127);
// {
//   page: 2,
//   limit: 50,
//   total: 127,
//   totalPages: 3,
//   hasMore: true
// }
```

### Search & Filter

#### `buildSearchQuery(query, searchTerm, fields, fuzziness?)`

Apply fuzzy search across multiple fields.

```typescript
let query = supabase.from("monsters").select("*");
query = buildSearchQuery(query, "dragon", ["name", "source"], "medium");
// Searches name and source fields with medium fuzziness (contains match)
```

Fuzziness levels:

- `"low"` - Prefix match (`dragon%`)
- `"medium"` - Contains match (`%dragon%`)
- `"high"` - Contains match (`%dragon%`)

#### `buildRangeFilter(query, field, min?, max?)`

Apply range filtering (min/max) to numeric fields.

```typescript
query = buildRangeFilter(query, "challenge_level", 1, 5);
// Filters challenge_level >= 1 AND challenge_level <= 5
```

#### `buildInFilter(query, field, values?)`

Apply IN filter for matching any value in an array.

```typescript
query = buildInFilter(query, "speed", ["fast", "slow"]);
// Filters speed IN ('fast', 'slow')
```

#### `buildArrayContainsFilter(query, field, values?)`

Apply JSONB array contains filter.

```typescript
query = buildArrayContainsFilter(query, "classes", ["wizard"]);
// Filters JSONB classes array containing 'wizard'
```

### Sorting

#### `buildSortQuery(query, sortField, sortOrder?)`

Apply sorting to query.

```typescript
query = buildSortQuery(query, "name", "asc");
// ORDER BY name ASC
```

### Data Parsing

#### `parseJsonFields(data, fields)`

Parse JSON string fields to objects.

```typescript
const monsters = parseJsonFields(data, ["attacks", "abilities", "tags"]);
// Converts JSON strings to parsed objects
```

## Complete Example

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildPaginationParams,
  buildPaginationMeta,
  buildSearchQuery,
  buildSortQuery,
  buildRangeFilter,
  parseJsonFields,
} from "@/lib/api/query-builder";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;

  // Extract pagination
  const pagination = buildPaginationParams(searchParams);

  // Build query
  let query = supabase.from("monsters").select("*", { count: "exact" });

  // Apply search
  const searchTerm = searchParams.get("q");
  if (searchTerm) {
    query = buildSearchQuery(query, searchTerm, ["name", "source"], "medium");
  }

  // Apply range filter
  const minCL = searchParams.get("min_cl");
  const maxCL = searchParams.get("max_cl");
  if (minCL || maxCL) {
    query = buildRangeFilter(
      query,
      "challenge_level",
      minCL ? parseInt(minCL) : undefined,
      maxCL ? parseInt(maxCL) : undefined,
    );
  }

  // Apply sorting
  query = buildSortQuery(query, "name", "asc");

  // Apply pagination
  query = query.range(
    pagination.offset,
    pagination.offset + pagination.limit - 1,
  );

  // Execute query
  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Parse JSON fields
  const parsedData = parseJsonFields(data || [], ["attacks", "abilities"]);

  // Build response with pagination metadata
  return NextResponse.json({
    data: parsedData,
    pagination: buildPaginationMeta(pagination, count || 0),
  });
}
```

## Benefits

1. **Consistency** - All API routes handle pagination, search, and sorting the same way
2. **Type Safety** - Full TypeScript support with proper types
3. **Tested** - Comprehensive unit test coverage (53 tests)
4. **Maintainable** - Single source of truth for query logic
5. **Flexible** - Composable functions for different use cases

## Testing

Run tests with:

```bash
npm test -- __tests__/lib/api/query-builder.test.ts
```

## Migration Guide

### Before

```typescript
const limit = Math.min(
  Math.max(parseInt(searchParams.get("limit") || "20"), 1),
  100,
);
const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
const offset = (page - 1) * limit;
```

### After

```typescript
const { limit, offset, page } = buildPaginationParams(searchParams);
```

### Before

```typescript
if (searchTerm) {
  query = query.or(`name.ilike.%${searchTerm}%,source.ilike.%${searchTerm}%`);
}
```

### After

```typescript
query = buildSearchQuery(query, searchTerm, ["name", "source"], "medium");
```
