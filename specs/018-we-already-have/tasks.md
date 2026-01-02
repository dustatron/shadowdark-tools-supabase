# Tasks: Magic Item Cards in Decks

**Input**: Design documents from `/specs/018-we-already-have/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 3.1: Setup & Database

- [x] T001 Create migration `supabase/migrations/20260102000001_add_magic_items_to_deck_items.sql` with schema changes from data-model.md (add item_type, magic_item_id columns, constraints)
- [x] T002 Add Zod schemas to `lib/validations/deck.ts`: DeckItemType, AddMagicItemSchema, MagicItemForDeckSchema, DeckWithItemsSchema (see data-model.md TypeScript types)

## Phase 3.2: Tests First (TDD) - MUST COMPLETE BEFORE 3.3

**Contract Tests:**

- [x] T003 [P] Write test for POST /api/decks/[id]/magic-items in `__tests__/api/decks/magic-items.test.ts` - test add magic item, auth, 404, deck full
- [x] T004 [P] Write test for DELETE /api/decks/[id]/magic-items/[item_id] in `__tests__/api/decks/magic-items-delete.test.ts` - test remove, auth, 404
- [x] T005 [P] Write test for GET /api/decks/[id] response extension in `__tests__/api/decks/deck-detail.test.ts` - test magic_items[] in response

**Component Tests:**

- [x] T006 [P] Write test for MagicItemSelector in `__tests__/components/deck/MagicItemSelector.test.tsx` - test search, add, filter
- [x] T007 [P] Write test for MagicItemCardPreviewReact in `__tests__/components/deck/MagicItemCardPreviewReact.test.tsx` - test render name, description, traits

## Phase 3.3: API Implementation (ONLY after tests are failing)

- [x] T008 Create POST route `app/api/decks/[id]/magic-items/route.ts` - add magic item to deck (follows spell pattern)
- [x] T009 Create DELETE route `app/api/decks/[id]/magic-items/[item_id]/route.ts` - remove magic item from deck
- [x] T010 Modify GET route `app/api/decks/[id]/route.ts` - include magic_items[] in response alongside spells[]

## Phase 3.4: Components

**Preview Components (can parallelize):**

- [x] T011 [P] Create `components/deck/MagicItemCardPreviewReact.tsx` - React/HTML preview (follow SpellCardPreviewReact pattern)
- [x] T012 [P] Create `components/pdf/MagicItemCard.tsx` - react-pdf component for export (follow SpellCardPDF pattern)
- [x] T013 [P] Create `components/deck/MagicItemCardPreview.tsx` - PDF preview wrapper (follow SpellCardPreview pattern)

**Selector Component:**

- [x] T014 Create `components/deck/MagicItemSelector.tsx` - selector sheet with search/filters (follow SpellSelector pattern)

**Export component in index:**

- [x] T015 Export new components from `components/deck/index.ts`

## Phase 3.5: PDF Export Update

- [x] T016 Modify `lib/pdf/generator.tsx` - update generateDeckPDF to accept mixed items and render both SpellCardPDF and MagicItemCard

## Phase 3.6: Page Integration

- [x] T017 Modify `app/dashboard/decks/[id]/page.tsx` - add MagicItemSelector trigger, display magic items in preview, handle item_count
- [x] T018 Update deck detail to show both spells and magic items in combined list with type distinction

## Phase 3.7: Polish & E2E

- [ ] T019 [P] E2E test: add magic item to deck in `__tests__/e2e/deck-magic-items.spec.ts`
- [ ] T020 [P] E2E test: export mixed deck to PDF
- [ ] T021 Manual testing per quickstart.md checklist
- [x] T022 Run `npm run lint` and `npm run format` to ensure code quality

---

## Dependencies

```
T001 (migration) ──┬── T002 (schemas)
                   │
                   └── T003-T007 (tests) ─── T008-T010 (API)
                                                    │
                                                    └── T011-T015 (components) ─── T016 (PDF)
                                                                                       │
                                                                                       └── T017-T018 (page) ─── T019-T022 (polish)
```

- T001 must complete before any implementation
- T002 must complete before T008-T010
- Tests T003-T007 must fail before implementing T008-T018
- T008-T010 (API) before T017-T018 (page integration)
- T011-T015 (components) before T16-T17

## Parallel Execution Examples

```bash
# After T001-T002 complete, launch tests in parallel:
# T003, T004, T005, T006, T007 - all different files, no dependencies

# After API implementation, launch preview components in parallel:
# T011, T012, T013 - all different files
```

## Validation Checklist

- [x] All contracts have corresponding tests (T003-T005)
- [x] All Zod schemas defined before implementation (T002)
- [x] All tests come before implementation (T003-T007 before T008-T018)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
