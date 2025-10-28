# Phase 0: Research & Discovery

**Feature**: Enhanced Mobile Navigation Menu
**Date**: 2025-10-24

## Research Objectives

1. Analyze existing mobile menu implementation
2. Identify shadcn/ui component patterns for mobile menus
3. Determine best practices for responsive navigation
4. Review accessibility requirements for mobile menus

## Current Implementation Analysis

### Existing Components

**File**: `components/ui/navbar.tsx`

- Base Navbar component using shadcn/ui Popover for mobile menu
- Mobile menu triggered by hamburger icon (< 768px breakpoint)
- Current mobile menu displays navigation links only
- `rightContent` prop passed through but rendered inline in mobile menu
- Auto-close on link click implemented via `setIsOpen(false)`

**File**: `components/navigation/app-navbar.tsx`

- Wrapper component providing authentication-aware navigation
- Manages user state via Supabase auth subscription
- Desktop: User avatar dropdown with account options (Dashboard, Profile, Settings, Logout)
- Mobile: Currently passes `rightContent` which includes theme toggle and user avatar dropdown
- Theme toggle rendered as separate icon button
- Admin users see "Admin Dashboard" option

### Current Pain Points

1. **Nested interaction**: Mobile users must tap hamburger → tap avatar → see account options (2 taps + dropdown)
2. **Poor discoverability**: Account options hidden behind avatar dropdown on mobile
3. **Inconsistent UX**: Theme toggle is icon-only on mobile vs. labeled option desired
4. **Visual complexity**: Avatar dropdown component in mobile menu feels cramped

## Technical Decisions

### Decision 1: Mobile Menu Content Structure

**Decision**: Flatten mobile menu to show all options as direct menu items

**Rationale**:

- Reduces interaction steps from 2+ taps to 1 tap
- Improves discoverability of account features
- Aligns with mobile UX best practices (avoid nested menus on small screens)
- Better accessibility for touch interactions

**Implementation Approach**:

- Modify `navbar.tsx` to accept optional `mobileMenuContent` prop
- Pass user-aware menu items from `app-navbar.tsx` to `navbar.tsx`
- Render items as list with separators for visual grouping

**Alternatives Considered**:

- Keep nested dropdown: Rejected due to poor mobile UX
- Create separate mobile-only component: Rejected due to code duplication
- Use Sheet instead of Popover: Rejected - Popover sufficient for menu size

### Decision 2: Theme Toggle Presentation

**Decision**: Render theme toggle as a clickable menu item with label and icon

**Rationale**:

- Consistency with other menu items
- Better discoverability (labeled vs. icon-only)
- More touch-friendly (larger tap target)
- Follows mobile menu conventions

**Implementation Approach**:

- Add theme toggle as menu item in mobile menu content
- Show "Light Mode" or "Dark Mode" label with Sun/Moon icon
- Handle click inline, auto-close menu after toggle

**Alternatives Considered**:

- Keep as icon button: Rejected - poor discoverability
- Use Switch component: Rejected - inconsistent with menu item pattern

### Decision 3: Component Architecture

**Decision**: Modify existing `navbar.tsx` to support conditional mobile content rendering

**Rationale**:

- Maintains single source of truth for navbar
- Avoids component duplication
- Leverages existing Popover, animation, and auto-close logic
- Minimal changes to existing desktop behavior

**Implementation Approach**:

1. Add optional `mobileMenuItems` prop to Navbar
2. When provided, render custom mobile menu content instead of default pattern
3. Preserve desktop `rightContent` rendering unchanged
4. `app-navbar.tsx` generates menu items based on auth state

**Alternatives Considered**:

- Create new MobileNavbar component: Rejected - duplication
- Pass render function: Considered but adds complexity
- Use React Context for user state: Rejected - prop drilling is clear and testable

### Decision 4: Visual Hierarchy & Separators

**Decision**: Use shadcn/ui Separator component between navigation and account sections

**Rationale**:

- Clear visual grouping of related items
- Follows material design and iOS menu patterns
- Improves scannability of menu options
- Already available in shadcn/ui

**Implementation Approach**:

- Main navigation links (Home, Monsters, Spells, Encounter Tables)
- Separator (border-t utility or Separator component)
- User account options (Dashboard, Profile, Settings)
- Theme toggle
- Logout (optionally separated with destructive styling)

**Alternatives Considered**:

- Section headers: Rejected - adds visual noise
- Spacing only: Rejected - insufficient differentiation
- Card grouping: Rejected - over-styled for menu context

## Technology Stack Confirmation

### UI Components (shadcn/ui)

- ✅ Popover: Existing, used for mobile menu dropdown
- ✅ Button: Existing, used for menu items and triggers
- ✅ Separator: Existing, used for visual grouping
- ✅ Avatar: Existing, used in desktop dropdown (not needed in mobile)

### Icons (Lucide React)

- ✅ Sun, Moon: Theme toggle icons
- ✅ User, Settings, LayoutDashboard, LogOut: Account option icons
- ✅ Menu (HamburgerIcon custom): Existing hamburger animation

### State Management

- ✅ Local state (useState): Menu open/closed state
- ✅ next-themes (useTheme): Theme toggle
- ✅ Supabase auth: User state via `onAuthStateChange`

### Styling

- ✅ Tailwind CSS: All styling via utility classes
- ✅ cn() utility: Class name merging
- ✅ Responsive utilities: `md:hidden` for mobile-only rendering

## Accessibility Considerations

### Touch Targets

- Minimum 44x44px tap targets per WCAG 2.5.5 (Level AAA)
- Current button padding: `px-3 py-2` (~48px height) ✅
- Ensure consistent spacing for all menu items

### Keyboard Navigation

- Popover handles focus management via Radix UI ✅
- Menu items should be keyboard navigable (link/button semantics)
- ESC key closes menu (already implemented)

### Screen Readers

- Menu items should have semantic HTML (links for navigation, buttons for actions)
- ARIA labels where needed (e.g., "Toggle theme", "Logout")
- Announce menu open/close state (Popover handles this)

### Focus Management

- Focus should return to hamburger button on menu close ✅
- Menu items should receive focus on keyboard navigation
- Logout confirmation if needed (out of scope for this feature)

## Performance Considerations

### Rendering

- No performance impact: Simple conditional rendering
- User state already fetched and cached by app-navbar.tsx
- No additional API calls or data fetching

### Animation

- Existing Popover animation sufficient (<16ms frame time)
- No custom animations needed
- CSS transitions handled by shadcn/ui components

## Testing Strategy

### Component Tests (Vitest)

**navbar.tsx**:

1. Renders mobile menu with custom items when provided
2. Renders default mobile menu when custom items not provided
3. Auto-closes menu on item click
4. Handles keyboard navigation (ESC key)

**app-navbar.tsx**:

1. Generates correct menu items for authenticated user
2. Generates correct menu items for guest user
3. Shows admin options for admin/moderator users
4. Theme toggle updates theme state
5. Logout handler calls Supabase signOut

### E2E Tests (Playwright)

**Mobile Navigation Flows**:

1. Guest user: Opens mobile menu → sees navigation + Sign In + theme toggle
2. Authenticated user: Opens mobile menu → sees navigation + account options + theme toggle
3. Click menu item → navigates to correct page + menu closes
4. Theme toggle → changes theme + menu closes
5. Logout → signs out + redirects + menu closes
6. Admin user: Opens mobile menu → sees admin dashboard option

### Visual Regression (Manual)

- Verify mobile menu layout at various viewport sizes
- Ensure touch targets are appropriately sized
- Check separator styling and spacing
- Verify icon alignment and text truncation

## Migration Path

This is a non-breaking change:

1. Modify `navbar.tsx` to support optional `mobileMenuItems` prop
2. Default behavior unchanged (backward compatible)
3. Update `app-navbar.tsx` to provide mobile menu items
4. No database migrations needed
5. No API changes needed

## Unknowns Resolved

All technical context items resolved:

- ✅ Component architecture defined
- ✅ UI component selection confirmed
- ✅ Accessibility patterns identified
- ✅ Testing approach outlined
- ✅ Performance validated (no concerns)

## References

- shadcn/ui Popover: https://ui.shadcn.com/docs/components/popover
- shadcn/ui Separator: https://ui.shadcn.com/docs/components/separator
- Radix UI Popover: https://www.radix-ui.com/primitives/docs/components/popover
- WCAG 2.5.5 Touch Target Size: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
- Mobile Menu UX Best Practices: https://www.nngroup.com/articles/mobile-navigation/

---

**Status**: ✅ All research complete, ready for Phase 1 (Design)
