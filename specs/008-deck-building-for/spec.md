# Feature Specification: Spell Card Deck Builder

**Feature Branch**: `008-deck-building-for`
**Created**: 2025-11-04
**Status**: Complete - Ready for Planning
**Input**: User description: "deck building for spell cards with pdf export"

## Execution Flow (main)

```
1. Parse user description from Input
   � Feature identified: Spell card deck builder with PDF export
2. Extract key concepts from description
   � Actors: Authenticated users, Game Masters
   � Actions: Create decks, name decks, add spells, export PDFs, manage decks
   � Data: Decks, spell selections, card layouts
   � Constraints: 52 cards max, 2.5x3.5" card size, specific layouts
3. For each unclear aspect:
   � Marked with [NEEDS CLARIFICATION]
4. Fill User Scenarios & Testing section
   � Primary flow: Create deck � Add spells � Export PDF � Reuse/delete deck
5. Generate Functional Requirements
   � All requirements testable and measurable
6. Identify Key Entities
   � Deck, Deck Items, Card Templates
7. Run Review Checklist
   � Spec ready for planning phase
8. Return: SUCCESS (spec ready for planning)
```

---

## � Quick Guidelines

-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story

As a Game Master running Shadowdark campaigns, I want to create custom spell card decks that I can print at home, so that I can have physical reference cards during gameplay without purchasing pre-made decks. I should be able to select specific spells I use frequently, save these selections as named decks, and export them as printable PDFs sized for standard card sleeves (2.5" x 3.5").

### Acceptance Scenarios

1. **Given** I'm logged in and viewing the dashboard, **When** I navigate to the deck builder feature, **Then** I see a list of my saved decks and an option to create a new deck

2. **Given** I'm creating a new deck, **When** I provide a deck name and start adding spells, **Then** the system tracks my selections and shows a running count of cards in the deck

3. **Given** I've added spells to my deck, **When** I choose to export as PDF with "9 cards per page" layout, **Then** I receive a multi-page PDF with exactly 9 cards per 8.5x11" page in a 3x3 grid

4. **Given** I've added spells to my deck, **When** I choose to export as PDF with "one card per page" layout, **Then** I receive a multi-page PDF where each page is 2.5x3.5" (one card per page)

5. **Given** I have an existing saved deck, **When** I return to the deck builder, **Then** I can view, edit, re-export, or delete that deck

6. **Given** I'm adding spells to a deck that already has 52 cards, **When** I try to add another spell, **Then** the system prevents me and displays a message indicating the deck is at maximum capacity

7. **Given** I'm viewing a deck I created, **When** I export it as a PDF, **Then** each card displays the spell's name, level, duration, range, and full description

### Edge Cases

- What happens when a user tries to create a deck without providing a name? System must require a deck name before saving.
- How does the system handle spells that have very long descriptions that might overflow card space? Text wraps to fit card dimensions.
- What happens if a spell that's in a saved deck gets deleted from the database? Spell is removed from the deck automatically.
- Can users add the same spell multiple times to a deck? No, system enforces unique spells per deck.
- What happens when a user navigates away mid-deck-creation without saving? System auto-saves draft decks so users can resume later.
- Can users share or duplicate existing decks? Not in MVP scope.

## Requirements

### Functional Requirements

**Deck Management**

- **FR-001**: System MUST allow authenticated users to create new spell card decks
- **FR-002**: System MUST require users to provide a name for each deck before saving
- **FR-003**: System MUST allow users to save decks for future access
- **FR-004**: System MUST allow users to view a list of all their saved decks
- **FR-005**: System MUST allow users to delete decks they own
- **FR-006**: System MUST allow users to edit existing decks (add/remove cards)
- **FR-007**: System MUST display the deck builder feature accessible from the user dashboard

**Spell Selection**

- **FR-008**: System MUST provide a spell selection interface within the deck builder page
- **FR-009**: System MUST allow users to add spells to their deck from available spells
- **FR-010**: System MUST enforce a maximum limit of 52 cards per deck
- **FR-011**: System MUST display a real-time count of cards currently in the deck
- **FR-012**: System MUST prevent adding more than 52 cards to a deck
- **FR-013**: System MUST enforce unique spells per deck (no duplicate spells allowed)

**Card Display**

- **FR-014**: System MUST display spell cards showing: spell name, level, duration, range, and full description
- **FR-015**: System MUST render cards at exactly 2.5 inches by 3.5 inches dimensions
- **FR-016**: System MUST display cards as single-sided for MVP
- **FR-017**: System MUST wrap spell descriptions to fit within card dimensions when text is too long

**PDF Export**

- **FR-018**: System MUST provide two export layout options: "9 cards per page" and "one card per page"
- **FR-019**: System MUST generate multi-page PDFs when "9 cards per page" layout is selected, displaying cards in a 3x3 grid on 8.5x11" pages
- **FR-020**: System MUST generate multi-page PDFs when "one card per page" layout is selected, with each page sized at 2.5x3.5"
- **FR-021**: System MUST maintain card dimensions at exactly 2.5" x 3.5" regardless of layout option
- **FR-022**: System MUST generate PDFs that are print-ready for home printing
- **FR-023**: System MUST allow users to export the same deck multiple times

**Data Persistence**

- **FR-024**: System MUST associate each deck with the user who created it
- **FR-025**: System MUST persist deck configurations (name, spell selections) for future access
- **FR-026**: System MUST automatically remove deleted spells from any decks that contain them
- **FR-027**: System MUST auto-save deck drafts so users can resume work after navigating away

**Future Extensibility**

- **FR-028**: System design SHOULD accommodate adding monster cards in a future version
- **FR-029**: System SHOULD NOT include card reordering functionality in MVP

### Key Entities

- **Deck**: A named collection of spell cards owned by a user. Contains a name, creation date, last modified date, owner reference, and a maximum of 52 card items.

- **Deck Item**: A reference to a specific spell included in a deck. Links a deck to a spell with the ability to store position/order for future features.

- **Card Template**: The visual and content layout definition for a spell card. Defines what spell attributes appear on a card and their general arrangement (exact styling is implementation).

- **Spell**: Existing entity from spell management feature. Contains spell name, level, duration, range, description, and other Shadowdark spell attributes.

---

## Review & Acceptance Checklist

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Outstanding Questions

1. ~~**Deck naming**: Should system require deck names, auto-generate them, or allow unnamed decks?~~ **RESOLVED**: Require name.
2. ~~**Duplicate spells**: Can users add the same spell multiple times to a deck, or enforce unique spells?~~ **RESOLVED**: No duplicates.
3. ~~**Long descriptions**: How should spell descriptions that exceed card space be handled?~~ **RESOLVED**: Wrap text.
4. ~~**Spell deletion**: What happens to decks containing deleted spells?~~ **RESOLVED**: Remove from deck.
5. ~~**PDF Library**: Which library for PDF generation?~~ **RESOLVED**: @react-pdf/renderer (supports precise inch dimensions, JSX components, text wrapping, flexbox layout).
6. ~~**Auto-save behavior**: Should system auto-save draft decks or lose unsaved work when user navigates away?~~ **RESOLVED**: Auto-save drafts.
