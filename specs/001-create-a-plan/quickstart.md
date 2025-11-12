# Quickstart: Dungeon Exchange

This document provides step-by-step testing scenarios to validate the core functionality of the Dungeon Exchange application.

## Prerequisites

1. Application is running locally or deployed
2. Database is seeded with sample official monsters
3. Test user accounts are available
4. Admin account is configured

## Test Scenario 1: User Registration and Authentication

### Objective

Verify that users can register, login, and access the application

### Steps

1. Navigate to the application homepage
2. Click "Sign Up" button
3. Enter valid email and password
4. Verify email confirmation (if enabled)
5. Login with credentials
6. Verify redirect to dashboard

### Expected Results

- User account is created successfully
- Email verification works (if enabled)
- Login redirects to dashboard
- User session is maintained across page refreshes

## Test Scenario 2: Monster Search and Discovery

### Objective

Verify the core search functionality works correctly

### Steps

1. Login as a test user
2. Navigate to the search page
3. Search for "goblin" in the search bar
4. Apply challenge level filter (CL 1-3)
5. Apply tag filter (e.g., "humanoid")
6. Change fuzziness setting to "high"
7. Click "Random Monster" button

### Expected Results

- Search returns relevant monsters containing "goblin"
- Filters correctly narrow results
- Fuzzy search finds related monsters
- Random monster selection respects current filters
- Results display with proper pagination/infinite scroll

## Test Scenario 3: Custom Monster Creation

### Objective

Verify users can create and manage custom monsters

### Steps

1. Login as a test user
2. Navigate to "Create Monster" page
3. Fill in required fields:
   - Name: "Test Orc"
   - Challenge Level: 2
   - Hit Points: 15
   - Armor Class: 13
   - Speed: "30 ft"
   - Source: "Custom"
4. Add an attack:
   - Name: "Scimitar"
   - Type: "melee"
   - Damage: "1d6+3"
   - Range: "5 ft"
5. Add tags: type "humanoid", location "mountains"
6. Save monster as private
7. Edit the monster to make it public
8. Verify monster appears in search results

### Expected Results

- Custom monster is created with validation
- XP is automatically calculated (CL 2 = 50 XP)
- Monster can be edited by owner
- Public monsters appear in community search
- Private monsters only visible to owner

## Test Scenario 4: List Management

### Objective

Verify users can create and manage encounter lists

### Steps

1. Login as a test user
2. Create a new list named "Forest Encounters"
3. Set party level to 3, XP budget to 200
4. Search for forest-themed monsters
5. Add 2 goblins to the list
6. Add 1 owlbear to the list
7. Verify total XP calculation
8. Reorder items in the list
9. Remove one item
10. Duplicate the list

### Expected Results

- List is created with metadata
- Monsters can be added from search results
- XP totals are calculated automatically
- Items can be reordered and removed
- Lists can be duplicated
- Lists persist across sessions

## Test Scenario 5: Encounter Table Generation

### Objective

Verify encounter table creation and rolling

### Steps

1. Login as a test user
2. Navigate to encounter generation
3. Select "Forest Encounters" list as source
4. Choose d6 die size
5. Generate encounter table with uniform distribution
6. Save the table as "Forest Random Encounters"
7. Test rolling the table multiple times
8. Edit the table to manually assign slots
9. Test rolling the modified table

### Expected Results

- Encounter table is generated with 6 slots
- Slots are populated from the list
- Table can be saved and retrieved
- Rolling produces random results from assigned slots
- Manual slot assignment works correctly
- Table statistics are calculated properly

## Test Scenario 6: Community Features

### Objective

Verify community content sharing and moderation

### Steps

1. Login as user A
2. Create a custom monster and mark as public
3. Logout and login as user B
4. Browse community content
5. Find user A's monster
6. Add it to a list
7. Flag the monster as inappropriate
8. Login as admin user
9. Review and resolve the flag
10. Verify flag status updates

