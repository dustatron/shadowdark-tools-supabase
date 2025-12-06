# Adventure Lists UI Components

## Overview

This document outlines the UI components needed for the Adventure Lists feature. These components will allow users to create, view, edit, and manage their adventure lists.

## Component Hierarchy

```
AdventureListsPage
├── AdventureListsHeader
├── AdventureListsFilters
└── AdventureListGrid
    └── AdventureListCard

AdventureListDetailPage
├── AdventureListHeader
├── AdventureListInfo
└── AdventureListItems
    ├── MonsterItemsSection
    │   └── MonsterListItem
    ├── SpellItemsSection
    │   └── SpellListItem
    └── MagicItemsSection
        └── MagicItemListItem

AdventureListFormPage
├── AdventureListForm
└── ItemSelector
    ├── MonsterSelector
    ├── SpellSelector
    └── MagicItemSelector
```

## Component Specifications

### AdventureListCard

A card component that displays a preview of an adventure list.

**Props:**

```typescript
interface AdventureListCardProps {
  list: AdventureList;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Design:**

- Card with hover effect
- Image at the top (if provided, otherwise a default placeholder)
- Title
- Description (truncated to 2-3 lines with ellipsis)
- Item counts (e.g., "5 monsters, 3 spells, 2 magic items")
- Public/private indicator
- Edit/delete buttons (if owner)

**Example:**

```jsx
<AdventureListCard
  list={{
    id: "123",
    title: "Dungeon of Doom",
    description: "A terrifying dungeon filled with deadly traps and monsters.",
    image_url: "https://example.com/dungeon.jpg",
    is_public: true,
    item_counts: {
      monsters: 5,
      spells: 3,
      magic_items: 2,
      total: 10,
    },
  }}
  onEdit={() => navigate(`/adventure-lists/${list.id}/edit`)}
  onDelete={() => handleDelete(list.id)}
/>
```

### AdventureListDetail

A component that displays the full details of an adventure list.

**Props:**

```typescript
interface AdventureListDetailProps {
  list: AdventureList;
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
  };
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddItem?: (itemType: string) => void;
  onRemoveItem?: (itemId: string) => void;
}
```

**Design:**

- Header with title, public/private status, and edit/delete buttons (if owner)
- Image (if provided)
- Description and notes in expandable sections
- Tabs for different item types (Monsters, Spells, Magic Items)
- List of items in each tab with relevant details
- Add/remove item buttons (if owner)

**Example:**

```jsx
<AdventureListDetail
  list={list}
  items={items}
  isOwner={isOwner}
  onEdit={() => navigate(`/adventure-lists/${list.id}/edit`)}
  onDelete={() => handleDelete(list.id)}
  onAddItem={(itemType) => setAddingItemType(itemType)}
  onRemoveItem={(itemId) => handleRemoveItem(itemId)}
/>
```

### AdventureListForm

A form component for creating or editing adventure lists.

**Props:**

```typescript
interface AdventureListFormProps {
  initialValues?: Partial<AdventureList>;
  onSubmit: (values: Partial<AdventureList>) => Promise<void>;
  onCancel: () => void;
}
```

**Design:**

- Form with fields for:
  - Title (required)
  - Description (optional)
  - Notes (optional)
  - Image URL (optional)
  - Public/private toggle
- Validation for required fields
- Submit and cancel buttons

**Example:**

```jsx
<AdventureListForm
  initialValues={list}
  onSubmit={handleSubmit}
  onCancel={() => navigate("/adventure-lists")}
/>
```

### ItemSelector

A component for searching and selecting items to add to a list.

**Props:**

```typescript
interface ItemSelectorProps {
  itemType: "monster" | "spell" | "magic_item";
  onSelect: (item: { id: string; name: string; type: string }) => void;
  onCancel: () => void;
}
```

**Design:**

- Search input
- Filters relevant to the item type
- List of items matching the search/filters
- Item cards with basic information
- Select button for each item

**Example:**

```jsx
<ItemSelector
  itemType="monster"
  onSelect={handleSelectItem}
  onCancel={() => setAddingItemType(null)}
/>
```

### MonsterListItem / SpellListItem / MagicItemListItem

Components for displaying items in an adventure list.

**Props:**

```typescript
interface ListItemProps {
  item: AdventureListItem;
  onRemove?: () => void;
  onUpdateQuantity?: (quantity: number) => void;
  onUpdateNotes?: (notes: string) => void;
}
```

**Design:**

- Card with item name and key details
- Quantity control (if editable)
- Notes field (if editable)
- Remove button (if editable)

**Example:**

```jsx
<MonsterListItem
  item={monster}
  onRemove={() => handleRemoveItem(monster.id)}
  onUpdateQuantity={(quantity) => handleUpdateQuantity(monster.id, quantity)}
  onUpdateNotes={(notes) => handleUpdateNotes(monster.id, notes)}
