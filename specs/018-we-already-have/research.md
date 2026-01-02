# Research: Magic Item Cards in Decks

## Current Deck Architecture

### Database Schema

**`decks` table:**

- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `name` (text)
- `created_at`, `updated_at`

**`deck_items` table (current):**

- `id` (UUID, PK)
- `deck_id` (UUID, FK → decks)
- `spell_id` (UUID) - references official_spells or user_spells
- `position` (integer, nullable)
- `added_at` (timestamptz)

### Data Flow

1. User creates deck → `decks` table
2. User adds spell → `deck_items` table with spell_id
3. GET deck → fetch deck_items, then batch fetch spells from both tables
4. Export → generate PDF with SpellCardPDF component

### Existing Components

- `SpellSelector`: Sheet component for searching/adding spells
- `SpellCard`: Display component for spell in deck list
- `SpellCardPreview`: PDF preview (react-pdf)
- `SpellCardPreviewReact`: HTML/CSS preview
- `SpellCardPDF`: react-pdf component for export

## Magic Item Tables

**`official_magic_items`:**

- 94 items seeded
- Fields: id, name, slug, description, traits (JSONB array), image_url
- Traits format: `[{ name: "Benefit", description: "..." }, ...]`

**`user_magic_items`:**

- Same structure as official
- Additional: user_id, is_public, is_ai_generated

**`all_magic_items` view:**

- UNION of both tables
- Adds `item_type` ('official' | 'custom') discriminator

## Design Decision: Schema Approach

### Option A: Extend deck_items table

Add columns to existing `deck_items`:

- `item_type` ('spell' | 'magic_item')
- `magic_item_id` (nullable UUID)
- Make `spell_id` nullable
- CHECK constraint: exactly one ID must be set

**Pros:**

- Single table query for all deck contents
- Maintains order across all items
- Simpler RLS policies

**Cons:**

- More nullable columns
- Need migration for existing data

### Option B: Separate junction table

Create new `deck_magic_items` table with same structure.

**Pros:**

- Clean separation of concerns
- No migration needed for existing data

**Cons:**

- Two queries to fetch deck contents
- Harder to maintain order across types
- Duplicate trigger/policy logic

### Decision: Option A

Rationale: Existing code already handles mixed data sources (official_spells + user_spells). Adding magic items is same pattern. Single table makes ordering and count tracking simpler.

## Magic Item Card Design

### Content Fields

- Name (title)
- Description (main body)
- Traits (list of name:description pairs)
- Image (optional, Cloudinary URL)

### Card Layout (2.5" x 3.5")

Similar to spell card but adapted for magic item content:

- Title at top
- Image placeholder (if present)
- Description text
- Traits list at bottom

## API Design

### New Endpoint

```
POST /api/decks/[id]/magic-items
Body: { magic_item_id: UUID }
```

Follows same pattern as `/api/decks/[id]/spells`:

1. Auth check
2. Ownership check
3. Item existence check (official + user tables)
4. Deck limit check (52 total)
5. Insert to deck_items

### Modified Endpoint

```
GET /api/decks/[id]
Response: { ...deck, spells: [], magic_items: [], item_count: number }
```

Extends existing response to include magic items array.

## References

- Existing spell card implementation: `components/deck/SpellCard.tsx`
- Magic item display: `components/magic-items/MagicItemCard.tsx`
- PDF generation: `lib/pdf/generator.tsx`
