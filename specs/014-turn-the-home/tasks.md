# Tasks: Central Home Page Search

**Input**: Design documents from `/specs/014-turn-the-home/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/search-api.yaml, quickstart.md

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 3.1: Setup & Database

- [x] T001 Create `search_all_content()` PostgreSQL function in `supabase/migrations/20251208112145_create_search_all_content.sql`
- [x] T002 Add pg_trgm index on equipment.name if missing in same migration file
- [ ] T003 Apply migration to local Supabase (`supabase db push`) - BLOCKED: Docker not running

## Phase 3.2: Validation & Types

- [x] T004 [P] Create Zod schema for SearchFilters in `lib/validations/search.ts`
- [x] T005 [P] Create TypeScript types for SearchResult, SearchResponse in `lib/types/search.ts`

## Phase 3.3: Tests First (TDD) - MUST COMPLETE BEFORE 3.4

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### API Route Tests

- [x] T006 [P] Write failing test for GET /api/search success case in `__tests__/api/search/route.test.ts`
- [x] T007 [P] Write failing test for GET /api/search validation errors in `__tests__/api/search/validation.test.ts`

### Component Tests

- [x] T008 [P] Write failing test for UnifiedSearchForm in `__tests__/components/search/UnifiedSearchForm.test.tsx`
- [x] T009 [P] Write failing test for SearchResultCard in `__tests__/components/search/SearchResultCard.test.tsx`
- [x] T010 [P] Write failing test for SearchResultsList in `__tests__/components/search/SearchResultsList.test.tsx`

## Phase 3.4: Core Implementation (ONLY after tests are failing)

### API Route

- [x] T011 Implement GET /api/search route handler in `app/api/search/route.ts`

### Components (can be parallel - different files)

- [x] T012 [P] Implement SearchResultCard component in `components/search/SearchResultCard.tsx`
- [x] T013 [P] Implement SearchResultsList component in `components/search/SearchResultsList.tsx`
- [x] T014 Implement UnifiedSearchForm component in `components/search/UnifiedSearchForm.tsx`

## Phase 3.5: Integration

- [x] T015 Replace home page with search UI in `app/page.tsx`
- [x] T016 Wire up form submission to API using react-query in `components/search/HomeSearchClient.tsx`
- [x] T017 Add result click navigation to detail pages in `components/search/SearchResultCard.tsx`

## Phase 3.6: E2E Tests & Polish

- [ ] T018 [P] Write Playwright E2E test for basic search flow in `e2e/search.spec.ts`
- [ ] T019 [P] Write Playwright E2E test for filter functionality in `e2e/search-filters.spec.ts`
- [ ] T020 Run quickstart.md verification scenarios manually
- [ ] T021 Run full test suite and fix any failures

---

## Dependencies

```
T001-T003 → T011 (DB function must exist before API uses it)
T004-T005 → T011 (types/schemas needed for API route)
T006-T010 → T011-T014 (tests before implementation - TDD)
T011 → T015-T017 (API must work before frontend integrates)
T012-T013 → T014 (child components before parent form)
T014 → T015 (form component before page integration)
T015-T017 → T018-T019 (integration before E2E)
```

## Parallel Execution Examples

### Phase 3.2 - Types and Validation (2 parallel tasks)

```
Task agent 1: "Create Zod schema for SearchFilters in lib/validations/search.ts"
Task agent 2: "Create TypeScript types for SearchResult, SearchResponse in lib/types/search.ts"
```

### Phase 3.3 - All Tests (5 parallel tasks)

```
Task agent 1: "Write failing Vitest test for GET /api/search success in __tests__/api/search/route.test.ts"
Task agent 2: "Write failing Vitest test for GET /api/search validation in __tests__/api/search/validation.test.ts"
Task agent 3: "Write failing test for UnifiedSearchForm in __tests__/components/search/UnifiedSearchForm.test.tsx"
Task agent 4: "Write failing test for SearchResultCard in __tests__/components/search/SearchResultCard.test.tsx"
Task agent 5: "Write failing test for SearchResultsList in __tests__/components/search/SearchResultsList.test.tsx"
```

### Phase 3.4 - Components (2 parallel tasks)

```
Task agent 1: "Implement SearchResultCard in components/search/SearchResultCard.tsx"
Task agent 2: "Implement SearchResultsList in components/search/SearchResultsList.tsx"
```

### Phase 3.6 - E2E Tests (2 parallel tasks)

```
Task agent 1: "Write Playwright E2E test for basic search in e2e/search.spec.ts"
Task agent 2: "Write Playwright E2E test for filters in e2e/search-filters.spec.ts"
```

---

## Task Details

### T001: Create search_all_content() function

```sql
-- Create function that:
-- 1. Searches all_monsters view with similarity() > 0.3
-- 2. Searches all_magic_items view with similarity() > 0.3
-- 3. Searches equipment table with similarity() > 0.3
-- 4. UNION ALL results with type discriminator
-- 5. Applies source filter (all/core/user)
-- 6. Applies content type filters (monsters/magic_items/equipment)
-- 7. Orders by relevance DESC
-- 8. Limits results
```

### T004: Zod Schema

```typescript
// lib/validations/search.ts
export const SearchFiltersSchema = z.object({
  q: z.string().min(3, "Search requires at least 3 characters"),
  source: z.enum(["all", "core", "user"]).default("all"),
  includeMonsters: z.coerce.boolean().default(true),
  includeMagicItems: z.coerce.boolean().default(true),
  includeEquipment: z.coerce.boolean().default(true),
  limit: z.coerce
    .number()
    .pipe(z.union([z.literal(25), z.literal(50), z.literal(100)]))
    .default(25),
});
```

### T011: API Route Implementation

```typescript
// app/api/search/route.ts
// 1. Parse and validate query params with SearchFiltersSchema
// 2. Call supabase.rpc('search_all_content', {...params})
// 3. Transform DB results to SearchResult[] with detailUrl
// 4. Return SearchResponse JSON
```

### T014: UnifiedSearchForm Component

```tsx
// components/search/UnifiedSearchForm.tsx
// shadcn/ui components: Form, Input, Button, RadioGroup, Checkbox, Select
// react-hook-form with zodResolver
// Form fields: search input, source radio (All/Core/User),
// content checkboxes (Monsters, Magic Items, Equipment), limit select
// Submit button + Enter key handling
```

### T015: Home Page Integration

```tsx
// app/page.tsx
// Replace hero + feature cards with:
// 1. Title/tagline
// 2. UnifiedSearchForm component
// 3. SearchResultsList component (conditional on search results)
// 4. Empty state when no search performed
```

---

## Validation Checklist

- [x] Contract (search-api.yaml) has corresponding tests (T006-T007)
- [x] Data model entities have type definitions (T005)
- [x] All tests come before implementation (Phase 3.3 before 3.4)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] DB function created before API route
- [x] Quickstart scenarios covered by E2E tests (T018-T019)

---

## Execution Order Summary

1. **Database** (T001-T003) - Sequential
2. **Types** (T004-T005) - Parallel
3. **Tests** (T006-T010) - All parallel
4. **API** (T011) - Sequential
5. **Components** (T012-T013 parallel, then T014)
6. **Integration** (T015-T017) - Sequential
7. **E2E & Polish** (T018-T019 parallel, then T020-T021)

Total: 21 tasks | Parallelizable groups: 4 | Estimated complexity: Medium
