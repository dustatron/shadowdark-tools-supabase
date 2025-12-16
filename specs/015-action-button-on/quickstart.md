# Quickstart: Action Menu Button Component

**Purpose**: E2E validation scenarios for action menu functionality

## Prerequisites

- Development server running: `npm run dev`
- Supabase local instance running: `supabase start`
- Test user account created with credentials
- At least one monster in database (official or user-created)

## Test Scenario 1: Favorite Toggle (Unauthenticated User)

**Acceptance Criteria**: FR-002 - Action menu not visible to guests

### Steps

1. Open browser in incognito/private mode
2. Navigate to monster detail page: `http://localhost:3000/monsters/{monster-id}`
3. Verify action menu button is NOT visible anywhere on page
4. Verify old favorite button is NOT visible (removed)
5. Verify old edit button is NOT visible (removed)

**Expected Result**: No action buttons shown to unauthenticated users

---

## Test Scenario 2: Favorite Toggle (Add to Favorites)

**Acceptance Criteria**: FR-004, FR-005, FR-022

### Steps

1. Sign in as test user
2. Navigate to monster detail page: `http://localhost:3000/monsters/{monster-id}`
3. Verify action menu button is visible (e.g., three-dot icon or "Actions" button)
4. Click action menu button
5. Verify dropdown menu opens with actions list
6. Verify favorite action shows empty heart icon
7. Click favorite action
8. Verify heart icon changes to filled immediately (optimistic update)
9. Verify success toast appears: "Added to favorites"
10. Verify menu closes automatically
11. Click action menu again to reopen
12. Verify favorite action now shows filled heart icon (persisted state)

**Expected Result**: Monster added to favorites with immediate UI feedback

---

## Test Scenario 3: Favorite Toggle (Remove from Favorites)

**Acceptance Criteria**: FR-005, FR-022

### Steps

1. Continue from Scenario 2 (monster already favorited)
2. Click action menu button
3. Verify favorite action shows filled heart icon
4. Click favorite action
5. Verify heart icon changes to empty immediately
6. Verify success toast appears: "Removed from favorites"
7. Verify menu closes
8. Reload page
9. Open action menu
10. Verify favorite action shows empty heart (state persisted)

**Expected Result**: Monster removed from favorites with state persisted

---

## Test Scenario 4: Add to Existing List

**Acceptance Criteria**: FR-006, FR-007, FR-008

### Prerequisite Setup

Create test list via SQL:

```sql
INSERT INTO user_lists (user_id, name, description)
VALUES ('{test-user-id}', 'Test Adventure List', 'For quickstart testing');
```

### Steps

1. Sign in as test user
2. Navigate to monster detail page
3. Click action menu button
4. Click "Add to Adventure List" action
5. Verify modal opens with title "Add to List"
6. Verify "Test Adventure List" appears in list selector
7. Verify list shows item count (0 items)
8. Click radio button for "Test Adventure List"
9. Click "Add to List" button
10. Verify modal closes
11. Verify success toast: "Added to Test Adventure List"
12. Open action menu and click "Add to Adventure List" again
13. Verify "Test Adventure List" now shows checkmark or "Already added" indicator
14. Verify "Add to List" button is disabled for that list

**Expected Result**: Monster added to existing list, duplicate prevention works

---

## Test Scenario 5: Create New List and Add

**Acceptance Criteria**: FR-009, FR-010

### Steps

1. Sign in as test user
2. Navigate to monster detail page
3. Click action menu button
4. Click "Add to Adventure List"
5. Verify modal opens
6. Verify "Create New List" form/section is visible
7. Click "Create New List" button or tab
8. Type list name: "My New Quest"
9. (Optional) Type description: "Testing list creation"
10. Click "Create & Add" button
11. Verify modal closes
12. Verify success toast: "Created list and added monster"
13. Navigate to lists page: `http://localhost:3000/protected/lists`
14. Verify "My New Quest" list exists
15. Click into list
16. Verify monster is in the list

**Expected Result**: New list created and monster added in one operation

---

## Test Scenario 6: Deck Action (Disabled State)

**Acceptance Criteria**: FR-011, FR-012

### Steps

1. Sign in as test user
2. Navigate to monster detail page
3. Click action menu button
4. Verify "Add to Deck" action is visible but grayed/disabled
5. Hover over "Add to Deck" action
6. Verify tooltip appears: "Deck support for monsters coming soon"
7. Try to click "Add to Deck"
8. Verify nothing happens (disabled state prevents action)

**Expected Result**: Deck action visible but disabled with explanatory tooltip

---

## Test Scenario 7: Edit Action (Owner Only)

**Acceptance Criteria**: FR-013

### Part A: Own Monster

