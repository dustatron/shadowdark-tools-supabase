# Quickstart: Magic Item Image Support

## Feature Validation Scenarios

### Scenario 1: Create Magic Item with Default Icon

1. Navigate to `/magic-items/create`
2. Fill in name: "Test Ring of Power"
3. Fill in description: "A powerful ring"
4. Add trait: Benefit - "Grants invisibility"
5. In image picker, click "Default Icons" tab
6. Click the ring icon from the grid
7. Verify ring icon shows as selected with preview
8. Click "Create Magic Item"
9. Verify redirected to detail page with ring image displayed

**Expected**: Magic item created with default ring icon visible at detail size

---

### Scenario 2: Create Magic Item with Custom Upload

1. Navigate to `/magic-items/create`
2. Fill in name: "Custom Sword"
3. Fill in description: "My custom sword"
4. Add trait: Bonus - "+1 attack"
5. In image picker, click "Upload Custom" tab
6. Click upload button, select a 5MB JPG image
7. Wait for upload progress to complete
8. Verify uploaded image shows in preview
9. Click "Create Magic Item"
10. Verify detail page shows uploaded image

**Expected**: Magic item created with custom uploaded image at all sizes

---

### Scenario 3: Edit Magic Item Image

1. Navigate to an existing magic item you own
2. Click "Edit"
3. In image picker, current image should be displayed
4. Click "Remove" to clear the image
5. Select a different default icon
6. Click "Save Changes"
7. Verify detail page shows new image

**Expected**: Image successfully changed

---

### Scenario 4: Magic Item Without Image

1. Navigate to `/magic-items/create`
2. Fill in required fields (name, description, trait)
3. Leave image picker empty (no selection)
4. Click "Create Magic Item"
5. Verify detail page shows placeholder/no image state
6. Verify list view shows placeholder thumbnail

**Expected**: Magic item works without image, shows appropriate placeholders

---

### Scenario 5: Upload Validation - File Too Large

1. Navigate to `/magic-items/create`
2. Click "Upload Custom" tab
3. Try to upload a 20MB image file
4. Verify error toast: "File size must be less than 15MB"
5. Verify upload is rejected, no preview shown

**Expected**: Upload rejected with clear error message

---

### Scenario 6: Upload Validation - Invalid File Type

1. Navigate to `/magic-items/create`
2. Click "Upload Custom" tab
3. Try to upload a PDF file
4. Verify error toast: "File must be an image"
5. Verify upload is rejected

**Expected**: Non-image files rejected with clear error

---

### Scenario 7: List View Thumbnails

1. Create 3 magic items: one with default icon, one with upload, one without
2. Navigate to `/magic-items`
3. Verify items with images show thumbnails
4. Verify item without image shows placeholder
5. Verify thumbnails are appropriately sized (not stretched)

**Expected**: All items display correctly in list with proper thumbnails

---

### Scenario 8: Image in Search Results

1. Create a magic item with an image
2. Navigate to `/magic-items`
3. Search for the item by name
4. Verify search result shows image thumbnail

**Expected**: Search results include image thumbnails

---

## Performance Checks

### Check 1: Upload Speed

- Upload a 10MB image
- Measure time from click to preview displayed
- Should complete within 10 seconds on reasonable connection

### Check 2: List View Load

- View a list with 20+ items with images
- Verify thumbnails load within 2 seconds
- No layout shift as images load

### Check 3: Transform Caching

- Load same image at different sizes
- Second load should be instant (Cloudinary CDN cache)

---

## Attribution Verification

1. Navigate to footer or about page
2. Verify "Icons by game-icons.net" attribution is present
3. Attribution should link to https://game-icons.net

---

## Edge Case Verification

### Deleted Cloudinary Image

1. Create item with uploaded image
2. (Manually delete image from Cloudinary dashboard)
3. View item detail page
4. Verify graceful fallback to placeholder (no broken image)

### Long Image URL

1. Create item with long public_id path
2. Verify URL stored correctly (up to 500 chars)
3. Verify display works

---

## Test Data Cleanup

After testing, delete test magic items to avoid polluting the database.