### Expected Results

- Public monsters appear in community browser
- Users can use others' public content
- Flagging system works correctly
- Admin can review and resolve flags
- Audit logs track admin actions
- Flag status updates properly

## Test Scenario 7: Guest User Experience

### Objective

Verify guest users have limited but functional access

### Steps

1. Visit application without logging in
2. Search public monsters
3. Create temporary list (should hit limit at 3)
4. Generate encounter table (should hit limit at 5)
5. Use random monster feature (should hit limit at 10)
6. Attempt to create custom monster (should prompt login)
7. Register account and verify data migration

### Expected Results

- Guests can search public content
- Temporary lists work with limits
- Encounter generation has session limits
- Custom content requires authentication
- Data migrates properly on registration
- Limits reset on browser refresh

## Test Scenario 8: Admin Dashboard

### Objective

Verify administrative functions work correctly

### Steps

1. Login as admin user
2. Access admin dashboard
3. Import official monsters via bulk script
4. Manage tag types (add new monster type)
5. Review content flags
6. Resolve a flag with "dismissed" status
7. View audit log
8. Edit an official monster

### Expected Results

- Admin dashboard is accessible to admin only
- Bulk import validates and imports data
- Tag management updates available options
- Flag resolution updates status and logs action
- Audit log shows all admin actions
- Official monster edits are tracked

## Test Scenario 9: Mobile Responsiveness

### Objective

Verify application works on mobile devices

### Steps

1. Access application on mobile browser
2. Test navigation menu (hamburger menu)
3. Perform monster search with touch interface
4. Create a list using mobile forms
5. Test drag-and-drop on touch screen
6. Generate and roll encounter table
7. Verify all buttons and forms are touch-friendly

### Expected Results

- Mobile layout adapts properly
- Navigation works on small screens
- Touch interface is responsive
- Forms are usable on mobile
- Drag-and-drop works with touch
- Performance is acceptable on mobile

## Test Scenario 10: Data Export and Print

### Objective

Verify export and print functionality

### Steps

1. Login as a test user
2. Create a monster with full details
3. Export monster as JSON
4. Export monster as Markdown
5. Create a list with multiple monsters
6. Export list as JSON
7. Print monster details page
8. Print encounter table

### Expected Results

- JSON exports contain complete data
- Markdown exports are human-readable
- List exports include all items
- Print views are clean and formatted
- Exports can be re-imported (if supported)

## Performance Validation

### Load Testing

1. Simulate 50 concurrent users searching
2. Verify page load times < 2 seconds
3. Verify search response times < 500ms
4. Test infinite scroll with large datasets
5. Monitor database query performance

### Expected Performance

- Search results within 500ms
- Page loads within 2 seconds
- Smooth infinite scrolling
- No memory leaks during extended use
- Database queries remain efficient

## Security Validation

### Authentication Testing

1. Test password reset flow
2. Verify session timeout
3. Test SQL injection on search inputs
4. Test XSS on custom monster fields
5. Verify RLS policies prevent data access

### Authorization Testing

1. Verify users can only edit their own content
2. Test admin-only access restrictions
3. Verify private content visibility
4. Test guest user limitations

## Data Integrity Validation

### Validation Testing

1. Test invalid monster statistics (negative HP, invalid CL)
2. Test XP calculation accuracy
3. Test data consistency across updates
4. Verify Shadowdark rule enforcement
5. Test backup and restore procedures

## Troubleshooting

### Common Issues

1. **Search returns no results**: Check database seeding
2. **Authentication fails**: Verify Supabase configuration
3. **Images don't load**: Check Cloudinary setup
4. **Performance issues**: Check database indexes
5. **Mobile layout broken**: Verify Tailwind CSS compilation

### Debug Steps

1. Check browser console for errors
2. Verify network requests in dev tools
3. Check Supabase logs for database errors
4. Review application logs for server errors
5. Test with different browsers and devices
