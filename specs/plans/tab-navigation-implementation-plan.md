# Tab-Based Navigation Implementation Plan

## Overview

Implement a polished tab-based navigation system for the Shadowdark GM Tools application, inspired by the Mantine UI header-tabs component. This will replace the current button-based desktop navigation with a more modern, professional tab interface that provides better visual hierarchy and active state indication.

**Reference**: https://ui.mantine.dev/component/header-tabs/

## Goals

1. **Professional UX**: Implement a two-tier header layout with tabs that visually connect to the header
2. **Clear Active States**: Use tab styling to clearly indicate the current page/section
3. **Responsive Design**: Maintain mobile burger menu while adding desktop tabs
4. **Theme Support**: Ensure tabs work seamlessly with light/dark mode
5. **Accessibility**: Leverage Mantine's built-in ARIA support for tabs

## Current State Analysis

### Existing Navigation (Desktop)
- Simple button-based navigation in header
- Buttons use `variant="light"` for active state
- Responsive but lacks visual polish
- Located in: `src/components/layout/Header.tsx`

### Existing Navigation (Mobile)
- Burger menu with drawer (`MobileNav.tsx`)
- NavLinks with active states
- **Keep unchanged** - working well for mobile

### Header Structure
- Single-section header (60px height)
- Group layout: Logo | Nav Buttons | Actions
- Located in AppShell from `RootProvider.tsx`

## Mantine Header-Tabs Analysis

### Key Features Identified

**Structure**:
- Two-tier layout:
  - **Top section**: Brand/logo (left) + User menu (right)
  - **Bottom section**: Full-width tabs navigation
- Uses `Tabs` component with `variant="outline"`
- Tabs positioned to overlap header border for seamless appearance

**Styling**:
- Header background color with 1px bottom border
- Tabs positioned with `bottom: -1px` to overlap border
- Active tab has no bottom border (creates connected look)
- Hover states with subtle background color change
- CSS modules for component-scoped styles
- `light-dark()` function for theme support

**Responsive**:
- Tabs: `visibleFrom="sm"` (desktop only)
- Burger: `hiddenFrom="sm"` (mobile only)
- Container maintains consistent width

## Implementation Plan

### Phase 1: Create CSS Module

**File**: `src/components/layout/Header.module.css` (new file)

Create scoped styles for:
- `.header` - Header container with background and border
- `.mainSection` - Top section padding
- `.tabsList` - Remove default Mantine border
- `.tab` - Tab styling with hover and active states

**Key CSS Features**:
```css
.header {
  background-color: light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6));
  border-bottom: 1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7));
}

.tab {
  position: relative;
  bottom: -1px; /* Overlap header border */

  &[data-active] {
    border-bottom-color: transparent; /* Remove bottom border for active */
  }
}
```

**Testing with Playwright**:
- Navigate to http://localhost:3000
- Take screenshot to verify styles applied
- Toggle dark mode and verify `light-dark()` values switch correctly

---

### Phase 2: Update Header Component Structure

**File**: `src/components/layout/Header.tsx`

#### 2.1 Add Imports
```tsx
import { Tabs } from '@mantine/core';
import { useRouter } from 'next/navigation';
import classes from './Header.module.css';
```

#### 2.2 Define Tab Configuration
```tsx
const tabs = [
  { value: 'home', label: 'Home', path: '/' },
  { value: 'monsters', label: 'Monsters', path: '/monsters' },
  { value: 'spells', label: 'Spells', path: '/spells' },
  { value: 'encounters', label: 'Encounters', path: '/encounters', disabled: true },
];
```

#### 2.3 Active Tab Detection
```tsx
function getActiveTab(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/monsters')) return 'monsters';
  if (pathname.startsWith('/spells')) return 'spells';
  if (pathname.startsWith('/encounters')) return 'encounters';
  return 'home';
}

const activeTab = getActiveTab(pathname);
```

#### 2.4 Update JSX Structure
Replace current single-section Group with two-tier layout:

