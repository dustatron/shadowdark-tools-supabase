import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  searchAllContent,
  UnifiedSearchParams,
  UnifiedSearchResult,
} from "@/lib/services/unified-search";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client
const createMockSupabaseClient = () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockIlike = vi.fn();
  const mockEq = vi.fn();
  const mockIn = vi.fn();
  const mockOrder = vi.fn();
  const mockLimit = vi.fn();

  // Chain the methods
  mockLimit.mockReturnValue({ data: [], error: null });
  mockOrder.mockReturnValue({ limit: mockLimit });
  mockIn.mockReturnValue({ order: mockOrder });
  mockEq.mockReturnValue({ order: mockOrder });
  mockIlike.mockReturnValue({ eq: mockEq, in: mockIn, order: mockOrder });
  mockSelect.mockReturnValue({
    ilike: mockIlike,
    eq: mockEq,
    order: mockOrder,
  });
  mockFrom.mockReturnValue({ select: mockSelect });

  return {
    from: mockFrom,
    _mocks: {
      from: mockFrom,
      select: mockSelect,
      ilike: mockIlike,
      eq: mockEq,
      in: mockIn,
      order: mockOrder,
      limit: mockLimit,
    },
  } as unknown as SupabaseClient;
};

describe("searchAllContent", () => {
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe("Content Type Filtering", () => {
    it("searches all content types when all toggles enabled", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        includeMonsters: true,
        includeMagicItems: true,
        includeEquipment: true,
        includeSpells: true,
      };

      await searchAllContent(mockSupabase, params);

      // Should query all 4 tables
      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      expect(fromCalls.length).toBeGreaterThanOrEqual(4);

      const tables = fromCalls.map((call: any[]) => call[0]);
      expect(tables).toContain("official_monsters");
      expect(tables).toContain("official_magic_items");
      expect(tables).toContain("equipment");
      expect(tables).toContain("official_spells");
    });

    it("searches only monsters when includeMonsters true, others false", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "goblin",
        includeMonsters: true,
        includeMagicItems: false,
        includeEquipment: false,
        includeSpells: false,
      };

      await searchAllContent(mockSupabase, params);

      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      const tables = fromCalls.map((call: any[]) => call[0]);

      expect(
        tables.filter((t: string) => t.includes("monster")).length,
      ).toBeGreaterThan(0);
      expect(tables).not.toContain("official_magic_items");
      expect(tables).not.toContain("equipment");
      expect(tables).not.toContain("official_spells");
    });

    it("searches only magic items when includeMagicItems true", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "sword",
        includeMonsters: false,
        includeMagicItems: true,
        includeEquipment: false,
        includeSpells: false,
      };

      await searchAllContent(mockSupabase, params);

      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      const tables = fromCalls.map((call: any[]) => call[0]);

      expect(tables).toContain("official_magic_items");
      expect(tables.filter((t: string) => t.includes("monster")).length).toBe(
        0,
      );
      expect(tables).not.toContain("equipment");
      expect(tables).not.toContain("official_spells");
    });

    it("searches only equipment when includeEquipment true", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "rope",
        includeMonsters: false,
        includeMagicItems: false,
        includeEquipment: true,
        includeSpells: false,
      };

      await searchAllContent(mockSupabase, params);

      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      const tables = fromCalls.map((call: any[]) => call[0]);

      expect(tables).toContain("equipment");
      expect(tables.filter((t: string) => t.includes("monster")).length).toBe(
        0,
      );
      expect(tables).not.toContain("official_magic_items");
      expect(tables).not.toContain("official_spells");
    });

    it("searches only spells when includeSpells true", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "fireball",
        includeMonsters: false,
        includeMagicItems: false,
        includeEquipment: false,
        includeSpells: true,
      };

      await searchAllContent(mockSupabase, params);

      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      const tables = fromCalls.map((call: any[]) => call[0]);

      expect(tables).toContain("official_spells");
      expect(tables.filter((t: string) => t.includes("monster")).length).toBe(
        0,
      );
      expect(tables).not.toContain("official_magic_items");
      expect(tables).not.toContain("equipment");
    });
  });

  describe("Source Filtering", () => {
    it("queries both official and user tables when sourceFilter is 'all'", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        sourceFilter: "all",
        includeMonsters: true,
        includeSpells: false,
        includeMagicItems: false,
        includeEquipment: false,
      };

      await searchAllContent(mockSupabase, params);

      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      const tables = fromCalls.map((call: any[]) => call[0]);

      expect(tables).toContain("official_monsters");
      expect(tables).toContain("user_monsters");
    });

    it("queries only official tables when sourceFilter is 'core'", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        sourceFilter: "core",
        includeMonsters: true,
        includeSpells: true,
        includeMagicItems: false,
        includeEquipment: false,
      };

      await searchAllContent(mockSupabase, params);

      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      const tables = fromCalls.map((call: any[]) => call[0]);

      expect(tables).toContain("official_monsters");
      expect(tables).toContain("official_spells");
      expect(tables).not.toContain("user_monsters");
      expect(tables).not.toContain("user_spells");
    });

    it("queries only user tables when sourceFilter is 'user'", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        sourceFilter: "user",
        includeMonsters: true,
        includeSpells: true,
        includeMagicItems: false,
        includeEquipment: false,
      };

      await searchAllContent(mockSupabase, params);

      const fromCalls = (mockSupabase as any)._mocks.from.mock.calls;
      const tables = fromCalls.map((call: any[]) => call[0]);

      expect(tables).toContain("user_monsters");
      expect(tables).toContain("user_spells");
      expect(tables).not.toContain("official_monsters");
      expect(tables).not.toContain("official_spells");
    });
  });

  describe("Limit Parameter", () => {
    it("applies default limit of 25 when not specified", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        includeMonsters: true,
      };

      await searchAllContent(mockSupabase, params);

      const limitCalls = (mockSupabase as any)._mocks.limit.mock.calls;
      expect(limitCalls.length).toBeGreaterThan(0);
      expect(limitCalls[0][0]).toBe(25);
    });

    it("applies custom limit when specified", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        includeMonsters: true,
        limit: 10,
      };

      await searchAllContent(mockSupabase, params);

      const limitCalls = (mockSupabase as any)._mocks.limit.mock.calls;
      expect(limitCalls.length).toBeGreaterThan(0);
      expect(limitCalls[0][0]).toBe(10);
    });
  });

  describe("Result Structure", () => {
    it("constructs correct detailUrl for monsters (/monsters/[id])", async () => {
      const mockMonster = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Red Dragon",
        description: "A fearsome red dragon",
      };

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [mockMonster],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        includeMonsters: true,
        includeMagicItems: false,
        includeEquipment: false,
        includeSpells: false,
      };

      const results = await searchAllContent(mockClient, params);

      const monsterResult = results.find((r) => r.contentType === "monster");
      expect(monsterResult?.detailUrl).toBe(`/monsters/${mockMonster.id}`);
    });

    it("constructs correct detailUrl for spells (/spells/[slug])", async () => {
      const mockSpell = {
        id: "456",
        name: "Fireball",
        slug: "fireball",
        description: "A ball of fire",
      };

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [mockSpell],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "fire",
        includeMonsters: false,
        includeMagicItems: false,
        includeEquipment: false,
        includeSpells: true,
      };

      const results = await searchAllContent(mockClient, params);

      const spellResult = results.find((r) => r.contentType === "spell");
      expect(spellResult?.detailUrl).toBe(`/spells/${mockSpell.slug}`);
    });

    it("constructs correct detailUrl for magic items (/magic-items/[slug])", async () => {
      const mockMagicItem = {
        id: "789",
        name: "Sword of Flames",
        slug: "sword-of-flames",
        description: "A flaming sword",
      };

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [mockMagicItem],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "sword",
        includeMonsters: false,
        includeMagicItems: true,
        includeEquipment: false,
        includeSpells: false,
      };

      const results = await searchAllContent(mockClient, params);

      const magicItemResult = results.find(
        (r) => r.contentType === "magic_item",
      );
      expect(magicItemResult?.detailUrl).toBe(
        `/magic-items/${mockMagicItem.slug}`,
      );
    });

    it("constructs correct detailUrl for equipment (/equipment/[id])", async () => {
      const mockEquipment = {
        id: "101",
        name: "Rope",
        description: "50 feet of rope",
      };

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [mockEquipment],
                  error: null,
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "rope",
        includeMonsters: false,
        includeMagicItems: false,
        includeEquipment: true,
        includeSpells: false,
      };

      const results = await searchAllContent(mockClient, params);

      const equipmentResult = results.find(
        (r) => r.contentType === "equipment",
      );
      expect(equipmentResult?.detailUrl).toBe(`/equipment/${mockEquipment.id}`);
    });

    it("includes all required fields in UnifiedSearchResult", async () => {
      const mockMonster = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Goblin",
        description: "A small green creature",
      };

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [mockMonster],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "goblin",
        includeMonsters: true,
      };

      const results = await searchAllContent(mockClient, params);

      expect(results.length).toBeGreaterThan(0);
      const result = results[0];

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("contentType");
      expect(result).toHaveProperty("source");
      expect(result).toHaveProperty("detailUrl");
      expect(result).toHaveProperty("relevance");
      expect(result).toHaveProperty("description");

      expect(result.contentType).toBe("monster");
      expect(result.source).toBe("official");
      expect(typeof result.relevance).toBe("number");
      expect(result.relevance).toBeGreaterThanOrEqual(0);
      expect(result.relevance).toBeLessThanOrEqual(1);
    });
  });

  describe("Relevance Ordering", () => {
    it("orders results by relevance score descending", async () => {
      const mockResults = [
        { id: "1", name: "Dragon", description: "A dragon", relevance: 0.5 },
        {
          id: "2",
          name: "Red Dragon",
          description: "A red dragon",
          relevance: 0.9,
        },
        { id: "3", name: "Dragon Scale", description: "Scale", relevance: 0.3 },
      ];

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: mockResults,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        includeMonsters: true,
      };

      const results = await searchAllContent(mockClient, params);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].relevance).toBeGreaterThanOrEqual(
          results[i + 1].relevance,
        );
      }
    });
  });

  describe("Parallel Query Execution", () => {
    it("executes queries in parallel using Promise.all", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        includeMonsters: true,
        includeMagicItems: true,
        includeEquipment: true,
        includeSpells: true,
      };

      // Spy on Promise.all
      const promiseAllSpy = vi.spyOn(Promise, "all");

      await searchAllContent(mockSupabase, params);

      expect(promiseAllSpy).toHaveBeenCalled();

      promiseAllSpy.mockRestore();
    });
  });

  describe("Edge Cases", () => {
    it("returns empty array when no content types enabled", async () => {
      const params: UnifiedSearchParams = {
        searchQuery: "dragon",
        includeMonsters: false,
        includeMagicItems: false,
        includeEquipment: false,
        includeSpells: false,
      };

      const results = await searchAllContent(mockSupabase, params);

      expect(results).toEqual([]);
    });

    it("handles empty search results gracefully", async () => {
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "nonexistent",
        includeMonsters: true,
      };

      const results = await searchAllContent(mockClient, params);

      expect(results).toEqual([]);
    });

    it("handles null descriptions in results", async () => {
      const mockMonster = {
        id: "123",
        name: "Mystery Monster",
        description: null,
      };

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [mockMonster],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const params: UnifiedSearchParams = {
        searchQuery: "mystery",
        includeMonsters: true,
      };

      const results = await searchAllContent(mockClient, params);

      expect(results[0].description).toBeNull();
    });
  });
});
