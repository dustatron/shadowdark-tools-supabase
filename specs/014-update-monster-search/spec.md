# Feature Specification: Monster Search View Toggle (Cards vs Table)

**Feature Branch**: `014-update-monster-search`
**Created**: 2025-12-08
**Status**: Draft
**Input**: User description: "update monster search to be able to show results in a table as well as cards"

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a GM browsing monsters, I want to toggle between card view and table view so I can quickly scan many results in a compact table or see detailed previews in cards depending on my current need.

### Acceptance Scenarios

1. **Given** I am on the monsters page viewing results as cards, **When** I click the table view toggle, **Then** the results display in a data table with sortable columns

2. **Given** I am viewing monsters in table view, **When** I click the card view toggle, **Then** the results return to the card grid layout

3. **Given** I have selected table view and apply search/filter criteria, **When** results update, **Then** the table view persists with new filtered data

4. **Given** I switch to table view and navigate away, **When** I return to the monsters page, **Then** my view preference persists [NEEDS CLARIFICATION: persist via URL param, localStorage, or user profile?]

5. **Given** I am viewing monsters in table format, **When** I click a monster row, **Then** I navigate to that monster's detail page

### Edge Cases

- What happens with 0 results in table view? (show empty table with message)
- How does table view display on mobile devices? (horizontal scroll or simplified columns)
- How does table view handle long monster names or descriptions? (truncation with tooltip)

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a toggle control to switch between card view and table view
- **FR-002**: System MUST display monsters in a sortable data table when table view is active
- **FR-003**: Table view MUST display key monster attributes: Name, CL (Challenge Level), HP, AC, Speed, Source
- **FR-004**: Table view MUST support column sorting (at minimum: Name, CL, HP, AC)
- **FR-005**: Each table row MUST be clickable to navigate to monster detail page
- **FR-006**: Table view MUST integrate with existing pagination (same page size options, same pagination controls)
- **FR-007**: Table view MUST work with all existing filters (search, CL range, types, speed, source)
- **FR-008**: System MUST indicate current active view in the toggle control
- **FR-009**: Table view MUST display favorite status for authenticated users (same as card view)
- **FR-010**: View preference MUST persist [NEEDS CLARIFICATION: session only, localStorage, URL param, or user profile setting?]

### Key Entities

- **Monster**: Existing entity - no changes needed; just different display format
- **ViewPreference**: User's choice between "cards" and "table" display mode

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---

## Open Questions

1. **View persistence**: Should view preference persist via URL parameter, localStorage, or user profile? (Recommend: URL param for shareability + localStorage fallback)
2. **Mobile table**: Horizontal scroll vs hide columns on small screens?
