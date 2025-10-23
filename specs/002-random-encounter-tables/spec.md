# Feature Specification: Random Encounter Tables

**Feature Branch**: `002-random-encounter-tables`
**Created**: 2025-10-22
**Status**: Draft
**Input**: User description: "Random Encounter Tables - Create, manage, and roll on random encounter tables with monster filtering, public sharing, and animated dice rolling"

## Execution Flow (main)

```
1. Parse user description from Input
   ’ Parsed: Random encounter table creation, management, rolling, filtering, sharing
2. Extract key concepts from description
   ’ Actors: Game Masters (authenticated users), Public viewers (unauthenticated/authenticated)
   ’ Actions: Create tables, filter monsters, roll dice, view results, share publicly, copy tables
   ’ Data: Encounter tables, table entries, monsters, dice rolls, filters
   ’ Constraints: User ownership, public sharing permissions, unique monster selection
3. For each unclear aspect:
   ’ All aspects clarified through user questions
4. Fill User Scenarios & Testing section
   ’ Complete - see below
5. Generate Functional Requirements
   ’ Complete - 35 testable requirements generated
6. Identify Key Entities
   ’ Complete - 4 entities identified
7. Run Review Checklist
   ’ All clarifications resolved
   ’ No implementation details included
8. Return: SUCCESS (spec ready for planning)
```

---

## ¡ Quick Guidelines

-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing

### Primary User Story

As a Shadowdark Game Master, I want to create random encounter tables by selecting from official monsters, my custom monsters, and community-shared monsters, so that I can quickly generate interesting and varied encounters for my game sessions. I need to configure the table with different dice sizes (d4 through d100 or custom), apply filters to get appropriate monsters for my setting, and roll on the table during gameplay to get instant monster details. I also want to share my best tables with other GMs and use tables created by the community.

### Acceptance Scenarios

1. **Given** I am a logged-in GM with no encounter tables, **When** I navigate to the encounter tables section, **Then** I see an empty state with a "Create New Table" button

2. **Given** I click "Create New Table", **When** I fill in table name, description, select d20 die size, check "Core Monsters" and "Your Monsters" sources, set level range 3-7, and click "Generate Random Table", **Then** the system creates a table with 20 unique monster entries matching my criteria and redirects me to the table view

3. **Given** I have a created encounter table, **When** I click "Roll d20" on the table view, **Then** I see an animated dice roll followed by the result number, the corresponding monster entry is highlighted, and the full monster stat block appears in the detail panel with a favorite button

4. **Given** I am viewing a monster in the detail panel, **When** I click the favorite button, **Then** the monster is added to my favorites (same behavior as the standard monster detail page)

5. **Given** I have a table entry I want to change, **When** I click "Edit" on that entry and select "Random monster from filters", **Then** the system replaces that entry with a different random monster matching the table's saved filters

6. **Given** I have a table entry I want to change, **When** I click "Edit" on that entry and select "Search all monsters", **Then** I can search and select any monster (core, mine, or public) to replace that entry

7. **Given** I have an existing table, **When** I access table settings and click "Regenerate Table", **Then** the system generates a completely new set of monster entries using the table's current filters

8. **Given** I have an existing table, **When** I access table settings, modify the filters (e.g., change level range to 5-10, add "Public Monsters" source), and save, **Then** the table's filters are updated for future regeneration and single-entry replacements

9. **Given** I want to share a table, **When** I click "Share" and then "Make Public", **Then** the system generates a unique shareable URL and marks the table as public

10. **Given** I am viewing a public table (authenticated user), **When** I see the table, **Then** I can roll on it, view monster details, and see a "Copy to My Tables" button

11. **Given** I am viewing a public table (unauthenticated visitor), **When** I see the table, **Then** I can roll on it and view monster details, but I do NOT see a "Copy to My Tables" button

12. **Given** I am an authenticated user viewing someone else's public table, **When** I click "Copy to My Tables", **Then** a duplicate table (with all entries) is created in my personal collection

13. **Given** I have multiple encounter tables, **When** I view my table list, **Then** I see cards showing each table's name, description, die size, entry count, and action buttons (View, Edit Settings, Delete, Share)

14. **Given** table generation would result in fewer monsters than the die size requires, **When** I attempt to generate the table, **Then** the system displays an error message: "Only X monsters match your criteria. Need at least Y."

15. **Given** I select a custom die size, **When** I enter a number outside the valid range (less than 2 or greater than 1000), **Then** the system prevents table creation and shows a validation error

### Edge Cases

- **What happens when a monster referenced in a table entry is deleted?** The system uses a cached snapshot of monster data stored with each entry, so the table continues to work even if the original monster is removed.

- **What happens if I try to generate a table with filters so restrictive that no monsters match?** The system displays an error: "No monsters match your criteria. Please adjust your filters."

- **What happens if I try to create a table without selecting any monster sources?** The system prevents table creation and shows validation: "Please select at least one monster source (Core, Your Monsters, or Public)."

- **What happens if two users try to generate public slugs at the exact same time?** The system ensures uniqueness by checking for existing slugs and regenerating if a collision occurs.

- **What happens if I'm viewing a public table and the owner deletes it?** The table becomes inaccessible and shows a "Table not found" error to anyone attempting to access the URL.

- **What happens when I roll on a table multiple times?** Each roll is independent and generates a new random result from 1 to the die size.

- **What happens if I set a table to public and then want to make it private again?** The table settings should allow toggling the public status, which removes the shareable URL access.

