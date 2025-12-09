# Architecture Refactor Tasks

## Overview

This document contains parallelizable tasks for the architecture refactoring. Tasks are organized by dependency level - tasks at the same level can be executed in parallel.

**Decision Summary:**

- Consolidate ALL components to `/components/` (primitives → `/components/primitives/`)
- Create generic ContentFilters component
- Enforce API routes for all client component data fetching
- Generate types from Supabase schema

---

## Phase 1: Foundation (No Dependencies - Fully Parallel)

### Task 1.1: Generate Supabase Types

**Description:** Generate TypeScript types from Supabase schema and integrate into codebase.

**Steps:**

1. Run `npx supabase gen types typescript --project-id anradzoxmwjpzlldneac > lib/types/database.types.ts`
2. Create helper types that wrap database types for frontend use
3. Update existing type definitions to use generated types where applicable

**Files Created:**

- `lib/types/database.types.ts`
- `lib/types/database-helpers.ts`

**Acceptance Criteria:**

- [ ] Types generated from production schema
- [ ] Helper types created for Monster, Spell, MagicItem, Equipment
- [ ] Build passes with new types

---

### Task 1.2: Move Primitives to /components/primitives/

**Description:** Reorganize shadcn/ui primitives into dedicated folder.

**Steps:**

1. Create `/components/primitives/` directory
2. Move all shadcn/ui primitives from `/components/ui/` to `/components/primitives/`
3. Update all imports across codebase

**Files to Move (from /components/ui/):**

- accordion.tsx, alert-dialog.tsx, alert.tsx, avatar.tsx, badge.tsx
- breadcrumb.tsx, button.tsx, card.tsx, carousel.tsx, checkbox.tsx
- collapsible.tsx, command.tsx, dialog.tsx, drawer.tsx, dropdown-menu.tsx
- form.tsx, input.tsx, label.tsx, multi-select.tsx, pagination.tsx
- popover.tsx, progress.tsx, scroll-area.tsx, select.tsx, separator.tsx
- sheet.tsx, sidebar.tsx, skeleton.tsx, slider.tsx, sonner.tsx
- switch.tsx, table.tsx, tabs.tsx, textarea.tsx, toast.tsx, toaster.tsx
- toggle-group.tsx, toggle.tsx, tooltip.tsx, use-toast.ts

**Acceptance Criteria:**

- [ ] All primitives moved to `/components/primitives/`
- [ ] All imports updated to `@/components/primitives/*`
- [ ] Build passes

---

### Task 1.3: Create Color Utility Functions

**Description:** Extract duplicate color logic into shared utilities.

**Steps:**

1. Create `/lib/utils/shadowdark-colors.ts`
2. Extract `getChallengeLevel Color` from MonsterCard.tsx (lines 118-128)
3. Extract `getTierColor` from SpellTable.tsx (lines 55-65)
4. Update all usages to import from utility

**Files Modified:**

- `src/components/monsters/MonsterCard.tsx`
- `src/components/monsters/MonsterTable.tsx`
- `src/components/spells/SpellTable.tsx`

**Acceptance Criteria:**

- [ ] Color utilities in single file
- [ ] All components using shared utility
- [ ] Build passes

---

### Task 1.4: Create API Query Builder Utility

**Description:** Extract duplicate pagination/filtering logic from API routes.

**Steps:**

1. Create `/lib/api/query-builder.ts`
2. Add `buildPaginationParams(searchParams)` function
3. Add `buildSearchQuery(query, searchTerm, fields)` function
4. Add `buildSortQuery(query, sortField, sortOrder)` function

**Example Interface:**

```typescript
export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

export const buildPaginationParams = (
  searchParams: URLSearchParams,
): PaginationParams => {
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "20"), 1),
    100,
  );
  const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
  const offset = (page - 1) * limit;
  return { limit, offset, page };
};
```

**Files Created:**

- `lib/api/query-builder.ts`

**Acceptance Criteria:**

- [ ] Utility handles pagination, search, sorting
- [ ] Unit tests for utility functions
- [ ] Build passes

---

### Task 1.5: Replace Console.log with Logger

**Description:** Replace all console.log/error/warn statements with logger utility.

**Steps:**

