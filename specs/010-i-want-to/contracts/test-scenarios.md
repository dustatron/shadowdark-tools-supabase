# Test Scenarios for Sidebar Migration

This document defines the test scenarios that validate the sidebar implementation against requirements.

## Unit Test Scenarios

### 1. NavigationLink Filtering (component-unit.test.tsx)

**Given**: A list of navigation links
**When**: Component renders
**Then**: All public links are visible

**Test Cases**:

- ✓ Renders Home link with Home icon
- ✓ Renders Monsters link with Swords icon
- ✓ Renders Spells link with Sparkles icon
- ✓ Renders Encounter Tables link with Dice6 icon
- ✓ Renders About link with Info icon
- ✓ All links have correct href attributes
- ✓ External links have target="\_blank" and rel="noopener noreferrer"

### 2. User Menu Filtering - Guest (component-unit.test.tsx)

**Given**: User is not authenticated (user = null)
**When**: Component renders
**Then**: Only public links and sign-in are visible

**Test Cases**:

- ✓ Dashboard section is not rendered
- ✓ Account section is not rendered
- ✓ Admin section is not rendered
- ✓ Sign In button is visible
- ✓ Theme toggle is visible in footer

### 3. User Menu Filtering - Authenticated (component-unit.test.tsx)

**Given**: User is authenticated with role="user"
**When**: Component renders
**Then**: Dashboard and Account sections are visible

**Test Cases**:

- ✓ Dashboard section header is rendered
- ✓ My Monsters link is visible
- ✓ My Spells link is visible
- ✓ Encounters link is visible
- ✓ Favorite Monsters link is visible
- ✓ Favorite Spells link is visible
- ✓ Account section header is rendered
- ✓ Settings link is visible
- ✓ Logout button is visible
- ✓ Admin section is not rendered

### 4. User Menu Filtering - Admin (component-unit.test.tsx)

**Given**: User is authenticated with role="admin"
**When**: Component renders
**Then**: Admin section is visible

**Test Cases**:

- ✓ Admin section header is rendered
- ✓ Admin Dashboard link is visible
- ✓ Admin link is only visible to admin/moderator roles

### 5. Conditional Menu Items (component-unit.test.tsx)

**Given**: User has no username_slug
**When**: Component renders
**Then**: Profile link is not visible

**Test Cases**:

- ✓ Profile link hidden when username_slug is null
- ✓ Profile link visible when username_slug exists
- ✓ Profile link href includes correct username_slug

### 6. Active Route Indication (component-unit.test.tsx)

**Given**: User is on /monsters page
**When**: Component renders
**Then**: Monsters link is marked as active

**Test Cases**:

- ✓ data-active attribute is set on current route
- ✓ aria-current="page" is set on current route
- ✓ Prefix matching works for nested routes (e.g., /dashboard/monsters)
- ✓ Only one link is active at a time

### 7. Theme Toggle (theme-toggle-unit.test.tsx)

**Given**: Theme is set to dark
**When**: User clicks theme toggle
**Then**: Theme switches to light and icon updates

**Test Cases**:

- ✓ Clicking toggle calls setTheme()
- ✓ Sun icon shown when theme is dark
- ✓ Moon icon shown when theme is light
- ✓ Button has aria-label for accessibility

## Integration Test Scenarios

### 8. Sidebar State Persistence (sidebar-state.test.tsx)

**Given**: User toggles sidebar to collapsed
**When**: Page reloads
**Then**: Sidebar remains collapsed

**Test Cases**:

- ✓ Cookie "sidebar:state" is set on toggle
- ✓ Cookie value is "false" when collapsed
- ✓ Cookie value is "true" when expanded
- ✓ State is restored from cookie on load
- ✓ Falls back to default (expanded) if cookie not set

### 9. Mobile vs Desktop Behavior (sidebar-responsive.test.tsx)

**Given**: Viewport width is < 768px (mobile)
**When**: Component renders
**Then**: Sidebar is hidden and toggle button shown

**Test Cases**:

- ✓ useSidebar().isMobile is true when viewport < 768px
- ✓ useSidebar().isMobile is false when viewport >= 768px
- ✓ Mobile sidebar uses overlay (openMobile state)
- ✓ Desktop sidebar uses inline (open state)
- ✓ Toggle button triggers correct state based on viewport

### 10. Logout Interaction (sidebar-logout.test.tsx)

**Given**: User clicks Logout button
**When**: Logout completes
**Then**: User is redirected and sidebar updates

