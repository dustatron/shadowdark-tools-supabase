import { describe, it, expect, beforeAll } from 'vitest';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Integration tests for database performance and optimization
describe('Database Performance Integration Tests', () => {
  let supabase: any;

  beforeAll(async () => {
    supabase = createSupabaseServerClient();
  });

  describe('Search Performance', () => {
    it('should perform full-text search efficiently', async () => {
      const searchTerms = ['dragon', 'goblin', 'undead', 'humanoid', 'beast'];

      for (const term of searchTerms) {
        const startTime = Date.now();

        const searchResponse = await supabase
          .rpc('search_monsters', {
            search_query: term,
            min_level: 1,
            max_level: 10,
            monster_types: null,
            locations: null,
            sources: null,
            result_limit: 20,
            result_offset: 0
          });

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(searchResponse.error).toBeNull();
        expect(duration).toBeLessThan(500); // Should complete within 500ms

        // Verify search relevance
        if (searchResponse.data.length > 0) {
          searchResponse.data.forEach((monster: any) => {
            const searchableText = `${monster.name} ${monster.author_notes || ''}`.toLowerCase();
            expect(searchableText).toContain(term.toLowerCase());
          });
        }
      }
    });

    it('should handle complex filter combinations efficiently', async () => {
      const complexFilters = [
        {
          search_query: 'humanoid',
          min_level: 2,
          max_level: 6,
          monster_types: ['humanoid', 'beast'],
          locations: ['forest', 'mountain'],
          sources: ['Shadowdark Core']
        },
        {
          search_query: 'undead',
          min_level: 3,
          max_level: 8,
          monster_types: ['undead'],
          locations: ['cave', 'dungeon'],
          sources: ['Shadowdark Core']
        }
      ];

      for (const filters of complexFilters) {
        const startTime = Date.now();

        const searchResponse = await supabase
          .rpc('search_monsters', filters);

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(searchResponse.error).toBeNull();
        expect(duration).toBeLessThan(750); // Complex queries should still be fast

        // Verify all filters are applied correctly
        searchResponse.data.forEach((monster: any) => {
          expect(monster.challenge_level).toBeGreaterThanOrEqual(filters.min_level);
          expect(monster.challenge_level).toBeLessThanOrEqual(filters.max_level);

          if (filters.monster_types) {
            const hasMatchingType = filters.monster_types.some(type =>
              monster.tags.type.includes(type)
            );
            expect(hasMatchingType).toBe(true);
          }

          if (filters.locations) {
            const hasMatchingLocation = filters.locations.some(location =>
              monster.tags.location.includes(location) ||
              monster.tags.location.includes('any')
            );
            expect(hasMatchingLocation).toBe(true);
          }

          if (filters.sources) {
            expect(filters.sources).toContain(monster.source);
          }
        });
      }
    });

    it('should handle large result sets with pagination efficiently', async () => {
      const pageSize = 50;
      const totalPages = 5;

      for (let page = 0; page < totalPages; page++) {
        const startTime = Date.now();

        const searchResponse = await supabase
          .rpc('search_monsters', {
            search_query: '',
            min_level: 1,
            max_level: 10,
            monster_types: null,
            locations: null,
            sources: null,
            result_limit: pageSize,
            result_offset: page * pageSize
          });

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(searchResponse.error).toBeNull();
        expect(duration).toBeLessThan(300); // Pagination should be fast
        expect(searchResponse.data.length).toBeLessThanOrEqual(pageSize);
      }
    });
  });

  describe('Index Performance', () => {
    it('should utilize indexes for common query patterns', async () => {
      // Test queries that should use specific indexes
      const indexTestCases = [
        {
          description: 'Challenge level range queries',
          test: async () => {
            const response = await supabase
              .from('official_monsters')
              .select('*')
              .gte('challenge_level', 3)
              .lte('challenge_level', 7)
              .limit(10);
            return response;
          }
        },
        {
          description: 'Name prefix searches',
          test: async () => {
            const response = await supabase
              .from('official_monsters')
              .select('*')
              .ilike('name', 'G%')
              .limit(10);
            return response;
          }
        },
        {
          description: 'Source filtering',
          test: async () => {
            const response = await supabase
              .from('official_monsters')
              .select('*')
              .eq('source', 'Shadowdark Core')
              .limit(10);
            return response;
          }
        },
        {
          description: 'Tag-based filtering',
          test: async () => {
            const response = await supabase
              .from('official_monsters')
              .select('*')
              .contains('tags', { type: ['humanoid'] })
              .limit(10);
            return response;
          }
        }
      ];

      for (const testCase of indexTestCases) {
        const startTime = Date.now();
        const response = await testCase.test();
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(response.error).toBeNull();
        expect(duration).toBeLessThan(200); // Index-backed queries should be very fast
      }
    });

    it('should perform efficiently with concurrent read operations', async () => {
      // Simulate multiple concurrent read operations
      const concurrentQueries = Array.from({ length: 10 }, (_, i) =>
        supabase
          .from('official_monsters')
          .select('*')
          .eq('challenge_level', (i % 5) + 1)
          .limit(5)
      );

      const startTime = Date.now();
      const results = await Promise.all(concurrentQueries);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All queries should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
      });

      // Concurrent queries should complete reasonably quickly
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Database Function Performance', () => {
    it('should execute random monster generation efficiently', async () => {
      const testCases = [
        { count: 1, min_level: 1, max_level: 10 },
        { count: 5, min_level: 2, max_level: 6 },
        { count: 10, min_level: 1, max_level: 5 },
        { count: 20, min_level: 3, max_level: 8 }
      ];

      for (const testCase of testCases) {
        const startTime = Date.now();

        const response = await supabase
          .rpc('get_random_monsters', testCase);

        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(response.error).toBeNull();
        expect(response.data.length).toBeLessThanOrEqual(testCase.count);
        expect(duration).toBeLessThan(400); // Function should execute quickly

        // Verify results meet criteria
        response.data.forEach((monster: any) => {
          expect(monster.challenge_level).toBeGreaterThanOrEqual(testCase.min_level);
          expect(monster.challenge_level).toBeLessThanOrEqual(testCase.max_level);
        });
      }
    });

    it('should handle database statistics efficiently', async () => {
      const startTime = Date.now();

      const response = await supabase
        .rpc('get_database_stats');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.error).toBeNull();
      expect(duration).toBeLessThan(500); // Stats calculation should be fast

      // Verify expected statistics structure
      expect(response.data).toHaveProperty('total_official_monsters');
      expect(response.data).toHaveProperty('total_user_monsters');
      expect(response.data).toHaveProperty('total_lists');
      expect(response.data).toHaveProperty('total_encounters');
    });

    it('should update search statistics efficiently', async () => {
      const startTime = Date.now();

      const response = await supabase
        .rpc('update_search_statistics');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.error).toBeNull();
      expect(duration).toBeLessThan(300); // Statistics update should be fast
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should handle large JSON operations efficiently', async () => {
      // Test operations with large JSON data (attacks, abilities, tags)
      const largeJsonTests = [
        {
          description: 'Complex attacks JSON',
          test: async () => {
            const response = await supabase
              .from('official_monsters')
              .select('name, attacks')
              .not('attacks', 'eq', '[]')
              .limit(50);
            return response;
          }
        },
        {
          description: 'Complex abilities JSON',
          test: async () => {
            const response = await supabase
              .from('official_monsters')
              .select('name, abilities')
              .not('abilities', 'eq', '[]')
              .limit(50);
            return response;
          }
        },
        {
          description: 'Tag filtering operations',
          test: async () => {
            const response = await supabase
              .from('official_monsters')
              .select('name, tags')
              .contains('tags', { type: ['humanoid'] })
              .limit(30);
            return response;
          }
        }
      ];

      for (const test of largeJsonTests) {
        const startTime = Date.now();
        const response = await test.test();
        const endTime = Date.now();
        const duration = endTime - startTime;

        expect(response.error).toBeNull();
        expect(duration).toBeLessThan(400); // JSON operations should be efficient

        // Verify JSON data is properly parsed
        response.data.forEach((monster: any) => {
          if (monster.attacks) {
            expect(Array.isArray(monster.attacks)).toBe(true);
          }
          if (monster.abilities) {
            expect(Array.isArray(monster.abilities)).toBe(true);
          }
          if (monster.tags) {
            expect(typeof monster.tags).toBe('object');
          }
        });
      }
    });

    it('should maintain performance under sustained load', async () => {
      // Simulate sustained database operations
      const operations = [];

      // Mix of different operation types
      for (let i = 0; i < 20; i++) {
        if (i % 4 === 0) {
          operations.push(
            supabase.rpc('search_monsters', {
              search_query: 'test',
              min_level: 1,
              max_level: 5,
              monster_types: null,
              locations: null,
              sources: null,
              result_limit: 10,
              result_offset: 0
            })
          );
        } else if (i % 4 === 1) {
          operations.push(
            supabase.rpc('get_random_monsters', {
              monster_count: 3,
              min_level: 1,
              max_level: 10
            })
          );
        } else if (i % 4 === 2) {
          operations.push(
            supabase
              .from('official_monsters')
              .select('*')
              .eq('challenge_level', (i % 5) + 1)
              .limit(5)
          );
        } else {
          operations.push(
            supabase.rpc('get_database_stats')
          );
        }
      }

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All operations should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
      });

      // Sustained operations should complete within reasonable time
      expect(duration).toBeLessThan(3000);
    });
  });
});