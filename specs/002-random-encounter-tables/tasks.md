# Tasks: Random Encounter Tables

**Input**: Design documents from `/specs/002-random-encounter-tables/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md
**Branch**: `002-random-encounter-tables`

## Execution Summary

```
Design Artifacts Analyzed:
- plan.md: Tech stack (Next.js 15, TypeScript, Mantine UI, Supabase)
- data-model.md: 2 entities (encounter_tables, encounter_table_entries)
- contracts/: 11 API endpoints
- quickstart.md: 14 user scenarios + 8 edge cases

Task Breakdown:
- Setup: 3 tasks
- Database: 4 tasks
- Types/Schemas: 3 tasks
- Backend Utils: 5 tasks
- Contract Tests: 11 tasks [P]
- API Routes: 11 tasks [P]
- Frontend Utils: 3 tasks [P]
- Components: 7 tasks [P]
- Pages: 5 tasks [P]
- E2E Tests: 6 tasks [P]
- Polish: 3 tasks

Total: 61 tasks
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **File paths**: All paths relative to repository root
- **TDD Order**: Tests written → Tests fail → Implementation → Tests pass

---

## Phase 3.1: Setup (T001-T003)

- [ ] **T001** Install nanoid dependency for public slug generation
  - Path: `package.json`
  - Action: `npm install nanoid@5`
  - Verify: Check package.json has nanoid in dependencies

- [ ] **T002** [P] Create directory structure for encounter tables
  - Create directories:
    - `app/api/encounter-tables/`
    - `app/api/encounter-tables/[id]/`
    - `app/api/encounter-tables/[id]/generate/`
    - `app/api/encounter-tables/[id]/entries/[roll]/`
    - `app/api/encounter-tables/[id]/roll/`
    - `app/api/encounter-tables/[id]/share/`
    - `app/api/encounter-tables/public/[slug]/`
    - `app/api/encounter-tables/public/[slug]/copy/`
    - `app/encounter-tables/`
    - `app/encounter-tables/[id]/`
    - `app/encounter-tables/public/[slug]/`
    - `components/encounter-tables/`
    - `lib/encounter-tables/`
    - `__tests__/integration/encounter-tables/`
    - `__tests__/e2e/`

- [ ] **T003** [P] Configure ESLint and Prettier for new files
  - Path: `.eslintrc.json`, `.prettierrc`
  - Verify: No linting warnings on empty TypeScript files

---

## Phase 3.2: Database Layer (T004-T007)

- [ ] **T004** Create database migration for encounter_tables and encounter_table_entries
  - Path: `supabase/migrations/YYYYMMDDHHMMSS_create_encounter_tables.sql`
  - Tables:
    - `encounter_tables` with all fields from data-model.md
    - `encounter_table_entries` with all fields from data-model.md
  - Constraints:
    - Check die_size between 2 and 1000
    - Check name length 3-100 characters
    - Unique (table_id, roll_number)
    - Unique (table_id, monster_id) WHERE monster_id IS NOT NULL
  - Indexes per data-model.md specifications
  - Triggers for updated_at timestamps

- [ ] **T005** Create RLS policies for encounter_tables
  - Path: Same migration file as T004
  - Policies:
    - SELECT: Users can view own tables OR public tables
    - INSERT: Users can create own tables (user_id = auth.uid())
    - UPDATE: Users can update own tables
    - DELETE: Users can delete own tables
  - Enable RLS on encounter_tables

- [ ] **T006** Create RLS policies for encounter_table_entries
  - Path: Same migration file as T004
  - Policies:
    - SELECT: Users can view entries for accessible tables (own or public)
    - INSERT: Users can create entries for own tables
    - UPDATE: Users can update entries in own tables
    - DELETE: Users can delete entries from own tables
  - Enable RLS on encounter_table_entries

- [ ] **T007** Verify database setup locally
  - Run: `supabase db reset --local`
  - Test: Insert sample table and entries manually via psql
  - Test: Verify RLS policies block unauthorized access
  - Test: Verify unique constraints work as expected

---

## Phase 3.3: Types & Schemas (T008-T010)

