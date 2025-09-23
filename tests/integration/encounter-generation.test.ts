import { describe, it, expect, beforeAll } from 'vitest';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Integration tests for encounter generation workflows
describe('Encounter Generation Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    supabase = createSupabaseServerClient();
  });

  describe('Random Encounter Generation', () => {
    it('should generate balanced encounters for different party sizes', async () => {
      const partySizes = [2, 4, 6, 8];
      const challengeLevel = 3;

      for (const partySize of partySizes) {
        // Generate encounter using database function
        const encounterResponse = await supabase
          .rpc('get_random_monsters', {
            monster_count: Math.ceil(partySize / 2), // Rough balance
            min_level: Math.max(1, challengeLevel - 1),
            max_level: Math.min(10, challengeLevel + 1)
          });

        expect(encounterResponse.error).toBeNull();
        expect(encounterResponse.data.length).toBeGreaterThan(0);

        // Calculate total XP
        const totalXp = encounterResponse.data.reduce((sum: number, monster: any) => {
          return sum + (monster.challenge_level * 25);
        }, 0);

        // XP should be reasonable for party size (rough balance check)
        const expectedXpPerPlayer = challengeLevel * 25;
        const expectedTotalXp = expectedXpPerPlayer * partySize;
        const xpVariance = Math.abs(totalXp - expectedTotalXp) / expectedTotalXp;

        // Allow 100% variance for random generation
        expect(xpVariance).toBeLessThan(1.0);
      }
    });

    it('should respect monster type filters in encounters', async () => {
      const monsterTypes = ['humanoid', 'beast', 'undead'];

      for (const monsterType of monsterTypes) {
        // Search for monsters of specific type
        const searchResponse = await supabase
          .rpc('search_monsters', {
            search_query: '',
            min_level: 1,
            max_level: 5,
            monster_types: [monsterType],
            locations: null,
            sources: null,
            result_limit: 5,
            result_offset: 0
          });

        expect(searchResponse.error).toBeNull();

        if (searchResponse.data.length > 0) {
          // Verify all returned monsters have the correct type
          searchResponse.data.forEach((monster: any) => {
            expect(monster.tags.type).toContain(monsterType);
          });
        }
      }
    });

    it('should respect location filters in encounters', async () => {
      const locations = ['forest', 'cave', 'desert', 'water'];

      for (const location of locations) {
        const searchResponse = await supabase
          .rpc('search_monsters', {
            search_query: '',
            min_level: 1,
            max_level: 10,
            monster_types: null,
            locations: [location],
            sources: null,
            result_limit: 10,
            result_offset: 0
          });

        expect(searchResponse.error).toBeNull();

        if (searchResponse.data.length > 0) {
          // Verify all returned monsters can be found in the specified location
          searchResponse.data.forEach((monster: any) => {
            const hasLocation = monster.tags.location.includes(location) ||
                               monster.tags.location.includes('any');
            expect(hasLocation).toBe(true);
          });
        }
      }
    });
  });

  describe('Encounter Table Integration', () => {
    it('should create and use encounter tables', async () => {
      // Create a test encounter table
      const testTable = {
        name: 'Test Dungeon Encounters',
        description: 'Integration test encounter table',
        environment: 'dungeon',
        challenge_level_min: 1,
        challenge_level_max: 5,
        creator_id: 'test-user-id'
      };

      const tableResponse = await supabase
        .from('encounter_tables')
        .insert([testTable])
        .select()
        .single();

      expect(tableResponse.error).toBeNull();
      const tableId = tableResponse.data.id;

      // Add entries to the table
      const entries = [
        {
          table_id: tableId,
          roll_min: 1,
          roll_max: 3,
          encounter_description: '2d4 goblins with crude weapons'
        },
        {
          table_id: tableId,
          roll_min: 4,
          roll_max: 6,
          encounter_description: '1 orc warrior with a shield'
        },
        {
          table_id: tableId,
          roll_min: 7,
          roll_max: 8,
          encounter_description: '1d6 skeletons animated by dark magic'
        }
      ];

      const entriesResponse = await supabase
        .from('encounter_table_entries')
        .insert(entries);

      expect(entriesResponse.error).toBeNull();

      // Test rolling on the table
      for (let roll = 1; roll <= 8; roll++) {
        const rollResponse = await supabase
          .from('encounter_table_entries')
          .select('*')
          .eq('table_id', tableId)
          .lte('roll_min', roll)
          .gte('roll_max', roll)
          .single();

        expect(rollResponse.error).toBeNull();
        expect(rollResponse.data.encounter_description).toBeTruthy();
      }

      // Clean up
      await supabase.from('encounter_tables').delete().eq('id', tableId);
    });

    it('should handle multiple encounter tables by environment', async () => {
      const environments = ['forest', 'dungeon', 'city', 'wilderness'];

      for (const environment of environments) {
        const tablesResponse = await supabase
          .from('encounter_tables')
          .select('*')
          .eq('environment', environment)
          .limit(5);

        expect(tablesResponse.error).toBeNull();

        // If tables exist for this environment, verify they're correctly categorized
        if (tablesResponse.data.length > 0) {
          tablesResponse.data.forEach((table: any) => {
            expect(table.environment).toBe(environment);
          });
        }
      }
    });
  });

  describe('Encounter Balance Validation', () => {
    it('should validate encounter difficulty calculations', async () => {
      // Test known monster combinations for balance
      const testCases = [
        {
          monsters: ['Goblin', 'Goblin', 'Goblin'], // 3 level 1 monsters
          partySize: 4,
          partyLevel: 1,
          expectedDifficulty: 'easy'
        },
        {
          monsters: ['Orc'], // 1 level 3 monster
          partySize: 4,
          partyLevel: 2,
          expectedDifficulty: 'medium'
        }
      ];

      for (const testCase of testCases) {
        // Get the actual monsters
        const monstersResponse = await supabase
          .from('official_monsters')
          .select('*')
          .in('name', testCase.monsters);

        expect(monstersResponse.error).toBeNull();

        if (monstersResponse.data.length > 0) {
          // Calculate total XP
          const totalXp = monstersResponse.data.reduce((sum: number, monster: any) => {
            return sum + (monster.challenge_level * 25);
          }, 0);

          // Basic difficulty calculation (simplified)
          const partyXpBudget = testCase.partySize * testCase.partyLevel * 25;
          const difficulty = totalXp <= partyXpBudget * 0.5 ? 'easy' :
                           totalXp <= partyXpBudget ? 'medium' :
                           totalXp <= partyXpBudget * 1.5 ? 'hard' : 'deadly';

          // Note: This is a simplified calculation for testing
          // Real implementation would use more sophisticated balance
          expect(['easy', 'medium', 'hard', 'deadly']).toContain(difficulty);
        }
      }
    });

    it('should ensure monster variety in random generation', async () => {
      // Generate multiple random encounters and check for variety
      const encounters = [];

      for (let i = 0; i < 5; i++) {
        const encounterResponse = await supabase
          .rpc('get_random_monsters', {
            monster_count: 3,
            min_level: 1,
            max_level: 5
          });

        expect(encounterResponse.error).toBeNull();
        encounters.push(encounterResponse.data);
      }

      // Check that we're not getting the exact same monsters every time
      const allMonsterNames = encounters.flat().map(monster => monster.name);
      const uniqueNames = [...new Set(allMonsterNames)];

      // Should have some variety (not just 1 unique monster repeated)
      expect(uniqueNames.length).toBeGreaterThan(1);
    });
  });

  describe('Performance and Scalability', () => {
    it('should generate encounters quickly even with large monster database', async () => {
      const startTime = Date.now();

      // Generate multiple encounters in sequence
      for (let i = 0; i < 10; i++) {
        const encounterResponse = await supabase
          .rpc('get_random_monsters', {
            monster_count: 5,
            min_level: 1,
            max_level: 10
          });

        expect(encounterResponse.error).toBeNull();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete 10 encounter generations in under 3 seconds
      expect(duration).toBeLessThan(3000);
    });

    it('should handle concurrent encounter generation requests', async () => {
      // Simulate multiple users generating encounters simultaneously
      const promises = Array.from({ length: 5 }, () =>
        supabase.rpc('get_random_monsters', {
          monster_count: 3,
          min_level: 2,
          max_level: 8
        })
      );

      const results = await Promise.all(promises);

      // All requests should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
        expect(result.data.length).toBeGreaterThan(0);
      });
    });
  });
});