# Monster Ability Score Modifiers - Quick Start

## What

Display 6 ability score modifiers (STR, DEX, CON, INT, WIS, CHA) on monster detail pages.

## Why

GMs need quick reference to monster capabilities during gameplay.

## Key Points

- **Modifiers only** - not raw ability scores (10-20)
- Values: -5 to +5, default +0
- **Detail pages only** - not list cards
- Populate existing official monsters
- Grid: 3 cols mobile, 6 cols desktop

## Implementation

1. Add 6 INT columns to `official_monsters` & `user_monsters`
2. Populate official monsters w/ appropriate values
3. Create `AbilityScoresCard` component
4. Update detail page to display card
5. Update types & validation
6. (Optional) Add to create/edit forms

## Estimate

1.5-2 hours total

## Files

- 2 migrations
- 1 new component
- 3-5 file updates

## Testing

- Display on detail pages
- Format: +2, -1, +0
- Responsive grid
- Validation: -5 to +5
- Defaults work
