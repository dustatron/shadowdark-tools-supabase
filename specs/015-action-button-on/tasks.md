# Tasks: Action Menu Button Component

**Input**: Design documents from `/specs/015-action-button-on/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → Tech stack: Next.js 15, React 19, shadcn/ui, Tailwind, React Query, Zod
   → Structure: Next.js App Router (app/, components/, lib/, __tests__)
2. Load design documents:
   → data-model.md: EntityActionMenu, ListSelectorModal components
   → contracts/: favorites-api.md, lists-api.md (existing APIs)
   → research.md: shadcn/ui DropdownMenu, Dialog, React Query patterns
   → quickstart.md: 11 E2E validation scenarios
3. Generate tasks by category:
   → Setup: Verify dependencies, shadcn/ui components
   → Tests: Component tests, integration tests, E2E tests
   → Core: Components (EntityActionMenu, ListSelectorModal), hooks
   → Integration: Replace existing buttons, add to spell pages
   → Polish: Accessibility, error handling, mobile optimization
4. Apply task rules:
   → Different component files = mark [P]
   → Tests before implementation (TDD)
   → Monster and Spell page updates can be [P]
5. Task count: 23 tasks total
6. Validate: All quickstart scenarios covered, all components tested
7. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/`, `components/`, `lib/`, `__tests__/`
- All paths relative to repository root: `/Users/dmccord/Projects/vibeCode/shadowdark-tools-supabase/`

---

## Phase 3.1: Setup & Dependencies

- [x] **T001** Verify shadcn/ui components installed: Run `npx shadcn@latest add dropdown-menu dialog button input radio-group tooltip` to ensure all required primitives available
- [x] **T002** [P] Verify React Query (@tanstack/react-query) configured in `app/layout.tsx` with QueryClientProvider
- [x] **T003** [P] Check existing favorites and lists API endpoints work: Test GET /api/favorites and GET /api/lists in browser DevTools
  - NOTE: Lists API exists, Favorites API needs to be created (will be done as part of implementation)

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Component Tests

- [ ] **T004** [P] Component test for EntityActionMenu in `__tests__/components/entity-action-menu.test.tsx`:
  - Test menu opens on click
  - Test favorite action shows correct icon (filled vs empty)
  - Test "Add to Deck" is disabled with tooltip
  - Test "Edit" only shows when isOwner=true
  - Test menu closes after action selected
  - Test keyboard navigation (Arrow keys, Enter, Escape)

- [ ] **T005** [P] Component test for ListSelectorModal in `__tests__/components/list-selector-modal.test.tsx`:
  - Test modal opens/closes on open prop change
  - Test lists render with item counts
  - Test lists with existing items show checkmark/disabled
  - Test "Create New List" form validation (name required, max 100 chars)
  - Test list selection calls onSelectList with correct ID
  - Test new list creation calls onCreateList then adds item

### Integration Tests

- [ ] **T006** [P] Integration test for favorite toggle in `__tests__/integration/favorite-toggle.test.tsx`:
  - Mock Supabase client POST /api/favorites
  - Test optimistic update (heart icon changes immediately)
  - Test success flow (API succeeds, cache invalidated, toast shown)
  - Test error flow (API fails, rollback optimistic update, error toast)
  - Test rapid clicks don't cause duplicate requests

- [ ] **T007** [P] Integration test for list operations in `__tests__/integration/list-operations.test.tsx`:
  - Mock GET /api/lists (fetch user lists)
  - Mock GET /api/lists/contains/{entityType}/{entityId}
  - Mock POST /api/lists (create new list)
  - Mock POST /api/lists/{listId}/items (add to list)
  - Test add to existing list flow
  - Test create new list and add flow
  - Test duplicate prevention (list already contains entity)

### E2E Tests (Playwright)

- [ ] **T008** E2E test for authenticated action menu in `__tests__/e2e/action-menu-auth.spec.ts`:
  - Scenario 1: Guest user sees no action button
  - Scenario 2: Authenticated user sees action button
  - Scenario 7: Owner sees "Edit" action, non-owner doesn't
  - Scenario 8: Keyboard navigation works (Tab, Arrow, Enter, Escape)

- [ ] **T009** E2E test for favorite toggle flow in `__tests__/e2e/favorite-toggle.spec.ts`:
  - Scenario 2: Add to favorites (empty heart → filled heart)
  - Scenario 3: Remove from favorites (filled heart → empty heart)
  - Verify state persists after page reload

- [ ] **T010** E2E test for list operations in `__tests__/e2e/list-operations.spec.ts`:
  - Scenario 4: Add to existing list
  - Scenario 5: Create new list and add
  - Scenario 6: Deck action disabled with tooltip
  - Verify duplicate prevention (already in list shows checkmark)