**Test Cases**:

- ✓ Logout button calls signOut() from AuthProvider
- ✓ Toast notification shown on successful logout
- ✓ User redirected to homepage
- ✓ Sidebar menu updates to guest view
- ✓ Dashboard sections disappear

## E2E Test Scenarios (Playwright)

### 11. Navigation Flow - Guest (sidebar-navigation.spec.ts)

**Given**: User visits homepage as guest
**When**: User clicks navigation links
**Then**: User navigates to correct pages

**Test Cases**:

- ✓ Click Monsters link → /monsters page loads
- ✓ Click Spells link → /spells page loads
- ✓ Click About link → /about page loads
- ✓ Active link indicator updates after navigation
- ✓ Sign In button → /auth/login page

### 12. Navigation Flow - Authenticated (sidebar-navigation-auth.spec.ts)

**Given**: User is logged in
**When**: User clicks dashboard links
**Then**: User navigates to dashboard pages

**Test Cases**:

- ✓ Click My Monsters → /dashboard/monsters
- ✓ Click My Spells → /dashboard/spells
- ✓ Click Encounters → /dashboard/encounters
- ✓ Click Settings → /settings
- ✓ Active indicator updates in dashboard section

### 13. Sidebar Collapse/Expand (sidebar-toggle.spec.ts)

**Given**: User is on desktop viewport
**When**: User clicks toggle button
**Then**: Sidebar collapses to icon-only view

**Test Cases**:

- ✓ Sidebar starts in expanded state (full labels)
- ✓ Click toggle → sidebar collapses (icons only)
- ✓ Icon labels remain as tooltips in collapsed state
- ✓ Click toggle again → sidebar expands
- ✓ Animation is smooth (no jarring transitions)
- ✓ Main content area adjusts width appropriately

### 14. Mobile Sidebar Overlay (sidebar-mobile.spec.ts)

**Given**: User is on mobile viewport (375px width)
**When**: User taps hamburger menu
**Then**: Sidebar opens as overlay

**Test Cases**:

- ✓ Sidebar hidden by default on mobile
- ✓ Hamburger button visible in header
- ✓ Tap hamburger → sidebar slides in from left
- ✓ Backdrop is visible behind sidebar
- ✓ Tap navigation link → sidebar closes automatically
- ✓ Tap backdrop → sidebar closes
- ✓ Sidebar content is scrollable if tall

### 15. Keyboard Navigation (sidebar-keyboard.spec.ts)

**Given**: User is using keyboard
**When**: User presses cmd+b (Mac) or ctrl+b (Windows)
**Then**: Sidebar toggles state

**Test Cases**:

- ✓ cmd+b toggles sidebar on Mac
- ✓ ctrl+b toggles sidebar on Windows/Linux
- ✓ Tab key navigates through sidebar links
- ✓ Enter key activates focused link
- ✓ Arrow keys navigate within sidebar menu (Radix UI)
- ✓ Escape key closes mobile sidebar

### 16. Theme Toggle Flow (theme-toggle.spec.ts)

**Given**: User is viewing site in dark mode
**When**: User clicks theme toggle in sidebar footer
**Then**: Site switches to light mode

**Test Cases**:

- ✓ Click Sun icon → theme changes to light
- ✓ Icon updates to Moon
- ✓ Theme preference persisted (localStorage)
- ✓ Reload page → theme preference restored
- ✓ Theme toggle works in both collapsed and expanded states

### 17. Admin Role Visibility (sidebar-admin.spec.ts)

**Given**: User logs in with admin role
**When**: Sidebar renders
**Then**: Admin section is visible

**Test Cases**:

- ✓ Regular user sees no Admin section
- ✓ Admin user sees Admin section with header
- ✓ Admin Dashboard link visible to admin
- ✓ Click Admin Dashboard → /admin route loads
- ✓ Moderator user also sees Admin section

### 18. Responsive Breakpoint Transition (sidebar-breakpoint.spec.ts)

**Given**: User resizes browser from desktop to mobile
**When**: Viewport crosses 768px breakpoint
**Then**: Sidebar behavior updates

**Test Cases**:

- ✓ Desktop → Mobile: Sidebar converts to overlay mode
- ✓ Mobile → Desktop: Sidebar converts to inline mode
- ✓ State persists across breakpoint changes
- ✓ No layout flash or broken states during transition

## Accessibility Test Scenarios

### 19. Screen Reader Navigation (sidebar-a11y.spec.ts)

