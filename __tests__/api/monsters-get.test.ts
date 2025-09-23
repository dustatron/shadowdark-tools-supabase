import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Contract Test: GET /api/monsters
 *
 * Tests the monster search and listing API endpoint according to the OpenAPI specification.
 * This test MUST FAIL initially as the endpoint is not yet implemented.
 *
 * Contract Requirements:
 * - GET /api/monsters
 * - Query parameters: q, fuzziness, min_cl, max_cl, tags, type, limit, offset
 * - Returns: { monsters: Monster[], total: number, has_more: boolean }
 * - Status codes: 200 (success), 400 (bad request)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

describe('GET /api/monsters - Contract Tests', () => {
  beforeAll(async () => {
    // These tests assume the Next.js dev server is running
    // In CI, we would start it programmatically
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Basic Functionality', () => {
    it('should return a list of monsters with default parameters', async () => {
      const response = await fetch(`${API_BASE}/api/monsters`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();

      // Validate response structure
      expect(data).toHaveProperty('monsters');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('has_more');

      expect(Array.isArray(data.monsters)).toBe(true);
      expect(typeof data.total).toBe('number');
      expect(typeof data.has_more).toBe('boolean');

      // Should return some monsters (we seeded the database)
      expect(data.monsters.length).toBeGreaterThan(0);
      expect(data.total).toBeGreaterThan(0);
    });

    it('should return monsters with valid Monster schema', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?limit=1`);
      const data = await response.json();

      expect(data.monsters.length).toBe(1);

      const monster = data.monsters[0];

      // Required fields according to Monster schema
      expect(monster).toHaveProperty('id');
      expect(monster).toHaveProperty('name');
      expect(monster).toHaveProperty('challenge_level');
      expect(monster).toHaveProperty('hit_points');
      expect(monster).toHaveProperty('armor_class');
      expect(monster).toHaveProperty('speed');
      expect(monster).toHaveProperty('attacks');
      expect(monster).toHaveProperty('abilities');
      expect(monster).toHaveProperty('tags');
      expect(monster).toHaveProperty('source');
      expect(monster).toHaveProperty('is_official');
      expect(monster).toHaveProperty('created_at');
      expect(monster).toHaveProperty('updated_at');

      // Validate field types
      expect(typeof monster.id).toBe('string');
      expect(typeof monster.name).toBe('string');
      expect(typeof monster.challenge_level).toBe('number');
      expect(typeof monster.hit_points).toBe('number');
      expect(typeof monster.armor_class).toBe('number');
      expect(typeof monster.speed).toBe('string');
      expect(Array.isArray(monster.attacks)).toBe(true);
      expect(Array.isArray(monster.abilities)).toBe(true);
      expect(typeof monster.tags).toBe('object');
      expect(typeof monster.source).toBe('string');
      expect(typeof monster.is_official).toBe('boolean');

      // Validate constraints
      expect(monster.challenge_level).toBeGreaterThanOrEqual(1);
      expect(monster.challenge_level).toBeLessThanOrEqual(20);
      expect(monster.hit_points).toBeGreaterThanOrEqual(1);
      expect(monster.armor_class).toBeGreaterThanOrEqual(1);
      expect(monster.armor_class).toBeLessThanOrEqual(21);
    });
  });

  describe('Query Parameters', () => {
    it('should support text search with q parameter', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?q=goblin`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.monsters.length).toBeGreaterThan(0);

      // Results should include "goblin" in name or description
      const hasGoblinMatch = data.monsters.some((monster: any) =>
        monster.name.toLowerCase().includes('goblin') ||
        monster.author_notes?.toLowerCase().includes('goblin')
      );
      expect(hasGoblinMatch).toBe(true);
    });

    it('should support challenge level filtering', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?min_cl=1&max_cl=3`);
      const data = await response.json();

      expect(response.status).toBe(200);

      // All returned monsters should be within challenge level range
      data.monsters.forEach((monster: any) => {
        expect(monster.challenge_level).toBeGreaterThanOrEqual(1);
        expect(monster.challenge_level).toBeLessThanOrEqual(3);
      });
    });

    it('should support fuzziness parameter', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?q=gobln&fuzziness=high`);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should still find "goblin" with fuzzy matching
    });

    it('should support tags filtering', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?tags=humanoid`);
      const data = await response.json();

      expect(response.status).toBe(200);

      // All returned monsters should have "humanoid" in their type tags
      data.monsters.forEach((monster: any) => {
        const hasHumanoidTag = monster.tags.type?.includes('humanoid');
        expect(hasHumanoidTag).toBe(true);
      });
    });

    it('should support type filtering', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?type=official`);
      const data = await response.json();

      expect(response.status).toBe(200);

      // All returned monsters should be official
      data.monsters.forEach((monster: any) => {
        expect(monster.is_official).toBe(true);
      });
    });

    it('should support pagination with limit and offset', async () => {
      const page1 = await fetch(`${API_BASE}/api/monsters?limit=5&offset=0`);
      const page1Data = await page1.json();

      const page2 = await fetch(`${API_BASE}/api/monsters?limit=5&offset=5`);
      const page2Data = await page2.json();

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);

      expect(page1Data.monsters.length).toBeLessThanOrEqual(5);
      expect(page2Data.monsters.length).toBeLessThanOrEqual(5);

      // Pages should have different monsters (unless total < 10)
      if (page1Data.total > 5) {
        const page1Ids = page1Data.monsters.map((m: any) => m.id);
        const page2Ids = page2Data.monsters.map((m: any) => m.id);
        const overlap = page1Ids.filter((id: string) => page2Ids.includes(id));
        expect(overlap.length).toBe(0);
      }
    });

    it('should validate limit parameter constraints', async () => {
      // Limit too high should be capped at 100
      const response = await fetch(`${API_BASE}/api/monsters?limit=200`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.monsters.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid challenge level range', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?min_cl=25`);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 400 for invalid limit values', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?limit=-1`);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid offset values', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?offset=-1`);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid fuzziness values', async () => {
      const response = await fetch(`${API_BASE}/api/monsters?fuzziness=invalid`);

      expect(response.status).toBe(400);
    });
  });

  describe('Performance Requirements', () => {
    it('should respond within 500ms', async () => {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE}/api/monsters?limit=20`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(500);
    });

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE}/api/monsters?limit=100`);
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });

  describe('Security Requirements', () => {
    it('should not expose private monsters to unauthenticated users', async () => {
      const response = await fetch(`${API_BASE}/api/monsters`);
      const data = await response.json();

      expect(response.status).toBe(200);

      // All monsters should be either official or public custom monsters
      data.monsters.forEach((monster: any) => {
        if (!monster.is_official) {
          expect(monster.is_public).toBe(true);
        }
      });
    });

    it('should sanitize search queries to prevent injection', async () => {
      const maliciousQuery = "'; DROP TABLE monsters; --";
      const response = await fetch(`${API_BASE}/api/monsters?q=${encodeURIComponent(maliciousQuery)}`);

      // Should not crash the server
      expect(response.status).toBe(200);
    });
  });
});