# Equipment API Contract Updates

**Feature**: 021-update-equipment-details
**Date**: 2026-01-06

## Summary

Updates to existing equipment API endpoints to support `image_url` field.

---

## POST /api/user/equipment

Create new user equipment with optional image.

### Request Body (updated)

```typescript
{
  name: string;          // Required, 1-200 chars
  description?: string;  // Optional, max 2000 chars
  item_type: "armor" | "weapon" | "gear";
  cost: {
    amount: number;      // >= 0
    currency: "gp" | "sp" | "cp";
  };
  attack_type?: string;  // Optional, max 50 chars
  range?: string;        // Optional, max 100 chars
  damage?: string;       // Optional, max 100 chars
  armor?: string;        // Optional, max 50 chars
  properties: string[];  // Required, each max 50 chars
  slot: number;          // 0-10
  quantity?: string;     // Optional, max 50 chars
  is_public: boolean;
  image_url?: string | null;  // NEW: Optional, max 500 chars
}
```

### Response 201 Created

```typescript
{
  id: string;            // UUID
  user_id: string;       // UUID
  name: string;
  slug: string;
  description: string | null;
  item_type: string;
  cost: { amount: number; currency: string };
  attack_type: string | null;
  range: string | null;
  damage: string | null;
  armor: string | null;
  properties: string[];
  slot: number;
  quantity: string | null;
  is_public: boolean;
  image_url: string | null;  // NEW
  created_at: string;
  updated_at: string;
}
```

---

## PUT /api/user/equipment/[id]

Update existing user equipment including image.

### Request Body (partial update)

```typescript
{
  name?: string;
  description?: string;
  item_type?: "armor" | "weapon" | "gear";
  cost?: { amount: number; currency: "gp" | "sp" | "cp" };
  attack_type?: string;
  range?: string;
  damage?: string;
  armor?: string;
  properties?: string[];
  slot?: number;
  quantity?: string;
  is_public?: boolean;
  image_url?: string | null;  // NEW: Can set to null to remove image
}
```

### Response 200 OK

Same as POST response body.

---

## GET /api/user/equipment

List user equipment - response now includes image_url.

### Response 200 OK

```typescript
{
  data: Array<{
    id: string;
    user_id: string;
    name: string;
    slug: string;
    description: string | null;
    item_type: string;
    cost: { amount: number; currency: string };
    attack_type: string | null;
    range: string | null;
    damage: string | null;
    armor: string | null;
    properties: string[];
    slot: number;
    quantity: string | null;
    is_public: boolean;
    image_url: string | null; // NEW
    created_at: string;
    updated_at: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

---

## GET /api/user/equipment/[id]

Get single equipment item - response now includes image_url.

### Response 200 OK

Same as single item in POST response.

---

## GET /api/equipment

List all equipment (official + public user) - response now includes image_url.

### Response Items Include

```typescript
{
  // ... existing fields ...
  image_url: string | null;  // NEW
  source_type: "official" | "custom";
  creator_name?: string;
}
```

---

## Validation Rules

| Field     | Validation                                |
| --------- | ----------------------------------------- |
| image_url | Optional, string, max 500 chars, nullable |

## Error Responses

No new error cases. Existing validation errors apply if image_url exceeds 500 chars.
