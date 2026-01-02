# API Contracts: Magic Item Image Support

## Modified Endpoints

### POST /api/user/magic-items

Create a new user magic item with optional image.

**Request Body** (Updated):

```json
{
  "name": "Flaming Sword",
  "description": "A sword wreathed in magical flames",
  "traits": [{ "name": "Benefit", "description": "+1 fire damage" }],
  "is_public": false,
  "image_url": "https://res.cloudinary.com/xxx/image/upload/v123/shadowdark/magic-items/user123/sword.jpg"
}
```

**Validation**:

- `image_url`: optional, must be valid URL if provided, max 500 chars

**Response**: 201 Created

```json
{
  "id": "uuid",
  "name": "Flaming Sword",
  "slug": "flaming-sword",
  "description": "A sword wreathed in magical flames",
  "traits": [...],
  "is_public": false,
  "image_url": "https://res.cloudinary.com/...",
  "user_id": "uuid",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

### PUT /api/user/magic-items/[id]

Update an existing user magic item, including image.

**Request Body** (Updated):

```json
{
  "name": "Flaming Sword +1",
  "image_url": "https://res.cloudinary.com/..."
}
```

**Notes**:

- Set `image_url: null` to remove image
- Omit `image_url` to leave unchanged

**Response**: 200 OK (same shape as POST response)

---

### GET /api/user/magic-items

List user's magic items with images.

**Response** (Updated):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Flaming Sword",
      "image_url": "https://res.cloudinary.com/...",
      ...
    }
  ],
  "pagination": { ... }
}
```

---

### GET /api/magic-items/[slug]

Fetch single magic item by slug.

**Response** (Updated):

```json
{
  "id": "uuid",
  "name": "Flaming Sword",
  "image_url": "https://res.cloudinary.com/...",
  "item_type": "custom",
  ...
}
```

---

### GET /api/search/magic-items

Search magic items.

**Response** (Updated):

```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Flaming Sword",
      "image_url": "https://res.cloudinary.com/...",
      ...
    }
  ],
  "total": 42,
  "pagination": { ... }
}
```

---

## Client-Side Contracts

### Cloudinary Upload (Direct)

Uploads go directly to Cloudinary, not through our API.

**Request**: POST `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`

**Form Data**:

```
file: <binary>
upload_preset: <preset_name>
folder: shadowdark/magic-items/{userId}
```

**Response**:

```json
{
  "secure_url": "https://res.cloudinary.com/xxx/image/upload/v123/shadowdark/magic-items/user123/abc.jpg",
  "public_id": "shadowdark/magic-items/user123/abc",
  "format": "jpg",
  "width": 800,
  "height": 600
}
```

---

## Cloudinary Transform URL Pattern

**Base URL**: `https://res.cloudinary.com/{cloud}/image/upload/{transforms}/{public_id}`

**Transform Presets**:
| Size | Transforms | Use Case |
|------|------------|----------|
| thumb | `w_80,h_80,c_fill,q_auto,f_auto` | List views |
| card | `w_200,h_200,c_fill,q_auto,f_auto` | Card components |
| detail | `w_400,q_auto,f_auto` | Detail pages |
| pdf | `w_600,q_90` | PDF export |

**Example**:

```
Original: https://res.cloudinary.com/xxx/image/upload/v123/shadowdark/magic-items/user123/sword.jpg
Thumb:    https://res.cloudinary.com/xxx/image/upload/w_80,h_80,c_fill,q_auto,f_auto/v123/shadowdark/magic-items/user123/sword.jpg
```

---

## Error Responses

### 400 Bad Request - Invalid Image URL

```json
{
  "error": "Validation error",
  "details": [{ "path": ["image_url"], "message": "Invalid URL format" }]
}
```

### 413 Payload Too Large (Client-side prevention)

Handled client-side before upload. Error toast displayed.

---

## Default Images Contract

**GET /api/config/default-magic-item-images** (Optional - can be client-only)

Or embedded in client bundle:

```typescript
// lib/config/default-magic-item-images.ts
export const DEFAULT_MAGIC_ITEM_IMAGES: DefaultMagicItemImage[] = [
  {
    id: "sword",
    name: "Sword",
    publicId: "shadowdark/defaults/sword",
    category: "weapon",
  },
  {
    id: "ring",
    name: "Ring",
    publicId: "shadowdark/defaults/ring",
    category: "jewelry",
  },
  // ... 13 more
];
```
