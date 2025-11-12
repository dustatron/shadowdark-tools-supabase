# UI/UX Improvement Plan - Dungeon Exchange

**Date**: October 17, 2025
**Status**: Proposed
**Priority**: High
**Estimated Effort**: 12-16 hours

## Executive Summary

This plan addresses critical UI/UX issues in the Dungeon Exchange application, focusing on:

1. Fixing broken light/dark theme synchronization
2. Implementing responsive, mobile-friendly navigation
3. Standardizing on Mantine UI components
4. Enhancing overall visual polish and RPG aesthetic

---

## Current Issues

### 1. Theme & Color Scheme Problems

**Issue**: Conflicting theme systems causing broken light/dark mode

**Root Causes**:

- Using both `next-themes` and Mantine's color scheme system independently
- `next-themes` toggles `.dark` class on `<html>`, but Mantine doesn't respond
- No `defaultColorScheme` specified in MantineProvider
- Generic `primaryColor: "dark"` instead of custom brand palette
- Tailwind CSS variables defined but not integrated with Mantine

**Impact**:

- Theme toggle button doesn't reliably switch modes
- Inconsistent colors between light/dark themes
- Poor visual identity

**Files Affected**:

- `app/layout.tsx` (lines 28-33)
- `src/components/providers/MantineProvider.tsx`
- `src/components/layout/Header.tsx` (lines 41, 82-86)

### 2. Navigation Issues

**Issue**: Poor mobile experience and lack of responsive navigation

**Root Causes**:

- Fixed horizontal layout with no mobile breakpoint handling
- No burger menu for small screens
- Logo, navigation links, and user menu compete for limited space
- No visual indicators for active page
- Navigation buttons use generic styling

**Impact**:

- Navigation breaks/overflows on mobile devices
- Users can't tell which page they're on
- Poor UX on tablets and phones

**Files Affected**:

- `src/components/layout/Header.tsx` (entire component)
- `src/components/providers/RootProvider.tsx` (AppShell config)

### 3. Layout & Component Inconsistency

**Issue**: Mixed component libraries and basic layout structure

**Root Causes**:

- Landing page (`app/page.tsx`) uses shadcn/ui components (Card, Button)
- Rest of app uses Mantine components
- AppShell has minimal configuration (no navbar, no responsive behavior)
- No mobile drawer/sidebar for navigation

**Impact**:

- Inconsistent theming across pages
- Maintenance complexity
- Wasted bundle size

**Files Affected**:

- `app/page.tsx` (lines 1-118)
- `src/components/providers/RootProvider.tsx` (lines 69-79)

---

## Proposed Solution

### Phase 1: Fix Theme System (CRITICAL)

**Priority**: P0 - Must fix first, blocks everything else
**Effort**: 2-3 hours

#### 1.1 Remove next-themes Dependency

**Action**: Eliminate conflicting theme provider

**Changes**:

```diff
# package.json
- "next-themes": "^0.x.x"

# app/layout.tsx
- import { ThemeProvider } from "next-themes";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
-       <ThemeProvider
-         attribute="class"
-         defaultTheme="system"
-         enableSystem
-         disableTransitionOnChange
-       >
          <MantineProvider>
            <Notifications />
            <RootProvider>{children}</RootProvider>
          </MantineProvider>
-       </ThemeProvider>
      </body>
    </html>
  );
```

**Rationale**: Mantine has its own color scheme system. Using two theme providers causes conflicts.

#### 1.2 Enhanced Mantine Theme Configuration

**Action**: Create robust, RPG-themed color palette with proper defaults

**File**: `src/components/providers/MantineProvider.tsx`

