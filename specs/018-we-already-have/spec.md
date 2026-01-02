# Feature Specification: Magic Item Cards in Decks

**Feature Branch**: `018-we-already-have`
**Created**: 2026-01-02
**Status**: Draft
**Input**: User description: "We already have a deck that supports spell cards but I want to expand it to support magic item cards and make a magic item card. so a user can add a magic item card to a deck."

---

## Quick Guidelines

- Focus on WHAT users need and WHY
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Written for business stakeholders, not developers

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a GM, I want to add magic items to my card deck alongside spells so I can print physical reference cards for magical equipment my players find during adventures.

### Acceptance Scenarios

1. **Given** a user is viewing their deck detail page, **When** they click "Add Cards" or similar action, **Then** they can choose to add either spells OR magic items
2. **Given** a user is adding items to their deck, **When** they search for magic items, **Then** they see results from official and their custom magic items
3. **Given** a user has magic items in their deck, **When** they view the deck detail page, **Then** magic items appear in the card list with appropriate visual distinction from spells
4. **Given** a user selects a magic item in their deck, **When** they view the preview, **Then** they see a printable magic item card with name, description, traits, and image
5. **Given** a user has a mixed deck (spells + magic items), **When** they export to PDF, **Then** both card types render correctly in the chosen layout

### Edge Cases

- What happens when deck reaches 52 card limit with mixed card types? (Same behavior as spells-only - reject additional cards)
- How does system handle magic items without images? (Show placeholder icon)
- Can a deck contain duplicate magic items? (Yes - same as spells)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to add official magic items to their decks
- **FR-002**: System MUST allow users to add their custom magic items to their decks
- **FR-003**: System MUST display magic items in deck detail view distinguishable from spells
- **FR-004**: System MUST provide a magic item card preview showing: name, description, traits, and image
- **FR-005**: System MUST include magic items when exporting deck to PDF
- **FR-006**: System MUST enforce the existing 52-card limit across both card types combined
- **FR-007**: System MUST allow users to remove magic items from decks
- **FR-008**: System MUST provide a selector/search interface for browsing available magic items
- **FR-009**: System MUST track deck item count inclusive of both spells and magic items

### Key Entities _(include if feature involves data)_

- **Deck**: User-owned collection of printable cards (spells and/or magic items), max 52 cards total
- **Deck Item**: Junction entry linking deck to either a spell or magic item, with position and timestamp
- **Magic Item**: Game content entity with name, description, traits array, optional image (exists in official_magic_items and user_magic_items tables)
- **Magic Item Card**: Visual representation of a magic item formatted for printing (2.5" x 3.5" standard card size)

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