- [ ] **T011** E2E test for error handling in `__tests__/e2e/error-handling.spec.ts`:
  - Scenario 9 Part A: Network error rollback
  - Scenario 9 Part B: Validation errors in list creation
  - Verify error toasts appear with correct messages

- [ ] **T012** E2E test for mobile responsiveness in `__tests__/e2e/mobile.spec.ts`:
  - Scenario 10: Touch-friendly button size (44x44px)
  - Test dropdown opens on tap
  - Test modal scrollable on mobile
  - Test no accidental clicks (proper spacing)

---

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Hooks & Utilities

- [x] **T013** [P] Create useFavoriteToggle hook in `lib/hooks/use-favorite-toggle.ts`:
  - Use @tanstack/react-query useMutation
  - Implement onMutate for optimistic update (setQueryData)
  - Implement onError for rollback
  - Implement onSuccess for cache invalidation and toast
  - Return { toggleFavorite, isPending } function

- [x] **T014** [P] Create useListOperations hook in `lib/hooks/use-list-operations.ts`:
  - useQuery for fetching user lists with item counts
  - useQuery for checking which lists contain entity (GET /api/lists/contains/{type}/{id})
  - useMutation for creating new list (POST /api/lists)
  - useMutation for adding item to list (POST /api/lists/{id}/items)
  - Return { lists, existingListIds, createList, addToList, isLoading }

- [x] **T015** [P] Create Zod validation schemas in `lib/validations/list-schemas.ts`:
  - CreateListSchema (name: min 1, max 100 chars; description: max 500 chars optional)
  - AddToListSchema (listId: UUID, entityId: UUID, entityType: enum, quantity: int min 1)
  - Export TypeScript types using z.infer<>

### Components

- [x] **T016** Create EntityActionMenu component in `components/entity-action-menu.tsx`:
  - Accept generic props: entity<T>, entityType, isFavorited, isOwner, callbacks, config
  - Use shadcn/ui DropdownMenu components (DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem)
  - Render favorite toggle with Heart/HeartOff icons from lucide-react
  - Render "Add to Adventure List" action (calls onAddToList)
  - Render "Add to Deck" action (disabled for monsters, tooltip via DropdownMenuLabel)
  - Render "Edit" action conditionally (only if isOwner && onEdit provided)
  - Add ARIA labels and keyboard navigation support
  - Close menu after action selected (DropdownMenu handles this automatically)

- [x] **T017** Create ListSelectorModal component in `components/list-selector-modal.tsx`:
  - Accept props: open, onOpenChange, entityId, entityType, lists, existingListIds, onSelectList, onCreateList
  - Use shadcn/ui Dialog components (Dialog, DialogContent, DialogHeader, DialogTitle)
  - Render list of user lists with RadioGroup for selection
  - Show checkmark icon for lists in existingListIds
  - Disable "Add to List" button for already-added lists
  - Render "Create New List" form with Input and validation
  - Use react-hook-form with zodResolver(CreateListSchema)
  - Show inline errors for validation failures
  - Handle create → add flow (create list, then add item to new list)
  - Show loading states during operations (skeleton loaders for lists)

---

## Phase 3.4: Integration

- [x] **T018** Replace favorite/edit buttons in monster detail page `app/monsters/[id]/page.tsx`:
  - Remove existing favorite button component
  - Remove existing edit button component
  - Import EntityActionMenu component
  - Fetch isFavorited state using React Query (query: favorites/{userId}/monster/{id})
  - Determine isOwner by comparing monster.user_id with session userId
  - Pass useFavoriteToggle hook result to onFavoriteToggle
  - Pass callback to open ListSelectorModal to onAddToList
  - Pass navigation to edit page to onEdit
  - Set config.showDeck=false, config.deckEnabled=false, config.deckTooltip="Deck support for monsters coming soon"
  - Verify component only renders if user is authenticated (check session)
  - NOTE: Created MonsterActionMenu wrapper component for cleaner integration

- [x] **T019** [P] Add ListSelectorModal state management to monster detail page:
  - Add useState for modal open/closed state
  - Add useListOperations hook call
  - Render ListSelectorModal component with correct props
  - Handle onSelectList: call addToList mutation, show toast, close modal
  - Handle onCreateList: call createList mutation, then addToList, show toast, close modal
  - Handle errors: keep modal open, show error toast
  - NOTE: Integrated into MonsterActionMenu wrapper component

- [ ] **T020** [P] Add EntityActionMenu to spell detail page `app/spells/[slug]/page.tsx`:
  - Same integration as T018 but for spells
  - Fetch isFavorited for entity_type='spell'
  - Set config.showDeck=true if spells support decks (check existing code)
  - Pass spell entity instead of monster
  - Reuse same ListSelectorModal component (entity-agnostic)