```typescript
"use client";

import {
  MantineProvider as BaseMantineProvider,
  createTheme,
  MantineColorsTuple,
} from "@mantine/core";
import { ReactNode } from "react";

// Custom Shadowdark palette (10 shades required)
const shadowdark: MantineColorsTuple = [
  '#f5f5f5',  // 0 - lightest (for dark mode text/backgrounds)
  '#e0e0e0',  // 1
  '#bdbdbd',  // 2
  '#9e9e9e',  // 3
  '#757575',  // 4
  '#616161',  // 5 - mid tone (default primary shade)
  '#424242',  // 6
  '#2c2c2c',  // 7
  '#1a1a1a',  // 8
  '#0d0d0d',  // 9 - darkest (for light mode text/backgrounds)
];

// Blood red for danger/critical actions
const blood: MantineColorsTuple = [
  '#fee2e2',
  '#fecaca',
  '#fca5a5',
  '#f87171',
  '#ef4444',
  '#dc2626',
  '#b91c1c',
  '#991b1b',
  '#7f1d1d',
  '#450a0a',
];

// Gold for treasure/rewards
const treasure: MantineColorsTuple = [
  '#fef3c7',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f59e0b',
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
  '#451a03',
];

// Magic purple/blue for spells
const magic: MantineColorsTuple = [
  '#ede9fe',
  '#ddd6fe',
  '#c4b5fd',
  '#a78bfa',
  '#8b5cf6',
  '#7c3aed',
  '#6d28d9',
  '#5b21b6',
  '#4c1d95',
  '#2e1065',
];

const theme = createTheme({
  /** Primary color - use our custom Shadowdark palette */
  primaryColor: 'shadowdark',

  /** Primary shade - index 5 is mid-tone, works well for both light/dark */
  primaryShade: { light: 6, dark: 4 },

  /** Font configuration */
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.2' },
      h2: { fontSize: '2rem', fontWeight: '700', lineHeight: '1.3' },
      h3: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4' },
    },
  },

  /** Custom color palettes */
  colors: {
    shadowdark,
    blood,
    treasure,
    magic,
  },

  /** Component defaults */
  components: {
    Button: {
      defaultProps: {
        variant: 'filled',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
    },
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
      },
    },
    NavLink: {
      defaultProps: {
        variant: 'filled',
      },
    },
  },
});

interface MantineProviderProps {
  children: ReactNode;
}

export function MantineProvider({ children }: MantineProviderProps) {
  return (
    <BaseMantineProvider
      theme={theme}
      defaultColorScheme="dark"
    >
      {children}
    </BaseMantineProvider>
  );
}
```

#### 1.3 Add ColorSchemeScript to Layout

**Action**: Prevent flash of unstyled content (FOUC)

**File**: `app/layout.tsx`

```diff
+ import { ColorSchemeScript } from '@mantine/core';

  return (
    <html lang="en" suppressHydrationWarning>
+     <head>
+       <ColorSchemeScript defaultColorScheme="dark" />
+     </head>
      <body className="antialiased">
        <MantineProvider>
          <Notifications />
          <RootProvider>{children}</RootProvider>
        </MantineProvider>
      </body>
    </html>
  );
```

**Success Criteria**:

- [ ] Theme toggle switches between light/dark reliably
- [ ] No flash of wrong theme on page load
- [ ] All Mantine components respond to color scheme changes
- [ ] Custom Shadowdark colors visible throughout app

---

### Phase 2: Responsive Navigation (HIGH PRIORITY)

**Priority**: P1 - Major UX issue
**Effort**: 3-4 hours

#### 2.1 Update Header with Mobile Support

**File**: `src/components/layout/Header.tsx`

**Key Changes**:

- Add `useDisclosure()` hook for mobile menu state
- Add `<Burger>` component for mobile toggle
- Use `visibleFrom` / `hiddenFrom` props for responsive display
- Add active state indicators
- Use `usePathname()` for current route detection

