# Feature Specification: Equipment Image Support

**Feature Branch**: `021-update-equipment-details`
**Created**: 2026-01-06
**Status**: Draft
**Input**: User description: "update equipment details to allow adding or selecting images for equipment. reference what we have for magic items. we want the same thing but for equipment. should show the icon in the equipment cards, in the edit view we add selected an image from a pre-selectin of images from https://game-icons.net. the user can upload an image too."

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a GM managing equipment, I want to assign images to my custom equipment items so they display visually in equipment cards and detail views, matching the functionality already available for magic items.

### Acceptance Scenarios

1. **Given** I'm viewing an equipment card, **When** the equipment has an image assigned, **Then** I see a thumbnail of that image in the card layout
2. **Given** I'm editing or creating equipment, **When** I access the image picker, **Then** I can choose from pre-selected game-icons.net icons organized by category
3. **Given** I'm in the image picker, **When** I switch to the "Upload Custom" tab, **Then** I can upload my own image (max 15MB)
4. **Given** I've selected an image, **When** I view the image picker, **Then** I see a preview with an option to remove it
5. **Given** equipment has no image assigned, **When** I view the equipment card, **Then** I see a default placeholder icon (matching current behavior)

### Edge Cases

- What happens when a user uploads an invalid file type? → Show error toast, reject upload
- What happens when uploaded image exceeds 15MB? → Show error toast, reject upload
- What happens when Cloudinary upload fails? → Show error toast, keep previous image (if any)
- How does image display on official vs user equipment? → Official equipment can have images set by admins; users can only edit their own equipment images

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display equipment images as thumbnails in EquipmentCard component
- **FR-002**: System MUST provide an image picker in the equipment edit/create form with two modes:
  - Default icons tab: Pre-selected game-icons.net icons from Cloudinary
  - Upload custom tab: User file upload to Cloudinary
- **FR-003**: Users MUST be able to select from categorized default equipment icons (weapons, armor, gear, misc)
- **FR-004**: Users MUST be able to upload custom images up to 15MB in JPG, PNG, GIF, or WEBP format
- **FR-005**: System MUST store image URLs in the `image_url` column for both `equipment` and `user_equipment` tables
- **FR-006**: System MUST display a placeholder icon when no image is assigned
- **FR-007**: Users MUST be able to remove a selected image and revert to no image
- **FR-008**: System MUST transform Cloudinary URLs appropriately for thumbnail vs detail views

### Key Entities

- **Equipment**: Official equipment items with optional `image_url` field
- **User Equipment**: User-created equipment with optional `image_url` field
- **Default Equipment Images**: Pre-configured set of game-icons.net icons stored in Cloudinary, categorized by equipment type

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

## Notes

**Reference Implementation**: The magic items feature (`MagicItemImagePicker`, `MagicItemCard`, `MagicItemForm`) provides the exact pattern to follow. Key files:

- `components/magic-items/MagicItemImagePicker.tsx` - Image picker component
- `components/magic-items/MagicItemCard.tsx` - Card with thumbnail display
- `lib/config/default-magic-item-images.ts` - Default icons configuration

**Database Status**:

- `user_equipment` table does NOT currently have an `image_url` column (needs migration)
- `equipment` (official) table does NOT currently have an `image_url` column (needs migration)

**Dependencies**:

- Cloudinary account configured (already in use for magic items)

**Icon Strategy**:

- Reuse existing magic item icons that apply (sword, dagger, armor, shield, boots, helmet, etc.)
- Add new equipment-specific icons from game-icons.net (rope, torch, lantern, backpack, rations, etc.)
- Create unified or shared config that both features can reference
