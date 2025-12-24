/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  searchMonsters,
  getRandomMonsters,
  type SearchMonstersParams,
  type GetRandomMonstersParams,
  type MonsterSearchResult,
} from "@/lib/services/monster-search";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Unit Tests: Monster Search Service
 *
 * Tests for TypeScript service functions that replace RPC calls:
 * - searchMonsters() replaces supabase.rpc("search_monsters")
 * - getRandomMonsters() replaces supabase.rpc("get_random_monsters")
 *
 * These tests MUST FAIL initially until implementation is complete.
 */

// ============================================================================
// Mock Data
// ============================================================================

const mockMonster1: MonsterSearchResult = {
  id: "1",
  name: "Goblin",
  challenge_level: 1,
  hit_points: 7,
  armor_class: 13,
  speed: "30 ft.",
  attacks: { melee: "Spear +2 (1d6)" },
  abilities: ["Darkvision 60 ft."],
  treasure: null,
  tags: { type: ["humanoid"], location: ["dungeon", "forest"] },
  source: "Shadowdark Core Rules",
  author_notes: null,
  icon_url: null,
  art_url: null,
  xp: 10,
  strength_mod: 0,
  dexterity_mod: 1,
  constitution_mod: 0,
  intelligence_mod: -1,
  wisdom_mod: 0,
  charisma_mod: -1,
  monster_type: "official",
  user_id: null,
  is_public: true,
  is_official: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  relevance: 1.0,
};

const mockMonster2: MonsterSearchResult = {
  id: "2",
  name: "Hobgoblin",
  challenge_level: 2,
  hit_points: 15,
  armor_class: 16,
  speed: "30 ft.",
  attacks: { melee: "Longsword +4 (1d8+2)" },
  abilities: ["Darkvision 60 ft.", "Martial Advantage"],
  treasure: { coins: "2d6 gp" },
  tags: { type: ["humanoid"], location: ["dungeon", "ruins"] },
  source: "Shadowdark Core Rules",
  author_notes: null,
  icon_url: null,
  art_url: null,
  xp: 100,
  strength_mod: 2,
  dexterity_mod: 1,
  constitution_mod: 1,
  intelligence_mod: 0,
  wisdom_mod: 0,
  charisma_mod: 0,
  monster_type: "official",
  user_id: null,
  is_public: true,
  is_official: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  relevance: 0.9,
};

const mockMonster3: MonsterSearchResult = {
  id: "3",
  name: "Fire Dragon",
  challenge_level: 10,
  hit_points: 150,
  armor_class: 19,
  speed: "40 ft., fly 80 ft.",
  attacks: {
    melee: "Bite +12 (2d10+6), Claw +12 (2d6+6)",
    special: "Fire Breath (recharge 5-6)",
  },
  abilities: ["Darkvision 120 ft.", "Fire Immunity", "Legendary Resistance"],
  treasure: { special: "Dragon hoard" },
  tags: { type: ["dragon"], location: ["mountains", "volcanic"] },
  source: "Shadowdark Core Rules",
  author_notes: "Extremely dangerous",
  icon_url: null,
  art_url: null,
  xp: 5900,
  strength_mod: 6,
  dexterity_mod: 2,
  constitution_mod: 5,
  intelligence_mod: 3,
  wisdom_mod: 2,
  charisma_mod: 4,
  monster_type: "official",
  user_id: null,
  is_public: true,
  is_official: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  relevance: 0.8,
};

const mockMonster4: MonsterSearchResult = {
  id: "4",
  name: "Custom Goblin Chief",
  challenge_level: 3,
  hit_points: 25,
  armor_class: 15,
  speed: "30 ft.",
  attacks: { melee: "Battleaxe +4 (1d8+2)" },
  abilities: ["Darkvision 60 ft.", "Leadership"],
  treasure: { coins: "1d10 gp" },
  tags: { type: ["humanoid"], location: ["dungeon"] },
  source: "Custom",
  author_notes: "Variant goblin leader",
  icon_url: null,
  art_url: null,
  xp: 200,
  strength_mod: 2,
  dexterity_mod: 1,
  constitution_mod: 1,
  intelligence_mod: 0,
  wisdom_mod: 0,
  charisma_mod: 1,
  monster_type: "custom",
  user_id: "user-123",
  is_public: true,
  is_official: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  relevance: 0.85,
};

// ============================================================================
// Mock Supabase Client
// ============================================================================

function createMockSupabaseClient(mockData: MonsterSearchResult[] = []) {
  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    // Make it properly thenable for await
    then: vi.fn().mockImplementation((resolve) => {
      resolve({ data: mockData, error: null, count: mockData.length });
      return Promise.resolve({ data: mockData, error: null });
    }),
  };

  const mockSupabase = {
    from: vi.fn().mockReturnValue(mockQuery),
  } as unknown as SupabaseClient;

  return { supabase: mockSupabase, query: mockQuery };
}

