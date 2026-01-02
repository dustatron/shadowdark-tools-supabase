# API Contracts: Magic Item Cards in Decks

## New Endpoints

### POST /api/decks/[id]/magic-items

Add a magic item to a deck.

**Request:**

```typescript
{
  magic_item_id: string; // UUID of official or user magic item
}
```

**Response (201):**

```typescript
{
  id: string,
  user_id: string,
  name: string,
  created_at: string,
  updated_at: string,
  item_count: number  // Total cards in deck
}
```

**Errors:**

- `401` - Authentication required
- `404` - Deck not found / Magic item not found
- `400` - Deck full (52 cards) / Validation error

### DELETE /api/decks/[id]/magic-items/[magic_item_id]

Remove a magic item from a deck.

**Response (204):** No content

**Errors:**

- `401` - Authentication required
- `404` - Deck not found / Item not in deck

---

## Modified Endpoints

### GET /api/decks/[id]

**Response (200) - Extended:**

```typescript
{
  id: string,
  user_id: string,
  name: string,
  created_at: string,
  updated_at: string,
  item_count: number,  // Changed from spell_count
  spells: SpellForDeck[],
  magic_items: MagicItemForDeck[]  // NEW
}

interface MagicItemForDeck {
  id: string,
  name: string,
  slug: string,
  description: string,
  traits: { name: string, description: string }[],
  image_url: string | null
}
```

### POST /api/decks/[id]/export

**Request (unchanged):**

```typescript
{
  layout: "grid" | "single";
}
```

**Behavior Change:**

- PDF now includes both spell cards and magic item cards
- Cards render in order they appear in deck_items (by added_at)
- Magic item cards use MagicItemCardPDF component

---

## Type Definitions

### MagicItemForDeck

```typescript
interface MagicItemForDeck {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: Trait[];
  image_url: string | null;
}

interface Trait {
  name: string;
  description: string;
}
```

### DeckWithItems (replaces DeckWithSpells)

```typescript
interface DeckWithItems {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  item_count: number;
  spells: SpellForDeck[];
  magic_items: MagicItemForDeck[];
}
```

### AddMagicItemInput

```typescript
interface AddMagicItemInput {
  magic_item_id: string; // UUID
}
```

---

## Validation Rules

1. `magic_item_id` must be valid UUID format
2. Magic item must exist in either `official_magic_items` or `user_magic_items`
3. Deck must belong to authenticated user
4. Total deck items (spells + magic items) cannot exceed 52
5. Duplicates are allowed (same item can be added multiple times)

---

## Error Response Format

All errors follow existing pattern:

```typescript
{
  error: string,
  details?: ZodIssue[]  // Only for validation errors
}
```
