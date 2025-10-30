# Implementation Plan: Favorites Filter for Encounter Tables

**Feature**: Add "User Monster Favorites" as monster source filter option
**Created**: 2025-10-30
**Estimate**: 1-1.5 hours

---

## Overview

Add "favorites" as a new source option in encounter table filters, allowing users to generate encounter tables exclusively from their favorited monsters.

**Current sources**: `official`, `user`, `public`
**New source**: `favorites`

---

## User Flow

1. User navigates to `/encounter-tables/new`
2. Expands "Monster Filters" accordion
3. Sees new checkbox: **"My Favorites"**
4. Selects favorites (with or without other sources)
5. Generates preview
6. Only favorited monsters appear in results

---

## Technical Requirements

### 1. Schema Updates

**File**: `lib/encounter-tables/schemas.ts`

Update source enum to include "favorites":

```typescript
sources: z
  .array(z.enum(["official", "user", "public", "favorites"]))
  .min(1, "At least one monster source required"),
```

### 2. Type Updates

**File**: `lib/encounter-tables/types.ts`

```typescript
export type MonsterSource = "official" | "user" | "public" | "favorites";
```

### 3. Query Logic Updates

**File**: `lib/encounter-tables/queries.ts`

Update `buildMonsterFilterQuery` function:

```typescript
// Add favorites handling in source filter section (lines 100-125)
if (filters.sources && filters.sources.length > 0) {
  const hasOfficial = filters.sources.includes("official");
  const hasUser = filters.sources.includes("user");
  const hasPublic = filters.sources.includes("public");
  const hasFavorites = filters.sources.includes("favorites");

  // If favorites selected, need to join with favorites table
  // This requires a different approach - see solution below
}
```

**Challenge**: The `all_monsters` view doesn't include favorites relationship. Need to filter after query or create new query path.

**Solution**: Modify `filterMonsters` utility to handle favorites separately:

```typescript
// In lib/encounter-tables/utils/filter-monsters.ts
export async function filterMonsters(
  filters: EncounterTableFilters,
  limit: number,
  excludeIds?: string[],
): Promise<MonsterData[]> {
  const supabase = await createClient();

  // Check if favorites is the ONLY source
  const onlyFavorites =
    filters.sources.includes("favorites") && filters.sources.length === 1;

  if (onlyFavorites) {
    // Query favorites table first, then get those monsters
    const { data: favs, error: favError } = await supabase
      .from("favorites")
      .select("item_id")
      .eq("item_type", "monster");

    if (favError) throw favError;

    const favoriteIds = favs?.map((f) => f.item_id) || [];

    if (favoriteIds.length === 0) {
      throw new Error("No favorite monsters found");
    }

    // Query monsters with favorite IDs filter
    let query = supabase.from("all_monsters").select("*").in("id", favoriteIds);

    // Apply other filters (level, movement, search)
    query = buildMonsterFilterQuery(query, filters, excludeIds);

    const { data, error } = await query.limit(limit * 2);
    // ... continue with existing logic
  } else if (filters.sources.includes("favorites")) {
    // Mixed sources including favorites
    // Fetch favorites IDs, then include in OR logic
    // This is more complex - may need separate queries and merge
  } else {
    // No favorites - existing logic works fine
    // ... existing code
  }
}
```

### 4. UI Updates

**File**: `app/encounter-tables/new/EncounterForm.tsx`

Add "My Favorites" checkbox to monster sources:

```typescript
const MONSTER_SOURCES = [
  { value: "official", label: "Official Monsters" },
  { value: "user", label: "My Custom Monsters" },
  { value: "public", label: "Community Monsters" },
  { value: "favorites", label: "My Favorites" }, // NEW
];
```

**File**: `components/encounter-tables/EncounterTableForm.tsx`

Same update for the existing form component if used elsewhere.

### 5. Validation & Edge Cases

**Handle empty favorites**:

- If user selects only "favorites" but has 0 favorites → show helpful error
- Error message: "No favorite monsters found. Add monsters to favorites first."

**Handle insufficient favorites**:

- If user wants d20 table but only has 5 favorites → show error
- Error message: "Only 5 favorite monsters available. Need 20 for d20 table."

**Mixed sources**:

- If favorites + official selected → union both sets
- Ensure no duplicates if monster is both official and favorited

---

## Implementation Steps

### Step 1: Update Schemas & Types (5 min)

1. Update `lib/encounter-tables/schemas.ts` - add "favorites" to enum
2. Update `lib/encounter-tables/types.ts` - add to MonsterSource type