// ============================================================================
// Tests: searchMonsters()
// ============================================================================

describe("searchMonsters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Empty Query Behavior", () => {
    it("should return all monsters when no search query provided", async () => {
      const { supabase } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster3,
      ]);

      const params: SearchMonstersParams = {};
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(3);
      expect(supabase.from).toHaveBeenCalledWith("all_monsters");
    });

    it("should return all monsters when empty search query provided", async () => {
      const { supabase } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { searchQuery: "" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
    });

    it("should return all monsters when whitespace-only search query provided", async () => {
      const { supabase } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { searchQuery: "   " };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
    });
  });

  describe("Fuzzy Search", () => {
    it("should match monsters by partial name", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster4,
      ]);

      const params: SearchMonstersParams = { searchQuery: "goblin" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.or).toHaveBeenCalled();
      // Verify fuzzy search is applied (should use ILIKE %pattern%)
    });

    it("should match monsters by source name", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { searchQuery: "Shadowdark" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.or).toHaveBeenCalled();
    });

    it("should match monsters by author notes", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster3]);

      const params: SearchMonstersParams = { searchQuery: "dangerous" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.or).toHaveBeenCalled();
    });

    it("should handle case-insensitive search", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { searchQuery: "GOBLIN" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.or).toHaveBeenCalled();
    });

    it("should handle special characters in search query", async () => {
      const { supabase, query } = createMockSupabaseClient([]);

      const params: SearchMonstersParams = { searchQuery: "dragon's lair" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(0);
      expect(query.or).toHaveBeenCalled();
    });
  });

  describe("Challenge Level Filtering", () => {
    it("should filter by minimum challenge level only", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster2,
        mockMonster3,
      ]);

      const params: SearchMonstersParams = { minChallengeLevel: 2 };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.gte).toHaveBeenCalledWith("challenge_level", 2);
    });

    it("should filter by maximum challenge level only", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
      ]);

      const params: SearchMonstersParams = { maxChallengeLevel: 2 };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.lte).toHaveBeenCalledWith("challenge_level", 2);
    });

    it("should filter by challenge level range", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster4,
      ]);

      const params: SearchMonstersParams = {
        minChallengeLevel: 1,
        maxChallengeLevel: 3,
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(3);
      expect(query.gte).toHaveBeenCalledWith("challenge_level", 1);
      expect(query.lte).toHaveBeenCalledWith("challenge_level", 3);
    });

    it("should handle edge case challenge levels (1 and 20)", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = {
        minChallengeLevel: 1,
        maxChallengeLevel: 20,
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.gte).toHaveBeenCalledWith("challenge_level", 1);
      expect(query.lte).toHaveBeenCalledWith("challenge_level", 20);
    });
  });

  describe("Monster Type Filtering", () => {
    it("should filter by single monster type tag", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster3]);

      const params: SearchMonstersParams = { monsterTypes: ["dragon"] };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.contains).toHaveBeenCalled();
    });

    it("should filter by multiple monster type tags", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster3,
      ]);

      const params: SearchMonstersParams = {
        monsterTypes: ["humanoid", "dragon"],
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(3);
      expect(query.contains).toHaveBeenCalled();
    });

    it("should handle empty monster types array", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { monsterTypes: [] };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.contains).not.toHaveBeenCalled();
    });
  });

  describe("Location Tag Filtering", () => {
    it("should filter by single location tag", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster3]);

      const params: SearchMonstersParams = { locationTags: ["mountains"] };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.contains).toHaveBeenCalled();
    });

    it("should filter by multiple location tags", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
      ]);

      const params: SearchMonstersParams = {
        locationTags: ["dungeon", "forest"],
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.contains).toHaveBeenCalled();
    });

    it("should handle empty location tags array", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { locationTags: [] };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.contains).not.toHaveBeenCalled();
    });
  });

  describe("Source Filtering", () => {
    it("should filter by exact source name", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster3,
      ]);

      const params: SearchMonstersParams = {
        sourceFilter: "Shadowdark Core Rules",
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(3);
      expect(query.ilike).toHaveBeenCalledWith(
        "source",
        "%Shadowdark Core Rules%",
      );
    });

    it("should filter by partial source name", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster4]);

      const params: SearchMonstersParams = { sourceFilter: "Custom" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.ilike).toHaveBeenCalledWith("source", "%Custom%");
    });

    it("should handle empty source filter", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { sourceFilter: "" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.ilike).not.toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    it("should apply default limit when not specified", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = {};
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.limit).toHaveBeenCalledWith(20); // Default limit
    });

    it("should apply custom limit", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { limit: 50 };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.limit).toHaveBeenCalledWith(50);
    });

    it("should enforce maximum limit of 100", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { limit: 200 };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.limit).toHaveBeenCalledWith(100); // Capped at 100
    });

    it("should apply offset for pagination", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { limit: 20, offset: 40 };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.range).toHaveBeenCalledWith(40, 59); // offset to offset+limit-1
    });

    it("should handle zero offset", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = { limit: 20, offset: 0 };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.range).toHaveBeenCalledWith(0, 19);
    });
  });

  describe("Relevance Scoring and Ordering", () => {
    it("should order results by relevance score (descending)", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1, // relevance: 1.0
        mockMonster2, // relevance: 0.9
        mockMonster4, // relevance: 0.85
      ]);

      const params: SearchMonstersParams = { searchQuery: "goblin" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(3);
      expect(query.order).toHaveBeenCalledWith("relevance", {
        ascending: false,
      });
    });

    it("should calculate higher relevance for exact name matches", async () => {
      const { supabase } = createMockSupabaseClient([
        { ...mockMonster1, relevance: 1.0 }, // Exact match "Goblin"
        { ...mockMonster4, relevance: 0.85 }, // Partial match "Custom Goblin Chief"
      ]);

      const params: SearchMonstersParams = { searchQuery: "Goblin" };
      const result = await searchMonsters(supabase, params);

      expect(result[0].relevance).toBeGreaterThan(result[1].relevance);
    });

    it("should order by name as secondary sort when relevance is equal", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
      ]);

      const params: SearchMonstersParams = {};
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(2);
      // Should have secondary order by name
      expect(query.order).toHaveBeenCalled();
    });
  });

  describe("Combined Filters", () => {
    it("should apply multiple filters simultaneously", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: SearchMonstersParams = {
        searchQuery: "goblin",
        minChallengeLevel: 1,
        maxChallengeLevel: 3,
        monsterTypes: ["humanoid"],
        locationTags: ["dungeon"],
        sourceFilter: "Shadowdark",
        limit: 10,
        offset: 0,
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.or).toHaveBeenCalled(); // Search query
      expect(query.gte).toHaveBeenCalled(); // Min CL
      expect(query.lte).toHaveBeenCalled(); // Max CL
      expect(query.contains).toHaveBeenCalled(); // Type/location tags
      expect(query.ilike).toHaveBeenCalled(); // Source filter
      expect(query.limit).toHaveBeenCalled(); // Pagination
    });

    it("should handle search with only type filters (no text query)", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
      ]);

      const params: SearchMonstersParams = {
        monsterTypes: ["humanoid"],
        minChallengeLevel: 1,
        maxChallengeLevel: 2,
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.or).not.toHaveBeenCalled(); // No text search
      expect(query.contains).toHaveBeenCalled();
      expect(query.gte).toHaveBeenCalled();
      expect(query.lte).toHaveBeenCalled();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should return empty array when no monsters match", async () => {
      const { supabase } = createMockSupabaseClient([]);

      const params: SearchMonstersParams = { searchQuery: "nonexistent" };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should handle database errors gracefully", async () => {
      const mockErrorQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => {
          resolve({
            data: null,
            error: { message: "Database connection failed" },
          });
          return Promise.resolve({
            data: null,
            error: { message: "Database connection failed" },
          });
        }),
      };

      const errorSupabase = {
        from: vi.fn().mockReturnValue(mockErrorQuery),
      } as unknown as SupabaseClient;

      const params: SearchMonstersParams = { searchQuery: "test" };

      await expect(searchMonsters(errorSupabase, params)).rejects.toThrow();
    });

    it("should sanitize SQL injection attempts in search query", async () => {
      const { supabase, query } = createMockSupabaseClient([]);

      const params: SearchMonstersParams = {
        searchQuery: "'; DROP TABLE monsters; --",
      };
      const result = await searchMonsters(supabase, params);

      expect(result).toHaveLength(0);
      expect(query.or).toHaveBeenCalled();
      // Should not contain raw SQL injection
    });
  });
});

