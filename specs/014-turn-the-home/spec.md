# Feature Specification: Central Home Page Search

**Feature Branch**: `014-turn-the-home`
**Created**: 2025-12-08
**Status**: Complete
**Input**: User description: "turn the home page into a central search. its one search box that will fuzzy search between magic items, monsters, and equipment clicking on the resulting item would take the user to the details page for that item."

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a Dungeon Master, I want a single search box on the home page that searches across all content types (magic items, monsters, equipment) so I can quickly find any game content without navigating to separate sections.

### Acceptance Scenarios

1. **Given** I am on the home page, **When** I type "sword" and submit the form, **Then** I see mixed results from magic items, monsters, and equipment that match "sword"
2. **Given** search results are displayed, **When** I click on a monster result, **Then** I am navigated to that monster's detail page
3. **Given** search results are displayed, **When** I click on a magic item result, **Then** I am navigated to that magic item's detail page
4. **Given** search results are displayed, **When** I click on an equipment result, **Then** I am navigated to that equipment's detail page
5. **Given** I am on the home page, **When** I type a partial or misspelled term like "gobln" and submit, **Then** I see fuzzy matched results including "Goblin"
6. **Given** I type a search term, **When** no results match, **Then** I see an empty state message indicating no results found
7. **Given** I am on the home page, **When** I select "Core" source filter and search, **Then** I only see official content in results
8. **Given** I am on the home page, **When** I select "User Generated" source filter and search, **Then** I only see user-created content in results
9. **Given** I have unchecked "Monsters" checkbox, **When** I search, **Then** monsters are excluded from results
10. **Given** I have unchecked multiple content type checkboxes, **When** I search, **Then** only checked types appear in results

### Edge Cases

- What happens when search term is empty or only whitespace? Show nothing, display message to refine search
- How does system handle very short search terms? Minimum 3 characters required before search executes
- What happens when results span all three types? Mixed results displayed together
- How many results should be displayed? Default 25, user can select 25, 50, or 100

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a search form with input field and submit button on the home page
- **FR-002**: System MUST search across magic items, monsters, and equipment simultaneously
- **FR-003**: System MUST use fuzzy matching to find results (handles typos, partial matches)
- **FR-004**: System MUST execute search on form submit (button click or Enter key)
- **FR-005**: System MUST require minimum 3 characters before executing search
- **FR-006**: Each result MUST clearly indicate its content type (monster, magic item, equipment)
- **FR-007**: Users MUST be able to click a result to navigate to its detail page
- **FR-008**: System MUST display results in a mixed format (not grouped by type)
- **FR-009**: System MUST handle empty/short search with message prompting user to refine search
- **FR-010**: System MUST provide source filter with options: All, Core (official), User Generated
- **FR-011**: System MUST provide checkbox filters to exclude content types (magic items, equipment, monsters)
- **FR-012**: Filters MUST persist during search session
- **FR-013**: System MUST limit results to 25 by default
- **FR-014**: Users MUST be able to change result limit to 25, 50, or 100

### Key Entities

- **Search Result**: A unified representation of any searchable content type, containing name, type indicator, and navigation path
- **Magic Item**: Game items with magical properties (existing entity)
- **Monster**: Creature stat blocks (existing entity)
- **Equipment**: Standard adventuring gear (existing entity)

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

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

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (all resolved)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