- [ ] **T008** [P] Create TypeScript type definitions
  - Path: `lib/encounter-tables/types.ts`
  - Export types:
    - `EncounterTable` (from data-model.md)
    - `EncounterTableEntry` (from data-model.md)
    - `EncounterTableFilters` (from data-model.md)
    - `MonsterSnapshot` (from data-model.md)
    - `MonsterSource` type
    - `Alignment` type
    - `MovementType` type
  - Export database row types (align with Supabase schema)

- [ ] **T009** [P] Create Zod validation schemas
  - Path: `lib/encounter-tables/schemas.ts`
  - Schemas from data-model.md:
    - `EncounterTableFiltersSchema` with refinement (level_min <= level_max)
    - `EncounterTableCreateSchema`
    - `EncounterTableUpdateSchema`
    - `ReplaceEntrySchema` (mode: random|search, optional monster_id)
    - `ShareTableSchema` (is_public: boolean)
  - Export inferred types from schemas

- [ ] **T010** [P] Create database query type helpers
  - Path: `lib/encounter-tables/queries.ts`
  - Export query builder functions:
    - `buildMonsterFilterQuery()` - Apply filters to all_monsters query
    - `selectTableWithEntries()` - Join query for table + entries
  - Export reusable select fragments

---

## Phase 3.4: Backend Utilities (T011-T015)

- [ ] **T011** [P] Implement monster filtering utility
  - Path: `lib/encounter-tables/utils/filter-monsters.ts`
  - Function: `filterMonsters(filters: EncounterTableFilters, limit: number, excludeIds?: string[])`
  - Query all_monsters with:
    - Source filtering (official, user, public)
    - Level range
    - Alignment (if specified)
    - Movement types (array overlap)
    - Search query (ILIKE on name, description)
    - Exclude already-used monster IDs
  - Return random selection up to limit
  - Throw error if insufficient monsters

- [ ] **T012** [P] Implement monster snapshot utility
  - Path: `lib/encounter-tables/utils/create-snapshot.ts`
  - Function: `createMonsterSnapshot(monsterId: string)`
  - Query complete monster data from all_monsters view
  - Return MonsterSnapshot object (all fields preserved)
  - Handle monster not found error

- [ ] **T013** [P] Implement public slug generation utility
  - Path: `lib/encounter-tables/utils/generate-slug.ts`
  - Function: `generateUniqueSlug(maxAttempts = 5)`
  - Use nanoid(8) for slug generation
  - Check uniqueness against encounter_tables.public_slug
  - Retry up to maxAttempts on collision
  - Throw error if all attempts fail

- [ ] **T014** [P] Implement table generation utility
  - Path: `lib/encounter-tables/utils/generate-table.ts`
  - Function: `generateTableEntries(tableId: string, dieSize: number, filters: EncounterTableFilters)`
  - Call filterMonsters() to get random unique monsters
  - Create entries array with roll_number (1 to dieSize)
  - Create monster snapshots for each
  - Return entries ready for bulk insert
  - Validate no duplicate monster IDs

- [ ] **T015** [P] Implement dice roll utility
  - Path: `lib/encounter-tables/utils/roll-dice.ts`
  - Function: `rollDice(dieSize: number): number`
  - Return random integer from 1 to dieSize (inclusive)
  - Use crypto.randomInt() for better randomness
  - Validate dieSize >= 2

---

## Phase 3.5: Contract Tests (T016-T026) ⚠️ MUST COMPLETE BEFORE 3.6

**CRITICAL: These tests MUST be written and MUST FAIL before ANY route implementation**