1. Find all console.log usages: `grep -r "console\." --include="*.tsx" --include="*.ts" app/ src/ components/ lib/`
2. Replace with appropriate logger method:
   - `console.log` → `logger.debug`
   - `console.error` → `logger.error`
   - `console.warn` → `logger.warn`
3. Add logger import where needed

**Exceptions (keep console.error):**

- API routes (server-side, acceptable)
- Error boundaries (already have context)

**Files to Update:**

- All error.tsx files in app/
- All client components with console statements
- Utility files in lib/

**Acceptance Criteria:**

- [ ] No console.log in client components
- [ ] Logger imported where needed
- [ ] Build passes

---

## Phase 2: Component Consolidation (Depends on Phase 1.2)

### Task 2.1: Move /src/components/ to /components/

**Description:** Consolidate all app components into single /components/ directory.

**Steps:**

1. Move `/src/components/monsters/` → `/components/monsters/`
2. Move `/src/components/spells/` → `/components/spells/`
3. Move `/src/components/encounter-tables/` → `/components/encounter-tables/`
4. Move `/src/components/favorites/` → `/components/favorites/`
5. Move `/src/components/navigation/` → `/components/navigation/`
6. Move `/src/components/providers/` → `/components/providers/`
7. Move `/src/components/ui/` (non-primitives) → `/components/shared/`
   - ViewModeToggle.tsx
   - SourceToggle.tsx
   - SearchInput.tsx
   - EmptyState.tsx
   - IconSelector.tsx
   - LoadingSpinner.tsx
   - Pagination.tsx
8. Update ALL imports across codebase
9. Delete empty `/src/components/` directory

**Import Pattern Change:**

- `@/src/components/*` → `@/components/*`
- `@/components/ui/*` (primitives) → `@/components/primitives/*`

**Acceptance Criteria:**

- [ ] All components in `/components/`
- [ ] No files in `/src/components/`
- [ ] All imports updated
- [ ] Build passes

---

### Task 2.2: Fix SpellFilters Import Paths

**Description:** Update SpellFilters to use @ alias instead of relative imports.

**Steps:**

1. Open `/src/components/spells/SpellFilters.tsx` (after move: `/components/spells/SpellFilters.tsx`)
2. Replace relative imports with @ alias:
   - `../../../components/ui/card` → `@/components/primitives/card`
   - Similar for all other imports

**Acceptance Criteria:**

- [ ] All imports use @ alias
- [ ] Build passes

---

### Task 2.3: Create Shared Type Definitions

**Description:** Consolidate type definitions and use generated Supabase types.

**Steps:**

1. Update `/lib/types/monsters.ts` to extend database types
2. Create `/lib/types/spells.ts` (extract from SpellFilters inline types)
3. Create `/lib/types/magic-items.ts`
4. Update all components to import from centralized type files

**Acceptance Criteria:**

- [ ] All entity types in dedicated files
- [ ] Types extend from database.types.ts where applicable
- [ ] No inline interface definitions in components
- [ ] Build passes

---

## Phase 3: Shared Components (Depends on Phase 2.1)

### Task 3.1: Create Generic ContentFilters Component

**Description:** Create reusable filter component that replaces MonsterFilters, SpellFilters, MagicItemFilters, EquipmentFilters.

**Steps:**

1. Create `/components/shared/ContentFilters.tsx`
2. Define configuration interface:

```typescript
interface FilterFieldConfig {
  type: "multiselect" | "range" | "search";
  key: string;
  label: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ContentFiltersProps<T extends Record<string, any>> {
  filters: T;
  onFiltersChange: (filters: T) => void;
  searchPlaceholder: string;
  sourceLabels?: { all: string; official: string; custom: string };
  sourceKey?: string; // e.g., 'monsterSource', 'spellSource'
  advancedFilters: FilterFieldConfig[];
  hasActiveFilters: (filters: T) => boolean;
  getActiveFilterCount: (filters: T) => number;
  defaultFilters: T;
  loading?: boolean;
}
```

3. Implement mobile Sheet + desktop Collapsible pattern
4. Create config files for each domain:
   - `/components/monsters/monster-filter-config.ts`
   - `/components/spells/spell-filter-config.ts`
   - `/components/magic-items/magic-item-filter-config.ts`
   - `/components/equipment/equipment-filter-config.ts`
5. Update each page to use ContentFilters with config

**Files Created:**

