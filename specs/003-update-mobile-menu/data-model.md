# Data Model

**Feature**: Enhanced Mobile Navigation Menu
**Date**: 2025-10-24

## Overview

This feature is primarily UI-focused and does not introduce new data entities. It uses existing authentication state and user data from Supabase to determine which menu options to display.

## Existing Data Dependencies

### User Authentication State

**Source**: Supabase Auth (via `@supabase/ssr`)

**Properties Used**:
- `user.id` (string): User identifier
- `user.email` (string): User email address
- `user.user_metadata.display_name` (string, optional): User display name
- `user.app_metadata.role` (string, optional): User role (`admin`, `moderator`, or undefined)

**State Transitions**: N/A (authentication state managed by Supabase)

**Validation**: No additional validation required - consumed as-is from auth session

### User Profile Data

**Source**: `user_profiles` table (Supabase)

**Properties Used**:
- `username_slug` (string, optional): URL-friendly username for profile links

**Relationships**: One-to-one with User (via `id` foreign key)

**Validation**: N/A (existing data, read-only for this feature)

**Fallback Behavior**: If `username_slug` is null/undefined, profile link directs to `/settings` instead of `/users/[slug]`

## Component State (Local)

### Mobile Menu State

**Managed By**: `navbar.tsx` component

**Properties**:
```typescript
interface MobileMenuState {
  isOpen: boolean; // Menu open/closed state
}
```

**State Transitions**:
- `closed → open`: User clicks hamburger icon
- `open → closed`: User clicks menu item, clicks outside, or presses ESC key

**Validation**: N/A (simple boolean toggle)

### Theme State

**Managed By**: `next-themes` library

**Properties**:
```typescript
interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: string) => void;
}
```

**State Transitions**:
- `light → dark`: User clicks theme toggle (when in light mode)
- `dark → light`: User clicks theme toggle (when in dark mode)

**Persistence**: Managed by `next-themes` (localStorage)

## Component Props

### MobileMenuItem

**Purpose**: Represents a single item in the mobile menu

**Structure**:
```typescript
interface MobileMenuItem {
  type: 'link' | 'button' | 'separator';
  label?: string;
  href?: string;
  icon?: React.ComponentType;
  onClick?: () => void;
  variant?: 'default' | 'destructive'; // For styling (e.g., logout button)
  adminOnly?: boolean; // Show only if user is admin/moderator
}
```

**Validation Rules**:
- If `type === 'link'`: `href` is required, `onClick` is optional
- If `type === 'button'`: `onClick` is required, `href` is optional
- If `type === 'separator'`: `label`, `href`, `onClick` are ignored
- `icon` is always optional (menu item can be text-only)

**Example Usage**:
```typescript
const menuItems: MobileMenuItem[] = [
  { type: 'link', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { type: 'link', label: 'Profile', href: '/users/username', icon: User },
  { type: 'link', label: 'Settings', href: '/settings', icon: Settings },
  { type: 'separator' },
  { type: 'button', label: 'Light Mode', icon: Sun, onClick: toggleTheme },
  { type: 'separator' },
  { type: 'button', label: 'Logout', icon: LogOut, onClick: handleLogout, variant: 'destructive' },
];
```

### Navbar Component Props

**Existing Props** (unchanged):
```typescript
interface NavbarProps {
  logo?: React.ReactNode;
  navigationLinks?: NavigationLink[];
  signInButton?: { label: string; onClick: () => void };
  ctaButton?: { label: string; onClick: () => void; variant?: string };
  rightContent?: React.ReactNode;
  className?: string;
}
```

**New Props** (to be added):
```typescript
interface NavbarProps {
  // ... existing props
  mobileMenuItems?: MobileMenuItem[]; // Custom mobile menu items (overrides default)
}
```

**Behavior**:
- If `mobileMenuItems` is provided: Render custom mobile menu content
- If `mobileMenuItems` is undefined: Render default mobile menu (navigation links + rightContent)
- Desktop behavior: Always uses `rightContent` prop (unchanged)

## Derived Data

### User Display Name / Initials

**Source**: Computed from user authentication state

**Logic**:
```typescript
function getUserInitials(user: UserData): string {
  if (user.display_name) {
    // "John Doe" → "JD"
    return user.display_name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  // Fallback to first letter of email
  return user.email.charAt(0).toUpperCase();
}
```

**Usage**: Desktop avatar display only (not needed in mobile menu)

### Current Theme Label

**Source**: Computed from theme state

**Logic**:
```typescript
function getThemeToggleLabel(theme: string): string {
  return theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}
```

**Usage**: Mobile menu theme toggle button label

### Menu Items for Authenticated User

**Source**: Computed from user state

**Logic**:
```typescript
function getAuthenticatedMenuItems(user: UserData): MobileMenuItem[] {
  const items: MobileMenuItem[] = [
    { type: 'link', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      type: 'link',
      label: 'Profile',
      href: user.username_slug ? `/users/${user.username_slug}` : '/settings',
      icon: User
    },
    { type: 'link', label: 'Settings', href: '/settings', icon: Settings },
  ];

  if (user.role === 'admin' || user.role === 'moderator') {
    items.push(
      { type: 'separator' },
      { type: 'link', label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard }
    );
  }

  items.push(
    { type: 'separator' },
    { type: 'button', label: getThemeToggleLabel(theme), icon: themeIcon, onClick: toggleTheme },
    { type: 'separator' },
    { type: 'button', label: 'Logout', icon: LogOut, onClick: handleLogout, variant: 'destructive' }
  );

  return items;
}
```

### Menu Items for Guest User

**Source**: Computed from authentication state

**Logic**:
```typescript
function getGuestMenuItems(): MobileMenuItem[] {
  return [
    { type: 'button', label: getThemeToggleLabel(theme), icon: themeIcon, onClick: toggleTheme },
    { type: 'separator' },
    { type: 'button', label: 'Sign In', onClick: () => router.push('/auth/login') },
  ];
}
```

## Data Flow

```
User Auth State (Supabase)
  ↓
app-navbar.tsx (compute menu items based on auth state)
  ↓
navbar.tsx (receive mobileMenuItems prop)
  ↓
Mobile Menu Rendering (Popover content)
  ↓
User Interaction (click menu item)
  ↓
Action (navigation or function call) + Menu Close
```

## Validation & Error Handling

### Missing username_slug
- **Scenario**: User profile doesn't have `username_slug` set
- **Handling**: Profile link redirects to `/settings` instead of `/users/[slug]`
- **User Impact**: Graceful degradation, user can still access profile settings

### Auth State Unavailable
- **Scenario**: Supabase auth state not yet loaded or error fetching user
- **Handling**: Show guest menu items (theme toggle + Sign In)
- **User Impact**: User sees login option, can still navigate main pages

### Theme State Unavailable
- **Scenario**: `next-themes` not initialized (SSR hydration)
- **Handling**: `mounted` state prevents rendering until client-side hydration complete
- **User Impact**: No flash of wrong theme, consistent rendering

## No Database Changes Required

This feature does not introduce:
- New tables
- New columns
- Schema migrations
- Data seeding
- RLS policy changes

All data dependencies are satisfied by existing authentication and user profile infrastructure.

---

**Status**: ✅ Data model analysis complete