```tsx
<div className={classes.header}>
  {/* Top Section: Logo + Actions */}
  <Container className={classes.mainSection} size="xl">
    <Group justify="space-between" h={60}>
      {/* Mobile burger */}
      <Burger
        opened={mobileOpened}
        onClick={onToggleMobile}
        hiddenFrom="sm"
        size="sm"
      />

      {/* Logo/Brand */}
      <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Text size="xl" fw={700} c="shadowdark.2">
          Shadowdark GM Tools
        </Text>
      </Link>

      {/* Right side: Theme toggle + User menu */}
      <Group gap="xs">
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => toggleColorScheme()}
        >
          {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>

        {user ? (
          <Menu>{/* existing user menu */}</Menu>
        ) : (
          <Button component={Link} href="/auth/login">Login</Button>
        )}
      </Group>
    </Group>
  </Container>

  {/* Bottom Section: Tabs Navigation */}
  <Container size="xl">
    <Tabs
      value={activeTab}
      onChange={(value) => {
        const tab = tabs.find(t => t.value === value);
        if (tab && !tab.disabled) {
          router.push(tab.path);
        }
      }}
      variant="outline"
      visibleFrom="sm"
      classNames={{
        root: classes.tabs,
        list: classes.tabsList,
        tab: classes.tab,
      }}
    >
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  </Container>
</div>
```

**Testing with Playwright**:
- Navigate to http://localhost:3000
- Verify two-tier layout visible on desktop
- Verify tabs render correctly
- Click each tab and verify navigation works
- Use `browser_snapshot` to inspect tab accessibility attributes

---

### Phase 3: Update AppShell Header Height

**File**: `src/components/providers/RootProvider.tsx`

#### 3.1 Update Header Configuration
```tsx
<AppShell header={{ height: 94 }} padding="md">
```

**Calculation**:
- Top section: 60px (logo + actions)
- Bottom section: 38px (tabs with -1px overlap)
- Total: ~94px

**Testing with Playwright**:
- Navigate to http://localhost:3000
- Verify no content overlap with header
- Scroll page and verify header stays fixed at correct height
- Take full-page screenshot to verify layout

---

### Phase 4: Handle Edge Cases

#### 4.1 Nested Route Handling
Ensure `/monsters/[id]` and `/spells/[slug]` correctly highlight parent tab:

```tsx
function getActiveTab(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/monsters')) return 'monsters';
  if (pathname.startsWith('/spells')) return 'spells';
  if (pathname.startsWith('/encounters')) return 'encounters';
  // Protected routes and other pages
  if (pathname.startsWith('/profile') || pathname.startsWith('/settings')) {
    return ''; // No tab active
  }
  return 'home'; // Default to home
}
```

**Testing with Playwright**:
- Navigate to `/monsters`
- Navigate to `/monsters/aboleth` (or any specific monster)
- Verify "Monsters" tab remains active on detail page
- Repeat for spells

#### 4.2 Disabled Tab Styling
Ensure "Encounters" tab shows as disabled:

```css
.tab {
  &[data-disabled] {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
    }
  }
}
```

**Testing with Playwright**:
- Verify "Encounters" tab has disabled styling
- Attempt to click it and verify no navigation occurs
- Check accessibility snapshot for `aria-disabled="true"`

---

### Phase 5: Mobile Responsiveness Verification

**File**: `src/components/layout/MobileNav.tsx` (no changes needed)

**Testing with Playwright**:
1. Resize browser to 375px width (mobile)
2. Verify tabs are hidden
3. Verify burger menu is visible
4. Click burger and verify drawer opens
5. Verify mobile nav links still work
6. Take screenshot of mobile view

---

### Phase 6: Theme Toggle Verification

**Testing with Playwright**:
1. Start in dark mode (default)
2. Verify header background is dark-6
3. Verify tab borders are dark-7
4. Click theme toggle to switch to light mode
5. Verify header background is gray-0
6. Verify tab borders are gray-2
7. Take screenshots of both modes for comparison

---

### Phase 7: Hover States and Interactions

**Testing with Playwright**:
1. Hover over inactive tab
2. Verify background color changes (use `browser_evaluate` to check computed styles)
3. Hover over active tab
4. Verify active tab maintains its styling
5. Test keyboard navigation (Tab key to focus, Enter to activate)

---

## Testing Strategy with Playwright MCP Server

### Test Scenarios

#### Scenario 1: Desktop Tab Navigation
```
1. Navigate to http://localhost:3000
2. Verify tabs visible (visibleFrom="sm")
3. Click "Monsters" tab
4. Verify URL is /monsters
5. Verify "Monsters" tab has active styling
6. Take screenshot: desktop-monsters-active.png
7. Click "Spells" tab
8. Verify URL is /spells
9. Verify "Spells" tab has active styling
10. Take screenshot: desktop-spells-active.png
```

