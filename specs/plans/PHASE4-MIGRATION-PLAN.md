# Phase 4: Forms Migration Plan

## Overview

**Phase**: 4 of 5
**Focus**: Migrate form components from Mantine (@mantine/form) to React Hook Form + shadcn/ui
**Estimated Duration**: 2-3 days
**Complexity**: HIGH (array fields, validation, complex state management)

---

## Forms Inventory

### 1. MonsterCreateEditForm.tsx (483 lines) - HIGH PRIORITY

**Location**: `/src/components/monsters/MonsterCreateEditForm.tsx`
**Complexity**: VERY HIGH
**Current Dependencies**:

- `@mantine/form` - useForm hook
- `@mantine/notifications` - notifications.show()
- `@tabler/icons-react` - 4 icons
- 21 Mantine UI components

**Key Features**:

- Create/edit modes
- Array field management (attacks, abilities)
- Icon selector integration
- Custom speed field logic (preset vs custom)
- Zod schema validation
- File upload capability
- Public/private toggle
- Rich form validation

**Array Fields**:

- `attacks[]` - Dynamic attack list with add/remove
- `abilities[]` - Dynamic ability list with add/remove

**Form Fields**:

- Basic: name, challenge_level, hit_points, armor_class
- Speed: dropdown + custom field
- Arrays: attacks (5 fields each), abilities (2 fields each)
- Treasure: object field
- Tags: nested object {type: [], location: []}
- Meta: source, author_notes, icon_url, is_public

### 2. MonsterForm.tsx (418 lines) - MEDIUM PRIORITY

**Location**: `/src/components/monsters/MonsterForm.tsx`
**Complexity**: HIGH
**Current Dependencies**:

- `@mantine/form` - useForm hook
- `@mantine/notifications` - notifications.show()
- `@tabler/icons-react` - 2 icons
- Modal component
- Similar field structure to MonsterCreateEditForm

**Key Features**:

- Modal-based form
- Simpler than MonsterCreateEditForm (no icon selector, no file upload)
- Array field management (attacks, abilities)
- Inline validation
- Modal open/close state management

**Overlap**: This component has significant overlap with MonsterCreateEditForm. May consider consolidating or reusing logic.

---

## Migration Strategy

### Approach: Sequential Migration

**Order**:

1. Install required packages
2. Install shadcn Form components
3. Migrate MonsterCreateEditForm (most complex)
4. Migrate MonsterForm (can reuse patterns from step 3)
5. Verify builds and test forms
6. Commit Phase 4

**Rationale**: MonsterCreateEditForm is the most complex. Solving it first establishes patterns that simplify MonsterForm migration.

---

## Package Dependencies

### Already Installed ✅

- `react-hook-form` - Already in package.json
- `@hookform/resolvers` - Already in package.json
- `zod` - Already in package.json
- `sonner` - Already installed (Phase 0)

### To Install

- None! All packages are already available.

### shadcn Components Needed

- [x] `form` - Already exists in `/components/ui/form.tsx`
- [x] `input` - Already installed (Phase 0)
- [x] `textarea` - Already installed (Phase 0)
- [x] `select` - Already installed (Phase 0)
- [x] `switch` - Already installed (Phase 0)
- [x] `dialog` - Already installed (Phase 1)
- [x] `separator` - Already installed (Phase 0)
- [x] `multi-select` - Created in Phase 2

**Result**: All components already available! No installation needed.

---

## Component Replacement Mapping

### Mantine → shadcn/ui + RHF

