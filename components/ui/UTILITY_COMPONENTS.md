# Utility Components Documentation

This directory contains utility components that replace Mantine utility components as part of the migration to shadcn/ui.

---

## Phase 1.3: Utility Components Migration - COMPLETE ✅

**Date**: October 17, 2025
**Status**: Complete

All 4 core utility components migrated from Mantine to shadcn/ui with zero Mantine dependencies.

---

## Components

### LoadingSpinner

A loading spinner component with optional message and centering.

**Props:**

- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Spinner size (default: `'md'`)
- `message?: string` - Loading message (default: `'Loading...'`)
- `centered?: boolean` - Center on page (default: `true`)
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Basic usage
<LoadingSpinner />

// Custom message
<LoadingSpinner message="Loading monsters..." />

// Non-centered
<LoadingSpinner centered={false} />

// Different sizes
<LoadingSpinner size="xl" />
```

**Size Reference:**

- `sm`: 16px × 16px (h-4 w-4)
- `md`: 24px × 24px (h-6 w-6)
- `lg`: 32px × 32px (h-8 w-8)
- `xl`: 48px × 48px (h-12 w-12)

**Migration**: Replaces Mantine `Loader`, `Center`, `Stack`, `Text`

---

### ErrorAlert

An error alert component with optional retry action.

**Props:**

- `title?: string` - Alert title (default: `'Error'`)
- `message: string` - Error message (required)
- `onRetry?: () => void` - Optional retry callback
- `variant?: 'default' | 'destructive'` - Alert variant (default: `'destructive'`)

**Usage:**

```tsx
import { ErrorAlert } from '@/components/ui/ErrorAlert';

// Basic error
<ErrorAlert message="Failed to load data" />

// With retry
<ErrorAlert
  title="Network Error"
  message="Failed to connect to server"
  onRetry={() => fetchData()}
/>

// Different variant
<ErrorAlert
  message="Warning message"
  variant="default"
/>
```

**Migration**: Replaces Mantine `Alert`, `Button`, `Group`, Tabler icons

---

### EmptyState

An empty state component for displaying when no data is available.

**Props:**

- `icon?: ReactNode` - Custom icon (default: `FileQuestion` from Lucide)
- `title: string` - Empty state title (required)
- `description?: string` - Optional description
- `action?: { label: string, onClick: () => void, icon?: ReactNode }` - Optional action button

**Usage:**

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { Search } from 'lucide-react';

// Basic empty state
<EmptyState
  title="No monsters found"
  description="Try adjusting your search criteria"
/>

// With custom icon
<EmptyState
  icon={<Search className="h-8 w-8" />}
  title="No results"
/>

// With action button
<EmptyState
  title="No lists yet"
  description="Create your first monster list"
  action={{
    label: "Create List",
    onClick: () => createList()
  }}
/>
```

**Migration**: Replaces Mantine `Center`, `Stack`, `Text`, `Button`, `ThemeIcon`

---

### Pagination

A pagination component with page size selection and navigation.

**Props:**

- `currentPage: number` - Current page (1-indexed)
- `totalPages: number` - Total number of pages
- `pageSize: number` - Current page size
- `totalItems: number` - Total number of items
- `onPageChange: (page: number) => void` - Page change callback
- `onPageSizeChange?: (pageSize: number) => void` - Optional page size change callback
- `pageSizeOptions?: number[]` - Page size options (default: `[10, 20, 50, 100]`)

**Usage:**

```tsx
import { Pagination } from '@/components/ui/Pagination';

// Basic pagination
<Pagination
  currentPage={page}
  totalPages={10}
  pageSize={20}
  totalItems={200}
  onPageChange={setPage}
/>

// With page size selector
<Pagination
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  pageSizeOptions={[10, 25, 50]}
/>
```

**Features:**

- First/Previous/Next/Last page navigation
- Current page indicator
- Item range display ("Showing 1-20 of 200 items")
- Optional page size selector
- Responsive layout (column on mobile, row on desktop)
- ARIA labels for accessibility

**Migration**: Replaces Mantine `Pagination`, `Group`, `Text`, `Select`

---

### Spinner

A simple loading spinner (already migrated in Phase 0).

**Props:**

- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: `'md'`)
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { Spinner } from '@/components/ui/spinner';

<Spinner />
<Spinner size="lg" />
```

---

### LoadingOverlay

A full-screen loading overlay (already migrated in Phase 0).

**Props:**

- `visible: boolean` - Controls overlay visibility
- `message?: string` - Optional loading message

**Usage:**

```tsx
import { LoadingOverlay } from "@/components/ui/loading-overlay";

