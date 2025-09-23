import { describe, it, expect } from 'vitest';

/**
 * Contract Test: GET /api/monsters/{id}
 * Tests monster details retrieval by ID
 * MUST FAIL initially - endpoint not implemented
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
const MOCK_MONSTER_ID = '123e4567-e89b-12d3-a456-426614174000';
const INVALID_ID = 'invalid-uuid';

describe('GET /api/monsters/{id} - Contract Tests', () => {
  it('should return monster details for valid ID', async () => {
    const response = await fetch(`${API_BASE}/api/monsters/${MOCK_MONSTER_ID}`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id', MOCK_MONSTER_ID);
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('challenge_level');
  });

  it('should return 404 for non-existent monster', async () => {
    const response = await fetch(`${API_BASE}/api/monsters/00000000-0000-0000-0000-000000000000`);
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid UUID format', async () => {
    const response = await fetch(`${API_BASE}/api/monsters/${INVALID_ID}`);
    expect(response.status).toBe(400);
  });
});