#### Scenario 2: Mobile Responsive Layout
```
1. Navigate to http://localhost:3000
2. Resize to 375px width
3. Verify tabs are hidden
4. Verify burger menu visible
5. Take screenshot: mobile-burger-visible.png
6. Click burger menu
7. Verify drawer opens
8. Take screenshot: mobile-drawer-open.png
9. Click "Monsters" in drawer
10. Verify navigation to /monsters
11. Verify drawer closes
```

#### Scenario 3: Nested Route Active State
```
1. Navigate to /monsters
2. Verify "Monsters" tab active
3. Click first monster in list
4. Verify URL is /monsters/[id]
5. Verify "Monsters" tab STILL active
6. Take screenshot: nested-route-active-state.png
7. Navigate back to /monsters
8. Verify "Monsters" tab still active
```

#### Scenario 4: Theme Toggle with Tabs
```
1. Navigate to http://localhost:3000
2. Verify dark mode active (default)
3. Take screenshot: tabs-dark-mode.png
4. Click theme toggle (sun icon)
5. Verify light mode active
6. Verify tab colors updated
7. Take screenshot: tabs-light-mode.png
8. Click theme toggle again (moon icon)
9. Verify dark mode restored
10. Verify tab colors match initial state
```

#### Scenario 5: Disabled Tab Behavior
```
1. Navigate to http://localhost:3000
2. Verify "Encounters" tab visible but disabled
3. Hover over "Encounters" tab
4. Verify cursor shows not-allowed
5. Click "Encounters" tab
6. Verify no navigation occurs
7. Verify URL remains at /
8. Use browser_snapshot to verify aria-disabled="true"
```

#### Scenario 6: Keyboard Navigation
```
1. Navigate to http://localhost:3000
2. Press Tab key until tabs are focused
3. Press Arrow Right key
4. Verify focus moves to next tab
5. Press Enter key
6. Verify navigation occurs
7. Take screenshot: keyboard-navigation.png
```

### Validation Checkpoints

After implementation, verify:
- ✅ Header height is correct (94px)
- ✅ Tabs visible on desktop (≥640px)
- ✅ Tabs hidden on mobile (<640px)
- ✅ Burger menu visible on mobile
- ✅ Active tab has connected appearance (no bottom border)
- ✅ Tab hover states work
- ✅ Tab navigation works via click
- ✅ Tab navigation works via keyboard
- ✅ Nested routes show correct active tab
- ✅ Disabled tab cannot be clicked
- ✅ Theme toggle updates tab colors
- ✅ Mobile drawer navigation still works
- ✅ No hydration errors
- ✅ No accessibility violations

---

## Files to Create/Modify

### New Files
1. `src/components/layout/Header.module.css` - CSS module for header and tabs

### Modified Files
1. `src/components/layout/Header.tsx` - Update to two-tier tab layout
2. `src/components/providers/RootProvider.tsx` - Update AppShell header height (60 → 94)

### Unchanged Files
1. `src/components/layout/MobileNav.tsx` - Keep as-is
2. `src/components/providers/MantineProvider.tsx` - No changes needed

---

## Success Criteria

### Functional
- [x] Tabs render on desktop screens (≥640px)
- [x] Tabs hidden on mobile screens (<640px)
- [x] Clicking tab navigates to correct route
- [x] Active tab visually connected to header (no bottom border)
- [x] Nested routes (e.g., /monsters/123) show parent tab as active
- [x] Disabled tab ("Encounters") cannot be navigated to
- [x] Burger menu and mobile drawer still work

### Visual
- [x] Header has proper background color (light-dark support)
- [x] Tabs have hover states
- [x] Active tab styling clear and distinct
- [x] Tab positioning overlaps header border (-1px)
- [x] Consistent spacing and alignment
- [x] Theme toggle updates all colors correctly

### Accessibility
- [x] Tabs use proper ARIA attributes (role="tablist", etc.)
- [x] Keyboard navigation works (Tab, Arrow keys, Enter)
- [x] Focus indicators visible
- [x] Disabled tab has aria-disabled="true"
- [x] Screen reader announces tab changes

### Performance
- [x] No hydration errors
- [x] No console warnings
- [x] Smooth tab transitions
- [x] CSS module properly scoped (no style leaks)