| Mantine Component              | shadcn/ui Component                  | React Hook Form Integration         |
| ------------------------------ | ------------------------------------ | ----------------------------------- |
| `useForm` from `@mantine/form` | `useForm` from `react-hook-form`     | Direct replacement with zodResolver |
| `form.getInputProps()`         | `register()` or `<Controller>`       | Field registration                  |
| `form.insertListItem()`        | `useFieldArray().append()`           | Array field append                  |
| `form.removeListItem()`        | `useFieldArray().remove()`           | Array field remove                  |
| `form.values`                  | `watch()` or `getValues()`           | Form value access                   |
| `form.onSubmit()`              | `handleSubmit()`                     | Form submission                     |
| `form.setFieldValue()`         | `setValue()`                         | Programmatic value setting          |
| `Modal`                        | `Dialog` + `DialogContent`           | Modal wrapper                       |
| `TextInput`                    | `Input` with `<FormField>`           | Form field wrapper                  |
| `NumberInput`                  | `Input type="number"`                | Number input                        |
| `Textarea`                     | `Textarea`                           | Direct replacement                  |
| `Select`                       | `Select` + `SelectContent`           | Dropdown                            |
| `MultiSelect`                  | `MultiSelect` (custom)               | Multi-select                        |
| `Switch`                       | `Switch`                             | Toggle                              |
| `ActionIcon`                   | `Button size="icon" variant="ghost"` | Icon button                         |
| `Paper`                        | `Card`                               | Container                           |
| `Stack`                        | `<div className="space-y-4">`        | Vertical stack                      |
| `Group`                        | `<div className="flex gap-2">`       | Horizontal group                    |
| `Grid`                         | Tailwind grid utilities              | Grid layout                         |
| `SimpleGrid`                   | Tailwind grid utilities              | Responsive grid                     |
| `Divider`                      | `Separator`                          | Divider line                        |
| `notifications.show()`         | `toast()` from `sonner`              | Notifications                       |

---

## Migration Patterns

### Pattern 1: Basic Form Setup

**Before (Mantine)**:

```typescript
import { useForm } from "@mantine/form";
import { z } from "zod";

const form = useForm({
  initialValues: { name: "" },
  validate: (values) => {
    try {
      schema.parse(values);
      return {};
    } catch (error) {
      // Convert Zod errors to Mantine format
      return {};
    }
  },
});
```

**After (React Hook Form)**:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "" },
});
```

### Pattern 2: Field Registration

**Before (Mantine)**:

```tsx
<TextInput
  label="Name"
  placeholder="Enter name"
  required
  {...form.getInputProps("name")}
/>
```

**After (React Hook Form + shadcn)**:

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Pattern 3: Array Fields

**Before (Mantine)**:

```typescript
const addAttack = () => {
  form.insertListItem("attacks", {
    name: "",
    type: "melee",
    damage: "",
  });
};

const removeAttack = (index: number) => {
  form.removeListItem("attacks", index);
};

// Rendering
{form.values.attacks.map((attack, index) => (
  <TextInput {...form.getInputProps(`attacks.${index}.name`)} />
))}
```

**After (React Hook Form)**:

```typescript
import { useFieldArray } from "react-hook-form";

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "attacks",
});

const addAttack = () => {
  append({
    name: "",
    type: "melee",
    damage: "",
  });
};

// Rendering
{fields.map((field, index) => (
  <FormField
    key={field.id}
    control={form.control}
    name={`attacks.${index}.name`}
    render={({ field }) => (
      <FormItem>
        <FormControl>
          <Input {...field} />
        </FormControl>
      </FormItem>
    )}
  />
))}
```

### Pattern 4: Form Submission

**Before (Mantine)**:

```tsx
<form onSubmit={form.onSubmit(handleSubmit)}>
```

**After (React Hook Form)**:

```tsx
<form onSubmit={form.handleSubmit(handleSubmit)}>
```

### Pattern 5: Notifications

**Before (Mantine)**:

```typescript
import { notifications } from "@mantine/notifications";

notifications.show({
  title: "Success",
  message: "Monster created successfully!",
  color: "green",
  icon: <IconCheck />,
});
```

**After (Sonner)**:

```typescript
import { toast } from "sonner";

toast.success("Monster created successfully!");
```

### Pattern 6: Modal/Dialog

**Before (Mantine)**:

```tsx
<Modal opened={opened} onClose={onClose} title="Create Monster" size="lg">
  {/* form content */}
</Modal>
```

**After (shadcn)**:

```tsx
<Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Create Monster</DialogTitle>
    </DialogHeader>
    {/* form content */}
  </DialogContent>
</Dialog>
```

---

## Icon Migration

### Tabler → Lucide

| Tabler Icon     | Lucide Icon    | Usage                 |
| --------------- | -------------- | --------------------- |
| IconPlus        | Plus           | Add attack/ability    |
| IconTrash       | Trash2         | Remove attack/ability |
| IconAlertCircle | AlertCircle    | Error display         |
| IconCheck       | Check          | Success notification  |
| IconSelector    | ChevronsUpDown | Select dropdown       |

---

## Validation Migration

### Mantine Custom Validation → Zod Resolver

**Before**: Custom validation function in `validate` config
**After**: Pure Zod schema with `zodResolver`

**Benefit**:

- Single source of truth for validation
- Type inference from schema
- No manual error conversion
- Better error messages

**Example**:

```typescript
// Before: lib/validations/monster.ts already exists with Zod schema
export const createMonsterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  challenge_level: z.number().int().min(1).max(20),
  // ... more fields
});

