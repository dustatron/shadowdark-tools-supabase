# Quickstart Guide - Random Encounter Tables

**Feature**: Random Encounter Tables
**Date**: 2025-10-22
**Status**: Implementation Guide

This guide provides step-by-step instructions for testing the Random Encounter Tables feature from a user's perspective. Each scenario maps directly to acceptance criteria from the feature specification.

---

## Prerequisites

1. **Authentication**: Log in to the application with a valid user account
2. **Data**: Ensure the database has:
   - At least 50 official monsters (seeded from core rulebook)
   - At least 10 monsters in the 3-7 level range for testing
3. **Environment**: Development server running on `http://localhost:3000`

---

## Scenario 1: Create Your First Encounter Table

**Goal**: Create a new encounter table with filtered monsters

**Steps**:

1. Navigate to `/encounter-tables`
2. Click "Create New Table" button
3. Fill in the form:
   - **Name**: "Forest Encounters"
   - **Description**: "Random encounters for Darkwood Forest"
   - **Die Size**: Select "d20" from dropdown
   - **Monster Sources**: Check "Core Monsters" and "Your Monsters"
   - **Level Range**: Set min=3, max=7
4. Click "Generate Table"

**Expected Result**:

- Table created successfully
- Redirected to table detail page at `/encounter-tables/[id]`
- Page displays:
  - Table name and description at top
  - 20 numbered entries (1-20)
  - Each entry shows: roll number, monster name, challenge level
  - "Roll d20" button prominent at top
  - Settings/Edit button available

**Acceptance Criteria Validated**: AC-1, AC-2

---

## Scenario 2: Roll on Your Table

**Goal**: Perform an animated dice roll and view monster details

**Steps**:

1. From the table detail page (previous scenario)
2. Click "Roll d20" button
3. Observe the animation (~1 second)
4. View the result

**Expected Result**:

- Dice rolling animation plays smoothly
- After ~1 second, animation stops
- Random number displayed (e.g., "You rolled: 14")
- Entry #14 highlighted in the table list
- Monster detail panel appears showing:
  - Monster name and icon
  - Full stat block (AC, HP, stats, attacks, abilities)
  - Favorite button (heart icon)
- Can click "Roll Again" to perform another roll

**Acceptance Criteria Validated**: AC-3, AC-4

---

## Scenario 3: Favorite a Monster from Table

**Goal**: Add a monster to favorites directly from the encounter table view

**Steps**:

1. After rolling (previous scenario), monster detail panel is visible
2. Click the favorite button (heart icon) in the monster detail panel
3. Observe the state change

**Expected Result**:

- Heart icon fills with color (indicating favorited)
- Toast notification: "Added to favorites"
- If you navigate to `/monsters/favorites`, the monster appears in the list
- Behavior identical to favoriting from `/monsters/[id]` page

**Acceptance Criteria Validated**: AC-4

---

## Scenario 4: Replace Single Entry with Random Monster

**Goal**: Replace one entry while maintaining table filters

**Steps**:

1. From table detail page
2. Find entry #7 in the list
3. Click "Edit" button (pencil icon) next to entry #7
4. In the dialog/modal, click "Random monster from filters"
5. Confirm the replacement

**Expected Result**:

- Entry #7 now shows a different monster
- New monster matches table's saved filters (level 3-7, from selected sources)
- New monster is NOT already present in another entry (uniqueness enforced)
- Table still has 20 entries total
- Other entries unchanged

**Acceptance Criteria Validated**: AC-5

---

## Scenario 5: Replace Single Entry with Specific Monster

**Goal**: Replace an entry by searching for a specific monster

**Steps**:

1. From table detail page
2. Click "Edit" on entry #12
3. In the dialog, click "Search all monsters"
4. Search for "Troll"
5. Select "Troll" from search results
6. Confirm the replacement

**Expected Result**:

- Entry #12 now shows "Troll"
- Troll may be outside the original filter criteria (allowed when manually selected)
- If Troll was already in the table, the UI prevents selection or swaps entries

