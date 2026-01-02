# Implementation Plan: Magic Item Cards in Decks

**Branch**: `018-we-already-have` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-we-already-have/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path ✓
2. Fill Technical Context ✓
3. Fill Constitution Check ✓
4. Evaluate Constitution Check ✓ - PASS
5. Execute Phase 0 → research.md ✓
6. Execute Phase 1 → contracts, data-model.md, quickstart.md ✓
7. Re-evaluate Constitution Check ✓ - PASS
8. Plan Phase 2 → Describe task generation approach ✓
9. STOP - Ready for /tasks command
```

## Summary

Extend deck feature to support magic item cards alongside spells. Requires:

- Database schema change: add `item_type` and `magic_item_id` columns to `deck_items`
- New API endpoint for adding magic items to decks
- MagicItemSelector component (parallel to SpellSelector)
- MagicItemCardPreview component for printable card preview
- PDF generator updates for magic item cards

## Technical Context

**Language/Version**: TypeScript 5, Next.js 15 (App Router), React 19
**Primary Dependencies**: @react-pdf/renderer, @tanstack/react-query, shadcn/ui, Zod 4
**Storage**: Supabase (PostgreSQL with RLS)
**Testing**: Vitest, Playwright
**Target Platform**: Web (Vercel deployment)
**Project Type**: Web (Next.js fullstack)
**Performance Goals**: <2s page load, <500ms search
**Constraints**: 52 cards max per deck (combined spells + magic items)
**Scale/Scope**: ~100 magic items, ~120 spells, personal user decks

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle               | Status  | Notes                                                          |
| ----------------------- | ------- | -------------------------------------------------------------- |
| I. Component-First      | ✅ PASS | MagicItemSelector, MagicItemCardPreview as reusable components |
| II. API-First           | ✅ PASS | New endpoint POST /api/decks/[id]/magic-items                  |
| III. Test-First         | ✅ PASS | Tests planned for new components and API routes                |
| IV. Integration Testing | ✅ PASS | E2E test for add magic item to deck flow                       |
| V. Simplicity           | ✅ PASS | Follows existing spell pattern, minimal new code               |
| VI. Data Integrity      | ✅ PASS | Zod validation, DB constraints for 52 card limit               |
| VII. Community Safety   | ⬜ N/A  | Personal decks, no sharing                                     |

## Project Structure

### Documentation (this feature)

```
specs/018-we-already-have/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (/tasks command)
```

### Source Code Changes

```
# Database
supabase/migrations/YYYYMMDD_add_magic_items_to_decks.sql

# API Routes
app/api/decks/[id]/magic-items/route.ts          # New: add magic item to deck
app/api/decks/[id]/route.ts                      # Modify: include magic items in GET
app/api/decks/[id]/export/route.ts               # Modify: include magic item cards

# Components
components/deck/MagicItemSelector.tsx            # New: selector sheet
components/deck/MagicItemCard.tsx                # New: deck list item display
components/deck/MagicItemCardPreview.tsx         # New: printable card preview
components/deck/MagicItemCardPreviewReact.tsx    # New: React preview
components/pdf/MagicItemCard.tsx                 # New: PDF card component

# Validation
lib/validations/deck.ts                          # Modify: add magic item schemas

# Pages
app/dashboard/decks/[id]/page.tsx                # Modify: show magic items, add selector
app/dashboard/decks/[id]/MagicItemTable.tsx      # New: magic item table in deck
```

**Structure Decision**: Extending existing web application structure

## Phase 0: Outline & Research

### Research Completed

1. **Current Deck Architecture**
   - `deck_items` table stores `spell_id` only
   - Spells fetched from `official_spells` and `user_spells` tables
   - SpellSelector component handles spell search/add
   - PDF generator uses SpellCardPDF component

2. **Magic Item Tables**
   - `official_magic_items`: 94 items with name, slug, description, traits[]
   - `user_magic_items`: user-created items, same structure
   - `all_magic_items` view: combines both tables

3. **Design Decision: Schema Approach**
   - **Option A**: Add `item_type` + `magic_item_id` columns (nullable spell_id)
   - **Option B**: Create separate `deck_magic_items` junction table
   - **Chosen**: Option A - simpler, maintains single query for deck contents

**Output**: research.md

## Phase 1: Design & Contracts

### Data Model

**Modified Tables:**

`deck_items` (modified):

- Add `item_type` column: 'spell' | 'magic_item' (default 'spell')
- Add `magic_item_id` column: UUID (nullable)
- Make `spell_id` nullable
- Add constraint: exactly one of spell_id/magic_item_id must be set

**Output**: data-model.md

### API Contracts

**New Endpoint:**

```
POST /api/decks/[id]/magic-items
Body: { magic_item_id: string }
Response: DeckWithCount
Errors: 401 (unauth), 404 (deck/item not found), 400 (deck full)
```

**Modified Endpoints:**

```
GET /api/decks/[id]
Response: Extended to include magic_items[] alongside spells[]

POST /api/decks/[id]/export
Now includes magic item cards in PDF output
```

**Output**: contracts/api-contracts.md

### Test Scenarios

1. User adds official magic item to deck → item appears in deck
2. User adds custom magic item to deck → item appears in deck
3. User removes magic item from deck → item removed
4. Deck reaches 52 cards (mixed) → reject additional items
5. Export mixed deck to PDF → both card types render

**Output**: quickstart.md

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Migration task for schema changes
- API route tasks (create magic-items route, modify deck route)
- Component tasks (MagicItemSelector, previews, PDF)
- Integration tasks (wire up to deck detail page)
- Test tasks per TDD principle

**Ordering Strategy**:

1. Database migration first
2. Zod schemas/types
3. API routes (can parallelize new + modify)
4. Components (can parallelize selector, preview, PDF)
5. Page integration
6. E2E tests

**Estimated Output**: ~15-20 tasks

## Complexity Tracking

_No violations - design follows existing patterns_

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research complete
- [x] Phase 1: Design complete
- [x] Phase 2: Task planning complete (approach described)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none)

---

_Based on Constitution v1.4.0 - See `.specify/memory/constitution.md`_