```typescript
"use client";

import {
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  UnstyledButton,
  ActionIcon,
  useMantineColorScheme,
  Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSun,
  IconMoon,
  IconUser,
  IconSettings,
  IconLogout,
  IconLogin,
  IconDashboard,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
  mobileOpened?: boolean;
  onToggleMobile?: () => void;
}

export function Header({ user, onLogout, mobileOpened, onToggleMobile }: HeaderProps) {
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <Group justify="space-between" h="100%" px="md">
      {/* Mobile burger menu */}
      <Burger
        opened={mobileOpened}
        onClick={onToggleMobile}
        hiddenFrom="sm"
        size="sm"
        aria-label="Toggle navigation"
      />

      {/* Logo/Brand - responsive sizing */}
      <Group>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Text
            size={{ base: 'md', sm: 'lg', md: 'xl' }}
            fw={700}
            c="shadowdark.2"
          >
            Shadowdark GM Tools
          </Text>
        </Link>
      </Group>

      {/* Desktop Navigation - hidden on mobile */}
      <Group gap="xs" visibleFrom="sm">
        <Button
          variant={pathname === '/monsters' ? 'light' : 'subtle'}
          component={Link}
          href="/monsters"
        >
          Monsters
        </Button>
        <Button
          variant={pathname === '/spells' ? 'light' : 'subtle'}
          component={Link}
          href="/spells"
        >
          Spells
        </Button>
      </Group>

      {/* User actions */}
      <Group gap="xs">
        {/* Theme toggle */}
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => toggleColorScheme()}
          title={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {colorScheme === "dark" ? (
            <IconSun size={18} />
          ) : (
            <IconMoon size={18} />
          )}
        </ActionIcon>

        {user ? (
          /* Authenticated user menu */
          <Menu
            width={200}
            position="bottom-end"
            opened={userMenuOpened}
            onChange={setUserMenuOpened}
          >
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar size="sm" radius="xl" color="shadowdark">
                    <IconUser size={16} />
                  </Avatar>
                  {/* Hide username on very small screens */}
                  <Text size="sm" fw={500} visibleFrom="xs">
                    {user.display_name || user.email}
                  </Text>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Account</Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={14} />}
                component={Link}
                href="/profile"
              >
                Profile
              </Menu.Item>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                component={Link}
                href="/settings"
              >
                Settings
              </Menu.Item>

              {isAdmin && (
                <>
                  <Menu.Divider />
                  <Menu.Label>Administration</Menu.Label>
                  <Menu.Item
                    leftSection={<IconDashboard size={14} />}
                    component={Link}
                    href="/admin"
                  >
                    Admin Dashboard
                  </Menu.Item>
                </>
              )}

              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                onClick={onLogout}
                color="red"
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : (
          /* Guest user actions - compact on mobile */
          <Button
            variant="subtle"
            leftSection={<IconLogin size={16} />}
            component={Link}
            href="/auth/login"
            size={{ base: 'xs', sm: 'sm' }}
          >
            <Text visibleFrom="xs">Login</Text>
          </Button>
        )}
      </Group>
    </Group>
  );
}
```

#### 2.2 Create Mobile Navigation Drawer

**New File**: `src/components/layout/MobileNav.tsx`

```typescript
"use client";

import { Drawer, Stack, NavLink, Divider, Text, Group } from "@mantine/core";
import {
  IconSword,
  IconWand,
  IconUser,
  IconSettings,
  IconDashboard,
  IconLogout,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  display_name?: string;
  role?: string;
}

interface MobileNavProps {
  opened: boolean;
  onClose: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export function MobileNav({ opened, onClose, user, onLogout }: MobileNavProps) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size="xs"
      padding="md"
      title={
        <Text size="lg" fw={700} c="shadowdark.2">
          Shadowdark GM Tools
        </Text>
      }
      hiddenFrom="sm"
    >
      <Stack gap="xs">
        {/* Main Navigation */}
        <NavLink
          label="Monsters"
          leftSection={<IconSword size={20} />}
          href="/monsters"
          component={Link}
          active={pathname === "/monsters"}
          onClick={onClose}
        />
        <NavLink
          label="Spells"
          leftSection={<IconWand size={20} />}
          href="/spells"
          component={Link}
          active={pathname === "/spells"}
          onClick={onClose}
        />

        {user && (
          <>
            <Divider my="sm" label="Account" labelPosition="center" />

            <NavLink
              label="Profile"
              leftSection={<IconUser size={20} />}
              href="/profile"
              component={Link}
              active={pathname === "/profile"}
              onClick={onClose}
            />
            <NavLink
              label="Settings"
              leftSection={<IconSettings size={20} />}
              href="/settings"
              component={Link}
              active={pathname === "/settings"}
              onClick={onClose}
            />

            {isAdmin && (
              <>
                <Divider my="sm" label="Admin" labelPosition="center" />
                <NavLink
                  label="Dashboard"
                  leftSection={<IconDashboard size={20} />}
                  href="/admin"
                  component={Link}
                  active={pathname === "/admin"}
                  onClick={onClose}
                />
              </>
            )}

            <Divider my="sm" />

            <NavLink
              label="Logout"
              leftSection={<IconLogout size={20} />}
              onClick={() => {
                onLogout?.();
                onClose();
              }}
              color="red"
            />
          </>
        )}
      </Stack>
    </Drawer>
  );
}
```