- `components/shared/ContentFilters.tsx`
- `components/monsters/monster-filter-config.ts`
- `components/spells/spell-filter-config.ts`
- `components/magic-items/magic-item-filter-config.ts`
- `components/equipment/equipment-filter-config.ts`

**Files Deprecated (keep for reference, then delete):**

- `components/monsters/MonsterFilters.tsx`
- `components/spells/SpellFilters.tsx`
- `components/magic-items/MagicItemFilters.tsx`
- `components/equipment/EquipmentFilters.tsx`

**Acceptance Criteria:**

- [ ] Single ContentFilters component handles all domains
- [ ] Mobile/desktop responsive behavior preserved
- [ ] Source toggle (All/Core/Custom) works
- [ ] Search debounce works
- [ ] Filter count badge works
- [ ] Clear filters works
- [ ] Build passes

---

### Task 3.2: Create Generic DataTable Component

**Description:** Create reusable table component wrapping @tanstack/react-table.

**Steps:**

1. Create `/components/shared/DataTable.tsx`
2. Define interface:

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  emptyMessage?: string;
  emptyDescription?: string;
  defaultSorting?: SortingState;
  onRowClick?: (row: T) => void;
}
```

3. Include SortableHeader helper component
4. Include empty state rendering
5. Update MonsterTable, SpellTable, MagicItemTable, EquipmentTable to use DataTable

**Files Created:**

- `components/shared/DataTable.tsx`
- `components/shared/SortableHeader.tsx`

**Files Modified:**

- `components/monsters/MonsterTable.tsx` (simplify to column definitions only)
- `components/spells/SpellTable.tsx`
- `components/magic-items/MagicItemTable.tsx`
- `components/equipment/EquipmentTable.tsx`

**Acceptance Criteria:**

- [ ] Single DataTable component
- [ ] Sorting works
- [ ] Empty state works
- [ ] All tables use shared component
- [ ] Build passes

---

### Task 3.3: Create Generic ContentList Component

**Description:** Create reusable list component that handles card/table view switching.

**Steps:**

1. Create `/components/shared/ContentList.tsx`
2. Define interface:

```typescript
interface ContentListProps<T> {
  items: T[];
  viewMode: "cards" | "table";
  CardComponent: ComponentType<{ item: T; currentUserId?: string }>;
  TableComponent: ComponentType<{ items: T[]; currentUserId?: string }>;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  gridCols?: string; // e.g., "md:grid-cols-2 lg:grid-cols-3"
}
```

3. Update MonsterList, SpellList, MagicItemList, EquipmentList to use ContentList

**Files Created:**

- `components/shared/ContentList.tsx`

**Files Simplified:**

- `components/monsters/MonsterList.tsx` → thin wrapper or removed
- `components/spells/SpellList.tsx`
- `components/magic-items/MagicItemList.tsx`
- `components/equipment/EquipmentList.tsx`

**Acceptance Criteria:**

- [ ] Single ContentList component
- [ ] View switching works
- [ ] Pagination works
- [ ] Loading/error/empty states work
- [ ] Build passes

---

### Task 3.4: Migrate EquipmentFilters to SearchInput

**Description:** Quick fix - update EquipmentFilters to use shared SearchInput component.

**Steps:**

1. Import SearchInput from `@/components/shared/SearchInput`
2. Replace inline search input with SearchInput component
3. Remove localSearch state and useDebounce logic
4. Update clearFilters function

**Files Modified:**

- `components/equipment/EquipmentFilters.tsx`

**Acceptance Criteria:**

- [ ] Uses SearchInput component
- [ ] Debounce still works
- [ ] Build passes

---

## Phase 4: API Standardization (Depends on Phase 1.4)

### Task 4.1: Refactor Monster API Routes

**Description:** Update monster API routes to use query builder utility.

**Steps:**

1. Update `/app/api/monsters/route.ts` to use `buildPaginationParams`
2. Update `/app/api/search/monsters/route.ts` to use query builder
3. Ensure consistent response format

**Acceptance Criteria:**

- [ ] Uses shared query builder
- [ ] Response format consistent
- [ ] Build passes
- [ ] API tests pass (if any)

---

### Task 4.2: Refactor Spell API Routes

**Description:** Update spell API routes to use query builder utility.

**Steps:**

1. Update `/app/api/spells/route.ts` to use `buildPaginationParams`
2. Update `/app/api/search/spells/route.ts` to use query builder
3. Ensure consistent response format

**Acceptance Criteria:**

- [ ] Uses shared query builder
- [ ] Response format consistent
- [ ] Build passes

---

### Task 4.3: Refactor Magic Items API Routes

**Description:** Update magic items API routes to use query builder utility.

**Steps:**

1. Update `/app/api/magic-items/route.ts` to use `buildPaginationParams`
2. Update `/app/api/search/magic-items/route.ts` to use query builder
3. Ensure consistent response format

**Acceptance Criteria:**

- [ ] Uses shared query builder
- [ ] Response format consistent
- [ ] Build passes

---

### Task 4.4: Refactor Equipment API Routes

**Description:** Update equipment API routes to use query builder utility.

**Steps:**

1. Update `/app/api/equipment/route.ts` to use `buildPaginationParams`
2. Ensure consistent response format

**Acceptance Criteria:**

- [ ] Uses shared query builder
- [ ] Response format consistent
- [ ] Build passes

---

### Task 4.5: Audit Direct Supabase Usage in Client Components

**Description:** Find and refactor any client components using direct Supabase calls.

**Steps:**

1. Search for `createClient` imports in client components
2. For each found:
   - Create API route if doesn't exist
   - Update component to fetch via API
3. Document exceptions (if any)

**Search Command:**

```bash
grep -r "createClient" --include="*.tsx" app/ components/ | grep -v "// server"
```

**Acceptance Criteria:**

- [ ] All client components use API routes
- [ ] No direct Supabase calls in client components
- [ ] Build passes

---

## Phase 5: Accessibility (Can Run Parallel with Phase 3-4)

### Task 5.1: Add ARIA Labels to Icon Buttons

**Description:** Audit and add aria-labels to all icon-only buttons.

**Steps:**

1. Find all icon-only buttons: `grep -r "size=\"icon\"" --include="*.tsx"`
2. Add aria-label to each:

```tsx
// Before
<Button size="icon" onClick={...}><Plus /></Button>

