# Component Contracts

**Feature**: Enhanced Mobile Navigation Menu
**Date**: 2025-10-24

## Overview

This feature is UI-only and does not introduce REST API endpoints. Instead, it defines component contracts for React components that implement the mobile navigation menu enhancement.

## Component Contracts

### 1. Navbar Component (`components/ui/navbar.tsx`)

**Purpose**: Base navigation bar component with responsive mobile menu

**Props Contract**:

```typescript
interface MobileMenuItem {
  type: "link" | "button" | "separator";
  label?: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: "default" | "destructive";
  adminOnly?: boolean;
}

interface NavigationLink {
  href: string;
  label: string;
  external?: boolean;
}

interface NavbarProps {
  logo?: React.ReactNode;
  navigationLinks?: NavigationLink[];
  signInButton?: {
    label: string;
    onClick: () => void;
  };
  ctaButton?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost"
      | "link";
  };
  rightContent?: React.ReactNode;
  mobileMenuItems?: MobileMenuItem[]; // NEW: Custom mobile menu items
  className?: string;
}
```

**Behavior Contract**:

1. **Desktop Rendering (viewport >= 768px)**:
   - MUST render `navigationLinks` as horizontal navigation menu
   - MUST render `rightContent` in top-right corner
   - MUST NOT render mobile hamburger menu
   - Behavior: Unchanged from current implementation

2. **Mobile Rendering (viewport < 768px)**:
   - MUST render hamburger menu icon
   - MUST NOT render desktop navigation or rightContent
   - When `mobileMenuItems` is provided:
     - MUST render custom mobile menu items in Popover
     - MUST handle item clicks and auto-close menu
   - When `mobileMenuItems` is undefined:
     - MUST render default mobile menu (navigationLinks + rightContent)
   - MUST close menu on: item click, outside click, ESC key

3. **Mobile Menu Item Rendering**:
   - `type: 'link'`: Render as Next.js Link with href
   - `type: 'button'`: Render as Button with onClick handler
   - `type: 'separator'`: Render as Separator component or divider
   - All items MUST auto-close menu on interaction
   - `variant: 'destructive'` MUST apply destructive styling (red text)
   - Icons MUST be rendered with consistent size (h-4 w-4)

4. **Accessibility**:
   - Hamburger button MUST have `aria-label="Toggle menu"`
   - Hamburger button MUST have `aria-expanded` matching menu state
   - Menu items MUST be keyboard navigable
   - ESC key MUST close menu
   - Focus MUST return to hamburger button on close

**Testing Contract**:

```typescript
describe("Navbar Component", () => {
  describe("Mobile Menu with Custom Items", () => {
    it("renders custom mobile menu items when provided", () => {
      // Given: Custom mobileMenuItems prop
      // When: Rendering in mobile viewport
      // Then: Custom items rendered, default items not rendered
    });

    it("renders link items as Next.js Link", () => {
      // Given: MobileMenuItem with type: 'link'
      // When: Item is clicked
      // Then: Navigation occurs, menu closes
    });

    it("renders button items with onClick handler", () => {
      // Given: MobileMenuItem with type: 'button'
      // When: Item is clicked
      // Then: onClick called, menu closes
    });

    it("renders separator items as visual dividers", () => {
      // Given: MobileMenuItem with type: 'separator'
      // When: Rendering menu
      // Then: Separator component rendered with proper styling
    });

    it("applies destructive styling to logout button", () => {
      // Given: MobileMenuItem with variant: 'destructive'
      // When: Rendering menu
      // Then: Text color is destructive (red)
    });

    it("closes menu on item click", () => {
      // Given: Open mobile menu
      // When: User clicks any menu item
      // Then: Menu closes, isOpen state becomes false
    });

    it("closes menu on outside click", () => {
      // Given: Open mobile menu
      // When: User clicks outside menu
      // Then: Menu closes
    });

    it("closes menu on ESC key press", () => {
      // Given: Open mobile menu
      // When: User presses ESC key
      // Then: Menu closes
    });
  });

  describe("Backward Compatibility", () => {
    it("renders default mobile menu when mobileMenuItems not provided", () => {
      // Given: No mobileMenuItems prop
      // When: Rendering in mobile viewport
      // Then: navigationLinks and rightContent rendered
    });

    it("desktop behavior unchanged", () => {
      // Given: Any prop configuration
      // When: Rendering in desktop viewport (>= 768px)
      // Then: Desktop navigation rendered, mobile menu not visible
    });
  });
});
```