// After: Use directly with zodResolver
const form = useForm({
  resolver: zodResolver(createMonsterSchema),
  defaultValues: {
    /* ... */
  },
});
```

---

## Breaking Changes to Monitor

### 1. Field API Changes

**Impact**: All field bindings change from `{...form.getInputProps()}` to `<FormField>` wrappers

**Mitigation**: Systematic replacement, no shortcuts

### 2. Array Field Management

**Impact**: Different API for adding/removing array items

**Mitigation**: Use `useFieldArray` hook pattern established above

### 3. Form State Access

**Impact**: `form.values` → `watch()` or `getValues()`

**Mitigation**: Replace all `form.values` references

### 4. Validation Timing

**Impact**: React Hook Form validates differently (onBlur, onChange, onSubmit modes)

**Mitigation**: Use default mode first, adjust if needed

### 5. TypeScript Types

**Impact**: Form types from Mantine → RHF types

**Mitigation**: Let TypeScript guide you, fix incrementally

---

## Testing Strategy

### Unit Testing (Optional - Future)

- Test form validation with invalid data
- Test array field add/remove
- Test form submission

### Manual Testing (Required)

**MonsterCreateEditForm**:

- [ ] Create new monster (all fields)
- [ ] Edit existing monster
- [ ] Add/remove attacks (test array fields)
- [ ] Add/remove abilities (test array fields)
- [ ] Custom speed toggle
- [ ] Icon upload
- [ ] Form validation (trigger all error cases)
- [ ] Submit and verify API call
- [ ] Cancel and verify no submission
- [ ] Public/private toggle

**MonsterForm**:

- [ ] Open modal
- [ ] Fill form
- [ ] Add/remove attacks
- [ ] Add/remove abilities
- [ ] Submit form
- [ ] Cancel form
- [ ] Form validation

---

## Rollback Plan

**If migration fails**:

1. Each form is a separate file - easy to rollback individually
2. Git commits isolate changes
3. Can keep Mantine form packages temporarily
4. Forms are not blocking - rest of app works

**Backup Strategy**:

- Commit after each form migration
- Test thoroughly before moving to next form

---

## Success Criteria

✅ **All forms migrated**:

- MonsterCreateEditForm uses React Hook Form
- MonsterForm uses React Hook Form

✅ **All Mantine form dependencies removed**:

- No `@mantine/form` imports
- No `@mantine/notifications` imports
- No Mantine form components

✅ **Build passes**:

- TypeScript compilation successful
- No ESLint errors
- All 22 pages generate

✅ **Functionality preserved**:

- Forms validate correctly
- Forms submit correctly
- Array fields work (add/remove)
- Error messages display properly
- Success notifications work

✅ **UI/UX maintained**:

- Forms look consistent with design
- Responsive layout preserved
- Loading states work
- Keyboard navigation works

---

## Next Steps After Phase 4

**Phase 5: Final Cleanup**

- Remove `@mantine/core` from package.json
- Remove `@mantine/hooks` from package.json
- Remove `@mantine/notifications` from package.json
- Remove `@tabler/icons-react` from package.json
- Remove MantineProvider from app/layout.tsx
- Bundle size analysis
- Performance benchmarking

---

## Estimated Timeline

| Task                          | Estimated Time | Complexity |
| ----------------------------- | -------------- | ---------- |
| Install dependencies (if any) | 5 min          | Low        |
| Migrate MonsterCreateEditForm | 3-4 hours      | Very High  |
| Test MonsterCreateEditForm    | 1 hour         | Medium     |
| Migrate MonsterForm           | 2-3 hours      | High       |
| Test MonsterForm              | 1 hour         | Medium     |
| Build verification            | 30 min         | Low        |
| Documentation                 | 1 hour         | Low        |
| **Total**                     | **8-11 hours** | **High**   |

**Recommended**: Break into 2 sessions (MonsterCreateEditForm first, MonsterForm second)

---

**Created**: October 17, 2025
**Status**: Ready to Execute
**Prerequisites**: Phase 0-3 Complete ✅