// After
<Button size="icon" onClick={...} aria-label="Add item"><Plus /></Button>
```

**Files to Audit:**

- All card components
- All table components
- Navigation components
- Filter components

**Acceptance Criteria:**

- [ ] All icon buttons have aria-label
- [ ] Labels are descriptive and unique
- [ ] Build passes

---

### Task 5.2: Add ARIA Labels to Sort Buttons

**Description:** Add accessibility labels to table sort buttons.

**Steps:**

1. Update SortableHeader component (from Task 3.2) with proper aria-labels
2. Include sort direction in label: "Sort by name, currently ascending"

**Acceptance Criteria:**

- [ ] Sort buttons have descriptive aria-labels
- [ ] Sort direction communicated to screen readers
- [ ] Build passes

---

### Task 5.3: Keyboard Navigation Audit

**Description:** Test and fix keyboard navigation issues.

**Steps:**

1. Tab through all pages with keyboard only
2. Ensure focus visible on all interactive elements
3. Ensure logical tab order
4. Fix any focus traps

**Pages to Test:**

- /monsters
- /spells
- /magic-items
- /equipment
- /encounter-tables

**Acceptance Criteria:**

- [ ] All interactive elements focusable
- [ ] Focus visible at all times
- [ ] Logical tab order
- [ ] No focus traps

---

## Phase 6: Validation (Final - Depends on All Above)

### Task 6.1: Full Build Validation

**Description:** Run complete build and fix any errors.

**Steps:**

1. `npm run build`
2. Fix any TypeScript errors
3. Fix any ESLint errors
4. `npm run lint`

**Acceptance Criteria:**

- [ ] Build passes with no errors
- [ ] Lint passes with no errors

---

### Task 6.2: Visual Regression Testing

**Description:** Manually verify all pages look correct.

**Pages to Check:**

- [ ] /monsters - list and detail views
- [ ] /spells - list and detail views
- [ ] /magic-items - list and detail views
- [ ] /equipment - list and detail views
- [ ] /encounter-tables - list and detail views
- [ ] /dashboard - all sections
- [ ] Mobile responsiveness on all above

**Acceptance Criteria:**

- [ ] All pages render correctly
- [ ] No visual regressions
- [ ] Mobile views work

---

### Task 6.3: Functional Testing

**Description:** Test core functionality still works.

**Test Cases:**

- [ ] Search filters work on all list pages
- [ ] Pagination works on all list pages
- [ ] View toggle (cards/table) works
- [ ] Source toggle (All/Core/Custom) works
- [ ] Sorting works in tables
- [ ] Navigation between pages works
- [ ] Authentication flow works
- [ ] Create/Edit forms work

**Acceptance Criteria:**

- [ ] All test cases pass
- [ ] No functional regressions

---

## Parallel Execution Groups

### Group A (No Dependencies)

- Task 1.1: Generate Supabase Types
- Task 1.3: Create Color Utility Functions
- Task 1.4: Create API Query Builder Utility
- Task 1.5: Replace Console.log with Logger

### Group B (Depends on nothing, but large)

- Task 1.2: Move Primitives to /components/primitives/

### Group C (Depends on Group B)

- Task 2.1: Move /src/components/ to /components/
- Task 2.2: Fix SpellFilters Import Paths

### Group D (Depends on Group A Task 1.1)

- Task 2.3: Create Shared Type Definitions

### Group E (Depends on Group C)

- Task 3.1: Create Generic ContentFilters Component
- Task 3.2: Create Generic DataTable Component
- Task 3.3: Create Generic ContentList Component
- Task 3.4: Migrate EquipmentFilters to SearchInput

### Group F (Depends on Group A Task 1.4)

- Task 4.1: Refactor Monster API Routes
- Task 4.2: Refactor Spell API Routes
- Task 4.3: Refactor Magic Items API Routes
- Task 4.4: Refactor Equipment API Routes
- Task 4.5: Audit Direct Supabase Usage

### Group G (Independent)

- Task 5.1: Add ARIA Labels to Icon Buttons
- Task 5.2: Add ARIA Labels to Sort Buttons
- Task 5.3: Keyboard Navigation Audit

### Group H (Final Validation)

- Task 6.1: Full Build Validation
- Task 6.2: Visual Regression Testing
- Task 6.3: Functional Testing

---

## Execution Order for Maximum Parallelism

```
Round 1 (Parallel):
├── Task 1.1 (Supabase Types)
├── Task 1.2 (Primitives Move)
├── Task 1.3 (Color Utils)
├── Task 1.4 (Query Builder)
├── Task 1.5 (Logger Replace)
├── Task 5.1 (ARIA Labels - Icons)
├── Task 5.2 (ARIA Labels - Sort)
└── Task 5.3 (Keyboard Nav)

