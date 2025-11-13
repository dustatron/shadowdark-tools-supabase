# Feature Specification: Create Custom Spell

**Feature Branch**: `009-add-create-spell`
**Created**: 2025-11-12
**Status**: Draft
**Input**: User description: "add create spell"

## Execution Flow (main)

```
1. Parse user description from Input
   � Extract: "create spell" capability
2. Extract key concepts from description
   � Actors: authenticated users (GMs)
   � Actions: create, save custom spells
   � Data: spell attributes (name, tier, class, description, duration, range, effect)
   � Constraints: Shadowdark RPG rules compliance
3. For each unclear aspect:
   � RESOLVED: Users create own spells only, CRUD only their spells
   � RESOLVED: No image/icon upload support
   � RESOLVED: Public/private toggle required
   � RESOLVED: No quota limits
   � RESOLVED: Spell names must be globally unique
4. Fill User Scenarios & Testing section
   � User creates wizard spell with tier, duration, range, effect
5. Generate Functional Requirements
   � All requirements testable
6. Identify Key Entities (spell data)
7. Run Review Checklist
   � All clarifications resolved
8. Return: SUCCESS (spec ready for planning)
```

---

## � Quick Guidelines

-  Focus on WHAT users need and WHY
- L Avoid HOW to implement (no tech stack, APIs, code structure)
- =e Written for business stakeholders, not developers

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a Game Master, I want to create custom spells for my Shadowdark campaign so that I can add unique magical abilities that fit my world's lore and complement the official spell list.

### Acceptance Scenarios

1. **Given** I am an authenticated user, **When** I navigate to create spell page, **Then** I see a form with all required spell fields (name, tier, class, school, duration, range, description)

2. **Given** I fill in all required spell fields with valid data, **When** I submit the form, **Then** the spell is saved to my custom spells and I can view it in my spell list

3. **Given** I am creating a spell, **When** I select spell tier, **Then** I can only choose values 1-5 (valid Shadowdark tiers)

4. **Given** I have created a custom spell, **When** I view my spells list, **Then** I can see both official spells and my custom spells clearly distinguished

5. **Given** I am filling spell details, **When** I select spell class, **Then** I can choose Wizard, Priest, or both

6. **Given** I submit invalid spell data, **When** form validates, **Then** I see clear error messages for each invalid field

### Edge Cases

- What happens when user creates spell with duplicate name (globally)?
- How does system handle very long spell descriptions (character limits)?
- What happens if user navigates away mid-creation without saving?
- Can other users view my spell if marked private?
- Can users edit official spells? (No - only their own custom spells)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create new custom spells
- **FR-002**: System MUST require spell name (non-empty string, globally unique)
- **FR-003**: System MUST require spell tier (integer 1-5 for Shadowdark compliance)
- **FR-004**: System MUST allow selection of spell class (Wizard, Priest, or both)
- **FR-005**: System MUST allow optional spell school specification
- **FR-006**: System MUST allow spell duration specification (instantaneous, concentration, rounds, minutes, hours, etc.)
- **FR-007**: System MUST allow spell range specification (self, touch, near, far, distance in feet)
- **FR-008**: System MUST require spell effect/description text
- **FR-009**: System MUST validate all inputs before saving
- **FR-010**: System MUST associate created spells with creator's user ID
- **FR-011**: System MUST prevent unauthenticated users from creating spells
- **FR-012**: System MUST allow users to edit only their own custom spells
- **FR-013**: System MUST allow users to delete only their own custom spells
- **FR-014**: System MUST prevent users from editing or deleting official spells
- **FR-015**: System MUST provide public/private toggle for spell visibility
- **FR-016**: System MUST show only public spells to other users
- **FR-017**: System MUST show both public and private spells to spell owner
- **FR-018**: System MUST reject duplicate spell names across all spells (official + custom)
- **FR-019**: System MUST provide clear feedback on successful spell creation
- **FR-020**: System MUST provide clear error messages for validation failures
- **FR-021**: System MUST allow unlimited custom spells per user

### Key Entities

- **Custom Spell**: User-created spell with all Shadowdark spell attributes (name, tier, class, school, duration, range, description), ownership link to creator, creation timestamp, public/private visibility flag
- **Spell Classes**: Wizard, Priest (standard Shadowdark classes that can cast spells)
- **Spell Tiers**: Integer levels 1-5 representing spell power (Shadowdark standard)
- **Official Spell**: Read-only spell from official Shadowdark content (for reference and name uniqueness checks)

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
- [x] Dependencies and assumptions identified (mirrors monster creation pattern)

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked and resolved
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
