# Adventure Lists Feature Summary

## Overview

The Adventure Lists feature allows Dungeon Masters to create collections of game elements (monsters, spells, magic items) that they need for their next game session. These lists can be private or public, and include a title, description, notes, and an optional image URL.

## Key Features

- **Create and manage adventure lists**: Users can create, edit, and delete their own adventure lists
- **Add various content types**: Lists can contain monsters, spells, and magic items
- **Public/private sharing**: Lists can be made public for other users to view
- **Notes and descriptions**: Users can add notes to both lists and individual items
- **Image support**: Lists can have an associated image via URL
- **Quantity tracking**: Users can specify quantities for each item in a list

## Documentation

We have created the following documentation for the Adventure Lists feature:

1. [**Plan**](./plan.md) - Overall plan and data model
2. [**API Design**](./api-design.md) - API endpoints and data structures
3. [**UI Components**](./ui-components.md) - UI component specifications and mockups
4. [**Implementation Plan**](./implementation-plan.md) - Timeline and resource allocation
5. [**Validation Schema**](./validation-schema.md) - Data validation schemas

## Data Model

### Adventure Lists

The `adventure_lists` table stores the basic information about each adventure list:

- `id`: Unique identifier
- `user_id`: Owner of the list
- `title`: Title of the list
- `description`: Optional description
- `notes`: Optional notes
- `image_url`: Optional URL to an image
- `is_public`: Whether the list is visible to other users
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Adventure List Items

The `adventure_list_items` table stores the items included in each adventure list:

- `id`: Unique identifier
- `list_id`: Reference to the parent list
- `item_type`: Type of item (monster, spell, magic_item)
- `item_id`: ID of the referenced item
- `quantity`: Quantity of this item in the list
- `notes`: Optional notes specific to this item
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## API Endpoints

The feature includes the following API endpoints:

- **List Management**
  - `GET /api/adventure-lists` - Get all lists for the current user
  - `GET /api/adventure-lists/public` - Get all public lists
  - `GET /api/adventure-lists/:id` - Get a specific list with all its items
  - `POST /api/adventure-lists` - Create a new list
  - `PUT /api/adventure-lists/:id` - Update an existing list
  - `DELETE /api/adventure-lists/:id` - Delete a list

- **List Items Management**
  - `POST /api/adventure-lists/:id/items` - Add an item to a list
  - `PUT /api/adventure-lists/:id/items/:itemId` - Update an item in a list
  - `DELETE /api/adventure-lists/:id/items/:itemId` - Remove an item from a list

## UI Components

The feature includes the following UI components:

- **AdventureListCard**: Card component for list previews
- **AdventureListDetail**: Detailed view of a list with all its items
- **AdventureListForm**: Form for creating or editing lists
- **ItemSelector**: Component for searching and selecting items to add to a list
- **MonsterListItem / SpellListItem / MagicItemListItem**: Components for displaying items in a list

## Pages

The feature includes the following pages:

- `/adventure-lists` - List of the user's adventure lists
- `/adventure-lists/public` - List of public adventure lists
- `/adventure-lists/new` - Create a new adventure list
- `/adventure-lists/:id` - View a specific adventure list
- `/adventure-lists/:id/edit` - Edit a specific adventure list

## Implementation Timeline

The implementation is divided into the following phases:

1. **Database Setup** (1-2 days)
2. **API Implementation** (2-3 days)
3. **UI Components** (3-4 days)
4. **Page Implementation** (2-3 days)
5. **Testing and Refinement** (2-3 days)

Total estimated time: 10-15 days

## Future Enhancements

After the initial implementation, we can consider these enhancements:

1. Support for additional content types
2. Advanced filtering and sorting options
3. List templates for common scenarios
4. Exporting lists to PDF or other formats
5. Sharing lists with specific users
6. Collaborative editing of lists
7. Tagging and categorizing lists

## Conclusion

The Adventure Lists feature will provide significant value to Dungeon Masters by allowing them to organize and prepare for their game sessions more efficiently. By collecting all the necessary game elements in one place, users can quickly access the information they need during gameplay.
