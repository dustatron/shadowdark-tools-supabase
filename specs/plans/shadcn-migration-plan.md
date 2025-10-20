# Mantine UI to shadcn/ui Migration Plan

## Executive Summary

### Why Migrate?

This project currently uses Mantine UI 8.3.1 alongside a partial shadcn/ui installation (8 components already installed). This hybrid approach creates several challenges:

**Current Pain Points:**

- **Dual Dependencies**: Maintaining two component libraries increases bundle size (~450KB for Mantine + Emotion runtime)
- **Inconsistent Patterns**: Mixing Mantine's `useForm` with react-hook-form creates cognitive overhead
- **Styling Conflicts**: Emotion CSS-in-JS conflicts with Tailwind utility-first approach
- **Developer Experience**: Context-switching between two different API styles
- **Partial Installation**: shadcn/ui is already 30% integrated, suggesting migration intent

**Expected Benefits:**

- **Reduced Bundle Size**: Eliminate Mantine (~450KB) and Emotion (~150KB), reduce by ~600KB total
- **Unified Stack**: Single component approach (shadcn/ui + react-hook-form + Tailwind)
- **Better Performance**: No runtime CSS-in-JS overhead, pure Tailwind classes
- **Enhanced Customization**: Direct component source control vs. imported library
- **Improved DX**: Consistent patterns across forms, validation, and UI components
- **Future-Proof**: shadcn/ui is RSC-friendly and aligns with Next.js 15 direction

### Migration Approach

**Strategy**: Incremental, feature-by-feature migration with parallel running capability

- **Duration**: 2-3 weeks (8-12 development days)
- **Risk Level**: Medium (mitigated by parallel running and phased approach)
- **Team Impact**: Minimal (features remain functional throughout migration)

---

## Migration Strategy

### Parallel Running Strategy

We will maintain both libraries during migration to ensure zero downtime:

1. **Phase 0-1**: Install shadcn/ui components alongside Mantine (already 30% complete)
2. **Phase 2-4**: Migrate features one-by-one, testing each thoroughly
3. **Phase 5**: Remove Mantine dependencies only after 100% migration complete

**Rollback Plan**: Each phase is a git commit that can be reverted. If critical issues arise, we can pause migration and fix Mantine components.

### Testing Strategy Per Phase

Each migration phase must pass:

- ✅ **Visual Parity**: Component looks identical (or better) than Mantine version
- ✅ **Functional Parity**: All interactions work as before
- ✅ **Accessibility**: ARIA attributes maintained or improved
- ✅ **Responsive**: Mobile/tablet/desktop breakpoints work correctly
- ✅ **Dark Mode**: Theme switching works properly
- ✅ **E2E Tests**: Existing Playwright tests pass

---

## Technical Mapping

### Component Mapping: Mantine → shadcn/ui

#### Layout & Structure

| Mantine Component | shadcn/ui Equivalent               | Migration Complexity | Notes                                      |
| ----------------- | ---------------------------------- | -------------------- | ------------------------------------------ |
| `AppShell`        | Custom layout with `div`           | Medium               | Create custom layout component             |
| `Container`       | Tailwind `container` class         | Low                  | Replace with `<div className="container">` |
| `Stack`           | `flex flex-col gap-*`              | Low                  | Replace with Tailwind utilities            |
| `Group`           | `flex flex-row gap-*`              | Low                  | Replace with Tailwind utilities            |
| `SimpleGrid`      | `grid grid-cols-*`                 | Low                  | Replace with Tailwind grid utilities       |
| `Grid`            | Tailwind grid utilities            | Low                  | Replace with responsive grid classes       |
| `Center`          | `flex items-center justify-center` | Low                  | Replace with Tailwind flex utilities       |
| `Paper`           | `Card` ✅ (installed)              | Low                  | Use existing shadcn Card                   |
| `Divider`         | `Separator` (install)              | Low                  | Install shadcn Separator                   |

#### Navigation

| Mantine Component | shadcn/ui Equivalent          | Migration Complexity | Notes                                  |
| ----------------- | ----------------------------- | -------------------- | -------------------------------------- |
| `Tabs`            | `Tabs` (install)              | Medium               | Install shadcn Tabs, update Header.tsx |
| `NavLink`         | Custom `NavigationMenuItem`   | Medium               | Use shadcn Navigation Menu             |
| `Drawer`          | `Sheet` (install)             | Medium               | Install shadcn Sheet for mobile nav    |
| `Burger`          | Custom component              | Low                  | Create simple hamburger button         |
| `Menu`            | `DropdownMenu` ✅ (installed) | Low                  | Use existing shadcn DropdownMenu       |

#### Data Display

| Mantine Component | shadcn/ui Equivalent        | Migration Complexity | Notes                                     |
| ----------------- | --------------------------- | -------------------- | ----------------------------------------- |
| `Text`            | Native `<p>` + Tailwind     | Low                  | Use semantic HTML with typography classes |
| `Title`           | Native `<h1-h6>` + Tailwind | Low                  | Use semantic HTML with typography classes |
| `Badge`           | `Badge` ✅ (installed)      | Low                  | Use existing shadcn Badge                 |
| `Avatar`          | `Avatar` (install)          | Low                  | Install shadcn Avatar                     |
| `ThemeIcon`       | Custom icon wrapper         | Low                  | Create wrapper for Lucide icons           |
| `Table`           | `Table` (install)           | Medium               | Install shadcn Table                      |

#### Feedback & Overlays

| Mantine Component | shadcn/ui Equivalent       | Migration Complexity | Notes                                   |
| ----------------- | -------------------------- | -------------------- | --------------------------------------- |
| `Alert`           | `Alert` (install)          | Low                  | Install shadcn Alert                    |
| `Notifications`   | `Toast` (install)          | Medium               | Replace notification system with Sonner |
| `LoadingOverlay`  | Custom `Spinner` + overlay | Low                  | Create loading overlay component        |
| `Loader`          | Custom `Spinner`           | Low                  | Use Lucide `Loader2` icon               |
| `Modal`           | `Dialog` (install)         | Medium               | Install shadcn Dialog                   |

#### Forms & Inputs

