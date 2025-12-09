# Quickstart: Central Home Page Search

## Feature Verification Steps

### Prerequisites

- Local Supabase running (`supabase start`)
- Dev server running (`npm run dev`)
- Browser open to `http://localhost:3000`

### Test Scenario 1: Basic Search

1. Navigate to home page (`/`)
2. Verify search form is visible with:
   - Text input field
   - Submit button
   - Source filter (All/Core/User Generated)
   - Content type checkboxes (Monsters, Magic Items, Equipment)
   - Result limit selector (25/50/100)
3. Type "sword" in search box
4. Click submit or press Enter
5. **Expected**: Mixed results appear with sword-related monsters, magic items, and equipment

### Test Scenario 2: Fuzzy Matching

1. Type "gobln" (misspelled)
2. Submit search
3. **Expected**: "Goblin" appears in results despite typo

### Test Scenario 3: Source Filter - Core Only

1. Select "Core" source filter
2. Search for "ring"
3. **Expected**: Only official content appears (no user-generated items)

### Test Scenario 4: Source Filter - User Generated

1. Select "User Generated" source filter
2. Search for any term
3. **Expected**: Only user-created content appears (equipment excluded entirely)

### Test Scenario 5: Content Type Filter

1. Uncheck "Monsters" checkbox
2. Search for "sword"
3. **Expected**: No monsters in results, only magic items and equipment

### Test Scenario 6: Multiple Content Type Filters

1. Uncheck "Monsters" and "Equipment"
2. Search for any term
3. **Expected**: Only magic items in results

### Test Scenario 7: Result Limit

1. Search with default limit (25)
2. Change limit to 50
3. Re-submit same search
4. **Expected**: Up to 50 results now displayed

### Test Scenario 8: Navigation to Detail Pages

1. Search for "goblin"
2. Click on a monster result
3. **Expected**: Navigated to `/monsters/[uuid]` detail page

4. Return to home, search for any magic item
5. Click on a magic item result
6. **Expected**: Navigated to `/magic-items/[slug]` detail page

7. Return to home, search for "longsword"
8. Click on an equipment result
9. **Expected**: Navigated to `/equipment/[uuid]` detail page

### Test Scenario 9: Minimum Character Validation

1. Type "ab" (2 characters)
2. Try to submit
3. **Expected**: Error message "Search requires at least 3 characters"

### Test Scenario 10: Empty Results

1. Search for "xyznonexistent123"
2. **Expected**: Empty state message "No results found. Try a different search term."

### Test Scenario 11: All Filters Disabled

1. Uncheck all content type checkboxes
2. Try to submit
3. **Expected**: Validation error or submit disabled

## API Verification

### Direct API Test

```bash
# Basic search
curl "http://localhost:3000/api/search?q=sword"

# With filters
curl "http://localhost:3000/api/search?q=ring&source=core&includeMonsters=false&limit=50"
```

### Expected Response Structure

```json
{
  "results": [
    {
      "id": "abc-123",
      "name": "Sword of Flame",
      "type": "magic_item",
      "source": "official",
      "detailUrl": "/magic-items/sword-of-flame",
      "relevance": 0.85
    }
  ],
  "total": 15,
  "query": "sword",
  "filters": {
    "source": "all",
    "includeMonsters": true,
    "includeMagicItems": true,
    "includeEquipment": true,
    "limit": 25
  }
}
```

## Success Criteria

- [ ] Search form displays on home page
- [ ] Form submits on button click and Enter key
- [ ] Fuzzy matching works (typos tolerated)
- [ ] Source filter restricts results correctly
- [ ] Content type checkboxes exclude types
- [ ] Result limit changes work
- [ ] Clicking results navigates to correct detail pages
- [ ] Minimum 3 character validation works
- [ ] Empty state displays appropriately
- [ ] Results show type indicator (monster/magic item/equipment)
