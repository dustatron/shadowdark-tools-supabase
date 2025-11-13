# Research: Sidebar Migration

**Phase**: 0 - Outline & Research
**Date**: 2025-01-12

## Research Questions

### 1. shadcn/ui Sidebar Component Architecture

**Question**: What is the composition pattern and API for shadcn/ui Sidebar?

**Findings**:

- **Compositional Structure**: Uses `SidebarProvider` → `Sidebar` → `SidebarHeader/Content/Footer` → `SidebarGroup/Menu`
- **State Management**: `useSidebar()` hook provides `open`, `isMobile`, `openMobile`, `setOpen()`, `setOpenMobile()`, `toggleSidebar()`
- **Collapsible Variants**:
  - `offcanvas` - slides in/out (default mobile behavior)
  - `icon` - collapses to icon-only view
  - `none` - static, no collapse
- **Positioning**: `side="left"` or `side="right"` prop
- **Styles**: `variant="sidebar"`, `"floating"`, or `"inset"`
- **Keyboard Shortcut**: Built-in cmd+b / ctrl+b toggle via hook

**Decision**: Use `variant="sidebar"` with `collapsible="icon"` for desktop icon-collapse behavior

**Rationale**: Best matches requirement FR-002 (icon-only/full-label transitions) while maintaining modern app aesthetic

**Alternatives Considered**:

- `collapsible="offcanvas"` - More dramatic animation, less practical for frequent use
- `collapsible="none"` - Doesn't meet FR-002 requirement for collapse functionality

### 2. State Persistence Strategy

**Question**: How should collapsed/expanded preference be persisted across sessions?

**Findings**:

- **shadcn/ui Built-in**: Uses cookies via `document.cookie` with `js-cookie` library
- **Next.js Compatibility**: Works with SSR, accessible in server components via `cookies()` from `next/headers`
- **Cookie Format**: `sidebar:state=true|false` (expanded/collapsed)
- **Fallback Strategy**: Can use localStorage for browsers that block cookies

**Decision**: Use shadcn/ui's default cookie-based persistence

**Rationale**:

- No additional code required - works out of box
- SSR compatible for Next.js 15
- Automatic mobile/desktop state separation

**Alternatives Considered**:

- localStorage only - Not SSR compatible, hydration issues
- URL params - Clutters URLs, breaks on external navigation
- Database storage - Overkill for UI preference, adds latency

### 3. Mobile vs Desktop Responsive Behavior

**Question**: What breakpoints and behavior differences for mobile/desktop?

**Findings**:

- **Default Breakpoint**: `768px` (md: breakpoint in Tailwind)
- **Mobile Behavior**: `isMobile` automatically detected, uses overlay with backdrop
- **Desktop Behavior**: Inline sidebar, pushes content right when expanded
- **Hook Properties**:
  - `isMobile: boolean` - auto-detected via matchMedia
  - `open: boolean` - desktop state
  - `openMobile: boolean` - mobile state
  - Separate state prevents mobile overlay from affecting desktop layout

**Decision**: Use default 768px breakpoint with shadcn/ui's built-in mobile detection

**Rationale**: Matches Tailwind's `md:` breakpoint already used throughout app, proven UX pattern

**Alternatives Considered**:

- Custom breakpoint (640px or 1024px) - Inconsistent with existing Tailwind usage
- Manual mobile detection - Reinventing what's already provided

### 4. Layout Integration with Next.js App Router

**Question**: Where should SidebarProvider be placed in Next.js layout hierarchy?

**Findings**:

- **Recommended**: Root layout (`app/layout.tsx`) wraps all pages
- **Context Requirement**: SidebarProvider must be ancestor of all Sidebar components
- **Performance**: Provider uses React Context, minimal re-render overhead
- **Auth Integration**: Must be inside auth provider to access user state

**Decision**: Add SidebarProvider to `app/layout.tsx` inside existing RootProvider

**Rationale**:

- Single source of truth for sidebar state
- All pages automatically get sidebar context
- Proper nesting with AuthProvider for user menu

**Alternatives Considered**:

- Per-route providers - Loses state between navigations, poor UX
- Outside RootProvider - Can't access auth context for user menus

### 5. Icon Library and Navigation Icons

**Question**: Which icon library and what icons for each navigation item?

**Findings**:

- **Current Library**: Lucide React 0.545 already in use (package.json)
- **Icon Recommendations** (from existing codebase + shadcn patterns):
  - Home: `Home` icon
  - Monsters: `Swords` icon (already used)
  - Spells: `Sparkles` icon (already used)
  - Encounter Tables: `Dice6` icon (already used)
  - About: `Info` icon
  - Dashboard: `LayoutDashboard` icon (already used)
  - Favorites: `Heart` icon (already used)
  - Profile: `User` icon (already used)
  - Settings: `Settings` icon (already used)
  - Admin: `Shield` or `LayoutDashboard` icon
  - Logout: `LogOut` icon (already used)
  - Toggle: `ChevronLeft`/`ChevronRight` or `Menu` icon

**Decision**: Use existing Lucide React icons from current navbar implementation

**Rationale**:

- Already imported and used in AppNavbar
- Consistent with existing UI
- No new dependencies

**Alternatives Considered**:

- Radix UI icons - Less variety, would need additional imports
- Custom SVGs - Maintenance burden, inconsistent sizing

### 6. Active Route Indication

**Question**: How to visually indicate current active page in sidebar?

**Findings**:

- **Next.js Pattern**: Use `usePathname()` from `next/navigation`
- **Matching Strategy**:
  - Exact match: `pathname === href`
  - Prefix match: `pathname.startsWith(href)` for nested routes
- **Visual Treatment**: `data-active` attribute on `SidebarMenuButton` automatically styles active state
- **Accessibility**: `aria-current="page"` for screen readers

**Decision**: Use `usePathname()` with prefix matching and `data-active` attribute

**Rationale**:

- Built-in Next.js hook, client-side
- shadcn/ui Sidebar components styled for `data-active`
- Covers nested routes (e.g., `/dashboard/monsters` when `/dashboard` active)

**Alternatives Considered**:

- Server-side pathname from headers - Not reactive on client navigation
- Manual CSS classes - Reinventing provided styling

### 7. Accessibility and Keyboard Navigation

**Question**: What accessibility features are required for WCAG compliance?

**Findings**:

- **Built-in Features**:
  - `cmd+b`/`ctrl+b` toggle already implemented in `useSidebar()` hook
  - Focus management via Radix UI primitives
  - `aria-label` on SidebarTrigger
  - Keyboard navigation (Tab, Arrow keys) through Radix Menu primitives
- **Required Additions**:
  - `aria-current="page"` on active menu items
  - Skip link for keyboard users to bypass sidebar
  - Focus trap when mobile sidebar open
  - Screen reader announcements for collapsed/expanded state

**Decision**: Leverage Radix UI accessibility + add aria-current and skip link

**Rationale**:

- Radix handles complex focus management
- Minimal custom code for full accessibility
- Meets FR-015 requirement

**Alternatives Considered**:

- Custom keyboard handling - Error-prone, misses edge cases
- Third-party a11y library - Unnecessary with Radix UI

### 8. Theme Toggle Placement

**Question**: Where should dark/light mode toggle be placed in sidebar?

**Findings**:

- **Common Patterns**:
  - `SidebarFooter` - Always visible, bottom of sidebar
  - `SidebarHeader` - Next to logo/branding
  - User menu dropdown - Grouped with settings
- **Current Implementation**: Top-right of navbar, standalone button

**Decision**: Place in `SidebarFooter` with icon button (same as current)

**Rationale**:

- Always accessible regardless of scroll position
- Maintains familiar location (bottom-right area)
- Doesn't clutter header with logo

**Alternatives Considered**:

- SidebarHeader - Competes with logo/title visually
- User menu - Hides from guest users, extra clicks

## Summary of Decisions

| Decision Area     | Choice                            | Key Rationale                           |
| ----------------- | --------------------------------- | --------------------------------------- |
| Sidebar Variant   | `collapsible="icon"`              | Icon-only collapse for desktop (FR-002) |
| State Persistence | Cookie-based (default)            | SSR compatible, no extra code           |
| Mobile Breakpoint | 768px (md:)                       | Matches existing Tailwind usage         |
| Provider Location | Inside RootProvider in layout.tsx | Access to auth context                  |
| Icon Library      | Lucide React (existing)           | Already imported, consistent            |
| Active Route      | usePathname() + data-active       | Built-in Next.js + shadcn styling       |
| Accessibility     | Radix UI + aria-current           | WCAG compliant, minimal code            |
| Theme Toggle      | SidebarFooter                     | Always visible, familiar                |

## Remaining Unknowns

None - All technical decisions resolved for implementation.

## References

- [shadcn/ui Sidebar Documentation](https://ui.shadcn.com/docs/components/sidebar)
- [Radix UI Primitives - Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [Next.js App Router - usePathname](https://nextjs.org/docs/app/api-reference/functions/use-pathname)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