Round 2 (After Round 1 completes):
├── Task 2.1 (Component Consolidation) [needs 1.2]
├── Task 2.2 (SpellFilters Imports) [needs 2.1]
├── Task 2.3 (Type Definitions) [needs 1.1]
├── Task 4.1 (Monster API) [needs 1.4]
├── Task 4.2 (Spell API) [needs 1.4]
├── Task 4.3 (Magic Items API) [needs 1.4]
├── Task 4.4 (Equipment API) [needs 1.4]
└── Task 4.5 (Supabase Audit) [needs 1.4]

Round 3 (After Round 2 completes):
├── Task 3.1 (ContentFilters) [needs 2.1]
├── Task 3.2 (DataTable) [needs 2.1]
├── Task 3.3 (ContentList) [needs 2.1]
└── Task 3.4 (EquipmentFilters) [needs 2.1]

Round 4 (Final):
├── Task 6.1 (Build Validation)
├── Task 6.2 (Visual Testing)
└── Task 6.3 (Functional Testing)
```

---

## Estimated Total Effort

| Phase     | Tasks        | Est. Hours    |
| --------- | ------------ | ------------- |
| Phase 1   | 5 tasks      | 6-8 hrs       |
| Phase 2   | 3 tasks      | 4-5 hrs       |
| Phase 3   | 4 tasks      | 8-10 hrs      |
| Phase 4   | 5 tasks      | 4-5 hrs       |
| Phase 5   | 3 tasks      | 3-4 hrs       |
| Phase 6   | 3 tasks      | 2-3 hrs       |
| **Total** | **23 tasks** | **27-35 hrs** |

With parallel execution across 4-5 agents, this can be completed in approximately **8-10 hours of wall-clock time**.