| Mantine Component | shadcn/ui Equivalent                | Migration Complexity | Notes                                |
| ----------------- | ----------------------------------- | -------------------- | ------------------------------------ |
| `TextInput`       | `Input` ✅ (installed) + `Label` ✅ | Low                  | Use existing shadcn Input/Label      |
| `NumberInput`     | `Input` type="number"               | Low                  | Use Input with number type           |
| `Textarea`        | `Textarea` (install)                | Low                  | Install shadcn Textarea              |
| `Select`          | `Select` (install)                  | Medium               | Install shadcn Select                |
| `MultiSelect`     | Custom multi-select                 | High                 | Build custom or use Combobox pattern |
| `Switch`          | `Switch` (install)                  | Low                  | Install shadcn Switch                |
| `Checkbox`        | `Checkbox` ✅ (installed)           | Low                  | Use existing shadcn Checkbox         |
| `ActionIcon`      | `Button` variant="ghost"            | Low                  | Use Button with icon variant         |
| `Button`          | `Button` ✅ (installed)             | Low                  | Use existing shadcn Button           |

#### Mantine-Specific

| Mantine Component        | shadcn/ui Equivalent         | Migration Complexity | Notes                            |
| ------------------------ | ---------------------------- | -------------------- | -------------------------------- |
| `@mantine/form`          | react-hook-form + Zod        | High                 | Already using RHF in some places |
| `@mantine/hooks`         | Custom hooks                 | Medium               | Recreate needed hooks            |
| `@mantine/notifications` | `Sonner` (install)           | Medium               | Replace notification system      |
| `useDebouncedValue`      | `use-debounce` package       | Low                  | Install use-debounce package     |
| `useDisclosure`          | `useState`                   | Low                  | Replace with simple state hook   |
| `useMantineColorScheme`  | `next-themes` ✅ (installed) | Low                  | Already using next-themes        |

---

### Theme & Color Palette Migration

#### Current Mantine Theme Configuration

**Custom Color Palettes** (from `/src/components/providers/MantineProvider.tsx`):

```typescript
// Mantine requires 10-shade palettes
const shadowdark = [
  "#f5f5f5",
  "#e0e0e0",
  "#bdbdbd",
  "#9e9e9e",
  "#757575",
  "#616161",
  "#424242",
  "#2c2c2c",
  "#1a1a1a",
  "#0d0d0d",
];
const blood = [
  "#fee2e2",
  "#fecaca",
  "#fca5a5",
  "#f87171",
  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
  "#450a0a",
];
const treasure = [
  "#fef3c7",
  "#fde68a",
  "#fcd34d",
  "#fbbf24",
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#92400e",
  "#78350f",
  "#451a03",
];
const magic = [
  "#ede9fe",
  "#ddd6fe",
  "#c4b5fd",
  "#a78bfa",
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",
  "#4c1d95",
  "#2e1065",
];
```

**Font Configuration**:

- Primary: Inter (already loaded)
- Headings: Inter with specific weights/sizes

**Component Defaults**:

- Buttons: `variant="filled"`
- Cards: `shadow="sm"`, `radius="md"`, `withBorder`
- Tables: `striped`, `highlightOnHover`
- NavLinks: `variant="filled"`

#### Tailwind Migration Strategy

**Step 1: Add Custom Colors to `tailwind.config.ts`**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Existing shadcn colors remain
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... other shadcn colors

        // Add Shadowdark custom colors
        shadowdark: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#bdbdbd",
          300: "#9e9e9e",
          400: "#757575",
          500: "#616161", // Primary shade
          600: "#424242",
          700: "#2c2c2c",
          800: "#1a1a1a",
          900: "#0d0d0d",
        },
        blood: {
          50: "#fee2e2",
          100: "#fecaca",
          200: "#fca5a5",
          300: "#f87171",
          400: "#ef4444",
          500: "#dc2626", // Primary shade
          600: "#b91c1c",
          700: "#991b1b",
          800: "#7f1d1d",
          900: "#450a0a",
        },
        treasure: {
          50: "#fef3c7",
          100: "#fde68a",
          200: "#fcd34d",
          300: "#fbbf24",
          400: "#f59e0b",
          500: "#d97706", // Primary shade
          600: "#b45309",
          700: "#92400e",
          800: "#78350f",
          900: "#451a03",
        },
        magic: {
          50: "#ede9fe",
          100: "#ddd6fe",
          200: "#c4b5fd",
          300: "#a78bfa",
          400: "#8b5cf6",
          500: "#7c3aed", // Primary shade
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#2e1065",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
} satisfies Config;
```

**Step 2: Update `globals.css` with Shadowdark Theme Variables**

```css
@layer base {
  :root {
    /* Existing shadcn variables */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    /* ... */

    /* Shadowdark-specific overrides for light mode */
    --primary: 0 0% 38%; /* shadowdark-500 */
    --secondary: 0 0% 96.1%;
    --accent: 45 93% 47%; /* treasure-500 for highlights */
    --destructive: 0 84% 60%; /* blood-400 */
  }

  .dark {
    /* Existing dark mode variables */
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... */

    /* Shadowdark dark mode (emphasize darkness) */
    --primary: 0 0% 62%; /* shadowdark-300 */
    --card: 0 0% 10%; /* Darker cards */
    --border: 0 0% 20%; /* Subtle borders */
    --accent: 45 93% 47%; /* Keep treasure gold */
  }
}
```

**Step 3: Create Typography Utilities**

```css
/* globals.css */
@layer base {
  h1 {
    @apply text-4xl font-extrabold leading-tight tracking-tight;
  }
  h2 {
    @apply text-3xl font-bold leading-snug;
  }
  h3 {
    @apply text-2xl font-semibold leading-normal;
  }
  /* Align with Mantine heading sizes */
}
```

---

### Form Handling Migration

This is the **highest complexity** area. Current state:

**Current Implementation**:

- `@mantine/form` used in `MonsterCreateEditForm.tsx` (484 lines, complex)
- `@mantine/form` used in `MonsterForm.tsx`
- Manual Zod validation with `form.validate()`
- `react-hook-form` already in `package.json` (unused)

**Migration Strategy**:

#### Option A: Full react-hook-form Migration (Recommended)

**Benefits**:

- Industry standard (1.6M weekly downloads vs Mantine's 200K)
- Better TypeScript integration
- Smaller bundle size
- Already using Zod validation

**Implementation**:

```typescript
// Before (Mantine)
import { useForm } from '@mantine/form';

const form = useForm({
  initialValues: { name: '', challenge_level: 1 },
  validate: (values) => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      // Manual error mapping
    }
  },
});

<TextInput {...form.getInputProps('name')} />

