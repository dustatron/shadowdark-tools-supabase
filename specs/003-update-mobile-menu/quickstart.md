# Quickstart Guide: Enhanced Mobile Navigation Menu

**Feature**: Enhanced Mobile Navigation Menu
**Branch**: `003-update-mobile-menu`
**Date**: 2025-10-24

## Overview

This quickstart guide validates the implementation of the enhanced mobile navigation menu feature. Follow these steps to verify all requirements are met.

## Prerequisites

- Application running locally (`npm run dev`)
- Browser DevTools open (for responsive testing)
- Test user account created (for authenticated testing)
- Admin/moderator account available (for admin menu testing)

## Manual Validation Steps

### 1. Guest User Mobile Menu (Not Authenticated)

**Objective**: Verify guest users see appropriate menu options

**Steps**:

1. Open application in browser (ensure logged out)
2. Open DevTools and set viewport to mobile (375x667 - iPhone SE)
3. Click the hamburger menu icon (top-right)

**Expected Results**:

- ✅ Mobile menu opens with smooth animation
- ✅ Menu displays:
  - Home link
  - Monsters link
  - Spells link
  - Encounter Tables link
  - Visual separator (border or spacing)
  - Theme toggle button (with Sun/Moon icon and label)
  - Visual separator
  - Sign In button
- ✅ No user account options visible (Dashboard, Profile, Settings, Logout)

**Validation Actions**:

1. Click "Theme Toggle" → Theme changes, menu closes
2. Reopen menu, click "Sign In" → Redirects to /auth/login, menu closes
3. Reopen menu, click "Monsters" → Navigates to /monsters, menu closes
4. Reopen menu, click outside → Menu closes
5. Reopen menu, press ESC key → Menu closes

---

### 2. Authenticated User Mobile Menu

**Objective**: Verify authenticated users see all account options directly in mobile menu

**Steps**:

1. Log in with test user account
2. Ensure viewport is still mobile (375x667)
3. Click the hamburger menu icon

**Expected Results**:

- ✅ Mobile menu opens with smooth animation
- ✅ Menu displays (in order):
  - Home link
  - Monsters link
  - Spells link
  - Encounter Tables link
  - Visual separator
  - Dashboard link (with icon)
  - Profile link (with icon)
  - Settings link (with icon)
  - Visual separator
  - Theme toggle (with Sun/Moon icon and label)
  - Visual separator
  - Logout button (with red/destructive text color)
- ✅ NO nested dropdown or avatar icon in mobile menu
- ✅ All items clearly visible without scrolling (on standard mobile viewport)

**Validation Actions**:

1. Click "Dashboard" → Navigates to /dashboard, menu closes
2. Reopen menu, click "Profile" → Navigates to profile page, menu closes
3. Reopen menu, click "Settings" → Navigates to /settings, menu closes
4. Reopen menu, click "Theme Toggle" → Theme changes, menu closes
5. Reopen menu, click "Logout" → Signs out, redirects to /, toast shown, menu closes

---

### 3. Admin/Moderator User Mobile Menu

**Objective**: Verify admin users see admin-specific options

**Steps**:

1. Log in with admin or moderator account
2. Set viewport to mobile (375x667)
3. Click the hamburger menu icon

**Expected Results**:

- ✅ All standard authenticated user menu items visible
- ✅ Additional section visible:
  - Visual separator (after Settings)
  - "Admin Dashboard" link (with icon)
- ✅ Admin Dashboard appears before Theme Toggle section

**Validation Actions**:

1. Click "Admin Dashboard" → Navigates to /admin, menu closes
2. Verify admin section only visible for admin/moderator roles (not regular users)

---

### 4. Desktop Behavior (Unchanged)

**Objective**: Verify desktop navigation remains unchanged

**Steps**:

1. Set viewport to desktop (1280x800)
2. Ensure logged in as authenticated user

**Expected Results**:

- ✅ Hamburger menu icon NOT visible
- ✅ Horizontal navigation links visible (Home, Monsters, Spells, Encounter Tables)
- ✅ Theme toggle icon button visible (top-right, before avatar)
- ✅ User avatar visible (top-right)
- ✅ Clicking avatar opens dropdown menu
- ✅ Dropdown contains: Dashboard, Profile, Settings, (Admin Dashboard if admin), Logout

**Validation Actions**:

1. Click avatar → Dropdown opens with all account options
2. Click outside → Dropdown closes
3. Desktop navigation behavior identical to before this feature

---

### 5. Responsive Breakpoint Testing

**Objective**: Verify menu switches correctly at 768px breakpoint

**Steps**:

1. Start at mobile viewport (375x667)
2. Gradually increase width to 768px, then beyond

**Expected Results**:

- ✅ At < 768px: Hamburger menu visible, desktop nav hidden
- ✅ At exactly 768px: Desktop nav becomes visible, hamburger hidden
- ✅ At > 768px: Desktop nav visible, hamburger hidden
- ✅ Smooth transition, no layout shift or flash

---

### 6. Touch Target Accessibility

**Objective**: Verify all menu items have adequate touch targets

**Steps**:

1. Open mobile menu on actual mobile device (if available) or DevTools mobile emulation
2. Attempt to tap each menu item

**Expected Results**:

- ✅ All menu items easily tappable (no mis-taps)
- ✅ Minimum tap target size: 44x44px (WCAG 2.5.5 Level AAA)
- ✅ Adequate spacing between items (no accidental taps)
- ✅ Visual feedback on tap (hover/active states)

**Validation Actions**:

