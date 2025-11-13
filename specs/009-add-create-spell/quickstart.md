# Quickstart: Create Custom Spell

**Feature**: 009-add-create-spell
**Date**: 2025-11-12
**Purpose**: Validate complete user journey for spell creation feature

## Prerequisites

- User has account and is authenticated
- Local development environment running (npm run dev)
- Database has official_spells seeded
- No existing spell named "Test Fire Bolt"

## User Journey Validation

### Step 1: Navigate to Create Spell Page

**Action**: Navigate to `/spells/create`

**Expected Result**:

- If not authenticated → Redirect to `/auth/login?redirect=/spells/create`
- If authenticated → Show "Create Custom Spell" page with form

**Validation**:

- [ ] Page title is "Create Custom Spell"
- [ ] Form displays all required fields (name, tier, classes, duration, range, effect)
- [ ] Public/private toggle present
- [ ] Submit button disabled until form valid

---

### Step 2: Fill Spell Form

**Action**: Enter spell details

**Input**:

```
Name: Test Fire Bolt
Tier: 1
Classes: [wizard]
Duration: Instantaneous
Range: 120 feet
Effect: You hurl a mote of fire at a creature or object within range. Make a ranged spell attack. On a hit, the target takes 1d10 fire damage.
School (optional): Evocation
Public: false
```

**Expected Result**:

- Form validation passes for all fields
- Submit button becomes enabled
- No validation errors shown

**Validation**:

- [ ] All fields accept input
- [ ] Tier dropdown shows only 1-5
- [ ] Classes allows multi-select (wizard, priest)
- [ ] Character counts shown for long text fields
- [ ] Submit button enabled

---

### Step 3: Submit Form

**Action**: Click "Create Spell" button

**Expected Result**:

- Loading spinner shown during submission
- POST /api/spells called with form data
- Response 201 with created spell
- Success toast notification
- Redirect to spell detail page

**Validation**:

- [ ] POST /api/spells returns 201
- [ ] Response includes spell.id (UUID)
- [ ] Response includes spell.slug = "test-fire-bolt"
- [ ] Response includes spell.user_id = current user
- [ ] Response includes spell.is_public = false
- [ ] Success message shown: "Spell created successfully"
- [ ] Redirected to `/spells/test-fire-bolt`

---

### Step 4: View Created Spell

**Action**: Spell detail page loads automatically

**Expected Result**:

- Spell details displayed
- "Edit" and "Delete" buttons visible (owner only)
- Privacy badge shows "Private"

**Validation**:

- [ ] Page title is "Test Fire Bolt"
- [ ] Tier badge shows "Tier 1"
- [ ] Classes badge shows "Wizard"
- [ ] Duration displays "Instantaneous"
- [ ] Range displays "120 feet"
- [ ] Effect displays full description
- [ ] School displays "Evocation"
- [ ] "Private" badge visible
- [ ] "Edit" button present
- [ ] "Delete" button present

---

### Step 5: Verify Spell in List

**Action**: Navigate to `/spells`

**Expected Result**:

- Spell list includes "Test Fire Bolt"
- Spell marked as user-created (not official)

**Validation**:

- [ ] "Test Fire Bolt" appears in spell list
- [ ] Spell has "Custom" source badge
- [ ] Spell has "Private" badge
- [ ] Tier and class badges correct
- [ ] Can click to view detail

---

### Step 6: Edit Spell

**Action**: Click "Edit" button on detail page

**Expected Result**:

- Redirect to `/spells/test-fire-bolt/edit`
- Form pre-filled with existing data
- Can modify fields

**Action**: Change name to "Fire Bolt" (duplicate official spell)

**Expected Result**:

- Form submits
- API returns 409 Conflict
- Error toast shown: "Spell name already exists"
- Form not cleared

**Validation**:

- [ ] Edit form loads with correct data
- [ ] Duplicate name triggers 409 error
- [ ] Error message shown to user
- [ ] Form data retained

**Action**: Change name to "Test Fire Bolt Enhanced", tier to 2, public to true

**Expected Result**:

- PUT /api/spells/:id succeeds
- Response 200 with updated spell
- Success toast shown
- Redirect to updated spell detail

**Validation**:

- [ ] PUT /api/spells/:id returns 200
- [ ] Response shows name = "Test Fire Bolt Enhanced"
- [ ] Response shows tier = 2
- [ ] Response shows is_public = true
- [ ] Response shows slug = "test-fire-bolt-enhanced"
- [ ] Redirected to new slug URL
- [ ] Public badge now visible

---

### Step 7: Verify Public Visibility

**Action**: Log out and navigate to spell list

**Expected Result**:

- Spell "Test Fire Bolt Enhanced" visible in public list
- Cannot edit or delete (not authenticated)

**Validation**:

- [ ] Public spell visible to unauthenticated users
- [ ] Can view detail page
- [ ] No "Edit" or "Delete" buttons shown
- [ ] "Public" badge visible

---

### Step 8: Delete Spell

**Action**: Log back in, navigate to spell detail, click "Delete"

**Expected Result**:

- Confirmation dialog appears
- Click "Confirm Delete"
- DELETE /api/spells/:id called
- Response 204 No Content
- Success toast shown
- Redirect to spell list

**Validation**:

- [ ] Confirmation dialog shown
- [ ] DELETE /api/spells/:id returns 204
- [ ] Success message: "Spell deleted successfully"
- [ ] Redirected to `/spells`
- [ ] Spell no longer in list
- [ ] Spell detail page returns 404

---

### Step 9: Verify Global Uniqueness

**Action**: Navigate to `/spells/create`

**Action**: Create spell named "Fireball" (official spell)

**Expected Result**:

- Form submits
- API checks all_spells view
- Finds duplicate in official_spells
- Returns 409 Conflict
- Error shown: "Spell name already exists"

**Validation**:

- [ ] POST /api/spells returns 409
- [ ] Error message clear to user
- [ ] Form data retained for correction

---

### Step 10: Verify Owner-Only CRUD

**Action**: Create second user account, log in

**Action**: Try to access `/spells/:id/edit` for another user's spell

**Expected Result**:

- RLS policy blocks UPDATE query
- 403 Forbidden returned
- Redirect to spell list or error page

**Validation**:

- [ ] Cannot edit other user's spells
- [ ] Cannot delete other user's spells
- [ ] Can view public spells
- [ ] Cannot view private spells of others

---

## Performance Validation

**Targets**:

- Form submission: < 500ms
- Name uniqueness check: < 100ms
- Spell list load (50 spells): < 2s
- Spell detail load: < 300ms

**Actions**:

1. Enable network throttling (Fast 3G)
2. Create spell and measure response time
3. Load spell list with 50+ spells
4. Measure page load times

**Validation**:

- [ ] Create spell completes in < 500ms
- [ ] List page loads in < 2s
- [ ] Detail page loads in < 300ms
- [ ] No network errors in console

---

## Edge Cases to Test

### Empty Form Submission

**Action**: Submit form without filling fields

**Expected Result**:

- Client-side validation prevents submission
- Error messages shown for all required fields

**Validation**:

- [ ] Required field errors shown
- [ ] Submit button disabled or blocked
- [ ] No API call made

---

### Invalid Tier

**Action**: Manually edit tier to 0 or 6 (if possible)

**Expected Result**:

- Client validation prevents selection
- If bypassed, server returns 400 with Zod error

**Validation**:

- [ ] Tier dropdown only shows 1-5
- [ ] Server rejects invalid tier

---

### Very Long Description

**Action**: Enter 10,000 character description

**Expected Result**:

- Client shows character limit warning
- Server accepts (no length limit on TEXT field)

**Validation**:

- [ ] Long text handled without errors
- [ ] UI remains responsive

---

### Network Failure

**Action**: Disable network, submit form

**Expected Result**:

- Request fails
- Error toast shown: "Network error, please try again"
- Form data retained

**Validation**:

- [ ] Error handling graceful
- [ ] User can retry
- [ ] Data not lost

---

## Cleanup

After quickstart validation:

1. Delete test spell "Test Fire Bolt Enhanced" (if exists)
2. Log out test users
3. Clear browser cache/cookies
4. Verify database state clean

---

## Success Criteria

All validation checkboxes above must pass:

- [ ] Create spell flow complete
- [ ] Edit spell flow complete
- [ ] Delete spell flow complete
- [ ] Public/private visibility works
- [ ] Global name uniqueness enforced
- [ ] Owner-only CRUD enforced
- [ ] RLS policies working
- [ ] Performance targets met
- [ ] Edge cases handled
- [ ] No console errors

**Total Checkboxes**: 85+
**Pass Threshold**: 100% (all must pass)

---

## Troubleshooting

| Issue                           | Solution                                          |
| ------------------------------- | ------------------------------------------------- |
| Redirect loop on /spells/create | Check auth middleware, verify cookie config       |
| 409 on unique names             | Check all_spells view includes both tables        |
| RLS blocks own spells           | Verify user_id matches auth.uid()                 |
| Slug conflicts                  | Verify slug generation uses user_id composite key |
| Form validation not working     | Check Zod schema matches field requirements       |
| Edit page 404                   | Verify spell slug in URL, check RLS SELECT policy |

---

## Automated Test Coverage

This quickstart should be automated as E2E test:

```
__tests__/e2e/spell-crud.spec.ts
- test('complete spell CRUD journey')
- test('name uniqueness validation')
- test('public/private visibility')
- test('owner-only access control')
```

Target: 90% of quickstart steps automated with Playwright