<LoadingOverlay visible={isLoading} message="Loading..." />;
```

---

## Accessibility

All components include proper accessibility features:

- **LoadingSpinner**: Screen reader accessible with message text
- **ErrorAlert**: Semantic alert structure with proper ARIA roles
- **EmptyState**: Semantic HTML (h3 for title, p for description)
- **Pagination**: ARIA labels on all navigation buttons
- **Spinner**: `aria-label="Loading"` for screen readers
- **LoadingOverlay**: `role="dialog"`, `aria-modal="true"`, `aria-live` regions

---

## Styling

All components use Tailwind CSS for styling and follow shadcn/ui patterns:

- Uses the `cn()` utility from `@/lib/utils` for class merging
- Supports className override for customization
- Uses Tailwind's built-in animations (`animate-spin`)
- Responsive and mobile-friendly
- Consistent with shadcn/ui design system

---

## Migration Statistics

### Components Migrated (6 total)

**Phase 0** (Completed Previously):

- ✅ Spinner
- ✅ LoadingOverlay

**Phase 1.3** (Just Completed):

- ✅ LoadingSpinner
- ✅ ErrorAlert
- ✅ EmptyState
- ✅ Pagination

### Mantine Imports Removed

- `Loader`, `Center`, `Stack`, `Text` (LoadingSpinner)
- `Alert`, `Button`, `Group` (ErrorAlert)
- `Center`, `Stack`, `Text`, `Button`, `ThemeIcon` (EmptyState)
- `Pagination`, `Group`, `Text`, `Select` (Pagination)

### shadcn Components Used

- `Button` (all components)
- `Alert`, `AlertTitle`, `AlertDescription` (ErrorAlert)
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` (Pagination)

### Icons Migrated

**Tabler → Lucide**:

- `IconAlertCircle` → `AlertCircle`
- `IconRefresh` → `RefreshCw`
- `IconPlus` → `Plus`

**New Lucide Icons**:

- `Loader2` (with `animate-spin`)
- `FileQuestion` (default empty state icon)
- `ChevronLeft`, `ChevronRight`, `ChevronsLeft`, `ChevronsRight` (Pagination)

---

## Testing

Unit tests are included for utility components:

- `/components/ui/__tests__/spinner.test.tsx`
- `/components/ui/__tests__/loading-overlay.test.tsx`

Run tests with:

```bash
npm test -- components/ui/__tests__/
```

---

## Migration Guide

### LoadingSpinner

```tsx
// Before (Mantine)
import { Loader, Center, Stack, Text } from "@mantine/core";

<Center py="xl">
  <Stack align="center" gap="md">
    <Loader size="md" />
    <Text size="sm" c="dimmed">
      Loading...
    </Text>
  </Stack>
</Center>;

// After (shadcn/ui)
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

<LoadingSpinner size="md" message="Loading..." />;
```

### ErrorAlert

```tsx
// Before (Mantine)
import { Alert, Button } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

<Alert icon={<IconAlertCircle />} title="Error" color="red">
  {message}
  <Button onClick={retry}>
    <IconRefresh />
    Retry
  </Button>
</Alert>;

// After (shadcn/ui)
import { ErrorAlert } from "@/components/ui/ErrorAlert";

<ErrorAlert title="Error" message={message} onRetry={retry} />;
```

### EmptyState

```tsx
// Before (Mantine)
import { Center, Stack, Text, Button, ThemeIcon } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

<Center py="xl">
  <Stack align="center">
    <ThemeIcon size="xl">
      <Icon />
    </ThemeIcon>
    <Text size="lg" fw={500}>
      {title}
    </Text>
    <Text size="sm" c="dimmed">
      {description}
    </Text>
    <Button onClick={action}>
      <IconPlus />
      {label}
    </Button>
  </Stack>
</Center>;

// After (shadcn/ui)
import { EmptyState } from "@/components/ui/EmptyState";

<EmptyState
  icon={<Icon className="h-8 w-8" />}
  title={title}
  description={description}
  action={{ label, onClick: action }}
/>;
```

### Pagination

```tsx
// Before (Mantine)
import { Pagination, Group, Text, Select } from "@mantine/core";

<Group justify="space-between">
  <Text size="sm">
    Showing {start}-{end} of {total}
  </Text>
  <Pagination value={page} onChange={setPage} total={totalPages} />
</Group>;

// After (shadcn/ui)
import { Pagination } from "@/components/ui/Pagination";

<Pagination
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={total}
  onPageChange={setPage}
/>;
```

---

## Dependencies

- `lucide-react` - Icons (Loader2, AlertCircle, ChevronLeft, etc.)
- `tailwindcss` - Styling and animations
- `clsx` & `tailwind-merge` - Class name merging (via `cn()` utility)
- `@radix-ui/*` - Base primitives for shadcn components

All dependencies are already installed in the project.

---

## Next Steps

- **Phase 1.4**: Form components (Input, Select, TextArea wrappers)
- **Phase 2.x**: Feature components (MonsterCard, MonsterForm, etc.)
- **Phase 3.x**: Layout components (Header, RootProvider)