1. Tap each menu item → Correct action occurs
2. Inspect element in DevTools → Verify padding/height >= 44px

---

### 7. Keyboard Navigation

**Objective**: Verify menu is keyboard accessible

**Steps**:

1. Set viewport to mobile
2. Use keyboard only (Tab, Enter, ESC)

**Expected Results**:

- ✅ Tab key moves focus to hamburger button
- ✅ Enter/Space opens menu
- ✅ Tab key navigates through menu items
- ✅ Enter/Space activates focused menu item
- ✅ ESC key closes menu
- ✅ Focus returns to hamburger button on close

---

### 8. Theme Toggle Integration

**Objective**: Verify theme toggle works correctly in mobile menu

**Steps**:

1. Open mobile menu in light theme
2. Click theme toggle
3. Verify theme change
4. Reopen menu

**Expected Results**:

- ✅ Theme toggle shows "Dark Mode" label in light theme
- ✅ Theme toggle shows "Light Mode" label in dark theme
- ✅ Icon changes: Sun (light mode option) / Moon (dark mode option)
- ✅ Theme persists after menu closes and reopens
- ✅ Theme applies immediately (no flash or delay)

---

### 9. Profile Link Fallback

**Objective**: Verify profile link handles missing username_slug

**Steps**:

1. Log in with user that has username_slug set
2. Open mobile menu, note Profile link href
3. Log in with user that does NOT have username_slug
4. Open mobile menu, note Profile link href

**Expected Results**:

- ✅ User with username_slug: Profile links to `/users/{username_slug}`
- ✅ User without username_slug: Profile links to `/settings`
- ✅ Both links work correctly when clicked

---

### 10. Menu Overflow Handling

**Objective**: Verify menu handles overflow on small viewports

**Steps**:

1. Set viewport to very small height (320x568 - iPhone SE landscape)
2. Open mobile menu as admin user (longest menu)

**Expected Results**:

- ✅ Menu content exceeds viewport height
- ✅ Menu becomes scrollable
- ✅ All items accessible via scrolling
- ✅ Menu closes when expected (clicks still work)

---

## Automated Test Validation

After manual validation, run automated tests:

### Component Tests

```bash
npm test navbar.test.tsx
npm test app-navbar.test.tsx
```

**Expected Results**:

- ✅ All Navbar component tests pass
- ✅ All AppNavbar component tests pass
- ✅ Test coverage >= 40% (project minimum)

### E2E Tests

```bash
npm run test:e2e mobile-navigation.spec.ts
```

**Expected Results**:

- ✅ Guest user mobile navigation flow passes
- ✅ Authenticated user mobile navigation flow passes
- ✅ Admin user mobile navigation flow passes
- ✅ Theme toggle E2E test passes
- ✅ Logout E2E test passes

---

## Performance Validation

### Animation Performance

**Steps**:

1. Open DevTools Performance tab
2. Record while opening/closing mobile menu
3. Analyze frame rate

**Expected Results**:

- ✅ Animations run at 60fps (no dropped frames)
- ✅ Menu open/close transitions smooth (<300ms)
- ✅ No layout thrashing or reflows

### Bundle Size Impact

**Steps**:

```bash
npm run build
```

**Expected Results**:

- ✅ No significant bundle size increase (frontend-only change)
- ✅ No new dependencies added
- ✅ Build succeeds without errors

---

## Accessibility Validation (WCAG)

### Screen Reader Testing (Optional but Recommended)

**Steps**:

1. Enable VoiceOver (macOS) or NVDA/JAWS (Windows)
2. Navigate mobile menu with screen reader

**Expected Results**:

- ✅ Menu button announces "Toggle menu, button"
- ✅ Menu state announced (expanded/collapsed)
- ✅ Menu items announced with labels
- ✅ Links announced as "link"
- ✅ Buttons announced as "button"

### Color Contrast

**Steps**:

1. Open DevTools Accessibility panel
2. Inspect menu item text colors

**Expected Results**:

- ✅ Regular menu items: Contrast ratio >= 4.5:1 (WCAG AA)
- ✅ Destructive text (logout): Contrast ratio >= 4.5:1
- ✅ Icons: Contrast ratio >= 3:1 (non-text content)

---

## Regression Testing

### Desktop Navigation (Unchanged)

**Validation**:

- ✅ Desktop navigation links work
- ✅ Desktop user dropdown works
- ✅ Desktop theme toggle works
- ✅ Desktop logout works
- ✅ Admin dropdown shows admin options

### Existing Mobile Menu (Guest Users)

**Validation**:

- ✅ Mobile menu still works for guest users
- ✅ Sign In button works
- ✅ Navigation links work

---

## Rollback Plan

If any validation step fails critically:

1. **Revert changes**:

   ```bash
   git checkout main -- components/ui/navbar.tsx components/navigation/app-navbar.tsx
   ```

2. **Verify rollback**:
   - Test mobile menu works as before
   - No errors in console

3. **Document issue**:
   - Create GitHub issue with failing validation step
   - Include screenshots/video if possible

---

## Sign-Off Checklist

Before merging to main:

- [ ] All manual validation steps passed
- [ ] All automated tests passed
- [ ] E2E tests passed
- [ ] Performance validated (60fps animations)
- [ ] Accessibility validated (keyboard, touch targets)
- [ ] Desktop behavior unchanged (regression test)
- [ ] No console errors or warnings
- [ ] Code reviewed (if team process requires)
- [ ] Feature documented in CHANGELOG (if applicable)

---

**Status**: Ready for validation once implementation complete
