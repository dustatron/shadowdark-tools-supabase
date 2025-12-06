# API Contracts: User-Generated Magic Items

**Feature**: 012-for-magic-items
**Date**: 2025-12-05

## Base URL

`/api/user/magic-items`

---

## Endpoints

### GET /api/user/magic-items

List current user's magic items.

**Auth**: Required

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| q | string | - | Search query |

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Sword of Flames",
      "slug": "sword-of-flames",
      "description": "A sword that burns...",
      "traits": [{ "name": "Benefit", "description": "+1d6 fire damage" }],
      "is_public": false,
      "created_at": "2025-12-05T00:00:00Z",
      "updated_at": "2025-12-05T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Response 401**: `{ "error": "Authentication required" }`

---

### POST /api/user/magic-items

Create a new magic item.

**Auth**: Required

**Request Body**:

```json
{
  "name": "Sword of Flames",
  "description": "A sword that burns with magical fire.",
  "traits": [{ "name": "Benefit", "description": "+1d6 fire damage on hit" }],
  "is_public": false
}
```

**Validation**:

- name: required, string, 1-200 chars
- description: required, string, 1-5000 chars
- traits: optional, array of {name: string, description: string}
- is_public: optional, boolean, default false

**Response 201**:

```json
{
  "id": "uuid",
  "name": "Sword of Flames",
  "slug": "sword-of-flames",
  "description": "A sword that burns with magical fire.",
  "traits": [...],
  "is_public": false,
  "created_at": "2025-12-05T00:00:00Z",
  "updated_at": "2025-12-05T00:00:00Z"
}
```

**Response 400**: `{ "error": "Validation error", "details": [...] }`
**Response 401**: `{ "error": "Authentication required" }`

---

### GET /api/user/magic-items/[id]

Get a specific user magic item.

**Auth**: Required (owner or admin)

**Response 200**: Single item object (same as list item)

**Response 401**: `{ "error": "Authentication required" }`
**Response 403**: `{ "error": "Access denied" }`
**Response 404**: `{ "error": "Not found" }`

---

### PUT /api/user/magic-items/[id]

Update a magic item.

**Auth**: Required (owner or admin)

**Request Body**: Same as POST (all fields optional for partial update)

**Response 200**: Updated item object

**Response 400**: `{ "error": "Validation error", "details": [...] }`
**Response 401**: `{ "error": "Authentication required" }`
**Response 403**: `{ "error": "Access denied" }`
**Response 404**: `{ "error": "Not found" }`

---

### DELETE /api/user/magic-items/[id]

Delete a magic item.

**Auth**: Required (owner or admin)

**Response 204**: No content

**Response 401**: `{ "error": "Authentication required" }`
**Response 403**: `{ "error": "Access denied" }`
**Response 404**: `{ "error": "Not found" }`

---

## Updated Endpoint

### GET /api/search/magic-items (Modified)

Add support for user items in existing search.

**New Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| source | string | - | Filter: "official", "community", or omit for all |

**Updated Response**:

```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Sword of Flames",
      "slug": "sword-of-flames",
      "description": "...",
      "traits": [...],
      "item_type": "official" | "custom",
      "creator_name": null | "username",
      "user_id": null | "uuid"
    }
  ],
  "pagination": {...}
}
```

---

## Zod Schemas

### MagicItemCreateSchema

```typescript
z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  traits: z
    .array(
      z.object({
        name: z.enum(["Benefit", "Curse", "Bonus", "Personality"]),
        description: z.string().min(1).max(1000),
      }),
    )
    .default([]),
  is_public: z.boolean().default(false),
});
```

### MagicItemUpdateSchema

```typescript
MagicItemCreateSchema.partial();
```