#### 2.3 Update RootProvider with Mobile State

**File**: `src/components/providers/RootProvider.tsx`

```diff
  import { AppShell, Container } from "@mantine/core";
+ import { useDisclosure } from "@mantine/hooks";
  import { Header } from "@/src/components/layout/Header";
+ import { MobileNav } from "@/src/components/layout/MobileNav";

  export function RootProvider({ children }: RootProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
+   const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
    const supabase = createSupabaseClient();

    // ... existing auth logic ...

    return (
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header>
-         <Header user={user} onLogout={handleLogout} />
+         <Header
+           user={user}
+           onLogout={handleLogout}
+           mobileOpened={mobileOpened}
+           onToggleMobile={toggleMobile}
+         />
        </AppShell.Header>

+       <MobileNav
+         opened={mobileOpened}
+         onClose={toggleMobile}
+         user={user}
+         onLogout={handleLogout}
+       />

        <AppShell.Main>
          <Container size="xl" py="md">
            {children}
          </Container>
        </AppShell.Main>
      </AppShell>
    );
  }
```

**Success Criteria**:

- [ ] Burger menu appears on mobile (<640px)
- [ ] Desktop navigation hidden on mobile
- [ ] Mobile drawer opens/closes smoothly
- [ ] Active page indicated in both desktop and mobile nav
- [ ] User menu accessible on mobile
- [ ] No layout overflow on any screen size

---

### Phase 3: Enhanced AppShell Layout (MEDIUM PRIORITY)

**Priority**: P2 - Nice to have
**Effort**: 2 hours

#### 3.1 Optional Persistent Sidebar Navigation

**File**: `src/components/providers/RootProvider.tsx`

```typescript
export function RootProvider({ children }: RootProviderProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: {
          mobile: !mobileOpened,
          desktop: !desktopOpened
        }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header
          user={user}
          onLogout={handleLogout}
          mobileOpened={mobileOpened}
          onToggleMobile={toggleMobile}
        />
      </AppShell.Header>

      {/* Optional: Persistent sidebar on desktop */}
      <AppShell.Navbar p="md">
        <NavbarContent user={user} onLogout={handleLogout} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" py="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
```

**Note**: This is optional and should be evaluated based on content needs.

**Success Criteria**:

- [ ] Sidebar toggleable on desktop
- [ ] Mobile drawer works independently
- [ ] Content area adjusts when sidebar opens/closes

---

### Phase 4: Standardize on Mantine Components (MEDIUM PRIORITY)

**Priority**: P2 - Reduces complexity
**Effort**: 3-4 hours

#### 4.1 Remove shadcn/ui Dependency

**Action**: Replace all shadcn/ui components with Mantine equivalents

**Files to Update**:

- `app/page.tsx` - Replace Card, Button components
- `package.json` - Remove unnecessary dependencies

