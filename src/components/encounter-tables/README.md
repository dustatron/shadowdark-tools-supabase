# Encounter Tables Components

Core React components for the Random Encounter Tables feature, built with shadcn/ui, React Hook Form, and Zod validation.

## Components

### EncounterTableForm

Form component for creating or editing encounter tables with comprehensive filtering options.

**Features:**

- Table name and description
- Die size selection (standard d4/d6/d8/d10/d12/d20/d100 or custom 2-1000)
- Monster source filters (official, user, public)
- Challenge level range slider (1-20)
- Alignment filters (optional)
- Movement type filters (optional)
- Search query filter (optional)
- Generate immediately checkbox
- Full validation with Zod schema

**Props:**

- `onSubmit`: Async callback for form submission
- `onCancel?`: Optional callback for cancel button
- `initialData?`: Partial form data for editing
- `isEdit?`: Boolean - edit mode vs create mode

**Reused Components:**

- shadcn/ui Form, Input, Textarea, Select, Checkbox, Slider, Button, Label

---

### TableCard

Card component for displaying encounter table summary in lists/grids.

**Features:**

- Table name and description
- Public/Private badge indicator
- Die size badge with icon (e.g., "d20" or "d37 (custom)")
- Entry count progress badge (shows "20/20 entries ✓" when complete)
- Filter summary badges
- Action dropdown menu (View, Edit, Share, Delete)
- Primary Roll button (disabled until complete)
- Responsive design with mobile optimization

**Props:**

- `table`: EncounterTable object
- `onView?`: Callback when View button clicked
- `onEdit?`: Callback when Edit button clicked
- `onDelete?`: Callback when Delete button clicked
- `onShare?`: Callback when Share button clicked
- `onRoll?`: Callback when Roll button clicked
- `isLoading?`: Boolean - loading state

**Reused Components:**

- shadcn/ui Card, Button, Badge, DropdownMenu
- Lucide icons: Eye, Pencil, Trash2, Share2, Globe, Lock, MoreVertical, Dices

---

### DiceRoller

Animated dice rolling button with visual feedback.

**Features:**

- Smooth rolling animation (~1 second duration)
- Random number cycling during animation
- Disabled state during animation
- Accessible (keyboard navigation, ARIA labels)
- Customizable variant and size
- Returns result via callback

**Props:**

- `dieSize`: Number - die size to roll
- `onRoll`: Callback with roll result
- `disabled?`: Boolean - disable button
- `variant?`: Button variant ("default" | "outline" | "secondary" | etc.)
- `size?`: Button size ("default" | "sm" | "lg" | "icon")
- `className?`: Additional CSS classes

**Animation States:**

- Idle: "Roll d20"
- Rolling: "Rolling 14..." (shows random numbers)
- Complete: "Rolled 17!" (shows final result)

**Reused Components:**

- shadcn/ui Button
- Lucide icon: Dices

---

### DiceRollerResult

Display-only variant of DiceRoller for showing roll results without button chrome.

**Features:**

- Auto-roll on mount (optional)
- Large result display
- Same animation as DiceRoller
- Useful for modal/dialog displays

**Props:**

- `dieSize`: Number - die size to roll
- `onRoll`: Callback with roll result
- `autoRoll?`: Boolean - auto-roll on mount
- `className?`: Additional CSS classes

---

## Form & Display Components

### TableEntryList

Displays a list of encounter table entries with roll numbers and monster summaries.

**Features:**

- Responsive grid layout
- Highlighted entries (for roll results)
- Click to view details
- Edit button per entry (owner only)
- Empty state handling

**Props:**

- `entries`: Array of EncounterTableEntry
- `highlightedRoll?`: Roll number to highlight
- `onEntryClick?`: Callback when entry is clicked
- `onEditEntry?`: Callback when edit button is clicked (presence enables edit buttons)
- `className?`: Additional CSS classes

**Reused Components:**

- shadcn/ui Card, Button, Badge

---

### MonsterDetailPanel

Full monster stat block display in responsive modal/drawer.

**Features:**

- Desktop: Modal dialog
- Mobile: Bottom sheet drawer
- Full stat block display (all monster fields)
- Favorite toggle button
- Reuses existing monster display components

**Props:**

- `monster`: MonsterSnapshot | null
- `open`: Boolean - dialog open state
- `onOpenChange`: Callback to change open state
- `onToggleFavorite?`: Callback for favorite button
- `isFavorited?`: Boolean - favorite state

**Reused Components:**

- `MonsterAttacksDisplay` from `/src/components/monsters/`
- `MonsterAbilitiesDisplay` from `/src/components/monsters/`
- shadcn/ui Sheet, Dialog, Card, Badge, Separator, Button

---

### ShareDialog

Public sharing dialog for encounter tables.

**Features:**

- Toggle public/private
- Display shareable URL when public
- Copy to clipboard with feedback
- Warning when making private
- Loading state handling
- Toast notifications

**Props:**

- `open`: Boolean - dialog open state
- `onOpenChange`: Callback to change open state
- `isPublic`: Boolean - current public state
- `publicSlug`: String | null - unique slug for URL
- `onTogglePublic`: Async callback to toggle public state
- `isLoading?`: Boolean - loading state

**Reused Components:**

- shadcn/ui Dialog, Switch, Button, Label, Alert
- Sonner toast (via `toast` function)

---

## Type Conversions

**MonsterDetailPanel** includes utility functions to convert encounter types to monster display types:

- `convertAttack()`: EncounterAttack → MonsterAttack
- `convertAbility()`: EncounterAbility → MonsterAbility

This ensures compatibility with existing monster display components.

---

## Usage Example

```tsx
import {
  TableEntryList,
  MonsterDetailPanel,
  ShareDialog,
} from "@/src/components/encounter-tables";

function EncounterTablePage() {
  const [selectedMonster, setSelectedMonster] =
    useState<MonsterSnapshot | null>(null);
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <TableEntryList
        entries={entries}
        highlightedRoll={lastRoll}
        onEntryClick={(entry) => setSelectedMonster(entry.monster_snapshot)}
        onEditEntry={canEdit ? handleEdit : undefined}
      />

      <MonsterDetailPanel
        monster={selectedMonster}
        open={!!selectedMonster}
        onOpenChange={(open) => !open && setSelectedMonster(null)}
        onToggleFavorite={handleFavorite}
        isFavorited={favorites.includes(selectedMonster?.id)}
      />

      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        isPublic={table.is_public}
        publicSlug={table.public_slug}
        onTogglePublic={handleTogglePublic}
      />
    </>
  );
}
```
