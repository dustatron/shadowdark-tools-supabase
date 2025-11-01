# Public Encounter Generator

## Overview

Make `/encounter-tables/new` publicly accessible, allow unauthenticated users to generate encounter tables, disable save functionality for unauthenticated users, and display alert prompting sign-in to save.

## User Stories

1. **As an unauthenticated user**, I want to generate encounter tables without signing in, so I can try the tool before creating an account
2. **As an unauthenticated user**, I want to see which features require authentication, so I know what I'm missing
3. **As an authenticated user**, I want to save my generated tables, so I can reuse them later
4. **As an unauthenticated user**, I want my generated table preserved if I log in, so I don't lose my work

## Current State

- `/encounter-tables/new` requires authentication (protected by middleware)
- EncounterForm component assumes authenticated user
- Save functionality directly calls API without auth checks
- No conditional UI for unauthenticated state

## Proposed Changes

### 1. Middleware Update

**File:** `lib/supabase/middleware.ts`

Add `/encounter-tables/new` to public routes:

```typescript
const publicRoutes = [
  "/",
  "/monsters",
  "/spells",
  "/encounter-tables/new", // NEW
  "/auth",
  "/api",
];
```

### 2. EncounterForm Component Updates

**File:** `app/encounter-tables/new/EncounterForm.tsx`

**Changes:**

- Add auth state detection
- Conditionally disable Save button based on auth
- Show alert banner when unauthenticated
- Preserve form data to localStorage on generate
- Restore from localStorage on auth

**New State:**

```typescript
const [user, setUser] = useState<User | null>(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

**Auth Detection:**

```typescript
useEffect(() => {
  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setIsAuthenticated(!!user);
  };
  checkAuth();
}, []);
```

**Alert Banner (bottom of form):**

```tsx
{
  !isAuthenticated && previewData && (
    <Alert className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <Link href="/auth/login" className="underline">
          Sign in
        </Link>{" "}
        to save this encounter table
      </AlertDescription>
    </Alert>
  );
}
```

**Save Button Updates:**

```tsx
<Button
  onClick={saveTable}
  disabled={!isAuthenticated || isSaving || !previewData}
>
  {isSaving ? "Saving..." : "Save Table"}
</Button>
```

**Data Persistence:**

```typescript
// On generate preview success
if (result.preview) {
  setPreviewData(result.preview);

  // Persist to localStorage for unauthenticated users
  if (!isAuthenticated) {
    localStorage.setItem(
      "pending_encounter_table",
      JSON.stringify(result.preview),
    );
  }
}

// On mount, check for pending data after auth
useEffect(() => {
  if (isAuthenticated) {
    const pending = localStorage.getItem("pending_encounter_table");
    if (pending) {
      const data = JSON.parse(pending);
      setPreviewData(data);
      // Show toast: "Your generated table is ready to save!"
      toast.info("Your generated table is ready to save!");
      localStorage.removeItem("pending_encounter_table");
    }
  }
}, [isAuthenticated]);
```

### 3. EncounterTablePreview Updates

**File:** `app/encounter-tables/new/EncounterTablePreview.tsx`

**Props Update:**

```typescript
interface Props {
  previewData: PreviewData;
  isGenerating: boolean;
  isSaving: boolean;
  isAuthenticated: boolean; // NEW
  onRegenerate: () => void;
  onSave: () => void;
}
```

**Save Button:**

```tsx
<Button
  onClick={onSave}
  disabled={!isAuthenticated || isSaving || !previewData}
  className="w-full"
>
  {isSaving ? "Saving..." : "Save Table"}
</Button>;

{
  !isAuthenticated && (
    <p className="text-sm text-muted-foreground text-center mt-2">
      <Link href="/auth/login" className="underline">
        Sign in
      </Link>{" "}
      to save
    </p>
  );
}
```

### 4. API Route Updates

**File:** `app/api/encounter-tables/route.ts` (POST)

**No changes needed** - already has auth check that returns 401:

```typescript
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 },
  );
}
```

### 5. Preview API Update

**File:** `app/api/encounter-tables/preview/route.ts`

**Remove auth requirement** - allow unauthenticated preview generation:

```typescript
// REMOVE this check:
// const { data: { user }, error: authError } = await supabase.auth.getUser();
// if (authError || !user) {
//   return NextResponse.json(
//     { error: "Authentication required" },
//     { status: 401 }
//   );
// }

// Keep validation and generation logic
```

## UI/UX Flow

### Unauthenticated User Flow

1. User visits `/encounter-tables/new`
2. Fills out form and clicks "Generate Preview"
3. Preview loads successfully
4. User sees:
   - Preview with all table entries
   - Disabled "Save Table" button
   - Alert banner: "Sign in to save this encounter table"
5. Table data persisted to localStorage
6. User clicks "Sign in" link → redirected to login
7. After login, redirected back to `/encounter-tables/new`
8. Table data restored from localStorage
9. Toast notification: "Your generated table is ready to save!"
10. Save button now enabled

### Authenticated User Flow

1. User visits `/encounter-tables/new`
2. Fills out form and clicks "Generate Preview"
3. Preview loads successfully
4. Save button enabled
5. User clicks "Save Table"
6. Redirected to `/encounter-tables/[id]`

## Component Structure

```
/encounter-tables/new/
├── page.tsx (public route)
├── EncounterForm.tsx
│   ├── Auth detection
│   ├── Form fields
│   ├── Generate preview logic
│   ├── Save logic (auth-gated)
│   ├── LocalStorage persistence
│   └── Alert banner
└── EncounterTablePreview.tsx
    ├── Preview display
    ├── Regenerate button
    └── Save button (conditional)
```

## Technical Considerations

### LocalStorage Schema

```typescript
interface PendingEncounterTable {
  name: string;
  description: string | null;
  die_size: number;
  filters: any;
  entries: any[];
  timestamp: number; // For cleanup
}
```

### Edge Cases

1. **LocalStorage full**: Catch quota errors, show toast warning
2. **Stale data**: Clear localStorage data older than 24h on mount
3. **Multiple tabs**: Use storage events to sync state
4. **Redirect loop**: Ensure middleware doesn't redirect authenticated users from `/encounter-tables/new`

### Accessibility

- Alert banner uses semantic Alert component
- Save button has proper disabled state
- Links have underline for visibility
- Toast notifications announced to screen readers

## Testing Requirements

### Unit Tests

- [ ] Auth state detection
- [ ] Save button disabled when unauthenticated
- [ ] LocalStorage save/restore logic
- [ ] Alert banner renders when unauthenticated

### E2E Tests (Playwright)

- [ ] Unauthenticated user can generate preview
- [ ] Save button disabled for unauthenticated
- [ ] Alert banner visible when unauthenticated
- [ ] Data persists through login flow
- [ ] Authenticated user can save table

### Manual Testing

- [ ] Route accessible without auth
- [ ] Preview generates without auth
- [ ] Save disabled for unauthenticated
- [ ] Alert visible with sign-in link
- [ ] Data persists through login
- [ ] Authenticated save works

## Success Metrics

- Unauthenticated users can generate tables
- Save functionality properly gated
- Clear CTAs for authentication
- Zero data loss through login flow

## Out of Scope

- Social share functionality for generated tables
- Export to PDF/print without saving
- URL-based sharing of generated tables
- Anonymous save to session storage (no persistence)
- Conversion tracking/analytics