/>
```

## Page Layouts

### Adventure Lists Page

The main page for viewing all adventure lists.

**Layout:**

- Header with title and "Create New List" button
- Filters for searching and sorting lists
- Grid of AdventureListCard components
- Pagination controls

### Adventure List Detail Page

Page for viewing a specific adventure list.

**Layout:**

- Breadcrumb navigation
- AdventureListDetail component
- Modal for ItemSelector when adding items

### Adventure List Form Page

Page for creating or editing an adventure list.

**Layout:**

- Breadcrumb navigation
- AdventureListForm component

## Responsive Design

All components should be responsive and work well on different screen sizes:

- **Desktop:** Grid layout with 3-4 cards per row
- **Tablet:** Grid layout with 2 cards per row
- **Mobile:** Single column layout

## Accessibility Considerations

- All form inputs should have proper labels
- Images should have alt text
- Interactive elements should be keyboard accessible
- Color contrast should meet WCAG standards
- Screen reader support for important UI elements

## State Management

The UI will use React's Context API or a state management library to manage:

- Current user's lists
- Public lists
- Selected list details
- Form state
- UI state (loading, errors, etc.)

## Styling

The components will use the application's existing design system and styling approach, with:

- Consistent typography
- Consistent spacing
- Consistent color palette
- Reusable UI components (buttons, inputs, cards, etc.)

## Mockups

### AdventureListCard

```
┌────────────────────────────┐
│         [IMAGE]            │
├────────────────────────────┤
│ Dungeon of Doom            │
│                            │
│ A terrifying dungeon filled│
│ with deadly traps and...   │
│                            │
│ 5 monsters, 3 spells,      │
│ 2 magic items              │
│                            │
│ 🔒 Private                 │
│                            │
│ [Edit] [Delete]            │
└────────────────────────────┘
```

### AdventureListDetail

```
┌────────────────────────────────────────────────────┐
│ Dungeon of Doom                   [Edit] [Delete]  │
│ 🔓 Public                                          │
├────────────────────────────────────────────────────┤
│                                                    │
│                    [IMAGE]                         │
│                                                    │
├────────────────────────────────────────────────────┤
│ Description                                        │
│ A terrifying dungeon filled with deadly traps and  │
│ monsters. Perfect for a level 5 party looking for  │
│ a challenge.                                       │
├────────────────────────────────────────────────────┤
│ Notes                                              │
│ Remember to emphasize the creepy atmosphere and    │
│ play spooky music during the boss encounter.       │
├────────────────────────────────────────────────────┤
│ [Monsters] [Spells] [Magic Items]                  │
├────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │ Skeleton                                 x3  │   │
│ │ CL 1, HP 5, AC 13                           │   │
│ │ Notes: Guard the entrance                    │   │
│ │ [Remove]                                     │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ Zombie                                   x2  │   │
│ │ CL 2, HP 10, AC 12                          │   │
│ │ Notes: In the crypt                          │   │
│ │ [Remove]                                     │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ [+ Add Monster]                                    │
└────────────────────────────────────────────────────┘
```

### AdventureListForm

```
┌────────────────────────────────────────────────────┐
│ Create Adventure List                              │
├────────────────────────────────────────────────────┤
│                                                    │
│ Title*                                             │
│ ┌──────────────────────────────────────────────┐   │
│ │ Dungeon of Doom                              │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ Description                                        │
│ ┌──────────────────────────────────────────────┐   │
│ │ A terrifying dungeon filled with deadly      │   │
│ │ traps and monsters.                          │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ Notes                                              │
│ ┌──────────────────────────────────────────────┐   │
│ │ Remember to emphasize the creepy atmosphere   │   │
│ │ and play spooky music during the boss        │   │
│ │ encounter.                                   │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ Image URL                                          │
│ ┌──────────────────────────────────────────────┐   │
│ │ https://example.com/dungeon.jpg              │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ ☐ Make this list public                            │
│                                                    │
│ [Cancel]                           [Save List]     │
└────────────────────────────────────────────────────┘
```

### ItemSelector

```
┌────────────────────────────────────────────────────┐
│ Add Monster                                [Close] │
├────────────────────────────────────────────────────┤
│                                                    │
│ Search                                             │
│ ┌──────────────────────────────────────────────┐   │
│ │ skeleton                                     │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ Filters                                            │
│ Challenge Level: [1-5] Source: [Official]          │
│                                                    │
├────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │ Skeleton                                     │   │
│ │ CL 1, HP 5, AC 13                           │   │
│ │ Source: Shadowdark Core                      │   │
│ │ [Add to List]                                │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
│ ┌──────────────────────────────────────────────┐   │
│ │ Skeletal Champion                            │   │
│ │ CL 3, HP 15, AC 15                          │   │
│ │ Source: Shadowdark Core                      │   │
│ │ [Add to List]                                │   │
│ └──────────────────────────────────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
```
