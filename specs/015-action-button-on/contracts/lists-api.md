# API Contract: Lists

**Existing API** - Using existing lists implementation, may need list items endpoints

## GET /api/lists

Get all lists for the authenticated user.

**Authentication**: Required

**Query Parameters**:

- `include_counts` (optional): Include item counts in response (default: true)

**Request Example**:

```http
GET /api/lists?include_counts=true
Authorization: Bearer {session_token}
```

**Response 200 OK**:

```json
{
  "lists": [
    {
      "id": "list-uuid",
      "user_id": "user-uuid",
      "name": "My Dungeon Monsters",
      "description": "Monsters for the haunted castle",
      "is_public": false,
      "item_count": 5,
      "created_at": "2025-12-16T10:00:00Z",
      "updated_at": "2025-12-16T10:00:00Z"
    }
  ]
}
```

## POST /api/lists

Create a new list.

**Authentication**: Required

**Request Body**:

```json
{
  "name": "New Adventure List",
  "description": "Optional description"
}
```

**Validation**:

- `name`: Required, min 1 char, max 100 chars
- `description`: Optional, max 500 chars

**Response 201 Created**:

```json
{
  "list": {
    "id": "new-list-uuid",
    "user_id": "user-uuid",
    "name": "New Adventure List",
    "description": "Optional description",
    "is_public": false,
    "created_at": "2025-12-16T10:00:00Z",
    "updated_at": "2025-12-16T10:00:00Z"
  }
}
```

**Response 400 Bad Request**:

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "name",
      "message": "List name is required"
    }
  ]
}
```

## GET /api/lists/{listId}/items

Get all items in a specific list.

**Authentication**: Required (must own the list)

**Request Example**:

```http
GET /api/lists/list-uuid/items
Authorization: Bearer {session_token}
```

**Response 200 OK**:

```json
{
  "items": [
    {
      "id": "item-uuid",
      "list_id": "list-uuid",
      "entity_type": "monster",
      "entity_id": "monster-uuid",
      "quantity": 1,
      "notes": null,
      "created_at": "2025-12-16T10:00:00Z"
    }
  ]
}
```

**Response 403 Forbidden**:

```json
{
  "error": "Access denied - not your list"
}
```

## POST /api/lists/{listId}/items

Add an item to a list.

**Authentication**: Required (must own the list)

**Request Body**:

```json
{
  "entity_type": "monster",
  "entity_id": "monster-uuid",
  "quantity": 1,
  "notes": "Optional notes"
}
```

**Validation**:

- `entity_type`: Required, 'monster' or 'spell'
- `entity_id`: Required, valid UUID
- `quantity`: Optional, positive integer, default 1
- `notes`: Optional, max 500 chars

**Response 201 Created**:

```json
{
  "item": {
    "id": "item-uuid",
    "list_id": "list-uuid",
    "entity_type": "monster",
    "entity_id": "monster-uuid",
    "quantity": 1,
    "notes": null,
    "created_at": "2025-12-16T10:00:00Z"
  }
}
```

**Response 409 Conflict** (duplicate):

```json
{
  "error": "Entity already in list",
  "existingItem": {
    "id": "existing-item-uuid",
    "quantity": 2
  }
}
```

## DELETE /api/lists/{listId}/items/{itemId}

Remove an item from a list.

**Authentication**: Required (must own the list)

**Request Example**:

```http
DELETE /api/lists/list-uuid/items/item-uuid
Authorization: Bearer {session_token}
```

**Response 204 No Content**:
(Empty body)

**Response 404 Not Found**:

```json
{
  "error": "Item not found"
}
```

## GET /api/lists/contains/{entityType}/{entityId}

Get all lists that contain a specific entity for the authenticated user.

**Authentication**: Required

**Request Example**:

```http
GET /api/lists/contains/monster/monster-uuid
Authorization: Bearer {session_token}
```

**Response 200 OK**:

```json
{
  "lists": [
    {
      "list_id": "list-uuid-1",
      "list_name": "Dungeon Monsters",
      "item_id": "item-uuid-1",
      "quantity": 1
    },
    {
      "list_id": "list-uuid-2",
      "list_name": "Boss Fights",
      "item_id": "item-uuid-2",
      "quantity": 3
    }
  ]
}
```

**Response 200 OK** (entity not in any lists):

```json
{
  "lists": []
}
```

## Contract Tests

### Test: GET /api/lists returns user's lists

```typescript
it("should return user lists with item counts", async () => {
  // Setup: Create user with 2 lists
  // Execute: GET /api/lists?include_counts=true
  // Assert: Response 200 with lists array
  // Assert: Each list has item_count property
});
```

### Test: POST /api/lists creates new list

```typescript
it("should create new list for authenticated user", async () => {
  // Setup: Authenticated user
  // Execute: POST /api/lists with valid body
  // Assert: Response 201 with created list
  // Assert: List belongs to authenticated user
  // Assert: List persisted in database
});
```

### Test: POST /api/lists validates name

```typescript
it("should reject list creation with empty name", async () => {
  // Setup: Authenticated user
  // Execute: POST /api/lists with name=""
  // Assert: Response 400 with validation error
});
```

### Test: POST /api/lists/{listId}/items adds item

```typescript
it("should add entity to list", async () => {
  // Setup: User owns list, valid monster ID
  // Execute: POST /api/lists/{id}/items
  // Assert: Response 201 with created item
  // Assert: Item persisted with correct list_id and entity_id
});
```

### Test: POST /api/lists/{listId}/items prevents duplicates

```typescript
it("should return 409 when adding duplicate entity", async () => {
  // Setup: Entity already in list
  // Execute: POST /api/lists/{id}/items with same entity
  // Assert: Response 409 Conflict
  // Assert: Existing item data returned
});
```

### Test: GET /api/lists/contains returns containing lists

```typescript
it("should return lists containing the entity", async () => {
  // Setup: User has 3 lists, entity in 2 of them
  // Execute: GET /api/lists/contains/monster/{id}
  // Assert: Response 200 with 2 lists
  // Assert: Returned lists match those containing entity
});
```

### Test: POST /api/lists/{listId}/items enforces ownership

```typescript
it("should return 403 when adding to another user list", async () => {
  // Setup: List owned by different user
  // Execute: POST /api/lists/{id}/items
  // Assert: Response 403 Forbidden
});
```