// After (react-hook-form + shadcn)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', challenge_level: 1 },
});

<Form {...form}>
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

**Breaking Changes**:

- `form.getInputProps()` → `render` pattern with `field` spreading
- `form.insertListItem()` → `useFieldArray()` hook
- `form.removeListItem()` → `fields.remove(index)`
- Manual validation → automatic via `zodResolver`

**Migration Checklist** (MonsterCreateEditForm.tsx):

- [ ] Replace `useForm` import
- [ ] Add `zodResolver` for validation
- [ ] Convert all `TextInput/NumberInput` to `FormField` pattern
- [ ] Replace attacks array logic with `useFieldArray`
- [ ] Replace abilities array logic with `useFieldArray`
- [ ] Update error display to use `FormMessage`
- [ ] Test form submission and validation

---

### Hooks Migration

#### `useDebouncedValue` → `use-debounce`

**Current Usage**: 2 instances (MonsterFilters, SpellFilters)

```typescript
// Before (Mantine)
import { useDebouncedValue } from "@mantine/hooks";
const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

// After (use-debounce)
import { useDebounce } from "use-debounce";
const [debouncedSearch] = useDebounce(searchTerm, 300);
```

**Action**: Install `use-debounce` package and update imports.

#### `useDisclosure` → `useState`

**Current Usage**: Mobile nav drawer, modals

```typescript
// Before (Mantine)
import { useDisclosure } from "@mantine/hooks";
const [opened, { open, close, toggle }] = useDisclosure(false);

// After (Custom hook)
function useDisclosure(initialState = false) {
  const [opened, setOpened] = useState(initialState);
  return {
    opened,
    open: () => setOpened(true),
    close: () => setOpened(false),
    toggle: () => setOpened((prev) => !prev),
  };
}
```

**Action**: Create `/lib/hooks/use-disclosure.ts` utility hook.

#### `useMantineColorScheme` → `next-themes` (Already Migrated)

No action needed - `next-themes` is already installed and configured.

---

### Notification System Migration

**Current**: `@mantine/notifications`
**Target**: Sonner (recommended by shadcn)

**Current Usage**:

- Monster create/edit success/error notifications
- Form validation feedback

**Migration**:

```typescript
// Before (Mantine)
import { notifications } from '@mantine/notifications';

notifications.show({
  title: 'Success',
  message: 'Monster created successfully!',
  color: 'green',
  icon: <IconCheck />,
});

// After (Sonner)
import { toast } from 'sonner';

toast.success('Monster created successfully!', {
  description: 'Your monster is now available.',
  icon: <IconCheck />,
});
```

**Setup Required**:

1. Install `sonner` package
2. Add `<Toaster />` to root layout
3. Update all `notifications.show()` calls
4. Update error handling to use `toast.error()`

---

## Implementation Phases

### Phase 0: Setup and Foundation (1 day)

**Goal**: Install all required shadcn/ui components and dependencies

#### Tasks

- [ ] **Install shadcn/ui components** (missing ones):

  ```bash
  npx shadcn@latest add tabs
  npx shadcn@latest add sheet
  npx shadcn@latest add separator
  npx shadcn@latest add avatar
  npx shadcn@latest add table
  npx shadcn@latest add alert
  npx shadcn@latest add dialog
  npx shadcn@latest add textarea
  npx shadcn@latest add select
  npx shadcn@latest add switch
  npx shadcn@latest add form
  npx shadcn@latest add navigation-menu
  npx shadcn@latest add skeleton
  ```

- [ ] **Install additional packages**:

  ```bash
  npm install use-debounce sonner
  ```

- [ ] **Update `tailwind.config.ts`** with Shadowdark color palettes

- [ ] **Update `globals.css`** with:
  - Shadowdark theme CSS variables
  - Typography utilities matching Mantine sizes
  - Custom utility classes for common layouts

- [ ] **Create custom hooks** in `/lib/hooks/`:
  - `use-disclosure.ts` (replacement for Mantine hook)
  - `use-media-query.ts` (for responsive logic)

- [ ] **Create utility components** in `/components/ui/`:
  - `spinner.tsx` (loading spinner with Lucide `Loader2`)
  - `loading-overlay.tsx` (full-screen loading state)

#### Success Criteria

- All shadcn components installed and importable
- Tailwind config includes custom Shadowdark colors
- Custom hooks created and tested
- No TypeScript errors

---

### Phase 1: Core Infrastructure (1-2 days)

**Goal**: Migrate theme provider, layout system, and utility components

#### 1.1 Theme Provider Migration

**Files to Update**:

- `/src/components/providers/MantineProvider.tsx` → Delete (or mark deprecated)
- `/src/components/providers/RootProvider.tsx` → Simplify
- `/app/layout.tsx` → Remove Mantine imports

**Tasks**:

- [ ] **Remove Mantine theme configuration**:
  - Delete `MantineProvider.tsx` file
  - Remove `ColorSchemeScript` from `layout.tsx`
  - Keep `next-themes` `ThemeProvider` only

