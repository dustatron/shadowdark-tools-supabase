# Quickstart: Monster Search View Toggle

**Feature**: 014-update-monster-search

## Prerequisites

- Node.js 18+
- npm
- Running dev server

## Quick Test

1. Start dev server:

   ```bash
   npm run dev
   ```

2. Navigate to monsters page:

   ```
   http://localhost:3000/monsters
   ```

3. Verify card view (default):
   - Monsters display in responsive grid
   - Each card shows name, CL, HP, AC, Speed, tags

4. Click "Table" toggle button:
   - View switches to data table
   - URL updates to `?view=table`
   - Columns: Name, CL, HP, AC, Speed, Source

5. Sort by Challenge Level:
   - Click CL column header
   - Results sort ascending
   - Click again for descending

6. Click a table row:
   - Navigates to monster detail page
   - Search params preserved in back navigation

7. Apply filters:
   - Set CL range 5-10
   - Search "dragon"
   - Verify table updates with filtered results

8. Test persistence:
   - Refresh page with `?view=table`
   - Table view persists
   - Navigate away and back
   - View preference maintained via localStorage

9. Mobile test (resize to mobile):
   - Table scrolls horizontally
   - Speed and Source columns hidden
   - Toggle buttons remain accessible

## Acceptance Criteria Checklist

- [ ] Toggle between cards and table view
- [ ] Table displays sortable columns (Name, CL, HP, AC)
- [ ] Row click navigates to monster detail
- [ ] Pagination works in table view
- [ ] All existing filters work with table view
- [ ] Favorites display in table for authenticated users
- [ ] View preference persists in URL
- [ ] Mobile-friendly table presentation