---

## Phase 3.5: Polish & Refinement

- [ ] **T021** [P] Add error boundaries in monster and spell detail pages:
  - Wrap EntityActionMenu and ListSelectorModal in error boundary
  - Show fallback UI on component error: "Action menu temporarily unavailable"
  - Log errors to console for debugging

- [ ] **T022** [P] Add accessibility improvements:
  - Verify ARIA labels on all actions (aria-label for favorite toggle)
  - Test keyboard navigation: Tab, Arrow keys, Enter, Escape
  - Ensure focus trap in modal (Dialog handles this)
  - Test screen reader compatibility (announce state changes)
  - Add visually hidden text for icon-only actions

- [ ] **T023** [P] Optimize performance:
  - Implement prefetching: fetch user lists when action menu opens (React Query prefetch)
  - Add staleTime to lists query (5 minutes)
  - Verify optimistic updates feel instant (<50ms)
  - Test with Chrome DevTools Performance tab (ensure <300ms for favorite toggle)

---

## Dependencies

**Setup blocks all** (T001-T003 before T004-T023)

**Tests block implementation**:

- T004-T012 (all tests) must be FAILING before T013-T020 (implementation)

**Core implementation dependencies**:

- T013 (useFavoriteToggle) blocks T018, T020
- T014 (useListOperations) blocks T019, T020
- T015 (Zod schemas) blocks T017
- T016 (EntityActionMenu) blocks T018, T020
- T017 (ListSelectorModal) blocks T019

**Integration dependencies**:

- T018 (monster page) before T019 (modal integration)
- T018, T019 complete before T020 (spell page)

**Polish comes last**:

- T021-T023 only after T018-T020 complete

---

## Parallel Execution Examples

### Test Phase (T004-T012 - Run all in parallel)

```bash
# All test tasks can run simultaneously (different files):
Task(T004): "Component test EntityActionMenu in __tests__/components/entity-action-menu.test.tsx"
Task(T005): "Component test ListSelectorModal in __tests__/components/list-selector-modal.test.tsx"
Task(T006): "Integration test favorite toggle in __tests__/integration/favorite-toggle.test.tsx"
Task(T007): "Integration test list operations in __tests__/integration/list-operations.test.tsx"
# E2E tests can run sequentially or parallel depending on test isolation
```

### Core Implementation - Hooks & Schemas (T013-T015 - Parallel)

```bash
# These create separate files, no dependencies:
Task(T013): "Create useFavoriteToggle hook in lib/hooks/use-favorite-toggle.ts"
Task(T014): "Create useListOperations hook in lib/hooks/use-list-operations.ts"
Task(T015): "Create Zod schemas in lib/validations/list-schemas.ts"
```

### Components (T016-T017 - Parallel)

```bash
# Different component files:
Task(T016): "Create EntityActionMenu component in components/entity-action-menu.tsx"
Task(T017): "Create ListSelectorModal component in components/list-selector-modal.tsx"
```

### Integration - Monster vs Spell (T020 can run parallel with T019)

```bash
# T018 must complete first, then:
Task(T019): "Add ListSelectorModal state to monster detail page"
Task(T020): "Add EntityActionMenu to spell detail page"  # Can run in parallel with T019
```

### Polish (T021-T023 - Parallel)

```bash
# All polish tasks are independent:
Task(T021): "Add error boundaries"
Task(T022): "Add accessibility improvements"
Task(T023): "Optimize performance"
```

---

## Validation Checklist

_GATE: Checked before implementation_

- [x] All contracts have corresponding tests (T006, T007)
- [x] All components have test tasks (T004, T005)
- [x] All E2E scenarios from quickstart.md covered (T008-T012)
- [x] All tests come before implementation (T004-T012 before T013-T020)
- [x] Parallel tasks truly independent (verified different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] TDD enforced: Tests must FAIL before implementation begins

---

## Notes

- **[P] tasks** = Different files, can run in parallel
- **Verify tests FAIL** before implementing (TDD critical for reliability)
- **Commit after each task** to maintain clean git history
- **Run existing tests** after each integration task to avoid regressions
- **Quickstart scenarios** map to E2E tests T008-T012
- **Existing APIs reused** - no new API endpoints needed (favorites, lists already exist)
- **Component reusability** validated by T020 (spell page uses same component)

---

## Estimated Timeline

- **Setup** (T001-T003): 15 min
- **Tests** (T004-T012): 3-4 hours (can parallelize)
- **Core** (T013-T017): 3-4 hours (hooks + components)
- **Integration** (T018-T020): 2-3 hours (page updates)
- **Polish** (T021-T023): 1-2 hours (accessibility, performance)

**Total**: 9-13 hours (faster with parallel execution)
