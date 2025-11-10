# Tasks: Spell Card Deck Builder

**Input**: Design documents from `/specs/008-deck-building-for/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/decks-api.md, quickstart.md

## Execution Summary

This tasks file contains 35 numbered tasks across 5 phases:

- **Setup** (3 tasks): Dependencies, DB structure
- **Tests First** (8 tasks): Contract tests only (E2E skipped per user request)
- **Core Implementation** (15 tasks): Migrations, API routes, components, PDF generation
- **Integration** (6 tasks): Auth, validation, cascade behavior, auto-save
- **Polish** (3 tasks): Performance, manual testing, cleanup

**TDD Order**: All Phase 3.2 tests MUST be written and failing before ANY Phase 3.3 implementation begins.

## Path Conventions

Next.js App Router structure (web application):

- API Routes: `app/api/decks/**`
- Pages: `app/decks/**`
- Components: `components/deck/**`, `components/pdf/**`
- Lib: `lib/validations/**, `lib/pdf/\*\*`
- DB Migrations: `supabase/migrations/**`
- Tests: `__tests__/api/decks/**`, `__tests__/e2e/decks.spec.ts`

## Phase 3.1: Setup

- [ ] **T001** Install @react-pdf/renderer dependency

  ```bash
  npm install @react-pdf/renderer@^3.1.0
  ```

  **Files**: `package.json`

- [ ] **T002** [P] Install @tanstack/react-query and @tanstack/react-virtual for optimistic updates and virtual scrolling

  ```bash
  npm install @tanstack/react-query@^5.89.0 @tanstack/react-virtual@^3.0.0
  ```

  **Files**: `package.json`

- [ ] **T003** [P] Create database migration file structure
  ```bash
  mkdir -p supabase/migrations
  ```
  Prepare for migrations T010-T014.

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

**NOTE**: E2E tests skipped per user request. Manual testing via quickstart.md instead.

### Contract Tests (API Endpoints)

- [ ] **T004** [P] Contract test GET /api/decks in `__tests__/api/decks/list.test.ts`
  - Test authenticated user gets their decks list
  - Test returns correct schema: `{ decks: [], total: number }`
  - Test 401 for unauthenticated
  - Test sorting by updated/created/name
  - MUST FAIL (endpoint doesn't exist yet)

- [ ] **T005** [P] Contract test POST /api/decks in `__tests__/api/decks/create.test.ts`
  - Test creates deck with valid name
  - Test returns 201 with deck object
  - Test 400 for missing/empty name
  - Test 401 for unauthenticated
  - MUST FAIL (endpoint doesn't exist yet)

- [ ] **T006** [P] Contract test GET /api/decks/[id] in `__tests__/api/decks/get-by-id.test.ts`
  - Test returns deck with spells array
  - Test 404 for non-existent deck
  - Test 401 for non-owner
  - Test correct spell data structure
  - MUST FAIL (endpoint doesn't exist yet)

- [ ] **T007** [P] Contract test PUT /api/decks/[id] in `__tests__/api/decks/update.test.ts`
  - Test updates deck name
  - Test updates spell_ids (replaces entire list)
  - Test 400 for >52 spells
  - Test 409 for duplicate spells
  - Test 401 for non-owner
  - MUST FAIL (endpoint doesn't exist yet)

- [ ] **T008** [P] Contract test DELETE /api/decks/[id] in `__tests__/api/decks/delete.test.ts`
  - Test returns 204 on success
  - Test 404 for non-existent deck
  - Test 401 for non-owner
  - Test cascade deletes deck_items
  - MUST FAIL (endpoint doesn't exist yet)

- [ ] **T009** [P] Contract test POST /api/decks/[id]/spells in `__tests__/api/decks/add-spell.test.ts`
  - Test adds spell to deck
  - Test 400 for 53rd spell
  - Test 409 for duplicate spell
  - Test 400 for invalid spell_id
  - MUST FAIL (endpoint doesn't exist yet)

- [ ] **T010** [P] Contract test DELETE /api/decks/[id]/spells/[spell_id] in `__tests__/api/decks/remove-spell.test.ts`
  - Test removes spell from deck
  - Test 404 for spell not in deck
  - Test 401 for non-owner
  - MUST FAIL (endpoint doesn't exist yet)

- [ ] **T011** [P] Contract test POST /api/decks/[id]/export in `__tests__/api/decks/export.test.ts`
  - Test returns PDF blob for "grid" layout
  - Test returns PDF blob for "single" layout
  - Test 400 for empty deck
  - Test 400 for invalid layout
  - Test Content-Type: application/pdf
  - MUST FAIL (endpoint doesn't exist yet)

### Integration Tests (User Workflows) - SKIPPED PER USER REQUEST

E2E tests skipped for this feature. Manual testing via quickstart.md scenarios instead.

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Database Schema

- [ ] **T012** [P] Create decks table migration in `supabase/migrations/YYYYMMDDHHMMSS_create_decks_table.sql`
  - Table: id, user_id, name, created_at, updated_at
  - Foreign key: user_id → auth.users(id) ON DELETE CASCADE
  - Check constraint: name length > 0, < 100
  - Index on user_id
  - Index on updated_at DESC
  - Run tests: T004, T005 should now pass for DB operations

- [ ] **T013** [P] Create deck_items table migration in `supabase/migrations/YYYYMMDDHHMMSS_create_deck_items_table.sql`
  - Table: id, deck_id, spell_id, position, added_at
  - Foreign key: deck_id → decks(id) ON DELETE CASCADE
  - Unique constraint: (deck_id, spell_id)
  - Index on deck_id
  - Index on spell_id
  - Run tests: T009, T010 should now pass for DB operations

- [ ] **T014** [P] Create deck RLS policies migration in `supabase/migrations/YYYYMMDDHHMMSS_add_deck_rls_policies.sql`
  - Enable RLS on decks table
  - Policy: Users can view own decks (SELECT)
  - Policy: Users can create own decks (INSERT)
  - Policy: Users can update own decks (UPDATE)
  - Policy: Users can delete own decks (DELETE)
  - Run tests: T004-T008 should respect auth

- [ ] **T015** [P] Create deck_items RLS policies migration in `supabase/migrations/YYYYMMDDHHMMSS_add_deck_items_rls_policies.sql`
  - Enable RLS on deck_items table
  - Policy: Users can view items in own decks (SELECT)
  - Policy: Users can add items to own decks (INSERT)
  - Policy: Users can remove items from own decks (DELETE)
  - Run tests: T009, T010 should respect auth

- [ ] **T016** Create deck triggers migration in `supabase/migrations/YYYYMMDDHHMMSS_add_deck_triggers.sql`
  - Trigger: Update updated_at on deck modification
  - Function: check_deck_size_limit() - prevent >52 cards
  - Trigger: enforce_deck_size_limit on INSERT deck_items
  - Run tests: T014 should pass (52 card limit enforced)

### Validation Schemas

- [ ] **T017** [P] Create deck Zod schemas in `lib/validations/deck.ts`
  - DeckSchema (full object)
  - CreateDeckSchema (name only)
  - UpdateDeckSchema (optional name, optional spell_ids)
  - DeckWithItemsSchema (includes spells array)
  - AddSpellSchema (spell_id only)
  - Validate 52 max, unique spells, name requirements
  - Run tests: T005, T007, T009 validation should pass

### API Routes

- [ ] **T018** Implement GET /api/decks in `app/api/decks/route.ts`
  - Get authenticated user from Supabase
  - Query decks with spell counts
  - Support sort/order query params
  - Return 401 if not authenticated
  - Run tests: T004 should PASS

- [ ] **T019** Implement POST /api/decks in `app/api/decks/route.ts` (same file as T018)
  - Get authenticated user
  - Validate request body with CreateDeckSchema
  - Insert deck with user_id
  - Return 201 with created deck
  - Run tests: T005 should PASS

- [ ] **T020** Implement GET /api/decks/[id] in `app/api/decks/[id]/route.ts`
  - Parse params (await params in Next.js 15)
  - Get authenticated user
  - Query deck with all spells (LEFT JOIN official_spells, user_spells)
  - Verify ownership (RLS handles this)
  - Return 404 if not found
  - Run tests: T006 should PASS

- [ ] **T021** Implement PUT /api/decks/[id] in `app/api/decks/[id]/route.ts` (same file as T020)
  - Parse params
  - Get authenticated user
  - Validate request body with UpdateDeckSchema
  - If name: update deck name
  - If spell_ids: replace deck_items (DELETE + bulk INSERT)
  - Return 409 for duplicates, 400 for >52
  - Run tests: T007 should PASS

- [ ] **T022** Implement DELETE /api/decks/[id] in `app/api/decks/[id]/route.ts` (same file as T020, T021)
  - Parse params
  - Get authenticated user
  - Delete deck (CASCADE handles deck_items)
  - Return 204 on success
  - Run tests: T008 should PASS

- [ ] **T023** Implement POST /api/decks/[id]/spells in `app/api/decks/[id]/spells/route.ts`
  - Parse params
  - Get authenticated user
  - Validate AddSpellSchema
  - Check deck size < 52
  - Check spell not already in deck
  - Insert deck_item
  - Return 400 for size limit, 409 for duplicate
  - Run tests: T009 should PASS

- [ ] **T024** Implement DELETE /api/decks/[id]/spells/[spell_id] in `app/api/decks/[id]/spells/[spell_id]/route.ts`
  - Parse params (both id and spell_id)
  - Get authenticated user
  - Delete deck_item
  - Return 404 if not found
  - Run tests: T010 should PASS

### React Components

- [ ] **T025** [P] Create DeckList component in `components/deck/DeckList.tsx`
  - Display list of user's decks
  - Show name, spell_count, updated_at
  - "New Deck" button
  - "Delete" button per deck
  - Link to deck detail page
  - Use React Query for data fetching
  - Run tests: T012 deck list should render

- [ ] **T026** [P] Create DeckForm component in `components/deck/DeckForm.tsx`
  - React Hook Form + Zod validation
  - Name input (required, max 100 chars)
  - Submit handler (create deck)
  - Error display
  - Run tests: T012 deck creation should work

- [ ] **T027** [P] Create SpellSelector component in `components/deck/SpellSelector.tsx`
  - Virtual scrolling for spell list (@tanstack/react-virtual)
  - Search/filter spells
  - Disable already-added spells
  - "Add" button per spell
  - Show "Deck Full (52/52)" when at limit
  - Run tests: T013, T014 spell adding should work

- [ ] **T028** [P] Create SpellCard component in `components/deck/SpellCard.tsx`
  - Display spell name, level, duration, range, description
  - "Remove" button
  - Compact view for deck list
  - Expanded view for PDF preview
  - Run tests: T013 spells should display

### PDF Generation Components

- [ ] **T029** [P] Create SpellCardPDF component in `components/pdf/SpellCardPDF.tsx`
  - @react-pdf/renderer <View> component
  - Render spell data: name, level, duration, range, description
  - Exact dimensions: 2.5" x 3.5"
  - Text wrapping for description
  - StyleSheet for layout
  - Single-sided design
  - Export for use in PDFDocument

- [ ] **T030** [P] Create GridLayout component in `components/pdf/GridLayout.tsx`
  - @react-pdf/renderer <Page> component
  - Letter size (8.5" x 11")
  - 3x3 grid layout (9 cards)
  - Flexbox positioning
  - Use SpellCardPDF component per cell
  - Handle pagination (9 cards per page)
  - Export for use in PDFDocument

- [ ] **T031** [P] Create PDFDocument component in `components/pdf/PDFDocument.tsx`
  - @react-pdf/renderer <Document> wrapper
  - Accept: spells array, layout type
  - If layout="single": One SpellCardPDF per page (2.5"x3.5")
  - If layout="grid": GridLayout pages with 9 cards each
  - Export PDF blob
  - Run tests: T017, T018 PDF generation should work

- [ ] **T032** Implement POST /api/decks/[id]/export in `app/api/decks/[id]/export/route.ts`
  - Parse params
  - Get authenticated user
  - Fetch deck with all spells
  - Validate layout ("single" | "grid")
  - Return 400 for empty deck
  - Generate PDF using @react-pdf/renderer renderToBuffer
  - Return PDF blob with correct headers:
    - Content-Type: application/pdf
    - Content-Disposition: attachment; filename="<deck-name>.pdf"
  - Run tests: T011, T017, T018 should PASS

### Pages

- [ ] **T033** Create deck list page in `app/decks/page.tsx`
  - Server Component (fetch initial data)
  - Render DeckList component
  - "New Deck" button → /decks/new
  - Links to /decks/[id]
  - Run tests: T012 should PASS

- [ ] **T034** Create deck detail page in `app/decks/[id]/page.tsx`
  - Server Component (fetch deck with spells)
  - Editable deck name (inline edit)
  - Display spell cards
  - SpellSelector component (add spells)
  - "Export PDF" button (dialog for layout selection)
  - "Delete Deck" button
  - Real-time spell count
  - Run tests: T013, T014, T015, T016, T017, T018 should PASS

## Phase 3.4: Integration

- [ ] **T035** Add React Query provider in `app/layout.tsx`
  - Wrap children with QueryClientProvider
  - Configure staleTime (5 min), cacheTime (10 min)
  - Enable optimistic updates
  - Run tests: Optimistic UI should work

- [ ] **T036** Implement auto-save with useMutation in deck detail page
  - Debounce spell additions (500ms)
  - Optimistic update on add/remove
  - Rollback on error
  - Auto-save deck name on blur
  - Run tests: T016 should PASS (auto-save works)

- [ ] **T037** Add cascade delete test for spells
  - Delete spell from database
  - Verify deck_items removed automatically
  - Verify deck spell_count updated
  - Run tests: Quickstart Scenario 10

- [ ] **T038** Add dashboard link to deck builder
  - Update protected/page.tsx dashboard
  - Add "Deck Builder" card/link
  - Icon + description
  - Run tests: Navigation from dashboard works

- [ ] **T039** Add performance monitoring for PDF generation
  - Log PDF generation time (console.log for dev)
  - Alert if >3s for single, >5s for grid
  - Run tests: Performance benchmarks in quickstart.md

- [ ] **T040** Validate all Zod error messages are user-friendly
  - Test all validation paths
  - Ensure error.issues formatted correctly
  - Display in UI with toasts/forms
  - Run tests: All validation tests show good errors

## Phase 3.5: Polish

- [ ] **T041** [P] Manual testing via quickstart.md
  - Execute all 12 quickstart scenarios manually
  - Verify all acceptance criteria met
  - Verify 40%+ code coverage from contract tests
  - Document any issues found

- [ ] **T042** [P] Performance validation
  - Verify PDF generation <3s (single), <5s (grid)
  - Verify page load <2s
  - Verify real-time updates <100ms
  - Run benchmarks from quickstart.md

- [ ] **T043** [P] Code cleanup and refactoring
  - Remove console.logs
  - Extract duplicate code
  - Add TypeScript strict checks
  - Run: `npm run lint:fix`
  - Commit clean code

## Dependencies

### Critical Path (Must be Sequential)

1. Setup (T001-T003) before everything
2. Tests (T004-T018) before implementation (MUST FAIL FIRST)
3. Migrations (T012-T016) before API routes
4. Validation (T017) before API routes
5. API routes (T018-T024) before components
6. Components (T025-T031) before pages
7. Pages (T033-T034) before integration
8. Integration (T035-T040) before polish

### Blocking Dependencies

- T012-T016 (migrations) block T018-T024 (API routes need DB)
- T017 (validation) blocks T018-T024 (API routes need schemas)
- T018-T024 (API routes) block T025-T034 (components need endpoints)
- T029-T031 (PDF components) block T032 (PDF endpoint)
- T025-T034 (components/pages) block T035-T040 (integration needs UI)

### Can Run in Parallel

- All tests (T004-T018) [P] - different files
- All migrations (T012-T015) [P] - different files
- T017 (validation) [P] with T012-T015 (different concerns)
- All React components (T025-T031) [P] - different files
- All polish tasks (T041-T043) [P] - independent verification

## Parallel Execution Examples

### Phase 3.2: All Tests Together (8 parallel tasks)

```bash
# Launch all contract tests in parallel
Task(subagent_type="test-engineer", prompt="Write contract test GET /api/decks in __tests__/api/decks/list.test.ts. Test auth, schema, sorting. MUST FAIL.")
Task(subagent_type="test-engineer", prompt="Write contract test POST /api/decks in __tests__/api/decks/create.test.ts. Test create, validation, auth. MUST FAIL.")
Task(subagent_type="test-engineer", prompt="Write contract test GET /api/decks/[id] in __tests__/api/decks/get-by-id.test.ts. Test get with spells, 404, auth. MUST FAIL.")
# ... (all T004-T018)
```

### Phase 3.3: Database Migrations (5 parallel tasks)

```bash
Task(subagent_type="data-migration-specialist", prompt="Create decks table migration with columns, constraints, indexes per data-model.md")
Task(subagent_type="data-migration-specialist", prompt="Create deck_items table migration with foreign keys, unique constraint per data-model.md")
Task(subagent_type="data-migration-specialist", prompt="Create deck RLS policies for user ownership")
Task(subagent_type="data-migration-specialist", prompt="Create deck_items RLS policies for user ownership")
```

### Phase 3.3: React Components (7 parallel tasks)

```bash
Task(subagent_type="react-developer", prompt="Create DeckList component with React Query in components/deck/DeckList.tsx")
Task(subagent_type="react-developer", prompt="Create DeckForm component with React Hook Form + Zod in components/deck/DeckForm.tsx")
Task(subagent_type="react-developer", prompt="Create SpellSelector component with virtual scrolling in components/deck/SpellSelector.tsx")
Task(subagent_type="react-developer", prompt="Create SpellCard component in components/deck/SpellCard.tsx")
Task(subagent_type="react-developer", prompt="Create SpellCardPDF component with @react-pdf/renderer in components/pdf/SpellCardPDF.tsx")
Task(subagent_type="react-developer", prompt="Create GridLayout component with @react-pdf/renderer in components/pdf/GridLayout.tsx")
Task(subagent_type="react-developer", prompt="Create PDFDocument wrapper in components/pdf/PDFDocument.tsx")
```

## Success Criteria

- ✅ All 43 tasks completed
- ✅ All contract tests pass (E2E skipped - manual testing instead)
- ✅ 40%+ code coverage from contract tests
- ✅ All 12 quickstart scenarios validated manually
- ✅ Performance targets met (<3s PDF, <2s page load)
- ✅ Constitution principles satisfied
- ✅ Clean lint/format output

## Notes

- **TDD is non-negotiable**: Tests (T004-T018) MUST be written and MUST FAIL before ANY implementation
- **Next.js 15**: Always await params in dynamic routes
- **PDF Generation**: Use dynamic imports to avoid SSR issues
- **Supabase**: Use createClient() from @/lib/supabase/server (must await)
- **Zod Errors**: Use error.issues not error.errors
- **RLS**: Policies tested in development before deployment