**Given**: User navigates with screen reader
**When**: User tabs through sidebar
**Then**: All elements are announced correctly

**Test Cases**:

- ✓ Sidebar has aria-label="Navigation sidebar"
- ✓ Active link has aria-current="page"
- ✓ Toggle button has aria-label="Toggle sidebar"
- ✓ Collapsed state announced via aria-expanded
- ✓ Group labels use aria-labelledby
- ✓ Theme toggle has descriptive aria-label

### 20. Keyboard Focus Management (sidebar-focus.spec.ts)

**Given**: User opens mobile sidebar with keyboard
**When**: Sidebar opens
**Then**: Focus is trapped within sidebar

**Test Cases**:

- ✓ Focus moves to first sidebar link on open
- ✓ Tab key cycles within sidebar (no escape to background)
- ✓ Shift+Tab reverses focus direction
- ✓ Escape key closes sidebar and restores focus
- ✓ Skip link available for keyboard users

## Performance Test Scenarios

### 21. Sidebar Render Performance (sidebar-performance.test.tsx)

**Given**: Component has 20+ menu items
**When**: Component re-renders
**Then**: Filtering completes in < 50ms

**Test Cases**:

- ✓ Menu item filtering is memoized
- ✓ No unnecessary re-renders on state changes
- ✓ Icon imports are tree-shaken

### 22. Animation Performance (sidebar-animation.spec.ts)

**Given**: User toggles sidebar rapidly
**When**: Multiple toggles occur
**Then**: Animations remain smooth (no jank)

**Test Cases**:

- ✓ Toggle animation runs at 60fps
- ✓ No layout thrashing during transition
- ✓ CSS transforms used (GPU accelerated)
- ✓ No performance degradation with 30+ pages open

## Regression Test Scenarios

### 23. Existing Features Preserved (sidebar-regression.spec.ts)

**Given**: Sidebar migration is complete
**When**: User performs common tasks
**Then**: All functionality still works

**Test Cases**:

- ✓ Authentication flow unchanged
- ✓ All 33 pages still accessible
- ✓ Search functionality works
- ✓ Monster creation works
- ✓ Spell creation works
- ✓ Encounter table generation works
- ✓ Favorites toggle works
- ✓ User settings save correctly

### 24. Layout Compatibility (sidebar-layout.spec.ts)

**Given**: Different page layouts exist (dashboard, public, auth)
**When**: User navigates between layout types
**Then**: Sidebar adapts correctly

**Test Cases**:

- ✓ Sidebar visible on all pages except auth pages
- ✓ Dashboard pages show sidebar with active indicators
- ✓ Public pages show sidebar with limited menu
- ✓ Auth pages (login/signup) may hide sidebar or show minimal version
- ✓ No layout shift between pages

## Test Priority

**P0 (Must Pass)**:

- Scenarios 1-6 (Core rendering and filtering)
- Scenarios 11-12 (Navigation flows)
- Scenarios 13-14 (Toggle and mobile)
- Scenario 23 (Regression tests)

**P1 (High Priority)**:

- Scenarios 7-10 (Integration tests)
- Scenarios 15-17 (Keyboard, theme, roles)
- Scenarios 19-20 (Accessibility)

**P2 (Nice to Have)**:

- Scenarios 18, 21-22, 24 (Edge cases and performance)

## Test Data Requirements

### Test Users

```typescript
const testUsers = {
  guest: null,
  regularUser: {
    id: "user-123",
    email: "user@example.com",
    display_name: "Test User",
    username_slug: "testuser",
    role: "user",
  },
  adminUser: {
    id: "admin-123",
    email: "admin@example.com",
    display_name: "Admin User",
    username_slug: "admin",
    role: "admin",
  },
  userWithoutProfile: {
    id: "user-456",
    email: "newuser@example.com",
    display_name: null,
    username_slug: null,
    role: "user",
  },
};
```

### Test Routes

```typescript
const testRoutes = [
  "/",
  "/monsters",
  "/spells",
  "/encounter-tables",
  "/about",
  "/dashboard/monsters",
  "/dashboard/spells",
  "/dashboard/encounters",
  "/dashboard/favorites/monsters",
  "/dashboard/favorites/spells",
  "/settings",
  "/admin",
  "/auth/login",
];
```

### Viewport Sizes

```typescript
const viewports = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1440, height: 900 }, // Desktop
  wide: { width: 1920, height: 1080 }, // Wide desktop
};
```
