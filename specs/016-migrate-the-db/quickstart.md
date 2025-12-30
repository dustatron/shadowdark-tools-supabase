# Quickstart: DB Function Migration

## Verification Steps

Run these steps after implementation to verify the migration is complete.

---

## 1. Monster Search Verification

### Test via API

```bash
# Search with query
curl "http://localhost:3000/api/search/monsters?q=goblin&limit=5"

# Expected: Array of monsters with relevance scores
# Verify: Results contain monsters with "goblin" in name

# Search with filters
curl "http://localhost:3000/api/search/monsters?minLevel=3&maxLevel=5&limit=10"

# Expected: Monsters with challenge_level between 3 and 5
```

### Verify Response Structure

```json
{
  "results": [
    {
      "id": "uuid",
      "name": "Goblin",
      "challenge_level": 1,
      "relevance": 0.85
    }
  ],
  "total": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 2. Unified Search Verification

### Test via API

```bash
# Search across all content types
curl "http://localhost:3000/api/search?q=fire&limit=10"

# Expected: Mixed results from monsters, spells, magic items, equipment
```

### Verify Response Structure

```json
{
  "results": [
    {
      "id": "uuid-or-slug",
      "name": "Fireball",
      "type": "spell",
      "source": "official",
      "detailUrl": "/spells/fireball",
      "relevance": 0.9
    }
  ],
  "total": 10,
  "query": "fire"
}
```

---

## 3. Audit Log Verification

### Test Admin Action

```bash
# Login as admin user first, then:
# Update a user (triggers audit log)
curl -X PATCH "http://localhost:3000/api/admin/users/{user-id}" \
  -H "Content-Type: application/json" \
  -d '{"display_name": "Updated Name"}'
```

### Verify in Database

```sql
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 5;

-- Should see entry with:
-- action_type: 'user_update'
-- target_type: 'user'
-- details: contains old/new values
```

---

## 4. Encounter Generation Verification

```bash
# Generate random encounter
curl -X POST "http://localhost:3000/api/encounters/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeLevel": 3,
    "partySize": 4,
    "difficulty": "medium"
  }'

# Expected: encounter object with monsters array
```

---

## 5. Run Tests

```bash
# Unit tests for new services
npm test -- --grep "monster-search"
npm test -- --grep "unified-search"
npm test -- --grep "audit"

# Integration tests
npm run test:e2e -- --grep "search"
```

---

## Success Criteria

- [ ] Monster search returns same results as RPC function
- [ ] Unified search returns all content types
- [ ] Audit logs created for admin actions
- [ ] Encounter generation works with new search service
- [ ] No RPC calls remain in production code
- [ ] All existing tests pass
- [ ] API response structure unchanged