**Acceptance Criteria Validated**: AC-6

---

## Scenario 6: Regenerate Entire Table

**Goal**: Generate a completely new set of monsters for the table

**Steps**:

1. From table detail page, click "Settings" button
2. In settings page, scroll to "Danger Zone" section
3. Click "Regenerate Table" button
4. Confirm the action in the confirmation dialog

**Expected Result**:

- All 20 entries replaced with new random monsters
- New monsters still match original filters (level 3-7, Core + Your Monsters)
- All 20 monsters are unique (no duplicates)
- Monster snapshots updated with current data
- Redirected back to table detail page

**Acceptance Criteria Validated**: AC-7

---

## Scenario 7: Update Table Filters

**Goal**: Change table filters and verify they're used for future generation

**Steps**:

1. From table detail page, click "Settings"
2. In settings page, modify filters:
   - Change level range to 5-10
   - Add "Public Monsters" to sources (now Core + Your + Public)
   - Add "Chaotic" to alignments filter
3. Click "Save Settings"
4. Return to table detail page
5. Click "Edit" on any entry → "Random monster from filters"

**Expected Result**:

- Settings saved successfully
- When replacing single entry, new monster matches updated filters:
  - Challenge level 5-10
  - From Core, Your, or Public sources
  - Chaotic alignment (if filter applied strictly)
- Existing entries unchanged until replaced/regenerated

**Acceptance Criteria Validated**: AC-8

---

## Scenario 8: Share Table Publicly

**Goal**: Make table accessible via public URL

**Steps**:

1. From table detail page, click "Share" button
2. In share dialog, toggle "Make Public" switch to ON
3. Observe the generated URL

**Expected Result**:

- Toast notification: "Table is now public"
- Share dialog displays unique URL: `https://yourapp.com/encounter-tables/public/abc12345`
- "Copy Link" button available
- Can toggle back to "Private" to revoke access

**Acceptance Criteria Validated**: AC-9

---

## Scenario 9: View Public Table (Authenticated User)

**Goal**: Access another user's public table and see copy option

**Steps**:

1. Log in with a different user account (or use incognito mode with auth)
2. Navigate to public URL from previous scenario: `/encounter-tables/public/abc12345`
3. View the table

**Expected Result**:

- Table is fully visible:
  - Name, description, die size shown
  - All 20 entries visible in list
- "Roll d20" button functional
- Clicking roll shows monster details
- "Copy to My Tables" button visible at top
- NO "Edit" or "Delete" buttons (read-only for non-owners)

**Acceptance Criteria Validated**: AC-10

---

## Scenario 10: View Public Table (Unauthenticated Visitor)

**Goal**: Verify guest access is functional but limited

**Steps**:

1. Open incognito/private browser window (no login)
2. Navigate to public URL: `/encounter-tables/public/abc12345`

**Expected Result**:

- Table fully visible (name, entries, die size)
- "Roll d20" button works
- Monster details displayed on roll
- NO "Copy to My Tables" button (requires authentication)
- NO "Edit" or "Delete" buttons
- Optional: "Sign in to copy this table" message displayed

**Acceptance Criteria Validated**: AC-11

---

## Scenario 11: Copy Public Table

**Goal**: Duplicate another user's public table to your collection

**Steps**:

1. As authenticated user, view public table (Scenario 9)
2. Click "Copy to My Tables" button
3. Wait for confirmation

**Expected Result**:

- Toast notification: "Table copied successfully"
- Redirected to your new table at `/encounter-tables/[new-id]`
- New table has:
  - Name: "[Original Name] (Copy)"
  - Same description
  - Same die size (20)
  - Same 20 entries with identical monsters
  - is_public = false (your copy is private by default)
  - No public_slug (independent from original)
- You can now edit, roll, regenerate, or delete your copy independently

**Acceptance Criteria Validated**: AC-12

---

## Scenario 12: View List of Your Tables

**Goal**: Navigate table collection and verify summary info

**Steps**:

