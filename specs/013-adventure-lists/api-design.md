# Adventure Lists API Design

## Overview

This document outlines the API endpoints for the Adventure Lists feature, which allows users to create and manage collections of game elements (monsters, spells, magic items) for their game sessions.

## Authentication

All API endpoints require authentication using a valid JWT token, except for public list endpoints which allow unauthenticated access.

## Base URL

All endpoints are relative to `/api/adventure-lists`.

## Data Types

### AdventureList

```typescript
interface AdventureList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  notes: string | null;
  image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  item_counts?: {
    monsters: number;
    spells: number;
    magic_items: number;
    total: number;
  };
}
```

### AdventureListItem

```typescript
interface AdventureListItem {
  id: string;
  list_id: string;
  item_type: "monster" | "spell" | "magic_item";
  item_id: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Joined data from the referenced item
  name: string;
  description: string;
  details: any; // Varies based on item_type
}
```

### AdventureListItemCreate

```typescript
interface AdventureListItemCreate {
  item_type: "monster" | "spell" | "magic_item";
  item_id: string;
  quantity?: number; // Defaults to 1
  notes?: string;
}
```

### AdventureListItemUpdate

```typescript
interface AdventureListItemUpdate {
  quantity?: number;
  notes?: string;
}
```

## Endpoints

### List Management

#### GET /

Get all adventure lists for the current user.

**Query Parameters:**

- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Offset for pagination (default: 0)
- `search` (optional): Search term to filter lists by title or description

**Response:**

```typescript
{
  data: AdventureList[];
  count: number;
}
```

#### GET /public

Get all public adventure lists.

**Query Parameters:**

- `limit` (optional): Number of results to return (default: 20)
- `offset` (optional): Offset for pagination (default: 0)
- `search` (optional): Search term to filter lists by title or description

**Response:**

```typescript
{
  data: AdventureList[];
  count: number;
}
```

#### GET /:id

Get a specific adventure list with all its items.

**Response:**

```typescript
{
  list: AdventureList;
  items: {
    monsters: AdventureListItem[];
    spells: AdventureListItem[];
    magic_items: AdventureListItem[];
  };
}
```

#### POST /

Create a new adventure list.

**Request Body:**

```typescript
{
  title: string;
  description?: string;
  notes?: string;
  image_url?: string;
  is_public?: boolean; // Defaults to false
}
```

**Response:**

```typescript
{
  id: string;
  ...rest of AdventureList properties
}
```

#### PUT /:id

Update an existing adventure list.

**Request Body:**

```typescript
{
  title?: string;
  description?: string;
  notes?: string;
  image_url?: string;
  is_public?: boolean;
}
```

**Response:**

```typescript
{
  id: string;
  ...rest of AdventureList properties
}
```

#### DELETE /:id

Delete an adventure list.

**Response:**

```typescript
{
  success: true;
}
```

### List Items Management

#### GET /:id/items

Get all items in a specific adventure list.

**Response:**

```typescript
{
  monsters: AdventureListItem[];
  spells: AdventureListItem[];
  magic_items: AdventureListItem[];
}
```

#### POST /:id/items

Add an item to an adventure list.

**Request Body:**

```typescript
AdventureListItemCreate;
```

**Response:**

```typescript
{
  id: string;
  ...rest of AdventureListItem properties
}
```

#### PUT /:id/items/:itemId

Update an item in an adventure list.

**Request Body:**

```typescript
AdventureListItemUpdate;
```

**Response:**

```typescript
{
  id: string;
  ...rest of AdventureListItem properties
}
```

#### DELETE /:id/items/:itemId

Remove an item from an adventure list.

**Response:**

```typescript
{
  success: true;
}
```

## Implementation Details

### Database Queries

The API will use the following database queries:

1. For fetching lists:

   ```sql
   SELECT
     al.*,
     (
       SELECT jsonb_build_object(
         'monsters', COUNT(*) FILTER (WHERE ali.item_type = 'monster'),
         'spells', COUNT(*) FILTER (WHERE ali.item_type = 'spell'),
         'magic_items', COUNT(*) FILTER (WHERE ali.item_type = 'magic_item'),
         'total', COUNT(*)
       )
       FROM public.adventure_list_items ali
       WHERE ali.list_id = al.id
     ) AS item_counts
   FROM public.adventure_lists al
   WHERE al.user_id = auth.uid()
   ORDER BY al.updated_at DESC
   LIMIT $1 OFFSET $2;
   ```

2. For fetching a list with items:

   ```sql
   -- First get the list
   SELECT * FROM public.adventure_lists WHERE id = $1;

   -- Then get the items using the get_adventure_list_items function
   SELECT * FROM public.get_adventure_list_items($1);
   ```

### Error Handling

The API will return appropriate HTTP status codes:

- 200: Success
- 400: Bad request (invalid input)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized to access the resource)
- 404: Not found (list or item not found)
- 500: Server error

Error responses will have the following format:

```typescript
{
  error: {
    message: string;
    code?: string;
    details?: any;
  }
}
```

## Security Considerations

- All endpoints will respect the Row Level Security policies defined in the database
- Users can only access their own lists and public lists
- Users can only modify their own lists
- Input validation will be performed on all requests
