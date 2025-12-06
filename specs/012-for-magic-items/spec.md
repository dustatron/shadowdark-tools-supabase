# Feature Specification: User-Generated Magic Items with Source Attribution

**Feature Branch**: `012-for-magic-items`
**Created**: 2025-12-05
**Status**: Draft
**Input**: User description: "for magic items I would like to create a user generated magic item. Allow the user to make that item private or public. update the magic item to show the author or source of the item. if its not user generated I would like to show that its from the core rules. do you have questions?"

---

## ¡ Quick Guidelines

-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a GM, I want to create custom magic items for my Shadowdark campaigns and optionally share them with the community. When browsing magic items, I want to see whether an item is from the official Core Rules or created by a community member, so I can make informed decisions about what to use in my games.

### Acceptance Scenarios

1. **Given** an authenticated user on the magic items page, **When** they click a "Create Magic Item" button, **Then** they see a form to enter magic item details including name, description, and traits.

2. **Given** a user filling out the magic item creation form, **When** they submit the form with valid data, **Then** the magic item is saved and associated with their account.

3. **Given** a user creating a magic item, **When** they set visibility to "public", **Then** other users can see this item when browsing magic items.

4. **Given** a user creating a magic item, **When** they set visibility to "private", **Then** only that user can see the item in their collection.

5. **Given** a user viewing any magic item, **When** the item is from official Shadowdark content, **Then** it displays "Core Rules" as the source.

6. **Given** a user viewing any magic item, **When** the item was created by a community member, **Then** it displays the creator's username as the author.

7. **Given** an authenticated user who created a magic item, **When** they view their own item, **Then** they can edit or delete it.

8. **Given** an unauthenticated user, **When** they browse magic items, **Then** they see all public items (both official and community) with proper source attribution but cannot create items.

### Edge Cases

- What happens when a user tries to create a magic item with a name that already exists? [NEEDS CLARIFICATION: Should duplicate names be allowed? Should it warn but allow?]
- What happens when a user who created public items deletes their account? [NEEDS CLARIFICATION: Should items be deleted, anonymized, or preserved?]
- What happens if a user wants to change a public item to private after others may have seen it? [NEEDS CLARIFICATION: Should this be allowed freely, or warn about visibility change?]

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create custom magic items
- **FR-002**: System MUST require name and description for magic items
- **FR-003**: System MUST allow users to add traits (benefits, curses, bonuses, personality) to their items
- **FR-004**: System MUST allow users to set item visibility as "public" or "private"
- **FR-005**: System MUST default new items to [NEEDS CLARIFICATION: private or public default?]
- **FR-006**: System MUST display "Core Rules" as source for official magic items
- **FR-007**: System MUST display creator's username for user-generated magic items
- **FR-008**: System MUST allow item creators to edit their own items
- **FR-009**: System MUST allow item creators to delete their own items
- **FR-010**: System MUST include public user-generated items in browse/search results
- **FR-011**: System MUST hide private items from all users except the creator
- **FR-012**: System MUST allow users to toggle visibility between public and private after creation

### Key Entities

- **User Magic Item**: Custom magic item created by a user; has name, description, traits, visibility status, and owner reference
- **Magic Item Source**: Attribution indicating whether item is from Core Rules or community-created (with author reference)

---

## Review & Acceptance Checklist

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

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

---

## Open Questions

1. **Duplicate names**: Allow duplicate magic item names across users?
2. **Default visibility**: New items default to public or private?
3. **Account deletion**: What happens to public items when creator deletes account?
4. **Visibility change**: Allow freely changing public’private after creation?
