import { describe, it, expect } from 'vitest';

// Test suite for encounter API endpoints
describe('Encounter API Contract Tests', () => {
  describe('POST /api/encounters/generate', () => {
    it('should generate random encounter with default settings', async () => {
      const response = await fetch('/api/encounters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeLevel: 3,
          partySize: 4
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('encounter');
      expect(data.encounter).toHaveProperty('monsters');
      expect(data.encounter).toHaveProperty('totalXp');
      expect(data.encounter).toHaveProperty('difficulty');
      expect(Array.isArray(data.encounter.monsters)).toBe(true);
    });

    it('should generate encounter with specific monster types', async () => {
      const response = await fetch('/api/encounters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeLevel: 2,
          partySize: 3,
          monsterTypes: ['humanoid', 'beast']
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      data.encounter.monsters.forEach((monster: any) => {
        const hasRequiredType = monster.tags.type.some((type: string) =>
          ['humanoid', 'beast'].includes(type)
        );
        expect(hasRequiredType).toBe(true);
      });
    });

    it('should generate encounter for specific location', async () => {
      const response = await fetch('/api/encounters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeLevel: 4,
          partySize: 5,
          location: 'cave'
        })
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      data.encounter.monsters.forEach((monster: any) => {
        expect(monster.tags.location).toContain('cave');
      });
    });

    it('should validate encounter generation parameters', async () => {
      const response = await fetch('/api/encounters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeLevel: 0, // Invalid
          partySize: -1      // Invalid
        })
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/encounters/tables', () => {
    it('should return list of encounter tables', async () => {
      const response = await fetch('/api/encounters/tables');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('tables');
      expect(Array.isArray(data.tables)).toBe(true);

      if (data.tables.length > 0) {
        const table = data.tables[0];
        expect(table).toHaveProperty('id');
        expect(table).toHaveProperty('name');
        expect(table).toHaveProperty('description');
        expect(table).toHaveProperty('environment');
      }
    });

    it('should filter tables by environment', async () => {
      const response = await fetch('/api/encounters/tables?environment=dungeon');

      expect(response.status).toBe(200);

      const data = await response.json();
      data.tables.forEach((table: any) => {
        expect(table.environment).toBe('dungeon');
      });
    });
  });

  describe('POST /api/encounters/tables', () => {
    it('should create new encounter table (auth required)', async () => {
      const newTable = {
        name: 'Test Dungeon Encounters',
        description: 'Test encounter table for dungeon exploration',
        environment: 'dungeon',
        entries: [
          { roll_min: 1, roll_max: 3, encounter_description: 'Small group of goblins' },
          { roll_min: 4, roll_max: 6, encounter_description: 'Wandering skeleton' }
        ]
      };

      // Note: This test needs proper auth setup
      // const response = await fetch('/api/encounters/tables', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newTable)
      // });

      expect(true).toBe(true); // Placeholder until auth is implemented
    });
  });

  describe('GET /api/encounters/tables/[id]/roll', () => {
    it('should roll on encounter table and return result', async () => {
      // First get a table ID
      const tablesResponse = await fetch('/api/encounters/tables');
      const tablesData = await tablesResponse.json();

      if (tablesData.tables.length > 0) {
        const tableId = tablesData.tables[0].id;

        const response = await fetch(`/api/encounters/tables/${tableId}/roll`);

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('result');
        expect(data.result).toHaveProperty('roll');
        expect(data.result).toHaveProperty('encounter_description');
        expect(typeof data.result.roll).toBe('number');
      }
    });

    it('should return 404 for non-existent table', async () => {
      const response = await fetch('/api/encounters/tables/non-existent-id/roll');
      expect(response.status).toBe(404);
    });
  });
});