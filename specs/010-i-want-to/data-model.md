# Data Model: Sidebar Navigation

**Phase**: 1 - Design & Contracts
**Date**: 2025-01-12

## Overview

This feature involves UI state management only - no database schema changes. All data models are TypeScript interfaces for React component props and state management.

## Component Data Models

### 1. SidebarState (Context State)

Managed by shadcn/ui's `useSidebar()` hook - no custom state needed.

```typescript
interface SidebarState {
  // Provided by useSidebar() hook
  open: boolean; // Desktop collapsed/expanded
  openMobile: boolean; // Mobile overlay open/closed
  isMobile: boolean; // Auto-detected breakpoint
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
}
```

**Persistence**: Automatic via cookies (`sidebar:state=true|false`)

**Validation**: N/A - boolean flags, no validation needed

### 2. NavigationLink

Represents a primary navigation item (public pages).

```typescript
interface NavigationLink {
  href: string; // Route path (e.g., "/monsters")
  label: string; // Display text (e.g., "Monsters")
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component
  external?: boolean; // Opens in new tab (default: false)
}
```

**Source**: Hardcoded in `app-sidebar.tsx`

**Validation Rules**:

- `href` must be valid route (starts with `/` or full URL)
- `label` required, non-empty string
- `icon` must be valid Lucide React component

**Example Data**:

```typescript
const publicLinks: NavigationLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/monsters", label: "Monsters", icon: Swords },
  { href: "/spells", label: "Spells", icon: Sparkles },
  { href: "/encounter-tables", label: "Encounter Tables", icon: Dice6 },
  { href: "/about", label: "About", icon: Info },
];
```

### 3. UserMenuItem

Represents an authenticated user menu item (dashboard, account, admin).

```typescript
interface UserMenuItem {
  label: string; // Display text (e.g., "My Monsters")
  href?: string; // Route path (mutually exclusive with onClick)
  onClick?: () => void; // Action handler (e.g., logout)
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component
  groupLabel?: string; // Optional group header (e.g., "Dashboard")
  requiresRole?: "admin" | "moderator"; // Role-based visibility
  condition?: (user: UserData) => boolean; // Custom visibility logic
}
```

**Source**: Generated dynamically based on `user` object from AuthProvider

**Validation Rules**:

- Must have either `href` OR `onClick`, not both
- `label` required, non-empty
- `icon` required
- `requiresRole` filters based on `user.role`
- `condition` function receives current user, returns boolean

**Example Data**:

```typescript
const dashboardItems: UserMenuItem[] = [
  {
    label: "My Monsters",
    href: "/dashboard/monsters",
    icon: Swords,
    groupLabel: "Dashboard",
  },
  {
    label: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    requiresRole: "admin",
    groupLabel: "Administration",
  },
  {
    label: "Profile",
    href: `/users/${user.username_slug}`,
    icon: User,
    condition: (user) => !!user.username_slug,
    groupLabel: "Account",
  },
  {
    label: "Logout",
    onClick: handleLogout,
    icon: LogOut,
    groupLabel: "Account",
  },
];
```

### 4. SidebarConfig

Top-level configuration for the entire sidebar.

```typescript
interface SidebarConfig {
  publicLinks: NavigationLink[];
  authenticatedMenuItems: UserMenuItem[];
  guestMenuItems: UserMenuItem[];
  variant: "sidebar" | "floating" | "inset";
  collapsible: "icon" | "offcanvas" | "none";
  side: "left" | "right";
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
    text?: string; // Optional text next to logo
  };
}
```

**Source**: Hardcoded configuration in `app-sidebar.tsx`

**Validation**: TypeScript ensures type safety at compile time

### 5. UserData (from existing AuthProvider)

No changes to existing user model - consumed as-is.

```typescript
interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  username_slug: string | null;
  role: "user" | "admin" | "moderator";
  // ... other existing fields
}
```

**Source**: Existing `@/src/components/providers/AuthProvider`

## State Flow

```
1. App loads → RootProvider → SidebarProvider initialized
2. SidebarProvider:
   - Reads cookie: sidebar:state
   - Detects mobile: window.matchMedia("(min-width: 768px)")
   - Sets initial state: { open, openMobile, isMobile }
3. app-sidebar.tsx renders:
   - Reads user from AuthProvider.useAuth()
   - Filters menu items based on user?.role, user?.username_slug
   - Reads pathname from usePathname()
   - Marks active route with data-active
4. User interactions:
   - Click toggle → useSidebar().toggleSidebar() → state updated → cookie saved
   - Click navigation link → Next.js navigation → sidebar auto-closes (mobile)
   - Keyboard cmd+b → useSidebar() handles toggle
```

## Component Hierarchy

