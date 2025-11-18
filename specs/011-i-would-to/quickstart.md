# Quickstart: Magic Items Feature

**Feature**: Magic Items (Read-Only Starter)
**Date**: 2025-11-17
**Purpose**: E2E validation scenario for magic items browsing, search, and detail viewing

## Prerequisites

- Node.js 18+ installed
- Supabase running locally (`supabase start`)
- Database migrated with magic items table and seed data
- Development server running (`npm run dev` on port 3000)

## Success Criteria

This quickstart validates that:

1. ✅ Database contains seeded magic items
2. ✅ API endpoints return proper responses
3. ✅ UI pages render magic items correctly
4. ✅ Search functionality filters items
5. ✅ Detail pages show complete item information
6. ✅ Favorites integration works (future)

## Setup Steps

### 1. Apply Database Migration

```bash
# Ensure Supabase is running
supabase status

# Apply the magic items migration
supabase db push

# Verify table exists
supabase db execute "SELECT COUNT(*) FROM official_magic_items;"
# Expected: ~150 items
```

### 2. Start Development Server

```bash
# Install dependencies if needed
npm install

# Start Next.js dev server
npm run dev

# Server should start on http://localhost:3000
```

### 3. Run Contract Tests

```bash
# Run API contract tests (should pass after implementation)
npm test -- contracts/magic-items-api.test.ts

# Expected: All tests pass
# - GET /api/magic-items returns 200
# - GET /api/magic-items?search=ring filters correctly
# - GET /api/magic-items/[slug] returns single item
# - Performance targets met (<500ms list, <300ms detail)
```

## Manual Validation Workflow

### Scenario 1: Browse Magic Items

**Objective**: View the list of all magic items

1. Navigate to `http://localhost:3000/magic-items`

**Expected Results**:

- ✅ Page loads within 2 seconds
- ✅ Grid/list of magic item cards displayed
- ✅ Each card shows:
  - Item name (e.g., "Ring of Invisibility")
  - Item description preview
  - Number of traits (e.g., "2 traits")
- ✅ Items sorted alphabetically by name
- ✅ Minimum 100 items visible (with scroll/pagination)

**Screenshot Location**: `specs/011-i-would-to/screenshots/browse-list.png`

### Scenario 2: Search for Magic Items

**Objective**: Filter items using search

1. On `/magic-items` page, locate search input
2. Type "ring" into search field
3. Wait for results to update (debounced ~300ms)

**Expected Results**:

- ✅ Search completes within 500ms
- ✅ Only items matching "ring" in name or description appear
- ✅ Results include:
  - "Ring of Invisibility"
  - "Ring of Fireballs"
  - "Ring of Feather Falling"
  - "Ring of Ramlaat"
- ✅ No items without "ring" in name/description
- ✅ Empty state shown if no matches (try "xyznonexistent")

**Screenshot Location**: `specs/011-i-would-to/screenshots/search-results.png`

### Scenario 3: View Magic Item Detail

**Objective**: See complete information for a single item

1. From the list page, click on "Ring of Invisibility"
2. Page navigates to `/magic-items/ring_of_invisibility`

**Expected Results**:

- ✅ Page loads within 2 seconds
- ✅ Full item name displayed: "Ring of Invisibility"
- ✅ Complete description: "A simple, gold band polished to a warm shine."
- ✅ Traits section shows:
  - **Benefit**: "Once per day, the ring can cast the invisibility spell (pg. 63) on you."
  - **Curse**: "There is a cumulative 1% chance each time you rest..."
- ✅ Each trait type has distinct visual styling (badge/color)
- ✅ Back button or breadcrumb to return to list

**Screenshot Location**: `specs/011-i-would-to/screenshots/detail-page.png`

### Scenario 4: View Item with Multiple Trait Types

**Objective**: Validate complex trait display

1. Navigate to `/magic-items/blade_of_vengeance`

**Expected Results**:

- ✅ Name: "Blade Of Vengeance"
- ✅ Description shown
- ✅ Traits displayed with labels:
  - **Bonus**: "+2 bastard sword. Cannot be wielded by undead."
  - **Benefit**: "You have advantage on attacks against undead creatures..."
  - **Personality**: "Lawful. Grim, suspicious. Forged as a failsafe..."
- ✅ Each trait type visually distinct
- ✅ All traits readable without truncation

**Screenshot Location**: `specs/011-i-would-to/screenshots/multiple-traits.png`

### Scenario 5: API Endpoint Direct Testing

**Objective**: Validate API responses independently

```bash
# Test list endpoint
curl http://localhost:3000/api/magic-items | jq '.data | length'
# Expected: ~150

# Test search endpoint
curl "http://localhost:3000/api/magic-items?search=invisibility" | jq '.data | length'
# Expected: 2-3 items

# Test single item endpoint
curl http://localhost:3000/api/magic-items/ring_of_invisibility | jq '.data.name'
# Expected: "Ring of Invisibility"

# Test error handling (invalid slug)
curl http://localhost:3000/api/magic-items/INVALID | jq '.error'
# Expected: "Invalid slug format" or "Magic item not found"
```

