# Quickstart: Spell Card Deck Builder

**Feature**: 008-deck-building-for
**Purpose**: Validate implementation against user stories

## Prerequisites

- ✅ Supabase local instance running (`supabase start`)
- ✅ Database migrations applied (decks, deck_items tables)
- ✅ Test user authenticated
- ✅ At least 10 spells seeded in database

## Test Scenarios

### Scenario 1: Create New Deck

**User Story**: As a GM, I want to create a new spell deck so I can organize my spells.

**Steps**:

1. Navigate to `/decks`
2. Click "New Deck" button
3. Enter deck name: "Test Wizard Deck"
4. Click "Create"

**Expected Results**:

- ✅ Redirected to `/decks/[new-deck-id]`
- ✅ Deck appears in list with 0 spells
- ✅ Deck name displayed as "Test Wizard Deck"
- ✅ Empty state message: "No spells in deck yet"

**Validation**:

```sql
-- Should return 1 row
SELECT * FROM decks
WHERE name = 'Test Wizard Deck'
  AND user_id = '<test-user-id>';
```

---

### Scenario 2: Add Spells to Deck

**User Story**: As a GM, I want to add spells to my deck so I can build my collection.

**Steps**:

1. From deck detail page (`/decks/[id]`)
2. Click "Add Spells" button
3. Search/browse available spells
4. Click "Add" on "Magic Missile"
5. Click "Add" on "Fireball"
6. Click "Add" on "Shield"

**Expected Results**:

- ✅ Spell count updates in real-time: 0 → 1 → 2 → 3
- ✅ Each spell appears in deck list immediately
- ✅ Added spells disabled in selector (can't add duplicates)
- ✅ Success toast: "Spell added to deck"

**Validation**:

```sql
-- Should return 3 rows
SELECT di.*, s.name
FROM deck_items di
JOIN official_spells s ON di.spell_id = s.id
WHERE di.deck_id = '<test-deck-id>';
```

---

### Scenario 3: Enforce 52 Card Limit

**User Story**: As a system, I must prevent decks from exceeding 52 cards.

**Setup**: Add 51 spells to deck

**Steps**:

1. From deck with 51 spells
2. Add one more spell (52nd)
3. Attempt to add another spell (53rd)

**Expected Results**:

- ✅ 52nd spell adds successfully
- ✅ Spell selector shows "Deck Full (52/52)" message
- ✅ All "Add" buttons disabled
- ✅ Attempting to add via API returns 400 error

**Validation**:

```sql
-- Should return 52
SELECT COUNT(*) FROM deck_items
WHERE deck_id = '<test-deck-id>';

-- Should fail with constraint violation
INSERT INTO deck_items (deck_id, spell_id)
VALUES ('<test-deck-id>', '<new-spell-id>');
```

---

### Scenario 4: Prevent Duplicate Spells

**User Story**: As a system, I must enforce unique spells per deck.

**Steps**:

1. From deck with "Magic Missile" already added
2. Attempt to add "Magic Missile" again

**Expected Results**:

- ✅ "Magic Missile" button disabled in UI
- ✅ If attempted via API, returns 409 Conflict
- ✅ Error message: "Spell already in deck"

**Validation**:

```sql
-- Should fail with unique constraint violation
INSERT INTO deck_items (deck_id, spell_id)
VALUES ('<test-deck-id>', '<existing-spell-id>');
-- ERROR: duplicate key value violates unique constraint "deck_items_unique"
```

---

### Scenario 5: Remove Spell from Deck

**User Story**: As a GM, I want to remove spells from my deck so I can adjust my collection.

**Steps**:

1. From deck with 3 spells
2. Click "Remove" button on "Shield" spell
3. Confirm removal

**Expected Results**:

- ✅ Spell count updates: 3 → 2
- ✅ "Shield" removed from deck list
- ✅ "Shield" re-enabled in spell selector
- ✅ Success toast: "Spell removed from deck"

**Validation**:

```sql
-- Should return 2 rows (Shield removed)
SELECT COUNT(*) FROM deck_items
WHERE deck_id = '<test-deck-id>';
```

---

### Scenario 6: Auto-Save Draft Deck

**User Story**: As a GM, I don't want to lose my work if I navigate away.

**Steps**:

1. Create new deck: "Auto-Save Test"
2. Add 2 spells
3. Navigate to `/monsters` (without explicit save)
4. Navigate back to `/decks`

**Expected Results**:

- ✅ "Auto-Save Test" appears in deck list
- ✅ Deck shows 2 spells (not 0)
- ✅ No unsaved changes indicator

**Validation**:

```sql
-- Should return deck with 2 items
SELECT d.name, COUNT(di.id) as spell_count
FROM decks d
LEFT JOIN deck_items di ON d.id = di.deck_id
WHERE d.name = 'Auto-Save Test'
GROUP BY d.id;
```

---

### Scenario 7: Export Deck as PDF (Single Card Layout)

**User Story**: As a GM, I want to export individual 2.5"x3.5" cards so I can print and cut them.

**Steps**:

1. From deck with 5 spells
2. Click "Export PDF" button
3. Select "One card per page" layout
4. Click "Download"

**Expected Results**:

- ✅ PDF downloads: `<deck-name>.pdf`
- ✅ PDF has 5 pages (one per spell)
- ✅ Each page is exactly 2.5" x 3.5"
- ✅ Each card shows: spell name, level, duration, range, description
- ✅ Text wraps within card bounds (no overflow)

**Manual Validation**:

- Open PDF in viewer
- Verify page size in document properties
- Print one page and measure with ruler (should be 2.5" x 3.5")

---

### Scenario 8: Export Deck as PDF (Grid Layout)

**User Story**: As a GM, I want to export 9 cards per page so I can print efficiently.

**Steps**:

1. From deck with 10 spells
2. Click "Export PDF" button
3. Select "9 cards per page" layout
4. Click "Download"

**Expected Results**:

- ✅ PDF downloads: `<deck-name>.pdf`
- ✅ PDF has 2 pages (9 cards on page 1, 1 card on page 2)
- ✅ Each page is 8.5" x 11"
- ✅ Cards arranged in 3x3 grid
- ✅ Each card is 2.5" x 3.5" within grid
- ✅ All spell content visible and readable

**Manual Validation**:

- Open PDF in viewer
- Verify page size is Letter (8.5 x 11)
- Verify grid spacing is correct
- Print and measure individual cards

---

### Scenario 9: Delete Deck

**User Story**: As a GM, I want to delete old decks so I can keep my collection organized.

**Steps**:

1. From deck list (`/decks`)
2. Click "Delete" button on "Test Wizard Deck"
3. Confirm deletion

**Expected Results**:

- ✅ Confirmation modal: "Delete deck and all its spells?"
- ✅ Deck removed from list immediately
- ✅ Redirected to `/decks` if on deck detail page
- ✅ Success toast: "Deck deleted"

**Validation**:

```sql
-- Should return 0 rows
SELECT * FROM decks
WHERE name = 'Test Wizard Deck';

-- Deck items should also be deleted (CASCADE)
SELECT * FROM deck_items
WHERE deck_id = '<deleted-deck-id>';
```

---

### Scenario 10: Spell Deletion Cascades to Decks

**User Story**: As a system, I must remove deleted spells from all decks.

**Setup**: Create user spell "Custom Spell", add to deck

**Steps**:

1. Navigate to deck with "Custom Spell"
2. Delete "Custom Spell" from spell management
3. Return to deck

**Expected Results**:

- ✅ "Custom Spell" no longer in deck
- ✅ Spell count decremented
- ✅ No broken references or errors

**Validation**:

```sql
-- Delete spell
DELETE FROM user_spells WHERE name = 'Custom Spell';

-- Deck items should be automatically removed (CASCADE)
SELECT * FROM deck_items WHERE spell_id = '<custom-spell-id>';
-- Should return 0 rows
```

---

### Scenario 11: Update Deck Name

**User Story**: As a GM, I want to rename my deck so I can keep it organized.

**Steps**:

1. From deck detail page
2. Click deck name to edit
3. Change name to "Updated Deck Name"
4. Press Enter or click outside

**Expected Results**:

- ✅ Deck name updates immediately
- ✅ Updated name shown in deck list
- ✅ Success toast: "Deck name updated"

**Validation**:

```sql
-- Should return updated name
SELECT name FROM decks WHERE id = '<test-deck-id>';
```

---

### Scenario 12: View Empty Deck

**User Story**: As a GM, I can view a deck with no spells.

**Steps**:

1. Create new deck "Empty Deck"
2. Don't add any spells
3. View deck detail page

**Expected Results**:

- ✅ Deck name displayed
- ✅ Spell count: 0/52
- ✅ Empty state message: "No spells in deck yet"
- ✅ "Add Spells" button visible
- ✅ Export PDF button disabled (can't export empty deck)

---

## Performance Benchmarks

### PDF Generation

**Test**: Export deck with 52 spells

**Targets**:

- Single card layout: < 3 seconds
- Grid layout: < 5 seconds

**Measurement**:

```javascript
const start = performance.now();
await exportDeck(deckId, "grid");
const duration = performance.now() - start;
console.log(`PDF generation took ${duration}ms`);
```

**Expected**: < 5000ms

---

### Page Load

**Test**: Load deck list page with 10 decks

**Target**: < 2 seconds

**Measurement**: Chrome DevTools Network tab (DOMContentLoaded)

**Expected**: < 2000ms

---

### Real-Time Updates

**Test**: Add spell to deck

**Target**: UI updates within 100ms

**Measurement**: Time from click to UI update

**Expected**: < 100ms (optimistic update)

---

## Integration Test Coverage

All scenarios above should have corresponding E2E tests in `__tests__/e2e/decks.spec.ts`:

```typescript
describe('Deck Builder', () => {
  test('Scenario 1: Create new deck', async ({ page }) => { ... });
  test('Scenario 2: Add spells to deck', async ({ page }) => { ... });
  test('Scenario 3: Enforce 52 card limit', async ({ page }) => { ... });
  // ... etc
});
```

---

## Success Criteria

All scenarios must pass without errors before feature is considered complete.

✅ = Test passed
❌ = Test failed
⏳ = Test not yet run