```
app/layout.tsx
├── SidebarProvider (shadcn/ui context)
│   ├── AppSidebar (custom component)
│   │   ├── Sidebar (shadcn/ui)
│   │   │   ├── SidebarHeader
│   │   │   │   ├── Logo (Image + Text)
│   │   │   │   └── SidebarTrigger (collapse button)
│   │   │   ├── SidebarContent
│   │   │   │   ├── SidebarGroup (Public Navigation)
│   │   │   │   │   ├── SidebarGroupLabel: "Navigation"
│   │   │   │   │   └── SidebarMenu
│   │   │   │   │       └── SidebarMenuItem[] (publicLinks)
│   │   │   │   ├── SidebarGroup (Dashboard - auth only)
│   │   │   │   │   ├── SidebarGroupLabel: "Dashboard"
│   │   │   │   │   └── SidebarMenu
│   │   │   │   │       └── SidebarMenuItem[] (dashboard items)
│   │   │   │   ├── SidebarGroup (Account - auth only)
│   │   │   │   │   ├── SidebarGroupLabel: "Account"
│   │   │   │   │   └── SidebarMenu
│   │   │   │   │       └── SidebarMenuItem[] (account items)
│   │   │   │   └── SidebarGroup (Admin - role-based)
│   │   │   │       ├── SidebarGroupLabel: "Administration"
│   │   │   │       └── SidebarMenu
│   │   │   │           └── SidebarMenuItem[] (admin items)
│   │   │   └── SidebarFooter
│   │   │       └── ThemeToggle (Sun/Moon button)
│   └── main (page content)
```

## Validation Rules

### Runtime Validation (Zod)

No database operations, but can add runtime checks for debugging:

```typescript
import { z } from "zod";

const NavigationLinkSchema = z.object({
  href: z.string().startsWith("/").or(z.string().url()),
  label: z.string().min(1),
  icon: z.custom<React.ComponentType>(),
  external: z.boolean().optional(),
});

const UserMenuItemSchema = z
  .object({
    label: z.string().min(1),
    href: z.string().startsWith("/").optional(),
    onClick: z.function().optional(),
    icon: z.custom<React.ComponentType>(),
    groupLabel: z.string().optional(),
    requiresRole: z.enum(["admin", "moderator"]).optional(),
    condition: z.function().optional(),
  })
  .refine((data) => !!(data.href || data.onClick), {
    message: "Either href or onClick must be provided",
  });
```

**Usage**: Development-only validation, removed in production build.

## Relationships

```
SidebarProvider (Context)
    ↓ provides state
AppSidebar (Component)
    ↓ consumes
AuthProvider.user (via useAuth hook)
    ↓ filters
UserMenuItem[] (based on role, username_slug)
    ↓ renders
SidebarMenu → SidebarMenuItem → SidebarMenuButton
```

## Performance Considerations

1. **Memoization**: Use `useMemo()` for filtered menu items to prevent recalculation on every render
2. **Icon Imports**: Import icons individually from `lucide-react` to enable tree-shaking
3. **Lazy Loading**: Icons loaded async via dynamic imports (if bundle size becomes issue)
4. **Context Optimization**: SidebarProvider uses React Context with minimal state changes

```typescript
const filteredMenuItems = useMemo(() => {
  return menuItems.filter((item) => {
    if (item.requiresRole && user?.role !== item.requiresRole) return false;
    if (item.condition && !item.condition(user)) return false;
    return true;
  });
}, [menuItems, user]);
```

## Migration Notes

### Removed Components

- `components/ui/navbar.tsx` - Replaced by Sidebar
- `components/navigation/app-navbar.tsx` - Replaced by AppSidebar
- `components/ui/navigation-menu.tsx` - No longer needed (using SidebarMenu)

### Preserved Components

- `components/ui/dropdown-menu.tsx` - May still be used elsewhere
- `components/ui/sheet.tsx` - May still be used elsewhere
- `components/ui/button.tsx` - Reused in sidebar

### New Components

- `components/ui/sidebar.tsx` - From shadcn/ui CLI
- `components/navigation/app-sidebar.tsx` - Custom implementation

## Testing Data

### Test User Scenarios

1. **Guest User**:

   ```typescript
   user = null
   → Shows: Public links, "Sign In" button
   → Hides: Dashboard, Account, Admin sections
   ```

2. **Regular Authenticated User**:

   ```typescript
   user = {
     role: "user",
     username_slug: "johndoe",
     display_name: "John Doe"
   }
   → Shows: Public links, Dashboard, Account (with Profile), Logout
   → Hides: Admin section
   ```

3. **Admin User**:

   ```typescript
   user = {
     role: "admin",
     username_slug: "admin",
     display_name: "Admin"
   }
   → Shows: All sections including Administration
   ```

4. **User Without Profile**:
   ```typescript
   user = {
     role: "user",
     username_slug: null,
     display_name: null
   }
   → Shows: Dashboard, Account (without Profile link)
   → Profile menu item filtered out
   ```