---

### 2. AppNavbar Component (`components/navigation/app-navbar.tsx`)

**Purpose**: Authentication-aware navbar wrapper that provides user-specific menu items

**Props Contract**:

```typescript
// No props - component is self-contained
interface AppNavbarProps {}
```

**Behavior Contract**:

1. **User State Management**:
   - MUST subscribe to Supabase auth state changes
   - MUST fetch user profile data (username_slug) on auth change
   - MUST update local user state on auth changes
   - MUST handle missing username_slug gracefully (fallback to null)

2. **Desktop Rendering**:
   - MUST render user avatar dropdown menu (unchanged from current)
   - Dropdown MUST contain: Dashboard, Profile, Settings, Logout
   - Admin users MUST see Admin Dashboard option
   - MUST render theme toggle as icon button

3. **Mobile Rendering**:
   - MUST generate `mobileMenuItems` array based on auth state
   - Authenticated users: Dashboard, Profile, Settings, Theme Toggle, Logout
   - Guest users: Theme Toggle, Sign In
   - Admin users: Include Admin Dashboard option
   - MUST pass `mobileMenuItems` to Navbar component

4. **Menu Item Generation**:
   - Dashboard link: `/dashboard`
   - Profile link: `/users/{username_slug}` OR `/settings` (if no slug)
   - Settings link: `/settings`
   - Admin Dashboard link: `/admin` (admin/moderator only)
   - Theme toggle: Button with theme switch handler
   - Logout: Button with Supabase signOut handler + redirect to `/`

5. **Theme Toggle**:
   - MUST toggle between 'light' and 'dark' themes
   - MUST update button label dynamically ("Light Mode" when dark, "Dark Mode" when light)
   - MUST use Sun icon for light mode, Moon icon for dark mode
   - MUST blur button after click (remove focus ring)

6. **Logout Handler**:
   - MUST call `supabase.auth.signOut()`
   - MUST clear local user state on success
   - MUST show success toast on logout
   - MUST redirect to `/` (home page)
   - MUST show error toast on failure

**Testing Contract**:

```typescript
describe("AppNavbar Component", () => {
  describe("Menu Items Generation", () => {
    it("generates authenticated user menu items", () => {
      // Given: User is authenticated
      // When: Component renders
      // Then: mobileMenuItems includes Dashboard, Profile, Settings, Theme, Logout
    });

    it("generates guest user menu items", () => {
      // Given: User is not authenticated
      // When: Component renders
      // Then: mobileMenuItems includes Theme Toggle, Sign In only
    });

    it("includes Admin Dashboard for admin users", () => {
      // Given: User has role 'admin' or 'moderator'
      // When: Component renders
      // Then: mobileMenuItems includes Admin Dashboard link
    });

    it("uses username_slug for profile link when available", () => {
      // Given: User has username_slug set
      // When: Component renders
      // Then: Profile link href is /users/{username_slug}
    });

    it("falls back to /settings for profile link when no username_slug", () => {
      // Given: User does not have username_slug
      // When: Component renders
      // Then: Profile link href is /settings
    });
  });

  describe("Theme Toggle", () => {
    it("toggles from light to dark theme", () => {
      // Given: Theme is 'light'
      // When: User clicks theme toggle in mobile menu
      // Then: setTheme('dark') is called
    });

    it("toggles from dark to light theme", () => {
      // Given: Theme is 'dark'
      // When: User clicks theme toggle in mobile menu
      // Then: setTheme('light') is called
    });

    it("shows correct label based on theme", () => {
      // Given: Theme is 'dark'
      // When: Component renders
      // Then: Theme toggle label is 'Light Mode' (opposite of current)
    });
  });

  describe("Logout Handler", () => {
    it("logs out user successfully", async () => {
      // Given: User is authenticated
      // When: User clicks Logout in mobile menu
      // Then: supabase.auth.signOut() called, toast shown, redirect to /
    });

    it("handles logout errors", async () => {
      // Given: signOut returns an error
      // When: User clicks Logout
      // Then: Error toast shown, user state remains
    });
  });

  describe("Desktop Behavior", () => {
    it("renders desktop dropdown menu unchanged", () => {
      // Given: Viewport >= 768px
      // When: Component renders
      // Then: User avatar dropdown with existing options rendered
    });
  });
});
```