- [ ] **T016** [P] Contract test GET /api/encounter-tables (list)
  - Path: `__tests__/integration/encounter-tables/list.test.ts`
  - Test authenticated user can list their tables
  - Test pagination parameters work
  - Test returns empty array for new user
  - Assert response schema matches OpenAPI spec
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T017** [P] Contract test POST /api/encounter-tables (create)
  - Path: `__tests__/integration/encounter-tables/create.test.ts`
  - Test table creation with valid data
  - Test validation errors (missing name, invalid die_size)
  - Test insufficient monsters error
  - Test generate_immediately flag
  - Assert response includes table + entries
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T018** [P] Contract test GET /api/encounter-tables/[id]
  - Path: `__tests__/integration/encounter-tables/get-by-id.test.ts`
  - Test authenticated user can fetch own table
  - Test includes entries in response
  - Test 404 for nonexistent table
  - Test 403 for other user's private table
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T019** [P] Contract test PATCH /api/encounter-tables/[id]
  - Path: `__tests__/integration/encounter-tables/update.test.ts`
  - Test update name, description, filters
  - Test validation errors
  - Test only owner can update
  - Test 404 for nonexistent table
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T020** [P] Contract test DELETE /api/encounter-tables/[id]
  - Path: `__tests__/integration/encounter-tables/delete.test.ts`
  - Test owner can delete table
  - Test cascade deletes entries
  - Test only owner can delete
  - Test 404 for nonexistent table
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T021** [P] Contract test POST /api/encounter-tables/[id]/generate
  - Path: `__tests__/integration/encounter-tables/regenerate.test.ts`
  - Test regenerates all entries
  - Test uses current table filters
  - Test all monsters unique
  - Test insufficient monsters error
  - Test only owner can regenerate
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T022** [P] Contract test PATCH /api/encounter-tables/[id]/entries/[roll]
  - Path: `__tests__/integration/encounter-tables/replace-entry.test.ts`
  - Test replace with random (mode: random)
  - Test replace with search (mode: search, monster_id)
  - Test validates roll number exists
  - Test maintains uniqueness
  - Test only owner can replace
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T023** [P] Contract test POST /api/encounter-tables/[id]/roll
  - Path: `__tests__/integration/encounter-tables/roll.test.ts`
  - Test returns random roll result
  - Test result between 1 and die_size
  - Test returns matching entry with monster_snapshot
  - Test works for public tables (no auth)
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T024** [P] Contract test PATCH /api/encounter-tables/[id]/share
  - Path: `__tests__/integration/encounter-tables/share.test.ts`
  - Test make public (generates slug)
  - Test make private (keeps slug, denies access)
  - Test toggle multiple times
  - Test only owner can share
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T025** [P] Contract test GET /api/encounter-tables/public/[slug]
  - Path: `__tests__/integration/encounter-tables/public-view.test.ts`
  - Test anyone can view public table (no auth)
  - Test authenticated user can view
  - Test 404 for private table
  - Test 404 for nonexistent slug
  - **Expected**: Test FAILS (route doesn't exist yet)

- [ ] **T026** [P] Contract test POST /api/encounter-tables/public/[slug]/copy
  - Path: `__tests__/integration/encounter-tables/copy.test.ts`
  - Test authenticated user can copy public table
  - Test copy includes all entries
  - Test copy is private by default
  - Test copy is independent from original
  - Test 401 for unauthenticated user
  - **Expected**: Test FAILS (route doesn't exist yet)

---

## Phase 3.6: API Routes (T027-T037) - ONLY AFTER TESTS FAIL

- [ ] **T027** Implement GET/POST /api/encounter-tables route
  - Path: `app/api/encounter-tables/route.ts`
  - GET: List user's tables with pagination
  - POST: Create new table, optionally generate entries
  - Use Zod schemas for validation
  - Handle errors per OpenAPI spec
  - **Expected**: T016 and T017 tests now PASS

- [ ] **T028** Implement GET /api/encounter-tables/[id] route
  - Path: `app/api/encounter-tables/[id]/route.ts`
  - GET: Fetch single table with entries (join query)
  - Check RLS (user owns OR is_public)
  - Return 404 if not found or not accessible
  - **Expected**: T018 test now PASSES

- [ ] **T029** Implement PATCH /api/encounter-tables/[id] route
  - Path: `app/api/encounter-tables/[id]/route.ts` (add PATCH handler)
  - PATCH: Update table settings (name, description, filters)
  - Validate ownership (RLS)
  - Use Zod validation
  - **Expected**: T019 test now PASSES

- [ ] **T030** Implement DELETE /api/encounter-tables/[id] route
  - Path: `app/api/encounter-tables/[id]/route.ts` (add DELETE handler)
  - DELETE: Remove table (cascade deletes entries)
  - Validate ownership
  - Return 204 on success
  - **Expected**: T020 test now PASSES

- [ ] **T031** Implement POST /api/encounter-tables/[id]/generate route
  - Path: `app/api/encounter-tables/[id]/generate/route.ts`
  - POST: Regenerate all entries
  - Delete existing entries
  - Call generateTableEntries() utility
  - Validate ownership
  - **Expected**: T021 test now PASSES

- [ ] **T032** Implement PATCH /api/encounter-tables/[id]/entries/[roll] route
  - Path: `app/api/encounter-tables/[id]/entries/[roll]/route.ts`
  - PATCH: Replace single entry
  - Handle mode=random (use filters, exclude used monsters)
  - Handle mode=search (use provided monster_id)
  - Validate ownership
  - **Expected**: T022 test now PASSES

- [ ] **T033** Implement POST /api/encounter-tables/[id]/roll route
  - Path: `app/api/encounter-tables/[id]/roll/route.ts`
  - POST: Perform dice roll
  - Call rollDice() utility
  - Fetch entry by roll_number
  - Return entry with monster_snapshot
  - Allow public access (check is_public OR ownership)
  - **Expected**: T023 test now PASSES

- [ ] **T034** Implement PATCH /api/encounter-tables/[id]/share route
  - Path: `app/api/encounter-tables/[id]/share/route.ts`
  - PATCH: Toggle is_public status
  - Generate slug if making public (call generateUniqueSlug)
  - Keep slug if making private (for potential re-public)
  - Validate ownership
  - **Expected**: T024 test now PASSES

- [ ] **T035** Implement GET /api/encounter-tables/public/[slug] route
  - Path: `app/api/encounter-tables/public/[slug]/route.ts`
  - GET: Fetch table by public_slug
  - Check is_public = true
  - Include entries
  - No auth required
  - **Expected**: T025 test now PASSES

- [ ] **T036** Implement POST /api/encounter-tables/public/[slug]/copy route
  - Path: `app/api/encounter-tables/public/[slug]/copy/route.ts`
  - POST: Copy public table to user's collection
  - Validate authenticated user
  - Duplicate table (new UUID, user_id = current user)
  - Duplicate all entries
  - Set is_public = false, public_slug = null
  - **Expected**: T026 test now PASSES

- [ ] **T037** Add error handling middleware for all routes
  - Path: All route files from T027-T036
  - Wrap handlers in try-catch
  - Log errors with context
  - Return proper HTTP status codes
  - Format error responses per OpenAPI spec

---

## Phase 3.7: Frontend Utilities (T038-T040)

- [ ] **T038** [P] Implement dice rolling animation hook
  - Path: `lib/encounter-tables/hooks/useDiceRoll.ts`
  - Hook: `useDiceRoll(dieSize: number, onComplete: (result: number) => void)`
  - State: rolling (boolean), displayValue (number | null)
  - Animation: 20 frames over ~1 second
  - Return: { rolling, displayValue, roll() }
  - Use requestAnimationFrame for smooth 60fps

- [ ] **T039** [P] Implement form helpers for filters
  - Path: `lib/encounter-tables/utils/form-helpers.ts`
  - Function: `getDefaultFilters(): EncounterTableFilters`
  - Function: `validateFilters(filters: EncounterTableFilters): ValidationResult`
  - Function: `serializeFilters(filters): string` for URL params
  - Function: `deserializeFilters(params): EncounterTableFilters`

- [ ] **T040** [P] Implement client-side error handling
  - Path: `lib/encounter-tables/utils/error-handlers.ts`
  - Function: `handleApiError(error: unknown): UserFriendlyError`
  - Map API errors to user messages
  - Handle network errors
  - Handle validation errors (Zod)
  - Export error message constants

---

## Phase 3.8: React Components (T041-T047)

- [ ] **T041** [P] Create EncounterTableForm component
  - Path: `components/encounter-tables/EncounterTableForm.tsx`
  - Props: `onSubmit`, `initialValues?`, `mode: 'create' | 'edit'`
  - Form fields: name, description, die_size, filters (sources, level range, alignments, movement, search)
  - Use React Hook Form + Zod schema
  - Mantine UI form components (TextInput, Select, Checkbox, NumberInput)
  - Show validation errors inline
  - Submit button disabled during submission

- [ ] **T042** [P] Create MonsterFilterPanel component
  - Path: `components/encounter-tables/MonsterFilterPanel.tsx`
  - Props: `filters`, `onChange`
  - Collapsible panel with filter controls
  - Checkboxes for sources, alignments, movement types
  - Range sliders for level (1-20)
  - Search text input with debounce
  - "Reset Filters" button
  - Show count of matching monsters (optional)

- [ ] **T043** [P] Create DiceRoller component
  - Path: `components/encounter-tables/DiceRoller.tsx`
  - Props: `dieSize`, `onRoll: (result: number) => void`
  - Use useDiceRoll hook
  - Button: "Roll d{dieSize}"
  - Animation: Display random numbers during roll
  - Final result: Large, highlighted number
  - Disabled state during animation
  - CSS animation for dice tumbling effect

- [ ] **T044** [P] Create TableEntryList component
  - Path: `components/encounter-tables/TableEntryList.tsx`
  - Props: `entries`, `highlightedRoll?`, `onEditEntry`, `onViewMonster`
  - Display entries in grid or list (responsive)
  - Each entry shows: roll number, monster name, challenge level
  - Highlight entry if matches highlightedRoll
  - Edit button per entry (owner only)
  - Click entry to view monster details

- [ ] **T045** [P] Create MonsterDetailPanel component
  - Path: `components/encounter-tables/MonsterDetailPanel.tsx`
  - Props: `monsterSnapshot`, `onClose`, `onFavorite?`
  - Display full monster stat block from snapshot
  - Reuse existing monster detail components if available
  - Show all fields: stats, attacks, abilities, traits, treasure
  - Favorite button (heart icon) if onFavorite provided
  - Close button to dismiss panel
  - Responsive: Drawer on mobile, modal on desktop

- [ ] **T046** [P] Create ShareDialog component
  - Path: `components/encounter-tables/ShareDialog.tsx`
  - Props: `table`, `onTogglePublic`, `onClose`
  - Toggle switch: Public / Private
  - If public: Display shareable URL
  - "Copy Link" button (clipboard API)
  - Warning when making private
  - Close button

- [ ] **T047** [P] Create TableCard component
  - Path: `components/encounter-tables/TableCard.tsx`
  - Props: `table`, `onView`, `onEdit`, `onDelete`, `onShare`
  - Card layout with table info:
    - Name (heading)
    - Description (truncated)
    - Die size badge (e.g., "d20")
    - Entry count (e.g., "20 entries")
    - Created date
  - Action buttons: View, Settings, Delete, Share
  - Public indicator if is_public = true

---

## Phase 3.9: Next.js Pages (T048-T052)

- [ ] **T048** [P] Create encounter tables list page
  - Path: `app/encounter-tables/page.tsx`
  - Server Component: Fetch user's tables
  - Display grid of TableCard components
  - "Create New Table" button (prominent if empty state)
  - Pagination if many tables
  - Filter/sort controls (name, created date)

- [ ] **T049** [P] Create new table page
  - Path: `app/encounter-tables/new/page.tsx`
  - Client Component with EncounterTableForm
  - Handle form submission (POST /api/encounter-tables)
  - Show loading state during generation
  - Redirect to table detail on success
  - Show error if insufficient monsters

- [ ] **T050** [P] Create table detail page
  - Path: `app/encounter-tables/[id]/page.tsx`
  - Server Component: Fetch table + entries
  - DiceRoller component at top
  - TableEntryList component
  - MonsterDetailPanel (conditional, based on roll result)
  - "Settings" button (goes to settings page)
  - "Share" button (opens ShareDialog)
  - Handle roll action (POST /api/encounter-tables/[id]/roll)

- [ ] **T051** [P] Create table settings page
  - Path: `app/encounter-tables/[id]/settings/page.tsx`
  - Client Component with EncounterTableForm (edit mode)
  - Load existing table data
  - Update button (PATCH /api/encounter-tables/[id])
  - "Regenerate Table" button (POST /api/encounter-tables/[id]/generate)
  - Delete button in danger zone (DELETE /api/encounter-tables/[id])
  - Confirmation modals for destructive actions

- [ ] **T052** [P] Create public table view page
  - Path: `app/encounter-tables/public/[slug]/page.tsx`
  - Server Component: Fetch by public_slug (no auth required)
  - Show table name, description, die size
  - DiceRoller component (roll works without auth)
  - TableEntryList component (read-only)
  - MonsterDetailPanel (view only, no favorite button if not authed)
  - "Copy to My Tables" button (authenticated users only)
  - Handle copy action (POST /api/encounter-tables/public/[slug]/copy)

---

## Phase 3.10: E2E Tests (T053-T058)

- [ ] **T053** [P] E2E test: Create table and roll
  - Path: `__tests__/e2e/encounter-tables-create-roll.spec.ts`
  - Flow: Login → Navigate to /encounter-tables/new → Fill form → Generate → Roll dice → View monster
  - Assert: Table created, entries visible, roll animation works, monster details displayed
  - Covers: Scenarios 1, 2, 3 from quickstart.md

- [ ] **T054** [P] E2E test: Edit and regenerate table
  - Path: `__tests__/e2e/encounter-tables-edit.spec.ts`
  - Flow: Create table → Go to settings → Update filters → Regenerate → Replace single entry
  - Assert: Filters updated, regeneration uses new filters, single entry replaced
  - Covers: Scenarios 4, 5, 6, 7 from quickstart.md

- [ ] **T055** [P] E2E test: Share table publicly
  - Path: `__tests__/e2e/encounter-tables-share.spec.ts`
  - Flow: Create table → Share → Copy public URL → Open in incognito → View and roll
  - Assert: Public URL accessible, works without auth, no edit buttons for guest
  - Covers: Scenarios 8, 9, 10 from quickstart.md

- [ ] **T056** [P] E2E test: Copy public table
  - Path: `__tests__/e2e/encounter-tables-copy.spec.ts`
  - Flow: User A shares table → User B logs in → Copies table → Edits copy → User A's original unchanged
  - Assert: Copy independent, has all entries, can be modified
  - Covers: Scenario 11, 12 from quickstart.md

- [ ] **T057** [P] E2E test: Error handling
  - Path: `__tests__/e2e/encounter-tables-errors.spec.ts`
  - Flow: Try to create table with impossible filters → Assert error message
  - Flow: Try custom die size out of range → Assert validation error
  - Covers: Scenarios 13, 14 from quickstart.md

- [ ] **T058** [P] E2E test: Performance benchmarks
  - Path: `__tests__/e2e/encounter-tables-performance.spec.ts`
  - Test: Generate d100 table (100 entries) in < 3 seconds
  - Test: Page load with 100 entries in < 2 seconds
  - Test: Search/filter query in < 500ms
  - Test: Dice animation exactly ~1 second
  - Covers: Performance benchmarks from quickstart.md

---

## Phase 3.11: Polish (T059-T061)

- [ ] **T059** [P] Add unit tests for utilities
  - Path: `__tests__/unit/encounter-tables/`
  - Test: filter-monsters.test.ts (all filter combinations)
  - Test: generate-slug.test.ts (collision handling)
  - Test: roll-dice.test.ts (distribution, range)
  - Test: create-snapshot.test.ts (monster not found)
  - Test: form-helpers.test.ts (validation, serialization)
  - Coverage target: 80% for utilities

- [ ] **T060** [P] Update documentation
  - Path: `README.md` and `docs/features/encounter-tables.md`
  - Add feature description
  - Add user guide (how to create, roll, share)
  - Add API endpoint documentation
  - Add database schema diagram
  - Include screenshots (if available)

- [ ] **T061** Run manual testing checklist from quickstart.md
  - Path: `specs/002-random-encounter-tables/quickstart.md`
  - Execute all 14 scenarios manually
  - Execute all 8 edge case tests
  - Verify all 4 performance benchmarks
  - Run accessibility checks (keyboard nav, screen reader)
  - Document any issues found

---

## Dependencies

### Critical Path

```
T001-T003 (Setup)
  ↓
T004-T007 (Database)
  ↓
T008-T010 (Types/Schemas) [can run parallel]
  ↓
T011-T015 (Backend Utils) [can run parallel after types]
  ↓
T016-T026 (Contract Tests - MUST FAIL) [can run parallel]
  ↓
T027-T037 (API Routes - Make tests pass)
  ↓
T038-T040 (Frontend Utils) [parallel]
  ↓
T041-T047 (Components) [parallel after utils]
  ↓
T048-T052 (Pages) [parallel after components]
  ↓
T053-T058 (E2E Tests) [parallel after pages]
  ↓
T059-T061 (Polish) [parallel]
```

### Detailed Dependencies

- **Database before everything**: T004-T007 block all code tasks
- **Types before utilities**: T008-T010 block T011-T015
- **Utilities before tests**: T011-T015 block T016-T026
- **Tests before implementation**: T016-T026 MUST complete before T027-T037
- **API routes before components**: T027-T037 block T041-T047 (need working API)
- **Components before pages**: T041-T047 block T048-T052
- **Pages before E2E**: T048-T052 block T053-T058
- **Everything before polish**: T001-T058 block T059-T061

### Parallel Execution Groups

**Group 1: Database Setup (Sequential)**

```bash
# T004 → T005 → T006 → T007 (same migration file)
Task: "Create database migration for encounter_tables"
```

**Group 2: Types (Parallel after DB)**

```bash
Task: "Create TypeScript type definitions in lib/encounter-tables/types.ts"
Task: "Create Zod validation schemas in lib/encounter-tables/schemas.ts"
Task: "Create database query helpers in lib/encounter-tables/queries.ts"
```

**Group 3: Backend Utils (Parallel after types)**

```bash
Task: "Implement monster filtering in lib/encounter-tables/utils/filter-monsters.ts"
Task: "Implement snapshot creation in lib/encounter-tables/utils/create-snapshot.ts"
Task: "Implement slug generation in lib/encounter-tables/utils/generate-slug.ts"
Task: "Implement table generation in lib/encounter-tables/utils/generate-table.ts"
Task: "Implement dice roll in lib/encounter-tables/utils/roll-dice.ts"
```

**Group 4: Contract Tests (Parallel after utils) - MUST FAIL**

```bash
Task: "Contract test GET /api/encounter-tables in __tests__/integration/encounter-tables/list.test.ts"
Task: "Contract test POST /api/encounter-tables in __tests__/integration/encounter-tables/create.test.ts"
Task: "Contract test GET /api/encounter-tables/[id] in __tests__/integration/encounter-tables/get-by-id.test.ts"
# ... (all 11 contract tests T016-T026)
```

**Group 5: API Routes (Sequential within each endpoint, but endpoints can be parallel)**

```bash
# Each route file can be done in parallel, but GET/PATCH/DELETE for same [id] should be sequential
Task: "Implement GET/POST /api/encounter-tables route in app/api/encounter-tables/route.ts"
Task: "Implement GET/PATCH/DELETE /api/encounter-tables/[id] in app/api/encounter-tables/[id]/route.ts"
Task: "Implement POST /api/encounter-tables/[id]/generate in app/api/encounter-tables/[id]/generate/route.ts"
# ... (all 11 routes T027-T037)
```

**Group 6: Frontend Utils (Parallel after API routes)**

```bash
Task: "Implement dice animation hook in lib/encounter-tables/hooks/useDiceRoll.ts"
Task: "Implement form helpers in lib/encounter-tables/utils/form-helpers.ts"
Task: "Implement error handlers in lib/encounter-tables/utils/error-handlers.ts"
```

**Group 7: Components (Parallel after frontend utils)**

```bash
Task: "Create EncounterTableForm in components/encounter-tables/EncounterTableForm.tsx"
Task: "Create MonsterFilterPanel in components/encounter-tables/MonsterFilterPanel.tsx"
Task: "Create DiceRoller in components/encounter-tables/DiceRoller.tsx"
Task: "Create TableEntryList in components/encounter-tables/TableEntryList.tsx"
Task: "Create MonsterDetailPanel in components/encounter-tables/MonsterDetailPanel.tsx"
Task: "Create ShareDialog in components/encounter-tables/ShareDialog.tsx"
Task: "Create TableCard in components/encounter-tables/TableCard.tsx"
```

**Group 8: Pages (Parallel after components)**

```bash
Task: "Create list page in app/encounter-tables/page.tsx"
Task: "Create new table page in app/encounter-tables/new/page.tsx"
Task: "Create detail page in app/encounter-tables/[id]/page.tsx"
Task: "Create settings page in app/encounter-tables/[id]/settings/page.tsx"
Task: "Create public view page in app/encounter-tables/public/[slug]/page.tsx"
```

**Group 9: E2E Tests (Parallel after pages)**

```bash
Task: "E2E test create and roll in __tests__/e2e/encounter-tables-create-roll.spec.ts"
Task: "E2E test edit and regenerate in __tests__/e2e/encounter-tables-edit.spec.ts"
Task: "E2E test share publicly in __tests__/e2e/encounter-tables-share.spec.ts"
Task: "E2E test copy table in __tests__/e2e/encounter-tables-copy.spec.ts"
Task: "E2E test error handling in __tests__/e2e/encounter-tables-errors.spec.ts"
Task: "E2E test performance in __tests__/e2e/encounter-tables-performance.spec.ts"
```

**Group 10: Polish (Parallel after all implementation)**

```bash
Task: "Add unit tests in __tests__/unit/encounter-tables/"
Task: "Update documentation in README.md and docs/"
Task: "Run manual testing from quickstart.md"
```

---

## Notes

- **TDD Enforcement**: Contract tests (T016-T026) MUST fail before implementing routes (T027-T037)
- **File Conflicts**: Tasks marked [P] are independent files with no conflicts
- **Sequential Tasks**: API routes for same endpoint path share files, so PATCH/DELETE must wait for GET
- **Commit Strategy**: Commit after each major phase (setup, database, types, tests, routes, components, pages)
- **Migration**: T004-T007 should be in single migration file for atomic deployment
- **Slug Generation**: T013 requires nanoid installed (T001)
- **Testing**: Run `npm test` after each phase to ensure tests pass/fail as expected
- **Parallel Execution**: Use Task agent with multiple tasks in single message for parallel [P] tasks

---

## Validation Checklist

_GATE: Review before marking tasks.md as complete_

- [x] All 11 API endpoints have contract tests (T016-T026)
- [x] All 11 API endpoints have implementation tasks (T027-T037)
- [x] Both entities (encounter_tables, encounter_table_entries) in database migration (T004)
- [x] All tests come before implementation (T016-T026 before T027-T037)
- [x] Parallel tasks [P] are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task in same group
- [x] Critical path dependencies documented
- [x] TDD order enforced (tests fail → implement → tests pass)
- [x] E2E tests cover all 14 quickstart scenarios (T053-T058)
- [x] Performance benchmarks included (T058)
- [x] Total task count matches estimate from plan.md (~59 tasks ✓ 61 tasks)

---

## Success Criteria

**Feature is complete when**:

- ✅ All 61 tasks checked off
- ✅ All contract tests passing (T016-T026)
- ✅ All E2E tests passing (T053-T058)
- ✅ Manual quickstart testing complete (T061)
- ✅ No console errors in browser
- ✅ Database migration applied successfully
- ✅ RLS policies verified (unauthorized access blocked)
- ✅ Performance benchmarks met (<2s loads, <500ms queries, <300ms DB)
- ✅ Code coverage ≥40% (target from constitution)

**Ready for production when**:

- All success criteria met
- Code review approved
- Documentation updated
- Branch merged to main
- Deployed to staging and tested
- Performance validated in production-like environment

---

_Generated from design documents on 2025-10-22_
_Based on: plan.md, data-model.md, contracts/openapi.yaml, quickstart.md, research.md_
