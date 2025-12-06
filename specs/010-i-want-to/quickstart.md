# Quickstart: Sidebar Migration Validation

This quickstart guide validates that the sidebar migration is working correctly. Execute these steps manually to verify the implementation.

## Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Dev server should be running
npm run dev
# → http://localhost:3000
```

## Test Sequence

### 1. Visual Verification - Guest User (5 minutes)

**Objective**: Verify sidebar renders correctly for unauthenticated users

1. **Open browser** to http://localhost:3000
2. **Verify sidebar is visible** on left side
3. **Check public navigation links** are present:
   - [ ] Home (with Home icon)
   - [ ] Monsters (with Swords icon)
   - [ ] Spells (with Sparkles icon)
   - [ ] Encounter Tables (with Dice6 icon)
   - [ ] About (with Info icon)
4. **Verify Sign In button** is visible
5. **Verify NO dashboard sections** are visible
6. **Check theme toggle** in sidebar footer
   - [ ] Click toggle → theme switches
   - [ ] Icon updates (Sun ↔ Moon)

**Expected Result**: Sidebar shows only public links + Sign In for guests

---

### 2. Sidebar Collapse/Expand (3 minutes)

**Objective**: Verify desktop collapse functionality

1. **Desktop viewport**: Ensure browser width > 768px
2. **Find toggle button** (typically in sidebar header)
3. **Click toggle button**
   - [ ] Sidebar collapses to icon-only view
   - [ ] Labels hidden, only icons visible
   - [ ] Animation is smooth (no jarring)
4. **Click toggle again**
   - [ ] Sidebar expands to full width
   - [ ] Labels reappear next to icons
5. **Refresh page** (F5 or Cmd+R)
   - [ ] Sidebar state persists (stays collapsed/expanded)

**Expected Result**: Sidebar toggles between full and icon-only, preference persists

---

### 3. Mobile Responsive Behavior (3 minutes)

**Objective**: Verify mobile overlay functionality

1. **Resize browser** to mobile width (< 768px) or use DevTools mobile view
2. **Verify sidebar is hidden** by default
3. **Find hamburger menu button** (top-left or top-right)
4. **Tap/click hamburger button**
   - [ ] Sidebar slides in from left as overlay
   - [ ] Backdrop visible behind sidebar
   - [ ] Content is readable (not cut off)
5. **Click a navigation link** (e.g., Monsters)
   - [ ] Navigation occurs
   - [ ] Sidebar automatically closes
6. **Open sidebar again**, then **tap backdrop**
   - [ ] Sidebar closes

**Expected Result**: Mobile sidebar works as overlay, auto-closes on navigation

---

### 4. Authentication & User Menu (5 minutes)

**Objective**: Verify authenticated user menu rendering

1. **Click Sign In** button in sidebar
2. **Log in** with test credentials:
   ```
   Email: [test user email]
   Password: [test user password]
   ```
3. **Navigate back to homepage**
4. **Verify dashboard section** appears with:
   - [ ] "Dashboard" group label
   - [ ] My Monsters link
   - [ ] My Spells link
   - [ ] Encounters link
   - [ ] Favorite Monsters link
   - [ ] Favorite Spells link
5. **Verify account section** appears with:
   - [ ] "Account" group label
   - [ ] Profile link (if username_slug exists)
   - [ ] Settings link
   - [ ] Logout button
6. **Verify Sign In button** is now gone

**Expected Result**: Dashboard and Account sections visible after login

---

### 5. Admin Role Verification (3 minutes)

**Objective**: Verify role-based menu visibility

**Note**: Skip this if you don't have admin credentials

1. **Log out** (click Logout in sidebar)
2. **Log in as admin**:
   ```
   Email: [admin email]
   Password: [admin password]
   ```
3. **Verify Administration section** appears with:
   - [ ] "Administration" group label
   - [ ] Admin Dashboard link
4. **Click Admin Dashboard link**
   - [ ] Navigate to /admin route
   - [ ] Active indicator on Admin Dashboard link

**Expected Result**: Admin section only visible to admin/moderator roles

---

### 6. Active Route Indication (2 minutes)

**Objective**: Verify current page highlighting

1. **Click Monsters link** in sidebar
   - [ ] Monsters link gets active styling (e.g., bold, different color)
   - [ ] data-active attribute present on link element
2. **Click Spells link**
   - [ ] Spells link becomes active
   - [ ] Monsters link becomes inactive
3. **Navigate to** /dashboard/monsters (via URL or click)
   - [ ] "My Monsters" link in Dashboard section is active
4. **Navigate to nested route** (e.g., /monsters/123)
   - [ ] Parent route (Monsters) still shows as active

**Expected Result**: Active link always highlighted, works with nested routes

---

### 7. Keyboard Navigation (3 minutes)

**Objective**: Verify keyboard accessibility

1. **Focus browser window**
2. **Press Tab key** repeatedly
   - [ ] Focus moves through sidebar links
   - [ ] Focus indicator visible on each link
3. **Press Enter** on a focused link
   - [ ] Navigation occurs
4. **Press cmd+b** (Mac) or **ctrl+b** (Windows/Linux)
   - [ ] Sidebar toggles collapsed/expanded
5. **On mobile**, open sidebar and **press Escape**
   - [ ] Sidebar closes

**Expected Result**: All sidebar interactions work via keyboard

---

### 8. Theme Toggle Persistence (2 minutes)

**Objective**: Verify theme preference saves

1. **Check current theme** (dark or light)
2. **Click theme toggle** in sidebar footer
   - [ ] Theme switches immediately
   - [ ] Icon updates
3. **Close browser tab**
4. **Reopen** http://localhost:3000
5. **Verify theme** matches your last selection

**Expected Result**: Theme preference persists across sessions

---

### 9. Navigation Flow - Full Journey (5 minutes)

**Objective**: Verify end-to-end navigation works

1. **Start as guest** on homepage
2. **Click Monsters** → view monster list
3. **Click Sign In** → login page
4. **Log in** → redirected
5. **Click My Monsters** → dashboard monsters
6. **Click Settings** → settings page
7. **Click About** → about page
8. **Click Logout** → logged out, redirected home
9. **Verify sidebar** updates back to guest view

**Expected Result**: All navigation paths work, sidebar updates with auth state

---

### 10. Regression Check - Existing Features (3 minutes)

**Objective**: Verify old functionality still works

1. **Search for a monster** (use search if available)
   - [ ] Search still works
2. **View monster detail** page
   - [ ] Detail view renders correctly
   - [ ] Sidebar visible on detail page
3. **Create a monster** (if authenticated)
   - [ ] Form still accessible
   - [ ] Sidebar visible during creation
4. **Check favorites** (if authenticated)
   - [ ] Favorites heart icon still toggles
   - [ ] Favorite items show in Favorite Monsters section

**Expected Result**: All existing features unaffected by sidebar migration

---

## Success Criteria

All checkboxes above should be checked (✓). If any fail:

1. **Document the failure**:
   - What step failed?
   - What was the expected behavior?
   - What actually happened?
   - Browser and viewport size

2. **Check console for errors**:

   ```
   Open DevTools → Console tab
   Look for red error messages
   ```

3. **Check network tab**:
   ```
   Open DevTools → Network tab
   Look for failed requests (red status codes)
   ```

## Common Issues & Fixes

### Issue: Sidebar not visible

- **Check**: Is SidebarProvider in layout.tsx?
- **Check**: Is AppSidebar component rendered?
- **Fix**: Verify component imports and provider hierarchy

### Issue: Menu items not filtering correctly

- **Check**: Is user state loading correctly? (console.log)
- **Check**: Are filter conditions correct in useMemo?
- **Fix**: Verify AuthProvider integration

### Issue: Toggle button not working

- **Check**: Is useSidebar() hook imported?
- **Check**: Are toggle handlers connected?
- **Fix**: Verify event handlers and state updates

### Issue: Mobile sidebar not closing

- **Check**: Is navigation listener set up?
- **Check**: Is setOpenMobile(false) called on link click?
- **Fix**: Add useEffect to listen for route changes

### Issue: State not persisting

- **Check**: Open DevTools → Application → Cookies
- **Check**: Is "sidebar:state" cookie present?
- **Fix**: Verify cookie domain and path settings

### Issue: Performance lag

- **Check**: Open DevTools → Performance tab
- **Check**: Record toggle animation, look for dropped frames
- **Fix**: Ensure CSS transforms used, check for layout thrashing

## Automated Test Validation

After manual quickstart, run automated tests:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

**Expected Results**:

- Unit tests: 100% pass rate
- E2E tests: 100% pass rate
- Coverage: ≥ 40% (target)

## Sign-Off

- [ ] All manual tests passed
- [ ] All automated tests passed
- [ ] No console errors
- [ ] No visual regressions
- [ ] Performance acceptable (< 100ms toggle)
- [ ] Mobile and desktop both tested
- [ ] Guest and authenticated flows tested

**Tester Name**: **\*\***\_\_\_**\*\***
**Date**: **\*\***\_\_\_**\*\***
**Notes**: **\*\***\_\_\_**\*\***