### Step 2: Update Filter Logic (30 min)

1. Read `lib/encounter-tables/utils/filter-monsters.ts`
2. Add favorites query logic:
   - Detect if "favorites" in sources
   - Query `favorites` table for user's monster favorites
   - Filter `all_monsters` by favorite IDs
   - Apply other filters (level, movement, search)
3. Handle mixed sources (favorites + others)
4. Add error handling for empty favorites

### Step 3: Update UI (15 min)

1. Update `MONSTER_SOURCES` constant in EncounterForm
2. Add "My Favorites" checkbox to form
3. Existing checkbox logic handles it automatically

### Step 4: Error Messages (10 min)

1. Add specific error messages for:
   - No favorites found
   - Insufficient favorites for die size
2. Update error handling in preview generation

### Step 5: Testing (20 min)

**Manual Tests**:

1. User with 0 favorites selects "favorites" only → error shown
2. User with 5 favorites tries d20 table → error shown
3. User with 20+ favorites generates d20 table → success
4. User selects "favorites" + "official" → both included
5. Favorites respect level range filters
6. Favorites respect search query filters

---

## Files to Modify

1. `lib/encounter-tables/schemas.ts` - Add "favorites" to enum
2. `lib/encounter-tables/types.ts` - Update MonsterSource type
3. `lib/encounter-tables/utils/filter-monsters.ts` - Add favorites query logic
4. `app/encounter-tables/new/EncounterForm.tsx` - Add checkbox to UI
5. `components/encounter-tables/EncounterTableForm.tsx` - Add checkbox (if used)

---

## Database Considerations

**Existing table**: `favorites`

- `user_id` - User who favorited
- `item_type` - Always "monster" for this use case
- `item_id` - Monster UUID
- RLS enabled (users see only their own)

**Query pattern**:

```sql
-- Get user's favorite monster IDs
SELECT item_id FROM favorites
WHERE user_id = auth.uid()
AND item_type = 'monster';

-- Then use those IDs in monsters query
SELECT * FROM all_monsters
WHERE id IN (...)
AND challenge_level BETWEEN 1 AND 20;
```

**Performance**: Indexed on `user_id` and `item_type`, should be fast.

---

## Edge Cases & Solutions

| Edge Case                         | Solution                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------ |
| User has 0 favorites              | Show error: "No favorite monsters found"                                       |
| Not enough favorites for die size | Show error with count: "Only 5 favorites, need 20"                             |
| Favorites + other sources         | Query separately, merge results, dedupe                                        |
| Favorite is deleted monster       | Favorites table has no FK constraint - monster might not exist in all_monsters |
| User not authenticated            | Favorites require auth - query will return empty (RLS)                         |

---

## Testing Checklist

- [ ] Schema updates compile without errors
- [ ] Favorites checkbox renders in UI
- [ ] Selecting only "favorites" queries favorites table
- [ ] Empty favorites shows helpful error
- [ ] Insufficient favorites shows count error
- [ ] Favorites + official works (union)
- [ ] Level filters apply to favorites
- [ ] Search query applies to favorites
- [ ] Preview generation succeeds with favorites
- [ ] Save table succeeds with favorites
- [ ] Toast errors show for edge cases

---

## Future Enhancements (Out of Scope)

1. **Favorites count badge** - Show count next to "My Favorites" checkbox
2. **Mixed source priority** - Allow weighting (e.g., 70% favorites, 30% official)
3. **Favorite tags** - Filter favorites by custom tags
4. **Favorite lists** - Multiple favorite lists (e.g., "Undead", "Dragons")

---

## Unresolved Questions

1. **Mixed sources behavior**: Should favorites be prioritized, or equal weight?
   - **Proposed**: Equal random selection from union of sources

2. **Duplicate handling**: If a monster is both official and favorited, include once or twice?
   - **Proposed**: Include once (deduplicate by ID)

3. **Empty state UX**: Should we show a link to favorites page when 0 found?
   - **Proposed**: Yes, add link in error message

4. **Performance**: Should we cache favorite IDs for session?
   - **Proposed**: Not yet - optimize if slow

5. **All_monsters view**: Does it include user_id for filtering?
   - **Need to check**: View schema to see available fields

---

**Time Breakdown**

- Schema/types: 5 min
- Query logic: 30 min
- UI updates: 15 min
- Error handling: 10 min
- Testing: 20 min

**Total: 1-1.5 hours**