---

## Integration Contracts

### Navbar ↔ AppNavbar Integration

**Contract**: AppNavbar provides auth-aware menu items to Navbar

**Data Flow**:

```
User Auth State (Supabase)
  ↓
AppNavbar (compute mobileMenuItems)
  ↓
Navbar (render mobileMenuItems in Popover)
  ↓
User Interaction
  ↓
AppNavbar handlers (logout, theme toggle) OR Next.js navigation
```

**Guarantees**:

1. AppNavbar MUST always provide valid MobileMenuItem[] or undefined
2. Navbar MUST handle both custom items and default fallback
3. Menu item clicks MUST trigger handlers before menu closes
4. Navigation items MUST use Next.js Link for client-side routing

### Theme Integration

**Contract**: Theme state managed by next-themes, consumed by both components

**Data Flow**:

```
next-themes Provider (app layout)
  ↓
useTheme() hook in AppNavbar
  ↓
Theme toggle button in mobile menu
  ↓
setTheme() updates theme + localStorage
  ↓
UI updates (theme classes applied)
```

**Guarantees**:

1. Theme state MUST be initialized before first render (mounted check)
2. Theme toggle MUST persist to localStorage via next-themes
3. Theme icon/label MUST reflect current theme
4. Theme changes MUST be instant (no page reload)

### Auth Integration

**Contract**: Auth state managed by Supabase, consumed via onAuthStateChange

**Data Flow**:

```
Supabase Auth
  ↓
onAuthStateChange subscription in AppNavbar
  ↓
User state updated
  ↓
mobileMenuItems recomputed
  ↓
Navbar re-renders with new menu items
```

**Guarantees**:

1. Auth state changes MUST trigger menu item regeneration
2. Logout MUST clear user state and redirect
3. Profile data fetch errors MUST be handled gracefully
4. Subscription MUST be cleaned up on unmount

---

## Test Files to Create

Based on the contracts above, the following test files should be created:

### Component Tests (Vitest + React Testing Library)

1. **`__tests__/components/ui/navbar.test.tsx`**
   - Mobile menu rendering with custom items
   - Item type rendering (link, button, separator)
   - Auto-close behavior
   - Keyboard navigation
   - Accessibility attributes

2. **`__tests__/components/navigation/app-navbar.test.tsx`**
   - Menu items generation for auth states
   - Theme toggle behavior
   - Logout handler
   - Profile link fallback logic
   - Admin menu items conditional rendering

### E2E Tests (Playwright)

3. **`__tests__/e2e/mobile-navigation.spec.ts`**
   - Guest user mobile navigation flow
   - Authenticated user mobile navigation flow
   - Admin user sees admin options
   - Theme toggle works in mobile menu
   - Logout flow from mobile menu
   - Menu closes after interactions

---

**Status**: ✅ Component contracts defined, ready for test creation