**Before** (`app/page.tsx`):

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
```

**After**:

```typescript
import { Card, Text, Button, Group, Container, Stack } from "@mantine/core";
```

#### 4.2 Create Mantine-based Landing Page

**File**: `app/page.tsx` (complete rewrite)

```typescript
import { Card, Text, Button, Group, Container, Stack, Grid } from "@mantine/core";
import { IconSword, IconWand, IconDice, IconList } from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Hero Section */}
        <Stack gap="md" align="center" ta="center">
          <Text size="3rem" fw={800} lh={1.2}>
            Shadowdark GM Tools
          </Text>
          <Text size="xl" c="dimmed" maw={600}>
            Manage your monsters, create encounters, and organize your
            campaigns for Shadowdark RPG
          </Text>
        </Stack>

        {/* Feature Cards */}
        <Grid gutter="lg" mt="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              component={Link}
              href="/monsters"
              className="hover:shadow-lg transition-shadow"
              p="lg"
              h="100%"
            >
              <Stack gap="md">
                <Group>
                  <IconSword size={32} stroke={1.5} color="var(--mantine-color-shadowdark-5)" />
                  <Text size="xl" fw={700}>Monsters</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  Access a comprehensive database of official Shadowdark
                  monsters. Search, filter by challenge level, and create your
                  own custom monsters.
                </Text>
                <Button variant="light" fullWidth mt="auto">
                  Browse Monsters
                </Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              component={Link}
              href="/spells"
              className="hover:shadow-lg transition-shadow"
              p="lg"
              h="100%"
            >
              <Stack gap="md">
                <Group>
                  <IconWand size={32} stroke={1.5} color="var(--mantine-color-magic-5)" />
                  <Text size="xl" fw={700}>Spells</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  Browse the complete spell database for Shadowdark. Filter by
                  tier, class, and search by name or description.
                </Text>
                <Button variant="light" fullWidth mt="auto">
                  Browse Spells
                </Button>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              p="lg"
              h="100%"
              opacity={0.6}
            >
              <Stack gap="md">
                <Group>
                  <IconDice size={32} stroke={1.5} color="var(--mantine-color-treasure-5)" />
                  <Text size="xl" fw={700}>Encounters</Text>
                </Group>
                <Text size="sm" c="dimmed">
                  Create balanced encounters for your party. Roll on encounter
                  tables or build custom encounters with your monster collection.
                </Text>
                <Button variant="light" fullWidth mt="auto" disabled>
                  Coming Soon
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* CTA Section */}
        <Stack gap="md" align="center" ta="center" mt="xl">
          <Text size="2rem" fw={700}>Get Started</Text>
          <Text c="dimmed" maw={600}>
            Start by browsing the monster database, or sign up to create
            custom monsters and manage your own campaigns.
          </Text>
          <Group justify="center" mt="md">
            <Button size="lg" component={Link} href="/monsters">
              Explore Monsters
            </Button>
            <Button size="lg" variant="light" component={Link} href="/auth/sign-up">
              Create Account
            </Button>
          </Group>
        </Stack>
      </Stack>
    </Container>
  );
}
```

#### 4.3 Remove Unused Dependencies

**File**: `package.json`

Remove these if not used elsewhere:

- `@radix-ui/*` packages (if only used by shadcn/ui)
- `tailwindcss-animate` (if only for shadcn/ui)
- `class-variance-authority`
- `clsx`

**Success Criteria**:

- [ ] All pages use Mantine components exclusively
- [ ] No import errors
- [ ] Consistent theming across all pages
- [ ] Reduced bundle size

---

### Phase 5: Visual Polish (LOW PRIORITY)

**Priority**: P3 - Nice to have
**Effort**: 2-3 hours

#### 5.1 Enhanced Dark Mode Aesthetic

**File**: `src/components/providers/MantineProvider.tsx`

Add deeper blacks and custom CSS variables:

```typescript
const theme = createTheme({
  // ... existing config ...

  black: "#0a0a0a", // Deeper black for dark mode backgrounds
  white: "#fafafa", // Softer white for light mode

  other: {
    // Custom CSS variables for special cases
    headerHeight: "60px",
    navbarWidth: "250px",
  },
});
```

#### 5.2 Add Micro-interactions

**File**: `app/globals.css`

```css
/* Smooth transitions for interactive elements */
.hover\:shadow-lg {
  transition: box-shadow 0.2s ease-in-out;
}