1. Navigate to `/encounter-tables`
2. Observe your table list

**Expected Result**:

- Grid/list of table cards
- Each card shows:
  - Table name
  - Description (truncated if long)
  - Die size (e.g., "d20")
  - Entry count (e.g., "20 entries")
  - Created date
- Action buttons on each card:
  - "View" → Goes to detail page
  - "Settings" → Goes to settings page
  - "Delete" → Opens confirmation dialog
  - "Share" → Opens share dialog
- Tables sorted by most recent first

**Acceptance Criteria Validated**: AC-13

---

## Scenario 13: Handle Insufficient Monsters Error

**Goal**: Verify graceful error when filters are too restrictive

**Steps**:

1. Navigate to `/encounter-tables/new`
2. Fill in form:
   - Name: "Ultra Rare Encounters"
   - Die Size: Select "d100" (requires 100 monsters)
   - Sources: Check ONLY "Your Monsters"
   - Level Range: 19-20
3. Click "Generate Table"

**Expected Result**:

- Request fails (no table created)
- Error message displays:
  - "Only 3 monsters match your criteria. Need at least 100."
- Form remains filled (user can adjust filters)
- Suggestions provided:
  - "Try increasing level range"
  - "Add more monster sources"
  - "Use a smaller die size"

**Acceptance Criteria Validated**: AC-14

---

## Scenario 14: Validate Custom Die Size

**Goal**: Test die size boundary validation

**Steps**:

1. Navigate to `/encounter-tables/new`
2. Fill in basic info (name, filters with many monsters available)
3. Select "Custom" die size option
4. Test invalid inputs:
   - Enter "1" → Error: "Die size must be at least 2"
   - Enter "1001" → Error: "Die size cannot exceed 1000"
   - Enter "-5" → Error: "Die size must be positive"
5. Enter valid input: "42"
6. Click "Generate Table"

**Expected Result**:

- Invalid inputs show inline validation errors
- Cannot submit form with invalid die size
- Valid input (42) creates table successfully
- Table has exactly 42 entries (roll 1-42)

**Acceptance Criteria Validated**: AC-15

---

## Edge Case Testing

### Edge Case 1: Monster Deleted After Table Creation

**Setup**:

