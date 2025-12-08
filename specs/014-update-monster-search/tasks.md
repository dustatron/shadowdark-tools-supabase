# Tasks: Monster Search View Toggle

**Input**: Design documents from `/specs/014-update-monster-search/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Summary

Add toggle between card view and table view for monster search results using @tanstack/react-table with shadcn/ui Table primitives. View preference persists via URL parameter.

---

## Phase 3.1: Setup

- [x] T001 [P] Install @tanstack/react-table dependency
  - Run: `npm install @tanstack/react-table`
  - Verify: package.json updated, no peer dependency warnings

- [x] T002 [P] Add ViewMode type and update FilterValues in `lib/types/monsters.ts`
  - Add: `export type ViewMode = "cards" | "table";`
  - Add `view: ViewMode` to FilterValues interface
  - Update DEFAULT_FILTERS with `view: "cards"`
  - Update `parseFiltersFromSearchParams` to parse `view` param
  - Update `serializeFiltersToSearchParams` to serialize `view` param

---

## Phase 3.2: Tests First (TDD)

**CRITICAL: Write tests that FAIL before implementation**

- [ ] T003 [P] Unit test for MonsterTable component in `__tests__/components/monsters/MonsterTable.test.tsx`
  - Test: renders table with monster data
  - Test: clickable rows have correct href
  - Test: sortable columns show sort indicator
  - Test: favorite button renders for authenticated user
  - Test: mobile columns hidden on small screen (mock viewport)

- [ ] T004 [P] Unit test for view toggle in `__tests__/components/monsters/MonsterFilters.test.tsx`
  - Test: toggle renders Cards and Table buttons
  - Test: active view is highlighted
  - Test: clicking toggle calls onViewChange callback

- [ ] T005 E2E test for view toggle flow in `e2e/monsters-view-toggle.spec.ts`
  - Navigate to /monsters
  - Verify cards view is default
  - Click Table toggle
  - Verify URL updates to ?view=table
  - Verify table renders with columns (Name, CL, HP, AC)
  - Click a row
  - Verify navigates to monster detail
  - Go back
  - Verify table view persists

---

## Phase 3.3: Core Implementation

- [x] T006 Create MonsterTable component in `src/components/monsters/MonsterTable.tsx`
  - Props: monsters, currentUserId, favoritesMap, preserveSearchParams
  - Use @tanstack/react-table for sorting state
  - Columns: Favorite (non-sortable), Name (sortable), CL (sortable), HP (sortable), AC (sortable), Speed, Source
  - Use shadcn Table, TableHeader, TableBody, TableRow, TableCell components
  - Row onClick navigates to monster detail with preserved search params
  - Hide Speed/Source columns on mobile via responsive classes
  - Integrate FavoriteButton for authenticated users

- [x] T007 Add view toggle to MonsterFilters in `src/components/monsters/MonsterFilters.tsx`
  - Add props: `view: ViewMode`, `onViewChange: (view: ViewMode) => void`
  - Add toggle button group after search input using shadcn Button components
  - Icons: LayoutGrid for cards, Table2 for table (from lucide-react)
  - Highlight active view with variant="default", inactive with variant="outline"

- [x] T008 Update MonsterList to conditionally render in `src/components/monsters/MonsterList.tsx`
  - Add prop: `view: ViewMode`
  - Import MonsterTable component
  - If view === "table", render MonsterTable instead of card grid
  - Pass same props (monsters, currentUserId, favoritesMap, preserveSearchParams) to MonsterTable
  - Pagination component remains below both views

- [x] T009 Wire view state in MonstersClient in `app/monsters/MonstersClient.tsx`
  - Add view to filters state (from initialFilters.view)
  - Add handleViewChange function to update filters.view and URL
  - Pass view and onViewChange to MonsterFilters
  - Pass view to MonsterList

- [x] T010 Update page.tsx to include view in initialFilters in `app/monsters/page.tsx`
  - parseFiltersFromSearchParams already handles view (from T002)
  - No additional changes needed, just verify view flows through

---

## Phase 3.4: Integration

- [ ] T011 Add localStorage fallback for view preference
  - In MonstersClient: on mount, if no URL view param, check localStorage
  - On view change, save to localStorage
  - Key: `monster-view-preference`

- [ ] T012 Verify all existing filters work with table view
  - Test search with table view
  - Test CL range with table view
  - Test type filters with table view
  - Test pagination with table view

---

## Phase 3.5: Polish

- [ ] T013 [P] Run lint and fix any issues
  - `npm run lint:fix`

- [ ] T014 [P] Run type check
  - `npx tsc --noEmit`

- [ ] T015 Run all unit tests
  - `npm run test:run`
  - Verify T003, T004 tests pass

- [ ] T016 Run E2E tests
  - `npm run test:e2e`
  - Verify T005 test passes

- [ ] T017 Manual QA via quickstart.md
  - Follow all steps in `specs/014-update-monster-search/quickstart.md`
  - Check all acceptance criteria boxes

---

## Dependencies

```
T001, T002 (parallel setup)
    ↓
T003, T004, T005 (parallel tests - must fail initially)
    ↓
T006 (MonsterTable - blocked by T002, T003)
    ↓
T007, T008 (MonsterFilters, MonsterList - blocked by T006)
    ↓
T009 (MonstersClient - blocked by T007, T008)
    ↓
T010 (page.tsx verification)
    ↓
T011, T012 (integration - blocked by T009)
    ↓
T013, T014 (parallel polish)
    ↓
T015, T016, T017 (final validation)
```

## Parallel Execution Examples

```bash
# Phase 3.1 - Setup (parallel)
Task: "Install @tanstack/react-table: npm install @tanstack/react-table"
Task: "Update lib/types/monsters.ts with ViewMode type and FilterValues extension"

# Phase 3.2 - Tests (parallel)
Task: "Write MonsterTable unit tests in __tests__/components/monsters/MonsterTable.test.tsx"
Task: "Write view toggle tests in __tests__/components/monsters/MonsterFilters.test.tsx"
Task: "Write E2E test for view toggle in e2e/monsters-view-toggle.spec.ts"

# Phase 3.5 - Polish (parallel)
Task: "Run npm run lint:fix"
Task: "Run npx tsc --noEmit"
```

## Validation Checklist

- [x] All component contracts have corresponding tests (T003, T004, T005)
- [x] All type changes have tasks (T002)
- [x] All tests come before implementation (T003-T005 before T006-T010)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
