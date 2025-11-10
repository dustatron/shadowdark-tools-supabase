# API Contracts: Decks

**Version**: 1.0.0
**Base Path**: `/api/decks`
**Authentication**: Required (Supabase Auth)

## Endpoints

### List User Decks

**Endpoint**: `GET /api/decks`

**Description**: Retrieve all decks owned by authenticated user

**Authentication**: Required

**Query Parameters**:
| Parameter | Type | Required | Description |
| --------- | ------ | -------- | ------------------------------------ |
| sort | string | No | Sort order: 'updated' \| 'created' \| 'name' (default: 'updated') |
| order | string | No | Sort direction: 'asc' \| 'desc' (default: 'desc') |

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
```

**Success Response** (200 OK):

```json
{
  "decks": [
    {
      "id": "uuid",
      "name": "My Wizard Spells",
      "spell_count": 12,
      "created_at": "2025-11-04T10:30:00Z",
      "updated_at": "2025-11-04T15:45:00Z"
    }
  ],
  "total": 1
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid authentication
  ```json
  { "error": "Authentication required" }
  ```

**Response Schema**:

```typescript
{
  decks: Array<{
    id: string;
    name: string;
    spell_count: number;
    created_at: string; // ISO 8601
    updated_at: string; // ISO 8601
  }>;
  total: number;
}
```

---

### Create Deck

**Endpoint**: `POST /api/decks`

**Description**: Create a new empty deck

**Authentication**: Required

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "My Wizard Spells"
}
```

**Validation**:

- `name`: Required, non-empty string, max 100 characters

**Success Response** (201 Created):

```json
{
  "id": "uuid",
  "name": "My Wizard Spells",
  "spell_count": 0,
  "created_at": "2025-11-04T10:30:00Z",
  "updated_at": "2025-11-04T10:30:00Z"
}
```

**Error Responses**:

- `400 Bad Request`: Validation error
  ```json
  {
    "error": "Validation error",
    "details": [
      {
        "path": ["name"],
        "message": "Required field"
      }
    ]
  }
  ```
- `401 Unauthorized`: Missing or invalid authentication
- `500 Internal Server Error`: Database error

---

### Get Deck Details

**Endpoint**: `GET /api/decks/[id]`

**Description**: Retrieve a single deck with all spells

**Authentication**: Required (must be deck owner)

**Path Parameters**:
| Parameter | Type | Description |
| --------- | ---- | ---------------- |
| id | UUID | Deck identifier |

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
```

**Success Response** (200 OK):

```json
{
  "id": "uuid",
  "name": "My Wizard Spells",
  "spell_count": 2,
  "created_at": "2025-11-04T10:30:00Z",
  "updated_at": "2025-11-04T15:45:00Z",
  "spells": [
    {
      "id": "spell-uuid-1",
      "name": "Magic Missile",
      "level": 1,
      "duration": "Instantaneous",
      "range": "120 feet",
      "description": "You create three glowing darts..."
    },
    {
      "id": "spell-uuid-2",
      "name": "Fireball",
      "level": 3,
      "duration": "Instantaneous",
      "range": "150 feet",
      "description": "A bright streak flashes..."
    }
  ]
}
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated or not deck owner
- `404 Not Found`: Deck does not exist
  ```json
  { "error": "Deck not found" }
  ```

---

### Update Deck

**Endpoint**: `PUT /api/decks/[id]`

**Description**: Update deck name or spell list

**Authentication**: Required (must be deck owner)

**Path Parameters**:
| Parameter | Type | Description |
| --------- | ---- | ---------------- |
| id | UUID | Deck identifier |

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Updated Deck Name", // Optional
  "spell_ids": ["uuid1", "uuid2"] // Optional, replaces entire spell list
}
```

**Validation**:

- `name`: Optional, if provided must be non-empty string, max 100 characters
- `spell_ids`: Optional array of UUIDs, max 52 items, must be unique

**Success Response** (200 OK):

```json
{
  "id": "uuid",
  "name": "Updated Deck Name",
  "spell_count": 2,
  "created_at": "2025-11-04T10:30:00Z",
  "updated_at": "2025-11-04T16:00:00Z"
}
```

**Error Responses**:

- `400 Bad Request`: Validation error
  ```json
  {
    "error": "Validation error",
    "details": [
      {
        "path": ["spell_ids"],
        "message": "Deck cannot exceed 52 cards"
      }
    ]
  }
  ```
