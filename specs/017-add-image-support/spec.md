# Feature Specification: Magic Item Image Support

**Feature Branch**: `017-add-image-support`
**Created**: 2026-01-01
**Status**: Draft
**Input**: User description: "Add image support to user magic items. Users can upload custom images (15MB max) or select from default fantasy item icons from game-icons.net. Images display at multiple sizes (thumbnail for web, larger for PDF). Cloudinary for hosting. Default icons grid + upload UI. User items only, not official items."

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a user creating or editing a custom magic item, I want to add an image that represents my item so that my magic items are visually identifiable in lists, detail views, and exported PDFs.

### Acceptance Scenarios

1. **Given** I am creating a new magic item, **When** I reach the image selection step, **Then** I see a grid of default fantasy icons to choose from
2. **Given** I am on the image selection UI, **When** I click a default icon, **Then** it becomes selected and shows as my item's image
3. **Given** I am on the image selection UI, **When** I choose to upload my own image, **Then** I can select a file up to 15MB
4. **Given** I have uploaded an image, **When** I view my magic item in a list, **Then** I see a small thumbnail version
5. **Given** I have an image on my magic item, **When** I view the item detail page, **Then** I see a larger version of the image
6. **Given** I have an image on my magic item, **When** I export to PDF, **Then** the image appears in appropriate quality/size
7. **Given** I am editing an existing magic item with an image, **When** I open the edit form, **Then** I see the current image and can change or remove it
8. **Given** I have selected an image, **When** I click remove/clear, **Then** the image is removed and I can select a new one

### Edge Cases

- What happens when a user uploads a file larger than 15MB? → Display error, reject upload
- What happens when a user uploads a non-image file? → Display error, reject upload
- What happens when a magic item has no image? → Display placeholder/no image state
- What happens when image upload fails mid-upload? → Display error, allow retry
- What happens when viewing an item whose image was deleted from storage? → Show placeholder gracefully

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to select one image per magic item
- **FR-002**: System MUST provide a grid of default fantasy item icons for selection
- **FR-003**: System MUST allow users to upload custom images up to 15MB
- **FR-004**: System MUST validate uploaded files are images (JPEG, PNG, GIF, WebP)
- **FR-005**: System MUST display images at different sizes based on context:
  - Thumbnail size for list views
  - Medium size for card views
  - Larger size for detail pages
  - High quality for PDF export
- **FR-006**: System MUST allow users to remove/clear an image from their magic item
- **FR-007**: System MUST allow users to replace an existing image with a new one
- **FR-008**: System MUST persist image selection when saving magic item
- **FR-009**: System MUST display upload progress/loading state during image upload
- **FR-010**: System MUST display appropriate error messages for failed uploads
- **FR-011**: System MUST only apply to user-created magic items (not official items)
- **FR-012**: System MUST include attribution for game-icons.net (CC BY 3.0 license requirement)

### Non-Functional Requirements

- **NFR-001**: Image upload should complete within reasonable time for 15MB file
- **NFR-002**: Thumbnail images should load quickly in list views
- **NFR-003**: Default icon grid should display without requiring additional network requests after initial load

### Key Entities

- **Magic Item Image**: An optional visual representation of a magic item. Can be a user-uploaded image or a reference to a default icon. Associated with exactly one user magic item.
- **Default Icon**: A pre-provided fantasy item icon that users can select. Part of a curated set available to all users. Licensed under CC BY 3.0 from game-icons.net.

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

## Assumptions & Constraints

- Only applies to `user_magic_items` table, not `official_magic_items`
- Cloudinary is the designated image hosting service (already integrated for avatars)
- Default icons sourced from game-icons.net require attribution (CC BY 3.0)
- Image is optional - magic items can exist without images
- One image per magic item (no galleries)
