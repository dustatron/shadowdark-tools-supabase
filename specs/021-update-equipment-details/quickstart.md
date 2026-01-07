# Quickstart: Equipment Image Support

**Feature**: 021-update-equipment-details
**Date**: 2026-01-06

## Prerequisites

- Cloudinary account configured (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_PRESET)
- Default equipment icons uploaded to Cloudinary (`shadowdark/default-equipment/` folder)
- Database migration applied

## Verification Steps

### 1. Database Migration Verification

```sql
-- Check columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_equipment' AND column_name = 'image_url';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'equipment' AND column_name = 'image_url';
```

Expected: Both queries return `image_url | text`

### 2. Create Equipment with Default Icon

1. Login to app
2. Navigate to `/equipment/create`
3. Fill basic info (name, type, cost)
4. In Image section, click "Default Icons" tab
5. Select a weapon icon (e.g., Sword)
6. Click "Create Equipment"

Expected: Equipment saved, redirects to detail page showing selected icon

### 3. Create Equipment with Custom Upload

1. Navigate to `/equipment/create`
2. Fill basic info
3. In Image section, click "Upload Custom" tab
4. Click "Choose Image" and select a JPG/PNG under 15MB
5. Wait for upload confirmation toast
6. Click "Create Equipment"

Expected: Equipment saved with custom image displayed

### 4. Equipment Card Image Display

1. Navigate to `/equipment` or `/dashboard/equipment`
2. Find equipment items with images assigned

Expected: Thumbnail (80x80) displays in card layout, placeholder icon shows for items without images

### 5. Edit Equipment Image

1. Navigate to equipment detail page
2. Click "Edit"
3. In Image section, select different icon or upload new image
4. Click "Save Changes"

Expected: Image updated successfully

### 6. Remove Equipment Image

1. Navigate to equipment edit page
2. In Image section, click "Remove" button
3. Click "Save Changes"

Expected: Image removed, placeholder icon shown on card

### 7. Image Upload Validation

1. Navigate to `/equipment/create`
2. Try uploading file > 15MB

Expected: Error toast "File size must be less than 15MB"

3. Try uploading non-image file (e.g., .txt)

Expected: Error toast "File must be an image"

## API Verification

### Create with image_url

```bash
curl -X POST http://localhost:3000/api/user/equipment \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{
    "name": "Test Sword",
    "item_type": "weapon",
    "cost": {"amount": 10, "currency": "gp"},
    "properties": [],
    "slot": 1,
    "is_public": false,
    "image_url": "shadowdark/default-equipment/sword"
  }'
```

Expected: 201 response with `image_url` in body

### Update image_url

```bash
curl -X PUT http://localhost:3000/api/user/equipment/<id> \
  -H "Content-Type: application/json" \
  -H "Cookie: <auth-cookie>" \
  -d '{"image_url": null}'
```

Expected: 200 response with `image_url: null`

## Success Criteria

- [ ] Equipment cards show image thumbnails
- [ ] Default icon picker displays categorized icons
- [ ] Custom image upload works with validation
- [ ] Images persist after create/edit
- [ ] Remove image functionality works
- [ ] Placeholder icon shows when no image
- [ ] No console errors during image operations