- [ ] **Update root layout** (`app/layout.tsx`):

  ```typescript
  import { ThemeProvider } from 'next-themes';
  import { Toaster } from 'sonner';

  export default function RootLayout({ children }) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] **Update `RootProvider.tsx`**:
  - Remove `AppShell`, `Container`, `useMantineColorScheme`
  - Replace with simple div-based layout
  - Keep Header and navigation logic

#### 1.2 Layout Components Migration

**Files to Update**:

- `/src/components/layout/Header.tsx` (235 lines, complex)
- `/src/components/layout/MobileNav.tsx`

**Tasks**:

- [ ] **Migrate Header.tsx**:
  - Replace `Container` → Tailwind container div
  - Replace `Group` → Tailwind flex utilities
  - Replace `Tabs` → shadcn Tabs component
  - Replace `ActionIcon` → shadcn Button with `variant="ghost" size="icon"`
  - Replace `Avatar` → shadcn Avatar
  - Replace `Menu` → shadcn DropdownMenu (already installed)
  - Replace `Burger` → Custom hamburger button component
  - Update theme toggle to use `next-themes`

- [ ] **Migrate MobileNav.tsx**:
  - Replace `Drawer` → shadcn Sheet component
  - Replace `NavLink` → Custom NavigationMenuItem or Link with styling
  - Replace `Divider` → shadcn Separator

- [ ] **Update CSS Module** (`Header.module.css`):
  - Migrate Mantine-specific styles to Tailwind classes
  - Remove Emotion-dependent styles

#### 1.3 Utility Components Migration

**Files to Update**:

- `/src/components/ui/LoadingSpinner.tsx`
- `/src/components/ui/ErrorAlert.tsx`
- `/src/components/ui/EmptyState.tsx`
- `/src/components/ui/Pagination.tsx`

**Tasks**:

- [ ] **Migrate LoadingSpinner**:
  - Replace `Loader`, `Center`, `Stack` with Tailwind
  - Use Lucide `Loader2` icon with CSS animation

  ```typescript
  <div className="flex flex-col items-center justify-center gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    {message && <p className="text-sm text-muted-foreground">{message}</p>}
  </div>
  ```

- [ ] **Migrate ErrorAlert**:
  - Replace Mantine `Alert` → shadcn Alert component
  - Replace `Button` → shadcn Button (already done)

- [ ] **Migrate EmptyState**:
  - Replace `Center`, `Stack`, `ThemeIcon` with Tailwind layout
  - Keep icon logic with Lucide icons

- [ ] **Migrate Pagination**:
  - Replace Mantine `Pagination` with custom component using shadcn Button
  - Use Tailwind for layout and styling

#### Success Criteria

- Theme switching works correctly (dark/light mode)
- Header renders correctly on desktop and mobile
- Mobile drawer navigation works
- All utility components render without Mantine dependencies
- No visual regressions

---

### Phase 2: Data Display Components (2-3 days)

**Goal**: Migrate monster and spell display components

#### 2.1 Monster Components Migration

**Files to Update** (7 files):

- `/src/components/monsters/MonsterCard.tsx`
- `/src/components/monsters/MonsterStatBlock.tsx`
- `/src/components/monsters/MonsterAttacksDisplay.tsx`
- `/src/components/monsters/MonsterAbilitiesDisplay.tsx`
- `/src/components/monsters/MonsterOwnershipCard.tsx`
- `/src/components/monsters/MonsterList.tsx`
- `/src/components/monsters/MonsterFilters.tsx`

**Tasks**:

- [ ] **MonsterCard.tsx**:
  - Replace `Paper` → shadcn `Card` (already installed)
  - Replace `Group`, `Stack` → Tailwind flex utilities
  - Replace `Text`, `Title` → semantic HTML + Tailwind typography
  - Replace `Badge` → shadcn Badge (already installed)
  - Replace `ActionIcon` → shadcn Button with icon variant
  - Replace `Menu` → shadcn DropdownMenu (already installed)

- [ ] **MonsterStatBlock.tsx**:
  - Replace `Paper` → shadcn Card
  - Replace `Grid` → Tailwind grid utilities
  - Replace `Text` → `<p>` or `<span>` with Tailwind classes

- [ ] **MonsterAttacksDisplay.tsx**:
  - Replace `Paper` → shadcn Card
  - Replace `Stack`, `Group` → Tailwind flex/grid
  - Replace `Divider` → shadcn Separator

- [ ] **MonsterAbilitiesDisplay.tsx**:
  - Replace `Paper` → shadcn Card
  - Replace `Title`, `Text` → semantic HTML + Tailwind
  - Replace `Divider` → shadcn Separator

- [ ] **MonsterOwnershipCard.tsx**:
  - Replace `Paper` → shadcn Card
  - Replace `Group` → Tailwind flex
  - Replace `Badge` → shadcn Badge

- [ ] **MonsterList.tsx**:
  - Replace `SimpleGrid` → Tailwind grid utilities
  - Replace `Stack` → Tailwind flex column
  - Update to use migrated MonsterCard

- [ ] **MonsterFilters.tsx** (High Complexity):
  - Replace `Paper` → shadcn Card
  - Replace `TextInput` → shadcn Input (already installed)
  - Replace `Select` → shadcn Select (to be installed)
  - Replace `MultiSelect` → Custom multi-select with shadcn Combobox pattern
  - Replace `useDebouncedValue` → `use-debounce`
  - Replace `ActionIcon` → shadcn Button

#### 2.2 Spell Components Migration

**Files to Update** (4 files):

- `/src/components/spells/SpellCard.tsx`
- `/src/components/spells/SpellDetailBlock.tsx`
- `/src/components/spells/SpellList.tsx`
- `/src/components/spells/SpellFilters.tsx`

**Tasks**: (Similar pattern to Monster components)

- [ ] **SpellCard.tsx**: Migrate Paper, Group, Text, Badge
- [ ] **SpellDetailBlock.tsx**: Migrate Paper, Grid, Badge
- [ ] **SpellList.tsx**: Migrate SimpleGrid, Stack
- [ ] **SpellFilters.tsx**: Migrate filters (same as MonsterFilters)

#### Success Criteria

- All monster/spell cards render correctly
- Filters work with debouncing
- Stat blocks display properly
- Responsive layout maintained
- No TypeScript errors

---

### Phase 3: Page-Level Components (1-2 days)

**Goal**: Migrate page-level layouts and compositions

#### Files to Update

- `/app/page.tsx` (Landing page)
- `/app/monsters/page.tsx` (Monster list page)
- `/app/monsters/[id]/page.tsx` (Monster detail page)
- `/app/monsters/[id]/edit/page.tsx` (Monster edit page)
- `/app/monsters/create/page.tsx` (Monster create page)
- `/app/spells/[slug]/page.tsx` (Spell detail page)
- `/app/spells/create/page.tsx` (Spell create page)

**Tasks**:

- [ ] **Landing page** (`app/page.tsx`):
  - Replace `Container` → Tailwind container
  - Replace `Stack`, `Group`, `Grid` → Tailwind utilities
  - Replace `Card`, `Title`, `Text` → shadcn Card + semantic HTML
  - Replace `Button` → shadcn Button

- [ ] **Monster list page**:
  - Replace `Container` → Tailwind container
  - Replace `LoadingOverlay` → Custom loading overlay component
  - Verify MonsterFilters and MonsterList work (migrated in Phase 2)

- [ ] **Monster detail page**:
  - Replace `Container`, `Grid`, `Group` → Tailwind utilities
  - Replace `Paper` → shadcn Card
  - Replace `Badge`, `Button` → shadcn components
  - Replace `Menu` → shadcn DropdownMenu
  - Replace `notifications` → Sonner toast

- [ ] **Monster edit/create pages**:
  - Replace `Container` → Tailwind container
  - Replace `LoadingOverlay` → Custom loading overlay
  - Replace `Alert` → shadcn Alert
  - Update to use migrated form component (Phase 4)

- [ ] **Spell pages**: (Similar pattern to Monster pages)

#### Success Criteria

- All pages render correctly
- Page layouts match original design
- Navigation works between pages
- Loading states display properly

---

### Phase 4: Forms and Complex Components (3-4 days)

**Goal**: Migrate complex form components to react-hook-form + shadcn

This is the **highest risk and complexity** phase.

#### 4.1 Form Component Migration

**Files to Update**:

- `/src/components/monsters/MonsterCreateEditForm.tsx` (484 lines, CRITICAL)
- `/src/components/monsters/MonsterForm.tsx`
- `/src/components/ui/IconSelector.tsx`

**Tasks**:

- [ ] **Install react-hook-form dependencies** (if not present):

  ```bash
  npm install react-hook-form @hookform/resolvers
  ```

- [ ] **Create form field components** in `/components/ui/`:

  ```bash
  npx shadcn@latest add form
  ```

- [ ] **Migrate MonsterCreateEditForm.tsx** (CRITICAL PATH):

  **Step 1**: Setup react-hook-form

  ```typescript
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useFieldArray } from "react-hook-form";

  const form = useForm({
    resolver: zodResolver(createMonsterSchema),
    defaultValues: {
      name: initialData?.name || "",
      challenge_level: initialData?.challenge_level || 1,
      // ... all other fields
    },
  });
  ```

  **Step 2**: Migrate basic inputs

  ```typescript
  // Before
  <TextInput
    label="Monster Name"
    {...form.getInputProps('name')}
  />

  // After
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Monster Name</FormLabel>
        <FormControl>
          <Input placeholder="Enter monster name" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  ```

  **Step 3**: Migrate array fields (attacks, abilities)

  ```typescript
  const { fields: attackFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attacks',
  });

  // Map over attackFields instead of form.values.attacks
  {attackFields.map((field, index) => (
    <div key={field.id}>
      <FormField
        control={form.control}
        name={`attacks.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input {...field} placeholder="Attack name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button onClick={() => remove(index)}>Remove</Button>
    </div>
  ))}
  ```

  **Step 4**: Update form submission

  ```typescript
  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      // Existing submission logic
      toast.success("Monster created successfully!");
      router.push(`/monsters/${monster.id}`);
    } catch (error) {
      toast.error("Failed to create monster");
    } finally {
      setIsSubmitting(false);
    }
  });
  ```

- [ ] **Migrate MonsterForm.tsx**: (Similar pattern to MonsterCreateEditForm)

- [ ] **Migrate IconSelector.tsx**:
  - Replace `Select`, `Group`, `TextInput` → shadcn components
  - Replace `ActionIcon` → shadcn Button

#### 4.2 Notification System Migration

- [ ] **Update all `notifications.show()` calls**:
  - Search codebase: `grep -r "notifications.show" src/ app/`
  - Replace with `toast.success()`, `toast.error()`, etc.

  **Locations**:
  - MonsterCreateEditForm.tsx (2 instances)
  - Monster detail page (delete action)
  - Any other forms

- [ ] **Remove `@mantine/notifications` imports**

#### Success Criteria

- MonsterCreateEditForm works end-to-end:
  - Form loads with initial data (edit mode)
  - All inputs update correctly
  - Array fields (attacks, abilities) can be added/removed
  - Validation works (shows errors)
  - Form submits successfully
  - Toasts display on success/error
- No TypeScript errors
- E2E tests pass for monster creation/editing

---

### Phase 5: Testing, Cleanup, and Optimization (2-3 days)

**Goal**: Ensure complete migration, remove Mantine, optimize bundle

#### 5.1 Comprehensive Testing

- [ ] **Visual regression testing**:
  - Compare screenshots of all pages (before/after)
  - Verify dark mode works correctly
  - Check responsive breakpoints (mobile, tablet, desktop)

- [ ] **Functional testing**:
  - Run all existing Playwright E2E tests
  - Manually test all user flows:
    - Monster create/edit/delete
    - Spell browsing
    - Search and filtering
    - Theme switching
    - Mobile navigation

- [ ] **Accessibility testing**:
  - Run axe DevTools on all pages
  - Verify keyboard navigation works
  - Check ARIA attributes on form fields

- [ ] **Performance testing**:
  - Run Lighthouse audits (before/after)
  - Compare bundle size (expect ~600KB reduction)
  - Check Core Web Vitals

#### 5.2 Mantine Removal

**Only proceed if all tests pass!**

- [ ] **Remove Mantine dependencies**:

  ```bash
  npm uninstall @mantine/core @mantine/hooks @mantine/form @mantine/notifications @mantine/dates @mantine/dropzone @mantine/spotlight
  npm uninstall @emotion/cache @emotion/react @emotion/styled
  npm uninstall mantine-form-zod-resolver
  ```

- [ ] **Remove Mantine-related files**:

  ```bash
  rm src/components/providers/MantineProvider.tsx
  rm src/components/layout/Header.module.css  # If no longer needed
  ```

- [ ] **Search for remaining Mantine imports**:

  ```bash
  grep -r "@mantine" src/ app/
  ```

  - Should return 0 results

- [ ] **Update `globals.css`**:
  - Remove comment about Mantine handling dark mode
  - Enable body background/text color application:

  ```css
  body {
    @apply bg-background text-foreground;
  }
  ```

- [ ] **Update `.claude/agents/mantine-ui-specialist.md`**:
  - Mark as deprecated
  - Point to new shadcn/ui patterns

#### 5.3 Documentation Updates

- [ ] **Update `/README.md`**:
  - Remove Mantine UI references
  - Add shadcn/ui setup instructions
  - Update component library section

- [ ] **Update `/CLAUDE.md`**:
  - Update tech stack section
  - Remove Mantine from "Current Implementation"
  - Add shadcn/ui patterns and examples
  - Update agent references (deprecate mantine-ui-specialist)

- [ ] **Create migration guide** (`/docs/mantine-to-shadcn-migration.md`):
  - Document component mappings for future reference
  - Include code examples
  - List common pitfalls and solutions

- [ ] **Update agent files**:
  - Deprecate `form-validation-specialist.md` (Mantine-focused)
  - Update `react-developer.md` with shadcn patterns

#### 5.4 Code Quality Improvements

- [ ] **Run linter and fix issues**:

  ```bash
  npm run lint:fix
  ```

- [ ] **Run formatter**:

  ```bash
  npm run format
  ```

- [ ] **Type check**:

  ```bash
  npx tsc --noEmit
  ```

- [ ] **Remove unused imports**:
  - Use ESLint plugin or IDE tools to remove unused imports

- [ ] **Optimize component file sizes**:
  - Split large components if needed
  - Extract reusable patterns

#### Success Criteria

- ✅ All Playwright E2E tests pass
- ✅ No Mantine dependencies in package.json
- ✅ No Mantine imports in codebase
- ✅ Bundle size reduced by ~600KB
- ✅ Lighthouse performance score maintained or improved
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Documentation updated
- ✅ Visual parity with original design
- ✅ Dark mode works correctly
- ✅ Mobile responsive design intact

---

## Risk Assessment

### High Risk Areas

#### 1. MonsterCreateEditForm.tsx (CRITICAL)

**Risk**: 484-line complex form with array fields, custom validation, dynamic inputs

**Impact**: High - core feature for creating custom monsters
**Probability**: Medium - react-hook-form migration is well-documented but complex

**Mitigation**:

- Create backup branch before migration
- Migrate in small, testable chunks:
  1. Basic inputs first
  2. Array fields second (attacks, abilities)
  3. Conditional logic third (custom speed)
- Write integration tests before migration
- Keep Mantine version alongside shadcn during development
- Allocate 2 full days for this single component

**Rollback**: Revert commit and use Mantine version until issues resolved

#### 2. Notification System

**Risk**: Replacing notification system affects error handling across app

**Impact**: Medium - broken notifications lead to poor UX
**Probability**: Low - Sonner migration is straightforward

**Mitigation**:

- Search for ALL `notifications.show()` calls before migration
- Create mapping document (Mantine → Sonner)
- Test error scenarios thoroughly
- Use TypeScript to catch missing migrations (remove Mantine types)

#### 3. Multi-Select Component

**Risk**: No direct shadcn equivalent for `MultiSelect`

**Impact**: Medium - affects monster/spell filtering (tags)
**Probability**: High - will require custom implementation

**Mitigation**:

- Use shadcn `Combobox` pattern with multi-select logic
- Alternatively, use `react-select` package temporarily
- Allocate extra time for custom component development
- Consider simplifying UX (convert to checkboxes if needed)

**Options**:

1. Build custom multi-select using shadcn Popover + Checkbox
2. Use third-party library (`react-select`, `cmdk`)
3. Simplify UX to use multiple single selects

### Medium Risk Areas

#### 4. Theme Switching

**Risk**: Color palette migration might not match Mantine appearance

**Impact**: Medium - visual consistency
**Probability**: Medium - CSS variable mapping is imperfect

**Mitigation**:

- Document exact Mantine color values
- Use browser DevTools to compare rendered colors
- Create side-by-side comparison screenshots
- Adjust Tailwind config until colors match

#### 5. Mobile Navigation

**Risk**: Drawer → Sheet migration might have UX differences

**Impact**: Medium - mobile users affected
**Probability**: Low - shadcn Sheet is feature-complete

**Mitigation**:

- Test on real mobile devices
- Verify swipe gestures work (if used)
- Ensure proper z-index layering

### Low Risk Areas

#### 6. Layout Components

**Risk**: Container, Stack, Group → Tailwind utilities

**Impact**: Low - mostly cosmetic
**Probability**: Low - Tailwind utilities are well-understood

**Mitigation**: Standard testing and visual comparison

#### 7. Simple Data Display

**Risk**: Text, Badge, Button migrations

**Impact**: Low - core shadcn components are stable
**Probability**: Very Low

---

## Timeline and Milestones

### Realistic Timeline: 12 Development Days (2.5 weeks)

Assumes: 1 developer, 5-6 hours/day of focused work

| Phase                          | Duration | Days      | Milestone                                       |
| ------------------------------ | -------- | --------- | ----------------------------------------------- |
| **Phase 0**: Setup             | 1 day    | Day 1     | All shadcn components installed, config updated |
| **Phase 1**: Infrastructure    | 2 days   | Days 2-3  | Theme provider, layout, header migrated         |
| **Phase 2**: Data Display      | 3 days   | Days 4-6  | Monster/spell components migrated               |
| **Phase 3**: Pages             | 2 days   | Days 7-8  | All pages migrated                              |
| **Phase 4**: Forms             | 3 days   | Days 9-11 | Forms migrated to react-hook-form               |
| **Phase 5**: Testing & Cleanup | 2 days   | Day 12    | Mantine removed, tests pass                     |

### Go/No-Go Decision Points

#### Decision Point 1: After Phase 1 (Day 3)

**Question**: Is the theme system working correctly?

**Go Criteria**:

- ✅ Dark mode switches without errors
- ✅ Custom Shadowdark colors render correctly
- ✅ Header and navigation work on mobile/desktop

**No-Go Action**: Fix theme issues before proceeding (add 1 day)

#### Decision Point 2: After Phase 2 (Day 6)

**Question**: Do all display components render correctly?

**Go Criteria**:

- ✅ Monster/spell cards look visually identical
- ✅ Filters work with debouncing
- ✅ No TypeScript errors

**No-Go Action**: Fix component issues, consider extending Phase 2 (add 1-2 days)

#### Decision Point 3: After Phase 4 (Day 11)

**Question**: Does the monster creation form work end-to-end?

**Go Criteria**:

- ✅ Form submits successfully
- ✅ Validation works correctly
- ✅ Array fields (attacks/abilities) function
- ✅ No data loss or corruption

**No-Go Action**: **CRITICAL** - Do not proceed to Phase 5 (Mantine removal) until form is 100% functional. Add 2-3 days if needed.

### Contingency Plan

**If timeline exceeds 15 days**:

1. Pause migration at current phase
2. Document migration state
3. Reassess complexity and resources
4. Consider hybrid approach (keep Mantine for forms only)

---

## Dependencies and Prerequisites

### Required Packages

#### To Install

```json
{
  "dependencies": {
    "sonner": "^1.7.0",
    "use-debounce": "^10.0.0"
  }
}
```

#### Already Installed ✅

- `react-hook-form`: ^7.63.0
- `@hookform/resolvers`: ^5.2.2
- `next-themes`: ^0.4.6
- `zod`: ^4.1.11
- `tailwind-merge`: ^3.3.1
- `class-variance-authority`: ^0.7.1
- `lucide-react`: ^0.545.0

#### To Remove (Phase 5)

```json
{
  "dependencies": {
    "@mantine/core": "^8.3.1",
    "@mantine/hooks": "^8.3.1",
    "@mantine/form": "^8.3.1",
    "@mantine/notifications": "^8.3.1",
    "@mantine/dates": "^8.3.1",
    "@mantine/dropzone": "^8.3.1",
    "@mantine/spotlight": "^8.3.1",
    "@emotion/cache": "^11.14.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "mantine-form-zod-resolver": "^1.3.0"
  }
}
```

**Total removal**: ~600KB (estimated minified + gzipped)

### shadcn/ui Components to Install

**Already Installed** ✅:

- badge
- button
- card
- checkbox
- dropdown-menu
- input
- label

**Need to Install**:

- tabs
- sheet
- separator
- avatar
- table
- alert
- dialog
- textarea
- select
- switch
- form
- navigation-menu
- skeleton
- toast (via sonner)

**Command**:

```bash
npx shadcn@latest add tabs sheet separator avatar table alert dialog textarea select switch form navigation-menu skeleton
```

### Configuration Changes

#### `tailwind.config.ts`

- Add Shadowdark custom color palettes
- Verify shadcn color variables

#### `globals.css`

- Add Shadowdark theme CSS variables
- Add typography utilities
- Enable body background/text (after Mantine removal)

#### `components.json`

Already configured ✅ (new-york style, RSC support)

### Development Environment

**Recommended**:

- Node.js 20+
- TypeScript 5+
- ESLint + Prettier configured
- Playwright for E2E tests

---

## Success Criteria

### Functional Metrics

- [ ] All existing features work identically
- [ ] All Playwright E2E tests pass
- [ ] No console errors in browser
- [ ] No TypeScript compilation errors
- [ ] Forms submit and validate correctly
- [ ] Navigation works (desktop + mobile)
- [ ] Theme switching works (dark/light)

### Performance Metrics

**Target Improvements**:

- **Bundle Size**: Reduce by 500-600KB (Mantine + Emotion removal)
- **First Contentful Paint (FCP)**: Maintain or improve (<1.5s)
- **Largest Contentful Paint (LCP)**: Maintain or improve (<2.5s)
- **Time to Interactive (TTI)**: Improve by 200-300ms (no runtime CSS-in-JS)

**Measurement**:

- Run Lighthouse audits before/after
- Compare production bundle analysis
- Measure page load times in Network tab

### Code Quality Metrics

- [ ] ESLint: 0 errors, <10 warnings
- [ ] TypeScript: No errors
- [ ] Test Coverage: Maintain 40%+ (MVP target)
- [ ] No `@ts-ignore` comments added
- [ ] No `any` types introduced

### Visual Parity

- [ ] All pages render identically (within 5px tolerance)
- [ ] Dark mode colors match Mantine theme
- [ ] Custom Shadowdark colors preserved:
  - `shadowdark` grays
  - `blood` reds
  - `treasure` golds
  - `magic` purples
- [ ] Typography sizes match Mantine headings
- [ ] Spacing/padding appears consistent

### Developer Experience

- [ ] Component API is intuitive
- [ ] No complex workarounds needed
- [ ] Custom hooks are simple and reusable
- [ ] Forms are easier to maintain (react-hook-form)
- [ ] Documentation is clear and up-to-date

---

## Post-Migration

### Cleanup Tasks

#### Code Cleanup

- [ ] Remove all Mantine imports (verify with grep)
- [ ] Delete MantineProvider.tsx
- [ ] Remove unused CSS modules
- [ ] Remove deprecated agent docs
- [ ] Clean up any temporary migration code

#### Optimization

- [ ] Run bundle analyzer and identify remaining bloat
- [ ] Code-split large components if needed
- [ ] Optimize images and assets
- [ ] Remove unused Tailwind classes (PurgeCSS)

#### Testing

- [ ] Run full E2E test suite
- [ ] Manual QA on staging environment
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile device testing (iOS, Android)

### Documentation Updates

#### User-Facing

- [ ] Update README.md with new tech stack
- [ ] Update contributing guidelines
- [ ] Create component usage examples

#### Developer-Facing

- [ ] Update CLAUDE.md with shadcn patterns
- [ ] Create shadcn component guidelines doc
- [ ] Update form validation patterns
- [ ] Document custom hooks usage

#### Agent Updates

- [ ] Deprecate `mantine-ui-specialist.md`
- [ ] Update `react-developer.md` with shadcn examples
- [ ] Update `form-validation-specialist.md` with react-hook-form patterns
- [ ] Create `shadcn-ui-specialist.md` (optional)

### Monitoring

**First Week Post-Migration**:

- [ ] Monitor error logs for migration issues
- [ ] Track user feedback on UI changes
- [ ] Monitor performance metrics (Core Web Vitals)
- [ ] Watch bundle size in production

**First Month Post-Migration**:

- [ ] Collect developer feedback on new patterns
- [ ] Identify pain points or missing utilities
- [ ] Optimize frequently-used components
- [ ] Consider adding more shadcn components as needed

---

## Resources and References

### Official Documentation

- **shadcn/ui**: https://ui.shadcn.com/docs
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **Sonner**: https://sonner.emilkowal.ski/
- **next-themes**: https://github.com/pacocoursey/next-themes
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives

### Component Mapping Reference

**Quick Reference Table**:

| Mantine       | shadcn/ui                     | Notes               |
| ------------- | ----------------------------- | ------------------- |
| AppShell      | Custom div                    | Use Tailwind layout |
| Container     | `<div className="container">` | Built into Tailwind |
| Stack         | `flex flex-col gap-*`         | Tailwind utility    |
| Group         | `flex flex-row gap-*`         | Tailwind utility    |
| Paper         | Card                          | shadcn component    |
| Tabs          | Tabs                          | shadcn component    |
| Drawer        | Sheet                         | shadcn component    |
| Menu          | DropdownMenu                  | shadcn component    |
| Alert         | Alert                         | shadcn component    |
| notifications | sonner (toast)                | External package    |
| useForm       | react-hook-form               | External package    |

### Example Code Patterns

#### Form Field Pattern

```typescript
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input placeholder="Placeholder" {...field} />
      </FormControl>
      <FormDescription>Optional description</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Array Fields Pattern

```typescript
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'arrayField',
});

{fields.map((field, index) => (
  <div key={field.id}>
    <FormField
      control={form.control}
      name={`arrayField.${index}.name`}
      render={({ field }) => <Input {...field} />}
    />
    <Button onClick={() => remove(index)}>Remove</Button>
  </div>
))}
<Button onClick={() => append({ name: '' })}>Add</Button>
```

#### Toast Pattern

```typescript
// Success
toast.success("Action completed", {
  description: "Your changes have been saved.",
});

// Error
toast.error("Action failed", {
  description: error.message,
});

// Loading
const toastId = toast.loading("Processing...");
// Later...
toast.success("Done!", { id: toastId });
```

### Troubleshooting Guide

**Issue**: Form validation not showing errors
**Solution**: Ensure `FormMessage` is inside `FormItem` and `FormField` has correct `name`

**Issue**: Dark mode not working
**Solution**: Verify `ThemeProvider` has `attribute="class"` and `globals.css` has `.dark` class

**Issue**: Tailwind classes not applying
**Solution**: Check `tailwind.config.ts` content paths include your component directories

**Issue**: TypeScript errors on form values
**Solution**: Ensure Zod schema matches form defaultValues exactly

---

## Migration Checklist Summary

### Pre-Migration

- [ ] Backup current branch
- [ ] Document current Mantine usage (run grep analysis)
- [ ] Create migration tracking spreadsheet
- [ ] Allocate 12 development days

### Phase 0: Setup ✅

- [ ] Install all shadcn components
- [ ] Install additional packages (sonner, use-debounce)
- [ ] Update tailwind.config.ts
- [ ] Create custom hooks
- [ ] Create utility components

### Phase 1: Infrastructure ✅

- [ ] Remove Mantine theme provider
- [ ] Migrate Header.tsx
- [ ] Migrate MobileNav.tsx
- [ ] Migrate utility components
- [ ] Test theme switching

### Phase 2: Data Display ✅

- [ ] Migrate MonsterCard
- [ ] Migrate MonsterStatBlock
- [ ] Migrate MonsterAttacksDisplay
- [ ] Migrate MonsterAbilitiesDisplay
- [ ] Migrate MonsterFilters
- [ ] Migrate SpellCard
- [ ] Migrate SpellFilters
- [ ] Test all display components

### Phase 3: Pages ✅

- [ ] Migrate landing page
- [ ] Migrate monster pages
- [ ] Migrate spell pages
- [ ] Test all page layouts

### Phase 4: Forms ✅

- [ ] Migrate MonsterCreateEditForm
- [ ] Migrate MonsterForm
- [ ] Migrate IconSelector
- [ ] Replace notifications with toast
- [ ] Test end-to-end form flows

### Phase 5: Cleanup ✅

- [ ] Run all E2E tests
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Remove Mantine dependencies
- [ ] Remove Mantine files
- [ ] Update documentation
- [ ] Final QA

### Post-Migration ✅

- [ ] Monitor production for issues
- [ ] Collect developer feedback
- [ ] Optimize bundle size
- [ ] Update agent docs

---

## Conclusion

This migration plan provides a comprehensive, phased approach to transitioning from Mantine UI to shadcn/ui. The migration is **technically feasible** with **manageable risk** when following the incremental strategy outlined.

**Key Success Factors**:

1. **Incremental approach** - Migrate feature-by-feature, not all-at-once
2. **Comprehensive testing** - Test each phase before proceeding
3. **Parallel running** - Keep Mantine until 100% migrated
4. **Clear rollback plan** - Each phase is a git commit
5. **Adequate time allocation** - 12 days for thorough migration

**Biggest Challenges**:

- MonsterCreateEditForm migration (Phase 4) - allocate extra time
- Multi-select component replacement - may require custom solution
- Theme color matching - requires visual comparison

**Expected Outcome**:

- ✅ Reduced bundle size (~600KB savings)
- ✅ Improved performance (no runtime CSS-in-JS)
- ✅ Better developer experience (unified stack)
- ✅ Future-proof component architecture

**Recommendation**: **Proceed with migration** following this phased plan. The partial shadcn installation suggests this migration was already intended, and the benefits outweigh the risks when approached methodically.

---

## Appendix: File Inventory

### Files Requiring Migration (Grouped by Phase)

**Phase 1: Infrastructure (8 files)**

- src/components/providers/MantineProvider.tsx (DELETE)
- src/components/providers/RootProvider.tsx
- src/components/layout/Header.tsx
- src/components/layout/Header.module.css
- src/components/layout/MobileNav.tsx
- src/components/ui/LoadingSpinner.tsx
- src/components/ui/ErrorAlert.tsx
- src/components/ui/EmptyState.tsx
- src/components/ui/Pagination.tsx

**Phase 2: Data Display (11 files)**

- src/components/monsters/MonsterCard.tsx
- src/components/monsters/MonsterStatBlock.tsx
- src/components/monsters/MonsterAttacksDisplay.tsx
- src/components/monsters/MonsterAbilitiesDisplay.tsx
- src/components/monsters/MonsterOwnershipCard.tsx
- src/components/monsters/MonsterList.tsx
- src/components/monsters/MonsterFilters.tsx
- src/components/spells/SpellCard.tsx
- src/components/spells/SpellDetailBlock.tsx
- src/components/spells/SpellList.tsx
- src/components/spells/SpellFilters.tsx

**Phase 3: Pages (7 files)**

- app/page.tsx
- app/monsters/page.tsx
- app/monsters/[id]/page.tsx
- app/monsters/[id]/edit/page.tsx
- app/monsters/create/page.tsx
- app/spells/[slug]/page.tsx
- app/spells/create/page.tsx

**Phase 4: Forms (3 files)**

- src/components/monsters/MonsterCreateEditForm.tsx (CRITICAL)
- src/components/monsters/MonsterForm.tsx
- src/components/ui/IconSelector.tsx

**Phase 5: Configuration (4 files)**

- package.json
- tailwind.config.ts
- app/globals.css
- app/layout.tsx

**Total: 33 files** requiring direct migration

### Documentation Files to Update

- README.md
- CLAUDE.md
- .claude/agents/mantine-ui-specialist.md (deprecate)
- .claude/agents/form-validation-specialist.md
- .claude/agents/react-developer.md