1. Create table with a custom monster you own
2. Note which entry contains your custom monster (e.g., entry #5)
3. Navigate to `/monsters/[your-monster-id]`
4. Delete the monster

**Test**:

1. Return to encounter table detail page
2. Roll until you hit entry #5 (or view entry directly)

**Expected Result**:

- Entry #5 still displays correctly
- Monster data shown from snapshot (name, stats, attacks all visible)
- Visual indicator that source monster no longer exists (optional)
- No errors or missing data

**Specification Reference**: Edge Case - Monster deleted after table creation

---

### Edge Case 2: No Monsters Match Criteria

**Setup**:

1. Attempt to create table with filters that match NO monsters:
   - Level range: 18-20
   - Sources: Only "Your Monsters" (assuming user has none in that range)

**Test**:

1. Click "Generate Table"

**Expected Result**:

- Error message: "No monsters match your criteria. Please adjust your filters."
- Table NOT created
- Form remains open for editing

**Specification Reference**: Edge Case - No monsters match

---

### Edge Case 3: No Monster Sources Selected

**Setup**:

1. Create table form
2. Uncheck ALL monster sources (Core, Your, Public)

**Test**:

1. Attempt to generate

**Expected Result**:

- Validation error: "Please select at least one monster source (Core, Your Monsters, or Public)."
- Cannot submit form
- At least one source must be checked

**Specification Reference**: Edge Case - No sources selected

---

### Edge Case 4: Duplicate Slug Generation (Stress Test)

**Note**: This is a backend test, difficult to trigger manually

**Setup**:

1. Create automated script to make 100 tables public simultaneously
2. Monitor for slug collisions

**Expected Result**:

- All tables get unique slugs
- Collision detection and retry logic works
- No duplicate public_slug values in database

**Specification Reference**: Edge Case - Slug collision

---

### Edge Case 5: Owner Deletes Public Table

**Setup**:

1. Create table and make it public
2. Share URL with another account
3. As owner, delete the table

**Test**:

1. As other user, try to access public URL

**Expected Result**:

- Page shows: "Table not found" or 404 error
- No crash or exposed data
- Clean error handling

**Specification Reference**: Edge Case - Public table deleted

---

### Edge Case 6: Multiple Rolls in Quick Succession

**Setup**:

1. View table detail page
2. Click "Roll d20" button rapidly 10 times

**Expected Result**:

- Each roll completes its animation before next begins (no race conditions)
- All 10 rolls produce valid results (1-20)
- UI doesn't freeze or show stale data
- Each roll highlights correct entry

**Specification Reference**: Edge Case - Multiple rolls

---

### Edge Case 7: Toggle Public/Private Multiple Times

**Setup**:

1. Create table
2. Share dialog: Make public → Make private → Make public → Make private

**Expected Result**:

- Each toggle updates is_public flag correctly
- When made private, public_slug remains in DB but URL is inaccessible
- When made public again, existing slug reused OR new slug generated
- No orphaned data or state inconsistencies

**Specification Reference**: Edge Case - Toggle public/private

---

### Edge Case 8: Copy Table Then Edit Original

**Setup**:

1. User A creates and shares public table
2. User B copies table
3. User A edits their original table (changes name, regenerates entries)

**Test**:

1. User B views their copied table

**Expected Result**:

- User B's copy is completely independent
- Changes to User A's table do NOT affect User B's copy
- Both tables can exist, be edited, and deleted independently

**Specification Reference**: Edge Case - Copy independence

---

## Performance Benchmarks

Test the following performance scenarios:

### Benchmark 1: Table Generation Speed

- Create d100 table (100 entries)
- **Target**: < 3 seconds total time
- Measure: Time from "Generate" click to table detail page loaded

### Benchmark 2: Search/Filter Query Speed

- Apply complex filters (level range, alignment, movement, search text)
- Query for 100 random monsters
- **Target**: < 500ms query time
- Use browser DevTools Network tab to measure

### Benchmark 3: Dice Roll Response Time

- Perform single roll on table with 100 entries
- **Target**: < 300ms from click to result displayed (excluding animation)
- Animation should be exactly 1 second (measure with DevTools Performance)

### Benchmark 4: Page Load Time

- Load table detail page with 100 entries
- **Target**: < 2 seconds (including all assets)
- Test with throttled network (Fast 3G simulation)

---

## Accessibility Testing

Manual checks for accessibility compliance:

1. **Keyboard Navigation**:
   - Tab through entire table creation form
   - All inputs focusable
   - "Enter" key submits form
   - Can roll dice with "Enter" key

2. **Screen Reader**:
   - Table entries announced correctly
   - Roll result announced after animation
   - Error messages have proper ARIA labels

3. **Color Contrast**:
   - All text meets WCAG AA standards (4.5:1 ratio)
   - Highlighted entry uses sufficient contrast

4. **Focus Indicators**:
   - Visible focus rings on all interactive elements
   - No loss of focus during dice animation

---

## Success Criteria

**Feature is ready for production when**:

✅ All 15 acceptance scenarios pass without errors
✅ All 8 edge cases handled gracefully
✅ All 4 performance benchmarks met
✅ Basic accessibility checks pass
✅ Zero console errors during normal usage
✅ RLS policies prevent unauthorized access (verified via manual testing)
✅ No duplicate monsters in single table (verified in DB after generation)

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Run integration tests
npm run test:integration -- encounter-tables

# Run E2E tests
npm run test:e2e -- encounter-tables

# Check database
psql -d shadowdark_dev -c "SELECT count(*) FROM encounter_tables;"

# Verify RLS policies
psql -d shadowdark_dev -c "\d+ encounter_tables"
```

---

**Last Updated**: 2025-10-22
**Related Files**: spec.md, data-model.md, contracts/openapi.yaml