.hover\:shadow-lg:hover {
  box-shadow: var(--mantine-shadow-lg);
}

/* Subtle scale on hover for cards */
.card-hover {
  transition: transform 0.2s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-2px);
}

/* Active navigation indicator */
[data-active="true"] {
  position: relative;
}

[data-active="true"]::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--mantine-color-shadowdark-5);
}
```

#### 5.3 Loading States and Skeletons

Create consistent loading components:

**New File**: `src/components/ui/LoadingSkeleton.tsx`

```typescript
import { Skeleton, Stack, Grid } from "@mantine/core";

export function MonsterListSkeleton() {
  return (
    <Stack gap="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={120} radius="md" />
      ))}
    </Stack>
  );
}

export function MonsterDetailSkeleton() {
  return (
    <Stack gap="lg">
      <Skeleton height={40} width="60%" />
      <Grid>
        <Grid.Col span={6}>
          <Skeleton height={200} />
        </Grid.Col>
        <Grid.Col span={6}>
          <Skeleton height={200} />
        </Grid.Col>
      </Grid>
      <Skeleton height={300} />
    </Stack>
  );
}
```

**Success Criteria**:

- [ ] Smooth transitions on interactive elements
- [ ] Consistent loading states
- [ ] Polished visual feedback
- [ ] Enhanced dark mode aesthetic

---

## Implementation Checklist

### Phase 1: Theme System ✓

- [ ] Remove `next-themes` from package.json
- [ ] Remove `ThemeProvider` from app/layout.tsx
- [ ] Update MantineProvider with custom theme
- [ ] Add custom color palettes (shadowdark, blood, treasure, magic)
- [ ] Set `defaultColorScheme="dark"`
- [ ] Add `ColorSchemeScript` to layout head
- [ ] Test light/dark mode toggle
- [ ] Verify no FOUC on page load

### Phase 2: Responsive Navigation ✓

- [ ] Install `@mantine/hooks` if not present
- [ ] Update Header component with Burger and responsive props
- [ ] Add `usePathname()` for active state detection
- [ ] Create MobileNav component with Drawer
- [ ] Update RootProvider with mobile state management
- [ ] Add `visibleFrom`/`hiddenFrom` props
- [ ] Test on mobile devices (320px - 768px)
- [ ] Test on tablets (768px - 1024px)
- [ ] Test on desktop (1024px+)

### Phase 3: Enhanced AppShell (Optional)

- [ ] Evaluate need for persistent sidebar
- [ ] If needed, add navbar configuration to AppShell
- [ ] Create NavbarContent component
- [ ] Add desktop toggle functionality
- [ ] Test sidebar collapse/expand

### Phase 4: Component Standardization ✓

- [ ] Audit all pages for shadcn/ui usage
- [ ] Rewrite app/page.tsx with Mantine components
- [ ] Replace Card, Button, Text imports
- [ ] Update other pages if needed
- [ ] Remove unused shadcn/ui files
- [ ] Remove unused dependencies from package.json
- [ ] Run build to verify no errors
- [ ] Test all pages for visual consistency

### Phase 5: Visual Polish ✓

- [ ] Add deeper black for dark mode
- [ ] Create micro-interaction CSS
- [ ] Build loading skeleton components
- [ ] Add hover states to interactive elements
- [ ] Test animations and transitions
- [ ] Verify accessibility (keyboard nav, screen readers)

---

## Testing Strategy

### Manual Testing

**Theme Switching**:

1. Toggle light/dark mode multiple times
2. Refresh page - verify theme persists
3. Open in incognito - verify default is dark
4. Check all pages for proper theme application

**Responsive Navigation**:

1. Resize browser from 320px to 1920px
2. Test burger menu on mobile
3. Verify drawer opens/closes smoothly
4. Test all navigation links
5. Verify active state indicators
6. Test on real devices (iOS Safari, Android Chrome)

**Component Consistency**:

1. Visit all pages in the app
2. Verify consistent styling
3. Check for any component mismatches
4. Verify all buttons/cards use Mantine

### Automated Testing

**Component Tests** (Vitest + Testing Library):

```typescript
// Header.test.tsx
describe('Header', () => {
  it('shows burger menu on mobile', () => {
    render(<Header />);
    // Test implementation
  });

  it('highlights active navigation link', () => {
    // Test implementation
  });

  it('toggles color scheme', () => {
    // Test implementation
  });
});
```

**E2E Tests** (Playwright):

```typescript
// navigation.spec.ts
test("mobile navigation works", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.click('[aria-label="Toggle navigation"]');
  await expect(page.locator("nav")).toBeVisible();
});
```

---

## Rollback Plan

If issues arise during implementation:

1. **Phase 1 Rollback**:
   - Reinstall `next-themes`
   - Restore original layout.tsx
   - Revert MantineProvider changes

2. **Phase 2 Rollback**:
   - Remove MobileNav component
   - Restore original Header component
   - Remove mobile state from RootProvider

3. **Phase 4 Rollback**:
   - Restore original app/page.tsx from git history
   - Reinstall shadcn/ui dependencies

---

## Success Metrics

### Before vs After

**Theme Issues**:

- Before: Light/dark toggle unreliable, FOUC on load
- After: Smooth theme switching, no flash, persistent preference

**Mobile UX**:

- Before: Navigation broken on mobile, no active indicators
- After: Burger menu, drawer navigation, clear active states

**Code Consistency**:

- Before: Mix of Mantine + shadcn/ui, confusing maintenance
- After: 100% Mantine, consistent theming, smaller bundle

**Visual Polish**:

- Before: Generic styling, no RPG theme
- After: Custom Shadowdark palette, smooth interactions, professional feel

---

## Maintenance Notes

### Future Considerations

1. **Theme Customization**: Users may want to customize colors in future
   - Consider adding theme editor in settings
   - Store user preferences in Supabase

2. **Additional Navigation**: As more features are added:
   - Evaluate if persistent sidebar becomes necessary
   - Consider breadcrumbs for deep navigation

3. **Performance**: Monitor bundle size impact
   - Mantine uses CSS-in-JS, ensure it's tree-shaken properly
   - Consider lazy loading Drawer component

4. **Accessibility**: Ensure all improvements maintain/improve a11y
   - Test with screen readers
   - Verify keyboard navigation
   - Check color contrast ratios

---

## Resources

### Documentation

- [Mantine Provider Docs](https://mantine.dev/theming/mantine-provider/)
- [Mantine Color Scheme](https://mantine.dev/theming/colors/)
- [Mantine AppShell](https://mantine.dev/core/app-shell/)
- [Mantine NavLink](https://mantine.dev/core/nav-link/)
- [Mantine Burger](https://mantine.dev/core/burger/)

### Related Files

- `app/layout.tsx` - Root layout with theme providers
- `src/components/providers/MantineProvider.tsx` - Theme configuration
- `src/components/layout/Header.tsx` - Main navigation header
- `src/components/providers/RootProvider.tsx` - AppShell wrapper
- `app/page.tsx` - Landing page
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Global styles

---

## Approval & Sign-off

**Reviewed by**: **\*\*\*\***\_**\*\*\*\***
**Approved by**: **\*\*\*\***\_**\*\*\*\***
**Date**: **\*\*\*\***\_**\*\*\*\***

**Implementation Start Date**: **\*\*\*\***\_**\*\*\*\***
**Target Completion Date**: **\*\*\*\***\_**\*\*\*\***
**Actual Completion Date**: **\*\*\*\***\_**\*\*\*\***

---

## Changelog

| Date       | Author      | Change Description    |
| ---------- | ----------- | --------------------- |
| 2025-10-17 | Claude Code | Initial plan creation |
|            |             |                       |
|            |             |                       |