1. Sign in as test user
2. Navigate to user-created monster detail page (owned by test user)
3. Click action menu button
4. Verify "Edit" action is visible in menu
5. Click "Edit" action
6. Verify navigation to edit page: `/monsters/{id}/edit`

### Part B: Other User's Monster

1. Navigate to official monster or another user's monster
2. Click action menu button
3. Verify "Edit" action is NOT visible in menu

**Expected Result**: Edit action only shown for monsters owned by current user

---

## Test Scenario 8: Menu Accessibility

**Acceptance Criteria**: FR-018, FR-019

### Steps

1. Sign in as test user
2. Navigate to monster detail page
3. Tab to action menu button using keyboard
4. Verify button receives focus (visible focus ring)
5. Press Enter or Space to open menu
6. Verify menu opens
7. Use Arrow Down key to navigate menu items
8. Verify focus moves through items: Favorite → Add to List → Add to Deck → Edit
9. Press Enter on "Add to Adventure List"
10. Verify list modal opens
11. Press Escape
12. Verify modal closes
13. Tab to action menu button again
14. Press Escape while menu is open
15. Verify menu closes

**Expected Result**: Full keyboard navigation support

---

## Test Scenario 9: Error Handling

**Acceptance Criteria**: FR-020

### Part A: Network Error Simulation

1. Sign in as test user
2. Open browser DevTools → Network tab
3. Set network throttling to "Offline"
4. Navigate to monster detail page (will load from cache)
5. Click action menu → Favorite action
6. Verify error toast appears: "Failed to update favorite. Please try again."
7. Verify heart icon reverts to original state (rollback)
8. Set network back to "Online"
9. Click favorite action again
10. Verify success

### Part B: List Creation Validation

1. Click action menu → Add to Adventure List
2. Click "Create New List"
3. Leave name field empty
4. Click "Create & Add"
5. Verify inline error: "List name is required"
6. Verify modal stays open
7. Type name: "A" (repeat 101 times to exceed max length)
8. Verify error: "List name must be less than 100 characters"

**Expected Result**: Graceful error handling with user-friendly messages

---

## Test Scenario 10: Mobile Responsiveness

**Acceptance Criteria**: FR-018 (mobile constraints)

### Steps

1. Open browser DevTools
2. Toggle device emulation (iPhone 12 Pro or similar)
3. Navigate to monster detail page
4. Verify action menu button is touch-friendly (44x44px minimum)
5. Tap action menu button
6. Verify dropdown menu opens
7. Verify menu items are spaced appropriately for touch (no accidental clicks)
8. Tap outside menu
9. Verify menu closes
10. Tap "Add to Adventure List"
11. Verify modal is readable and scrollable on mobile
12. Verify form inputs are touch-friendly

**Expected Result**: Fully functional on mobile/touch devices

---

## Test Scenario 11: Component Reusability (Spells)

**Acceptance Criteria**: FR-017

### Steps

1. Sign in as test user
2. Navigate to spell detail page: `http://localhost:3000/spells/{spell-slug}`
3. Verify action menu button is visible
4. Click action menu button
5. Verify menu shows same actions adapted for spells:
   - Favorite toggle (heart icon)
   - Add to Adventure List
   - Add to Deck (enabled for spells if supported, or disabled)
   - Edit (if user owns the spell)
6. Test favorite toggle on spell
7. Verify success
8. Test add to list on spell
9. Verify modal works identically

**Expected Result**: Component works seamlessly with different entity types

---

## Success Criteria

- ✅ All 11 scenarios pass without errors
- ✅ No console errors in browser DevTools
- ✅ All state changes persist across page reloads
- ✅ All UI feedback (toasts, loading states) appears as expected
- ✅ Accessibility features work (keyboard nav, ARIA, focus management)
- ✅ Mobile experience is touch-friendly and responsive

## Performance Validation

Run Chrome DevTools Lighthouse audit on monster detail page:

- **Favorite toggle response**: < 300ms (optimistic update should feel instant)
- **List modal load**: < 500ms from click to modal render
- **Page load**: < 2s for monster detail page

## Database Validation

After completing scenarios, verify database state:

```sql
-- Check favorite was created
SELECT * FROM user_favorites
WHERE user_id = '{test-user-id}'
AND entity_type = 'monster'
AND entity_id = '{monster-id}';

-- Check list item was created
SELECT li.*, ul.name as list_name
FROM list_items li
JOIN user_lists ul ON li.list_id = ul.id
WHERE ul.user_id = '{test-user-id}'
AND li.entity_id = '{monster-id}';

-- Check new list was created
SELECT * FROM user_lists
WHERE user_id = '{test-user-id}'
AND name = 'My New Quest';
```

Expected: All queries return expected rows, no orphaned data.
