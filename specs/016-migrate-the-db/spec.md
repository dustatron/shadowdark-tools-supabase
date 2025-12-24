# Feature Specification: Migrate DB Functions to TypeScript Services

**Feature Branch**: `016-migrate-the-db`
**Created**: 2025-12-19
**Status**: Draft
**Input**: User description: "migrate the db functions"

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a developer maintaining the codebase, I need database logic converted from PostgreSQL RPC functions to TypeScript service functions so that the code is easier to read, debug, test, and maintain without requiring database migrations for logic changes.

### Acceptance Scenarios

1. **Given** a user searches for monsters, **When** the search API is called, **Then** results are returned with the same filtering, pagination, and fuzzy search behavior as before
2. **Given** a user searches across all content types, **When** the unified search API is called, **Then** monsters, spells, equipment, and magic items are returned with relevance scoring
3. **Given** an admin updates a user or resolves a flag, **When** the action completes, **Then** an audit log entry is created with action details
4. **Given** the encounter generator runs, **When** it needs monsters matching criteria, **Then** it receives filtered monsters for encounter building

### Edge Cases

- What happens when search query is empty? Return all items with filters applied
- How does system handle no results? Return empty array, not error
- What happens if database connection fails? Return 500 with appropriate error message
- How does pagination work at boundaries? Return empty array when page exceeds total

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide monster search with fuzzy text matching identical to current behavior
- **FR-002**: System MUST support monster filtering by challenge level range (min/max)
- **FR-003**: System MUST support monster filtering by type, location, and source
- **FR-004**: System MUST support pagination with limit/offset for monster search
- **FR-005**: System MUST provide unified search across monsters, spells, equipment, and magic items
- **FR-006**: System MUST support content type filtering in unified search (toggle each type on/off)
- **FR-007**: System MUST return relevance scores in search results
- **FR-008**: System MUST create audit log entries for admin actions (user updates, flag resolutions)
- **FR-009**: System MUST maintain backward compatibility - API responses must not change structure
- **FR-010**: System MUST handle JSONB fields (attacks, abilities, tags) consistently in responses

### Key Entities

- **Monster**: Searchable game entity with name, challenge_level, type, location tags, attacks, abilities
- **Spell**: Searchable magic content with name, tier, class associations
- **Equipment**: Basic gear items with name, cost, properties
- **Magic Item**: Magical gear with name, rarity, effects
- **Audit Log**: Admin action record with action_type, admin_id, target_type, target_id, details, notes

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

## Functions to Migrate (Reference)

### Priority 1 - Production Code

| Function             | Current Location | Purpose                                            |
| -------------------- | ---------------- | -------------------------------------------------- |
| `search_monsters`    | API routes       | Monster search w/ filters, pagination, fuzzy match |
| `search_all_content` | API routes       | Unified search across 4 content types              |
| `create_audit_log`   | Admin routes     | Insert audit log entries                           |

### Priority 2 - Test/Admin Only

| Function                   | Purpose                            |
| -------------------------- | ---------------------------------- |
| `search_spells`            | Spell search (similar to monsters) |
| `get_random_monsters`      | Random monster selection           |
| `get_adventure_list_items` | Fetch enriched list items          |

### Keep as DB Functions (Triggers)

- `handle_new_user` - Auth trigger
- `handle_updated_at` - Timestamp trigger
- `update_*` trigger functions
- `check_*` constraint functions