### Scenario 6: Database Query Performance

**Objective**: Verify query performance targets

```sql
-- Time the list query
EXPLAIN ANALYZE
SELECT id, name, slug, description, traits
FROM official_magic_items
ORDER BY name ASC
LIMIT 50;
-- Expected: Execution time < 100ms

-- Time the search query
EXPLAIN ANALYZE
SELECT id, name, slug, description, traits,
  similarity(name || ' ' || description, 'invisibility') AS score
FROM official_magic_items
WHERE name % 'invisibility' OR description % 'invisibility'
ORDER BY score DESC, name ASC
LIMIT 50;
-- Expected: Execution time < 300ms

-- Time the single item query
EXPLAIN ANALYZE
SELECT id, name, slug, description, traits
FROM official_magic_items
WHERE slug = 'ring_of_invisibility';
-- Expected: Execution time < 50ms (using unique index)
```

## E2E Test Scenario (Playwright)

**File**: `__tests__/e2e/magic-items.spec.ts`

```typescript
test("GM can browse, search, and view magic items", async ({ page }) => {
  // 1. Browse list
  await page.goto("http://localhost:3000/magic-items");
  await expect(page.locator("h1")).toContainText("Magic Items");
  const items = page.locator('[data-testid="magic-item-card"]');
  await expect(items).toHaveCount(50, { timeout: 5000 }); // First page

  // 2. Search for items
  await page.fill('[data-testid="search-input"]', "ring");
  await page.waitForTimeout(400); // Debounce
  const filteredItems = page.locator('[data-testid="magic-item-card"]');
  const count = await filteredItems.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(50); // Filtered results

  // 3. View detail page
  await page.click("text=Ring of Invisibility");
  await expect(page).toHaveURL(/\/magic-items\/ring_of_invisibility/);
  await expect(page.locator("h1")).toContainText("Ring of Invisibility");
  await expect(page.locator('[data-testid="trait-Benefit"]')).toBeVisible();
  await expect(page.locator('[data-testid="trait-Curse"]')).toBeVisible();

  // 4. Navigate back
  await page.click('[data-testid="back-button"]');
  await expect(page).toHaveURL(/\/magic-items$/);
});
```

## Troubleshooting

### Database Issues

**Problem**: No magic items in database

```bash
# Check if table exists
supabase db execute "\\dt official_magic_items"

# Check row count
supabase db execute "SELECT COUNT(*) FROM official_magic_items;"

# Re-run migration if needed
supabase db reset
```

**Problem**: Search not working

```bash
# Verify pg_trgm extension enabled
supabase db execute "SELECT * FROM pg_extension WHERE extname = 'pg_trgm';"

# Check if fuzzy_search function exists
supabase db execute "\\df fuzzy_search"
```

### API Issues

**Problem**: 404 on API routes

- Verify Next.js server is running on port 3000
- Check `app/api/magic-items/route.ts` exists
- Restart dev server: `npm run dev`

**Problem**: 500 errors

- Check Supabase connection in `.env.local`
- Verify RLS policies allow read access
- Check browser console and server logs

### UI Issues

**Problem**: Page doesn't render

- Check `app/magic-items/page.tsx` exists
- Verify Supabase client connection
- Check browser console for errors

**Problem**: Search doesn't filter

- Verify client component has search state
- Check debounce timing (300ms)
- Inspect network tab for API calls

## Performance Benchmarks

Run these after implementation to validate targets:

```bash
# API performance
npm run test:perf -- magic-items-api.test.ts

# Page load performance
npx playwright test --grep "performance"

# Lighthouse CI
npm run lighthouse -- http://localhost:3000/magic-items
# Target: >90 performance score
```

## Success Checklist

Before marking implementation complete:

- [ ] Database migration applied successfully
- [ ] 150 magic items seeded
- [ ] GET /api/magic-items returns items
- [ ] Search filters by name and description
- [ ] GET /api/magic-items/[slug] returns single item
- [ ] /magic-items page renders list
- [ ] Search input filters client-side
- [ ] /magic-items/[slug] page shows detail
- [ ] Traits display with proper labels
- [ ] Performance targets met (<2s load, <500ms search)
- [ ] Contract tests pass (100%)
- [ ] E2E test passes
- [ ] No console errors in browser
- [ ] RLS policies allow public read

## Next Steps

After validating quickstart:

1. Add favorites functionality (user_favorites integration)
2. Add filter by trait type
3. Add pagination for large result sets
4. Optimize images (if icons added)
5. Add user-created magic items (Phase 2)

## References

- Feature Spec: [spec.md](./spec.md)
- Data Model: [data-model.md](./data-model.md)
- API Contract: [contracts/magic-items-api.yaml](./contracts/magic-items-api.yaml)
- Constitution: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)
