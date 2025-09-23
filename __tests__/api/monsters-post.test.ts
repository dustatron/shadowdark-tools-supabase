import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Contract Test: POST /api/monsters
 *
 * Tests the custom monster creation API endpoint according to the OpenAPI specification.
 * This test MUST FAIL initially as the endpoint is not yet implemented.
 *
 * Contract Requirements:
 * - POST /api/monsters
 * - Requires authentication (bearerAuth)
 * - Request body: CreateMonsterRequest schema
 * - Returns: Monster schema (201), ValidationError (400), Unauthorized (401)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

// Mock auth token for testing (in real tests, this would be from test setup)
const MOCK_AUTH_TOKEN = 'mock-jwt-token';
const INVALID_AUTH_TOKEN = 'invalid-token';

describe('POST /api/monsters - Contract Tests', () => {
  const validMonsterData = {
    name: 'Test Orc Warrior',
    challenge_level: 2,
    hit_points: 15,
    armor_class: 13,
    speed: '30 ft',
    source: 'Custom Test',
    attacks: [
      {
        name: 'Scimitar',
        type: 'melee',
        damage: '1d6+3',
        range: '5 ft',
        description: 'Slashing damage'
      }
    ],
    abilities: [
      {
        name: 'Aggressive',
        description: 'Can move up to speed toward an enemy as bonus action'
      }
    ],
    tags: {
      type: ['humanoid'],
      location: ['mountain', 'wasteland']
    },
    author_notes: 'A test monster for validation',
    is_public: false
  };

  beforeAll(async () => {
    // These tests assume the Next.js dev server is running
    // In real implementation, we'd set up test database and auth
  });

  afterAll(async () => {
    // Cleanup test data if needed
  });

  describe('Authentication Requirements', () => {
    it('should return 401 when no authentication token is provided', async () => {
      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validMonsterData),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('unauthorized');
    });

    it('should return 401 when invalid authentication token is provided', async () => {
      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${INVALID_AUTH_TOKEN}`,
        },
        body: JSON.stringify(validMonsterData),
      });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('Successful Monster Creation', () => {
    it('should create a custom monster with valid data and authentication', async () => {
      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(validMonsterData),
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('content-type')).toContain('application/json');

      const data = await response.json();

      // Validate returned Monster schema
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name', validMonsterData.name);
      expect(data).toHaveProperty('challenge_level', validMonsterData.challenge_level);
      expect(data).toHaveProperty('hit_points', validMonsterData.hit_points);
      expect(data).toHaveProperty('armor_class', validMonsterData.armor_class);
      expect(data).toHaveProperty('speed', validMonsterData.speed);
      expect(data).toHaveProperty('attacks');
      expect(data).toHaveProperty('abilities');
      expect(data).toHaveProperty('tags');
      expect(data).toHaveProperty('source', validMonsterData.source);
      expect(data).toHaveProperty('author_notes', validMonsterData.author_notes);
      expect(data).toHaveProperty('is_public', validMonsterData.is_public);
      expect(data).toHaveProperty('is_official', false);
      expect(data).toHaveProperty('user_id');
      expect(data).toHaveProperty('created_at');
      expect(data).toHaveProperty('updated_at');

      // Validate field types and constraints
      expect(typeof data.id).toBe('string');
      expect(data.challenge_level).toBeGreaterThanOrEqual(1);
      expect(data.challenge_level).toBeLessThanOrEqual(20);
      expect(data.hit_points).toBeGreaterThanOrEqual(1);
      expect(data.armor_class).toBeGreaterThanOrEqual(1);
      expect(data.armor_class).toBeLessThanOrEqual(21);

      // Validate XP calculation (CL * 25)
      expect(data.xp).toBe(validMonsterData.challenge_level * 25);

      // Validate arrays
      expect(Array.isArray(data.attacks)).toBe(true);
      expect(Array.isArray(data.abilities)).toBe(true);
      expect(data.attacks.length).toBe(1);
      expect(data.abilities.length).toBe(1);

      // Validate attack structure
      const attack = data.attacks[0];
      expect(attack).toHaveProperty('name');
      expect(attack).toHaveProperty('type');
      expect(attack).toHaveProperty('damage');
      expect(attack).toHaveProperty('range');

      // Validate ability structure
      const ability = data.abilities[0];
      expect(ability).toHaveProperty('name');
      expect(ability).toHaveProperty('description');

      // Validate tags structure
      expect(data.tags).toHaveProperty('type');
      expect(data.tags).toHaveProperty('location');
      expect(Array.isArray(data.tags.type)).toBe(true);
      expect(Array.isArray(data.tags.location)).toBe(true);
    });

    it('should create a public monster when is_public is true', async () => {
      const publicMonsterData = {
        ...validMonsterData,
        name: 'Test Public Goblin',
        is_public: true
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(publicMonsterData),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.is_public).toBe(true);
      expect(data.name).toBe('Test Public Goblin');
    });

    it('should default is_public to false when not specified', async () => {
      const { is_public, ...monsterWithoutPublicFlag } = validMonsterData;

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(monsterWithoutPublicFlag),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.is_public).toBe(false);
    });
  });

  describe('Validation Requirements', () => {
    it('should return 400 when required fields are missing', async () => {
      const invalidData = {
        // Missing required fields: name, challenge_level, hit_points, armor_class, speed, source
        attacks: [],
        abilities: []
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('validation');
    });

    it('should return 400 when name is too long', async () => {
      const invalidData = {
        ...validMonsterData,
        name: 'A'.repeat(101) // Exceeds 100 character limit
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 400 when challenge_level is out of range', async () => {
      const invalidData = {
        ...validMonsterData,
        challenge_level: 25 // Exceeds maximum of 20
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const invalidDataLow = {
        ...validMonsterData,
        challenge_level: 0 // Below minimum of 1
      };

      const response2 = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidDataLow),
      });

      expect(response2.status).toBe(400);
    });

    it('should return 400 when hit_points is invalid', async () => {
      const invalidData = {
        ...validMonsterData,
        hit_points: 0 // Below minimum of 1
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when armor_class is out of range', async () => {
      const invalidDataHigh = {
        ...validMonsterData,
        armor_class: 22 // Exceeds maximum of 21
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidDataHigh),
      });

      expect(response.status).toBe(400);

      const invalidDataLow = {
        ...validMonsterData,
        armor_class: 0 // Below minimum of 1
      };

      const response2 = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidDataLow),
      });

      expect(response2.status).toBe(400);
    });

    it('should return 400 when attack structure is invalid', async () => {
      const invalidData = {
        ...validMonsterData,
        attacks: [
          {
            // Missing required fields: name, type, damage
            range: '5 ft'
          }
        ]
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 when ability structure is invalid', async () => {
      const invalidData = {
        ...validMonsterData,
        abilities: [
          {
            // Missing required field: description
            name: 'Test Ability'
          }
        ]
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Content Security', () => {
    it('should sanitize input to prevent XSS attacks', async () => {
      const maliciousData = {
        ...validMonsterData,
        name: '<script>alert("xss")</script>',
        author_notes: '<img src="x" onerror="alert(1)">'
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(maliciousData),
      });

      if (response.status === 201) {
        const data = await response.json();
        // Script tags should be sanitized or escaped
        expect(data.name).not.toContain('<script>');
        expect(data.author_notes).not.toContain('<img');
      } else {
        // Or the request should be rejected
        expect(response.status).toBe(400);
      }
    });

    it('should enforce reasonable limits on text fields', async () => {
      const oversizedData = {
        ...validMonsterData,
        author_notes: 'A'.repeat(10000) // Very long description
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(oversizedData),
      });

      // Should either be accepted with truncation or rejected
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty attacks array', async () => {
      const dataWithEmptyAttacks = {
        ...validMonsterData,
        attacks: []
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(dataWithEmptyAttacks),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(Array.isArray(data.attacks)).toBe(true);
      expect(data.attacks.length).toBe(0);
    });

    it('should handle empty abilities array', async () => {
      const dataWithEmptyAbilities = {
        ...validMonsterData,
        abilities: []
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(dataWithEmptyAbilities),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(Array.isArray(data.abilities)).toBe(true);
      expect(data.abilities.length).toBe(0);
    });

    it('should handle null treasure data', async () => {
      const dataWithNullTreasure = {
        ...validMonsterData,
        treasure: null
      };

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(dataWithNullTreasure),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.treasure).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    it('should create monster within reasonable time', async () => {
      const startTime = Date.now();

      const response = await fetch(`${API_BASE}/api/monsters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MOCK_AUTH_TOKEN}`,
        },
        body: JSON.stringify(validMonsterData),
      });

      const endTime = Date.now();

      expect(response.status).toBe(201);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});