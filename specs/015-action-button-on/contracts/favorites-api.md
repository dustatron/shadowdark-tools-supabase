# API Contract: Favorites

**Existing API** - No new endpoints required, using existing favorites implementation

## GET /api/favorites

Get all favorites for the authenticated user.

**Authentication**: Required

**Query Parameters**:

- `entity_type` (optional): Filter by 'monster' or 'spell'

**Request Example**:

```http
GET /api/favorites?entity_type=monster
Authorization: Bearer {session_token}
```

**Response 200 OK**:

```json
{
  "favorites": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "user_id": "user-uuid",
      "entity_type": "monster",
      "entity_id": "monster-uuid",
      "created_at": "2025-12-16T10:00:00Z"
    }
  ]
}
```

**Response 401 Unauthorized**:

```json
{
  "error": "Authentication required"
}
```

## POST /api/favorites

Add an entity to favorites.

**Authentication**: Required

**Request Body**:

```json
{
  "entity_type": "monster",
  "entity_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Validation**:

- `entity_type`: Required, must be 'monster' or 'spell'
- `entity_id`: Required, must be valid UUID

**Response 201 Created**:

```json
{
  "favorite": {
    "id": "fav-uuid",
    "user_id": "user-uuid",
    "entity_type": "monster",
    "entity_id": "monster-uuid",
    "created_at": "2025-12-16T10:00:00Z"
  }
}
```

**Response 400 Bad Request**:

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "entity_id",
      "message": "Invalid UUID"
    }
  ]
}
```

**Response 409 Conflict**:

```json
{
  "error": "Already favorited"
}
```

## DELETE /api/favorites/{entityType}/{entityId}

Remove an entity from favorites.

**Authentication**: Required

**Path Parameters**:

- `entityType`: 'monster' or 'spell'
- `entityId`: UUID of the entity

**Request Example**:

```http
DELETE /api/favorites/monster/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {session_token}
```

**Response 204 No Content**:
(Empty body)

**Response 404 Not Found**:

```json
{
  "error": "Favorite not found"
}
```

## GET /api/favorites/{entityType}/{entityId}

Check if a specific entity is favorited by the authenticated user.

**Authentication**: Required

**Request Example**:

```http
GET /api/favorites/monster/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer {session_token}
```

**Response 200 OK** (favorited):

```json
{
  "isFavorited": true,
  "favorite": {
    "id": "fav-uuid",
    "created_at": "2025-12-16T10:00:00Z"
  }
}
```

**Response 200 OK** (not favorited):

```json
{
  "isFavorited": false
}
```

## Contract Tests

### Test: GET /api/favorites returns user's favorites

```typescript
it("should return user favorites filtered by entity type", async () => {
  // Setup: Create authenticated user and favorites
  // Execute: GET /api/favorites?entity_type=monster
  // Assert: Response 200 with favorites array
  // Assert: All returned favorites have entity_type='monster'
});
```

### Test: POST /api/favorites creates new favorite

```typescript
it("should create favorite for authenticated user", async () => {
  // Setup: Authenticated user, valid monster ID
  // Execute: POST /api/favorites with valid body
  // Assert: Response 201 with created favorite
  // Assert: Favorite persisted in database
  // Assert: Favorite belongs to authenticated user
});
```

### Test: POST /api/favorites prevents duplicates

```typescript
it("should return 409 when favoriting already-favorited entity", async () => {
  // Setup: User already favorited entity
  // Execute: POST /api/favorites with same entity
  // Assert: Response 409 Conflict
});
```

### Test: DELETE /api/favorites removes favorite

```typescript
it("should delete favorite and return 204", async () => {
  // Setup: User has favorited entity
  // Execute: DELETE /api/favorites/{type}/{id}
  // Assert: Response 204 No Content
  // Assert: Favorite removed from database
});
```

### Test: GET /api/favorites requires authentication

```typescript
it("should return 401 for unauthenticated requests", async () => {
  // Setup: No auth token
  // Execute: GET /api/favorites
  // Assert: Response 401 Unauthorized
});
```