- **What happens if I try to edit a public table that I copied from someone else?** The copied table is fully mine to edit - it's completely independent from the original.

## Requirements

### Functional Requirements

#### Table Creation & Management

- **FR-001**: System MUST allow authenticated users to create new encounter tables with a name (3-100 characters, required) and optional description
- **FR-002**: System MUST support die size selection from standard options (d4, d6, d8, d10, d12, d20, d100) or custom numeric input (2-1000)
- **FR-003**: System MUST allow users to select one or more monster sources via checkboxes: "Core Monsters" (official rulebook), "Your Monsters" (user-created only), "Public Monsters" (community-shared user monsters)
- **FR-004**: System MUST require at least one monster source to be selected for table generation
- **FR-005**: System MUST provide filter options for level range (1-20, defaulting to full range), alignment (Lawful, Neutral, Chaotic), movement types (fly, swim, burrow, climb), and text search
- **FR-006**: System MUST generate a table by randomly selecting unique monsters matching the selected sources and filters, with one monster per roll number (1 through die size)
- **FR-007**: System MUST prevent table generation if fewer monsters match the criteria than the die size requires, displaying error: "Only X monsters match your criteria. Need at least Y."
- **FR-008**: System MUST prevent table generation if no monsters match the criteria, displaying error: "No monsters match your criteria. Please adjust your filters."
- **FR-009**: System MUST store table generation filters (sources, level range, alignment, movement, search) with each table for future regeneration
- **FR-010**: System MUST allow users to view a list of all their created encounter tables with summary information (name, description, die size, entry count)
- **FR-011**: System MUST provide actions for each table: View, Edit Settings, Delete, and Share
- **FR-012**: System MUST allow users to delete their own encounter tables, which removes the table and all its entries
- **FR-013**: System MUST restrict table editing and deletion to the table owner only

#### Table Settings & Regeneration

- **FR-014**: System MUST provide a dedicated table settings interface (page or modal) where users can edit table name, description, and saved filters
- **FR-015**: System MUST allow users to regenerate an entire table using the current/updated filters, replacing all entries with new randomly selected monsters
- **FR-016**: System MUST allow users to edit individual table entries by choosing either "Random monster from filters" or "Search all monsters"
- **FR-017**: System MUST replace a single entry with a different random monster (matching table filters) when user selects "Random monster from filters"
- **FR-018**: System MUST allow users to search and select any monster (core, their own, or public) when replacing a single entry via "Search all monsters"

#### Rolling & Monster Display

- **FR-019**: System MUST provide a roll button that generates a random number from 1 to the table's die size
- **FR-020**: System MUST display an animated dice rolling effect for approximately 1 second before revealing the final result
- **FR-021**: System MUST highlight the rolled table entry after a roll is complete
- **FR-022**: System MUST display the full monster stat block in a detail panel when a monster is rolled
- **FR-023**: The monster detail display MUST include the same information and favorite button functionality as the standard monster detail page
- **FR-024**: System MUST allow users to favorite monsters directly from the table detail panel
- **FR-025**: System MUST allow multiple independent rolls on the same table, with each roll being random

#### Data Persistence & Snapshots

- **FR-026**: System MUST store a snapshot of each monster's complete data when added to a table entry
- **FR-027**: System MUST use the stored monster snapshot for display if the original monster is deleted or modified
- **FR-028**: System MUST maintain table functionality even if referenced monsters are no longer available

#### Public Sharing

- **FR-029**: System MUST allow table owners to make their tables public, generating a unique shareable slug (URL-friendly identifier)
- **FR-030**: System MUST ensure public slugs are unique across all tables by regenerating if a collision occurs
- **FR-031**: System MUST allow anyone (authenticated or unauthenticated) to view public tables and roll on them
- **FR-032**: System MUST hide the "Copy to My Tables" button from unauthenticated users viewing public tables
- **FR-033**: System MUST show the "Copy to My Tables" button to authenticated users viewing other users' public tables
- **FR-034**: System MUST create a complete duplicate of a public table (with all entries) when an authenticated user copies it to their collection
- **FR-035**: System MUST allow table owners to toggle public/private status, which controls shareable URL access

### Key Entities

- **Encounter Table**: Represents a collection of random encounter possibilities with a specific die size. Contains name, description, die size (4, 6, 8, 10, 12, 20, 100, or custom), public status, shareable slug (if public), and saved generation filters (monster sources, level range, alignment, movement types, search query). Owned by a single user. Can have multiple entries (one per roll number).

- **Encounter Table Entry**: Represents a single position on an encounter table (e.g., "roll 7 = Troll"). Contains roll number (1 through die size), reference to monster (may become invalid if monster deleted), and complete monster data snapshot (preserved for historical accuracy). Belongs to exactly one encounter table.

- **Monster Data Snapshot**: A complete copy of monster attributes (name, stats, abilities, attacks, etc.) frozen at the time the monster was added to a table entry. Used to display monster information even if the original monster is modified or deleted. Contains all fields necessary to display a full monster stat block.

- **Table Generation Filters**: Configuration parameters used to select monsters for table generation and regeneration. Includes monster sources (core, user-created, public community), level range (min/max 1-20), alignment options (Lawful, Neutral, Chaotic), movement type options (fly, swim, burrow, climb), and text search query. Stored with each table for consistency.

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
- [x] Ambiguities marked (then resolved via clarifying questions)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