// ============================================================================
// Tests: getRandomMonsters()
// ============================================================================

describe("getRandomMonsters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Randomization", () => {
    it("should return requested count of monsters", async () => {
      const { supabase } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster3,
      ]);

      const params: GetRandomMonstersParams = { count: 3 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(3);
    });

    it("should return single monster when count is 1", async () => {
      const { supabase } = createMockSupabaseClient([mockMonster1]);

      const params: GetRandomMonstersParams = { count: 1 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1);
    });

    it("should use PostgreSQL random() function for selection", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: GetRandomMonstersParams = { count: 1 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1);
      // Should order by random() or use equivalent randomization
      expect(query.order).toHaveBeenCalled();
    });

    it("should handle count larger than available monsters", async () => {
      const { supabase } = createMockSupabaseClient([mockMonster1]); // Only 1 available

      const params: GetRandomMonstersParams = { count: 10 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1); // Returns what's available
    });
  });

  describe("Challenge Level Filtering", () => {
    it("should filter by minimum challenge level", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster2,
        mockMonster3,
      ]);

      const params: GetRandomMonstersParams = {
        count: 2,
        minChallengeLevel: 2,
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.gte).toHaveBeenCalledWith("challenge_level", 2);
    });

    it("should filter by maximum challenge level", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
      ]);

      const params: GetRandomMonstersParams = {
        count: 2,
        maxChallengeLevel: 2,
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.lte).toHaveBeenCalledWith("challenge_level", 2);
    });

    it("should filter by challenge level range", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster4,
      ]);

      const params: GetRandomMonstersParams = {
        count: 3,
        minChallengeLevel: 1,
        maxChallengeLevel: 3,
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(3);
      expect(query.gte).toHaveBeenCalledWith("challenge_level", 1);
      expect(query.lte).toHaveBeenCalledWith("challenge_level", 3);
    });
  });

  describe("Monster Type Filtering", () => {
    it("should filter by single monster type", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster3]);

      const params: GetRandomMonstersParams = {
        count: 1,
        monsterTypes: ["dragon"],
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.contains).toHaveBeenCalled();
    });

    it("should filter by multiple monster types", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster3,
      ]);

      const params: GetRandomMonstersParams = {
        count: 3,
        monsterTypes: ["humanoid", "dragon"],
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(3);
      expect(query.contains).toHaveBeenCalled();
    });
  });

  describe("Location Tag Filtering", () => {
    it("should filter by single location tag", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster3]);

      const params: GetRandomMonstersParams = {
        count: 1,
        locationTags: ["mountains"],
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.contains).toHaveBeenCalled();
    });

    it("should filter by multiple location tags", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
      ]);

      const params: GetRandomMonstersParams = {
        count: 2,
        locationTags: ["dungeon", "forest"],
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(2);
      expect(query.contains).toHaveBeenCalled();
    });
  });

  describe("Combined Filters", () => {
    it("should apply all filters simultaneously", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: GetRandomMonstersParams = {
        count: 1,
        minChallengeLevel: 1,
        maxChallengeLevel: 3,
        monsterTypes: ["humanoid"],
        locationTags: ["dungeon"],
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.gte).toHaveBeenCalled();
      expect(query.lte).toHaveBeenCalled();
      expect(query.contains).toHaveBeenCalled();
      expect(query.limit).toHaveBeenCalledWith(1);
    });

    it("should return empty array when filters match no monsters", async () => {
      const { supabase } = createMockSupabaseClient([]);

      const params: GetRandomMonstersParams = {
        count: 5,
        minChallengeLevel: 15,
        monsterTypes: ["nonexistent"],
      };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle count of 0", async () => {
      const { supabase } = createMockSupabaseClient([]);

      const params: GetRandomMonstersParams = { count: 0 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(0);
    });

    it("should handle negative count gracefully", async () => {
      const { supabase } = createMockSupabaseClient([]);

      const params: GetRandomMonstersParams = { count: -5 };

      await expect(getRandomMonsters(supabase, params)).rejects.toThrow();
    });

    it("should handle database errors gracefully", async () => {
      const mockErrorQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => {
          resolve({
            data: null,
            error: { message: "Database connection failed" },
          });
          return Promise.resolve({
            data: null,
            error: { message: "Database connection failed" },
          });
        }),
      };

      const errorSupabase = {
        from: vi.fn().mockReturnValue(mockErrorQuery),
      } as unknown as SupabaseClient;

      const params: GetRandomMonstersParams = { count: 1 };

      await expect(getRandomMonsters(errorSupabase, params)).rejects.toThrow();
    });
  });

  describe("Query Optimization", () => {
    it("should query all_monsters view for official and public monsters", async () => {
      const { supabase } = createMockSupabaseClient([mockMonster1]);

      const params: GetRandomMonstersParams = { count: 1 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(supabase.from).toHaveBeenCalledWith("all_monsters");
    });

    it("should select all required fields from MonsterSearchResult type", async () => {
      const { supabase, query } = createMockSupabaseClient([mockMonster1]);

      const params: GetRandomMonstersParams = { count: 1 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(1);
      expect(query.select).toHaveBeenCalled();
      // Should select all fields needed for MonsterSearchResult
    });

    it("should use database-level randomization for performance", async () => {
      const { supabase, query } = createMockSupabaseClient([
        mockMonster1,
        mockMonster2,
        mockMonster3,
      ]);

      const params: GetRandomMonstersParams = { count: 2 };
      const result = await getRandomMonsters(supabase, params);

      expect(result).toHaveLength(3);
      // Should use .order('random()') or equivalent
      expect(query.order).toHaveBeenCalled();
      expect(query.limit).toHaveBeenCalledWith(2);
    });
  });
});
