# Quickstart: Magic Item Cards in Decks

## User Flow

### 1. Add Magic Item to Deck

1. Navigate to deck detail page: `/dashboard/decks/[id]`
2. Click "Add Cards" button
3. Select "Magic Items" tab in selector
4. Search/browse magic items
5. Click "Add" on desired item
6. Item appears in deck list

### 2. Preview Magic Item Card

1. Select magic item in deck list
2. Card preview panel shows:
   - Item name
   - Description
   - Traits list
   - Image (if available)
3. Toggle between Card/PDF preview modes

### 3. Export Mixed Deck

1. Click "Export PDF" button
2. Select layout (grid/single)
3. PDF generates with all cards:
   - Spell cards (existing)
   - Magic item cards (new)
4. Download PDF

---

## Acceptance Test Scenarios

### Scenario 1: Add Official Magic Item

```gherkin
Given I am on my deck detail page
And the deck has 5 spells
When I open the card selector
And I switch to "Magic Items" tab
And I search for "Sword of the Moon"
And I click "Add" on the result
Then the magic item appears in my deck
And the deck shows "6 Cards"
```

### Scenario 2: Add Custom Magic Item

```gherkin
Given I have created a custom magic item
When I open the card selector on my deck
And I filter by "Custom Items"
Then I see my custom item in results
When I add it to the deck
Then it appears in the deck list
```

### Scenario 3: Remove Magic Item

```gherkin
Given my deck contains a magic item
When I click the remove button on that item
Then the item is removed from the deck
And the card count decreases by 1
```

### Scenario 4: Deck Limit with Mixed Content

```gherkin
Given my deck has 51 cards (mix of spells and magic items)
When I try to add another magic item
Then it is added successfully
When I try to add one more item
Then I see error "Deck cannot exceed 52 cards"
```

### Scenario 5: Export Mixed Deck to PDF

```gherkin
Given my deck has 3 spells and 2 magic items
When I click "Export PDF"
And I select "Grid" layout
Then a PDF downloads
And it contains all 5 cards rendered correctly
```

### Scenario 6: Magic Item Card Preview

```gherkin
Given my deck has a magic item with traits
When I select that item in the deck list
Then the preview shows the item name
And the preview shows the description
And the preview shows all traits
And traits show name and description
```

---

## Manual Verification Checklist

- [ ] Can add official magic item to deck
- [ ] Can add custom (user) magic item to deck
- [ ] Magic items display correctly in deck list
- [ ] Card count includes both spells and magic items
- [ ] Can remove magic item from deck
- [ ] 52 card limit enforced across item types
- [ ] Magic item preview renders correctly (React)
- [ ] Magic item preview renders correctly (PDF)
- [ ] PDF export includes magic items
- [ ] Grid layout works with mixed content
- [ ] Single layout works with mixed content