---

## Potential Issues and Mitigations

### Issue 1: Header Height Shift
**Problem**: Changing from 60px to 94px could cause layout shifts
**Mitigation**:
- Update AppShell header height immediately
- Test all pages to ensure content not hidden
- Check mobile layouts for overflow

**Test**: Use Playwright to navigate to all routes and verify no content overlap

### Issue 2: Pathname Matching for Nested Routes
**Problem**: `/monsters/123` might not match "monsters" tab
**Mitigation**:
- Use `pathname.startsWith('/monsters')` instead of exact match
- Test with actual monster/spell detail pages

**Test**: Navigate to detail pages via Playwright and verify active tab

### Issue 3: CSS Module Not Loading
**Problem**: Styles might not apply if module not imported correctly
**Mitigation**:
- Ensure `.module.css` extension used
- Verify import path is correct
- Check build output for CSS bundling

**Test**: Inspect element in Playwright to verify classes applied

### Issue 4: Theme Toggle Breaking Tab Colors
**Problem**: `light-dark()` might not work in all contexts
**Mitigation**:
- Use Mantine CSS variables instead of raw colors
- Test theme toggle extensively
- Verify CSS color inheritance

**Test**: Toggle theme multiple times and verify colors update

### Issue 5: Mobile Breakpoint Conflicts
**Problem**: `visibleFrom="sm"` and `hiddenFrom="sm"` might conflict
**Mitigation**:
- Verify Mantine breakpoints match expected values
- Use same breakpoint for both visibility toggles
- Test at exact breakpoint width (640px)

**Test**: Resize browser from 375px to 1280px gradually, verify transition point

---

## Rollback Plan

If implementation fails or causes issues:

1. **Revert Header.tsx**: `git checkout src/components/layout/Header.tsx`
2. **Remove CSS Module**: `rm src/components/layout/Header.module.css`
3. **Revert RootProvider**: `git checkout src/components/providers/RootProvider.tsx`
4. **Test Reversion**: Verify app returns to working state

---

## Post-Implementation Tasks

1. **Update Documentation**: Add header-tabs pattern to project docs
2. **Screenshot Updates**: Replace old header screenshots in README
3. **Accessibility Audit**: Run lighthouse/axe on new header
4. **Performance Check**: Verify no layout shift metrics degraded
5. **Cross-Browser Test**: Test in Safari, Firefox, Chrome
6. **User Feedback**: Gather feedback on new navigation UX

---

## Timeline Estimate

- **Phase 1** (CSS Module): 30 minutes
- **Phase 2** (Header Component): 1 hour
- **Phase 3** (AppShell Height): 15 minutes
- **Phase 4** (Edge Cases): 30 minutes
- **Phase 5** (Mobile Testing): 30 minutes
- **Phase 6** (Theme Testing): 15 minutes
- **Phase 7** (Interactions): 30 minutes
- **Testing with Playwright**: 1 hour
- **Bug Fixes & Polish**: 1 hour

**Total**: ~5 hours

---

## Implementation Order

1. Create CSS module (Phase 1)
2. Test CSS in isolation with Playwright
3. Update Header component structure (Phase 2)
4. Test tabs navigation with Playwright
5. Update AppShell height (Phase 3)
6. Test layout with Playwright
7. Add edge case handling (Phase 4)
8. Test nested routes with Playwright
9. Verify mobile responsiveness (Phase 5)
10. Test mobile with Playwright
11. Verify theme toggle (Phase 6)
12. Test themes with Playwright
13. Test interactions (Phase 7)
14. Final comprehensive Playwright test suite
15. Document any issues found
16. Polish and iterate

---

## Notes

- Keep existing mobile navigation unchanged (working well)
- Maintain all existing functionality (theme toggle, user menu, etc.)
- Use Mantine components and patterns consistently
- Leverage CSS modules for scoped styling
- Test thoroughly with Playwright MCP server at each phase
- Prioritize accessibility (keyboard nav, ARIA attributes)
- Ensure dark mode support throughout
- Follow Mantine best practices from official examples

---

## References

- Mantine Header Tabs: https://ui.mantine.dev/component/header-tabs/
- Mantine Tabs Docs: https://mantine.dev/core/tabs/
- Mantine AppShell Docs: https://mantine.dev/core/app-shell/
- CSS Modules: https://github.com/css-modules/css-modules