- `401 Unauthorized`: Not authenticated or not deck owner
- `404 Not Found`: Deck does not exist
- `409 Conflict`: Duplicate spells in spell_ids
  ```json
  { "error": "Duplicate spells not allowed" }
  ```

---

### Delete Deck

**Endpoint**: `DELETE /api/decks/[id]`

**Description**: Permanently delete a deck and all its items

**Authentication**: Required (must be deck owner)

**Path Parameters**:
| Parameter | Type | Description |
| --------- | ---- | ---------------- |
| id | UUID | Deck identifier |

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
```

**Success Response** (204 No Content):

```
(empty body)
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated or not deck owner
- `404 Not Found`: Deck does not exist

---

### Add Spell to Deck

**Endpoint**: `POST /api/decks/[id]/spells`

**Description**: Add a single spell to deck

**Authentication**: Required (must be deck owner)

**Path Parameters**:
| Parameter | Type | Description |
| --------- | ---- | ---------------- |
| id | UUID | Deck identifier |

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "spell_id": "uuid"
}
```

**Validation**:

- `spell_id`: Required UUID, must exist in official_spells or user_spells
- Deck must have < 52 spells
- Spell must not already be in deck

**Success Response** (201 Created):

```json
{
  "id": "uuid",
  "name": "My Wizard Spells",
  "spell_count": 13,
  "created_at": "2025-11-04T10:30:00Z",
  "updated_at": "2025-11-04T16:05:00Z"
}
```

**Error Responses**:

- `400 Bad Request`: Validation error or constraint violation
  ```json
  { "error": "Deck cannot exceed 52 cards" }
  ```
  ```json
  { "error": "Spell already in deck" }
  ```
  ```json
  { "error": "Spell not found" }
  ```
- `401 Unauthorized`: Not authenticated or not deck owner
- `404 Not Found`: Deck does not exist

---

### Remove Spell from Deck

**Endpoint**: `DELETE /api/decks/[id]/spells/[spell_id]`

**Description**: Remove a spell from deck

**Authentication**: Required (must be deck owner)

**Path Parameters**:
| Parameter | Type | Description |
| --------- | ---- | ---------------- |
| id | UUID | Deck identifier |
| spell_id | UUID | Spell identifier |

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
```

**Success Response** (200 OK):

```json
{
  "id": "uuid",
  "name": "My Wizard Spells",
  "spell_count": 11,
  "created_at": "2025-11-04T10:30:00Z",
  "updated_at": "2025-11-04T16:10:00Z"
}
```

**Error Responses**:

- `401 Unauthorized`: Not authenticated or not deck owner
- `404 Not Found`: Deck or spell not found in deck

---

### Export Deck as PDF

**Endpoint**: `POST /api/decks/[id]/export`

**Description**: Generate PDF for deck with specified layout

**Authentication**: Required (must be deck owner)

**Path Parameters**:
| Parameter | Type | Description |
| --------- | ---- | ---------------- |
| id | UUID | Deck identifier |

**Request Headers**:

```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "layout": "grid" // "grid" (9 per page) or "single" (1 per page)
}
```

**Validation**:

- `layout`: Required, must be "grid" or "single"

**Success Response** (200 OK):

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="my-wizard-spells.pdf"

<PDF binary data>
```

**Error Responses**:

- `400 Bad Request`: Invalid layout option or empty deck
  ```json
  { "error": "Cannot export empty deck" }
  ```
- `401 Unauthorized`: Not authenticated or not deck owner
- `404 Not Found`: Deck does not exist
- `500 Internal Server Error`: PDF generation failed

---

## Common Response Patterns

### Error Response Structure

All error responses follow this format:

```json
{
  "error": "Human-readable error message",
  "details": [...] // Optional, for validation errors
}
```

### Validation Error Details

```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["field", "name"],
      "message": "Specific validation failure"
    }
  ]
}
```

## Rate Limiting

Not implemented for MVP. Consider for v2:

- 100 requests per minute per user
- 10 PDF exports per hour per user

## Caching Headers

```
Cache-Control: no-cache, private
Vary: Authorization
```

## CORS

Not applicable (same-origin Next.js API routes)

## Versioning

API version included in this document. Breaking changes require new version.
