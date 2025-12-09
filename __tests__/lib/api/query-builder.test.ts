/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildPaginationParams,
  buildPaginationParamsFromOffset,
  buildPaginationMeta,
  buildSearchQuery,
  buildSortQuery,
  buildRangeFilter,
  buildArrayContainsFilter,
  buildInFilter,
  parseJsonFields,
  sanitizeSearchQuery,
  type PaginationParams,
} from "@/lib/api/query-builder";

describe("Query Builder Utilities", () => {
  describe("buildPaginationParams", () => {
    it("should return default pagination when no params provided", () => {
      const searchParams = new URLSearchParams();
      const result = buildPaginationParams(searchParams);

      expect(result).toEqual({
        limit: 20,
        offset: 0,
        page: 1,
      });
    });

    it("should parse valid limit and page params", () => {
      const searchParams = new URLSearchParams({
        limit: "50",
        page: "3",
      });
      const result = buildPaginationParams(searchParams);

      expect(result).toEqual({
        limit: 50,
        offset: 100, // (3-1) * 50
        page: 3,
      });
    });

    it("should enforce maximum limit", () => {
      const searchParams = new URLSearchParams({
        limit: "200", // Exceeds max of 100
      });
      const result = buildPaginationParams(searchParams);

      expect(result.limit).toBe(100);
    });

    it("should enforce minimum limit of 1", () => {
      const searchParams = new URLSearchParams({
        limit: "0",
      });
      const result = buildPaginationParams(searchParams);

      expect(result.limit).toBe(1);
    });

    it("should enforce minimum page of 1", () => {
      const searchParams = new URLSearchParams({
        page: "-5",
      });
      const result = buildPaginationParams(searchParams);

      expect(result.page).toBe(1);
      expect(result.offset).toBe(0);
    });

    it("should handle invalid limit gracefully", () => {
      const searchParams = new URLSearchParams({
        limit: "invalid",
      });
      const result = buildPaginationParams(searchParams);

      expect(result.limit).toBe(20); // Falls back to default
    });

    it("should respect custom default and max limits", () => {
      const searchParams = new URLSearchParams({
        limit: "150",
      });
      const result = buildPaginationParams(searchParams, 30, 200);

      expect(result.limit).toBe(150);
    });

    it("should calculate offset correctly for various pages", () => {
      const searchParams = new URLSearchParams({
        limit: "10",
        page: "5",
      });
      const result = buildPaginationParams(searchParams);

      expect(result.offset).toBe(40); // (5-1) * 10
    });
  });

  describe("buildPaginationParamsFromOffset", () => {
    it("should return default pagination when no params provided", () => {
      const searchParams = new URLSearchParams();
      const result = buildPaginationParamsFromOffset(searchParams);

      expect(result).toEqual({
        limit: 20,
        offset: 0,
        page: 1,
      });
    });

    it("should parse valid limit and offset params", () => {
      const searchParams = new URLSearchParams({
        limit: "25",
        offset: "50",
      });
      const result = buildPaginationParamsFromOffset(searchParams);

      expect(result).toEqual({
        limit: 25,
        offset: 50,
        page: 3, // floor(50/25) + 1
      });
    });

    it("should enforce minimum offset of 0", () => {
      const searchParams = new URLSearchParams({
        offset: "-10",
      });
      const result = buildPaginationParamsFromOffset(searchParams);

      expect(result.offset).toBe(0);
    });

    it("should calculate page number correctly", () => {
      const searchParams = new URLSearchParams({
        limit: "20",
        offset: "60",
      });
      const result = buildPaginationParamsFromOffset(searchParams);

      expect(result.page).toBe(4); // floor(60/20) + 1
    });
  });

  describe("buildPaginationMeta", () => {
    it("should build correct metadata for first page", () => {
      const params: PaginationParams = {
        limit: 20,
        offset: 0,
        page: 1,
      };
      const result = buildPaginationMeta(params, 45);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3, // ceil(45/20)
        hasMore: true, // 45 > 0 + 20
      });
    });

    it("should build correct metadata for last page", () => {
      const params: PaginationParams = {
        limit: 20,
        offset: 40,
        page: 3,
      };
      const result = buildPaginationMeta(params, 45);

      expect(result).toEqual({
        page: 3,
        limit: 20,
        total: 45,
        totalPages: 3,
        hasMore: false, // 45 <= 40 + 20
      });
    });

    it("should handle empty results", () => {
      const params: PaginationParams = {
        limit: 20,
        offset: 0,
        page: 1,
      };
      const result = buildPaginationMeta(params, 0);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasMore: false,
      });
    });

    it("should handle exact page boundary", () => {
      const params: PaginationParams = {
        limit: 20,
        offset: 0,
        page: 1,
      };
      const result = buildPaginationMeta(params, 20);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 20,
        totalPages: 1,
        hasMore: false, // 20 <= 0 + 20
      });
    });
  });

  describe("buildSearchQuery", () => {
    let mockQuery: any;

    beforeEach(() => {
      mockQuery = {
        or: vi.fn().mockReturnThis(),
      };
    });

    it("should return query unchanged when no search term", () => {
      const result = buildSearchQuery(mockQuery, undefined, ["name", "source"]);

      expect(result).toBe(mockQuery);
      expect(mockQuery.or).not.toHaveBeenCalled();
    });

    it("should return query unchanged when empty search term", () => {
      const result = buildSearchQuery(mockQuery, "   ", ["name", "source"]);

      expect(result).toBe(mockQuery);
      expect(mockQuery.or).not.toHaveBeenCalled();
    });

    it("should apply low fuzziness search (prefix match)", () => {
      buildSearchQuery(mockQuery, "dragon", ["name", "source"], "low");

      expect(mockQuery.or).toHaveBeenCalledWith(
        "name.ilike.dragon%,source.ilike.dragon%",
      );
    });

    it("should apply medium fuzziness search (contains)", () => {
      buildSearchQuery(mockQuery, "dragon", ["name", "source"], "medium");

      expect(mockQuery.or).toHaveBeenCalledWith(
        "name.ilike.%dragon%,source.ilike.%dragon%",
      );
    });

    it("should apply high fuzziness search (contains)", () => {
      buildSearchQuery(mockQuery, "dragon", ["name", "source"], "high");

      expect(mockQuery.or).toHaveBeenCalledWith(
        "name.ilike.%dragon%,source.ilike.%dragon%",
      );
    });

    it("should sanitize search term", () => {
      buildSearchQuery(mockQuery, "dragon's lair", ["name"], "low");

      expect(mockQuery.or).toHaveBeenCalledWith("name.ilike.dragon's lair%");
    });

    it("should search multiple fields", () => {
      buildSearchQuery(
        mockQuery,
        "test",
        ["name", "source", "description"],
        "medium",
      );

      expect(mockQuery.or).toHaveBeenCalledWith(
        "name.ilike.%test%,source.ilike.%test%,description.ilike.%test%",
      );
    });
  });

  describe("buildSortQuery", () => {
    let mockQuery: any;

    beforeEach(() => {
      mockQuery = {
        order: vi.fn().mockReturnThis(),
      };
    });

    it("should return query unchanged when no sort field", () => {
      const result = buildSortQuery(mockQuery, undefined);

      expect(result).toBe(mockQuery);
      expect(mockQuery.order).not.toHaveBeenCalled();
    });

    it("should apply ascending sort by default", () => {
      buildSortQuery(mockQuery, "name");

      expect(mockQuery.order).toHaveBeenCalledWith("name", { ascending: true });
    });

    it("should apply descending sort", () => {
      buildSortQuery(mockQuery, "created_at", "desc");

      expect(mockQuery.order).toHaveBeenCalledWith("created_at", {
        ascending: false,
      });
    });

    it("should apply ascending sort explicitly", () => {
      buildSortQuery(mockQuery, "challenge_level", "asc");

      expect(mockQuery.order).toHaveBeenCalledWith("challenge_level", {
        ascending: true,
      });
    });
  });

  describe("buildRangeFilter", () => {
    let mockQuery: any;

    beforeEach(() => {
      mockQuery = {
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
      };
    });

    it("should return query unchanged when no min/max", () => {
      const result = buildRangeFilter(mockQuery, "challenge_level");

      expect(result).toBe(mockQuery);
      expect(mockQuery.gte).not.toHaveBeenCalled();
      expect(mockQuery.lte).not.toHaveBeenCalled();
    });

    it("should apply minimum filter only", () => {
      buildRangeFilter(mockQuery, "challenge_level", 5);

      expect(mockQuery.gte).toHaveBeenCalledWith("challenge_level", 5);
      expect(mockQuery.lte).not.toHaveBeenCalled();
    });

    it("should apply maximum filter only", () => {
      buildRangeFilter(mockQuery, "challenge_level", undefined, 10);

      expect(mockQuery.gte).not.toHaveBeenCalled();
      expect(mockQuery.lte).toHaveBeenCalledWith("challenge_level", 10);
    });

    it("should apply both min and max filters", () => {
      buildRangeFilter(mockQuery, "challenge_level", 5, 10);

      expect(mockQuery.gte).toHaveBeenCalledWith("challenge_level", 5);
      expect(mockQuery.lte).toHaveBeenCalledWith("challenge_level", 10);
    });

    it("should handle zero as valid min", () => {
      buildRangeFilter(mockQuery, "armor_class", 0);

      expect(mockQuery.gte).toHaveBeenCalledWith("armor_class", 0);
    });
  });

  describe("buildArrayContainsFilter", () => {
    let mockQuery: any;

    beforeEach(() => {
      mockQuery = {
        contains: vi.fn().mockReturnThis(),
      };
    });

    it("should return query unchanged when no values", () => {
      const result = buildArrayContainsFilter(mockQuery, "classes");

      expect(result).toBe(mockQuery);
      expect(mockQuery.contains).not.toHaveBeenCalled();
    });

    it("should return query unchanged when empty array", () => {
      const result = buildArrayContainsFilter(mockQuery, "classes", []);

      expect(result).toBe(mockQuery);
      expect(mockQuery.contains).not.toHaveBeenCalled();
    });

    it("should apply contains filter for single value", () => {
      buildArrayContainsFilter(mockQuery, "classes", ["wizard"]);

      expect(mockQuery.contains).toHaveBeenCalledWith("classes", ["wizard"]);
    });

    it("should apply contains filter for multiple values", () => {
      buildArrayContainsFilter(mockQuery, "classes", ["wizard", "priest"]);

      expect(mockQuery.contains).toHaveBeenCalledWith("classes", [
        "wizard",
        "priest",
      ]);
    });
  });

  describe("buildInFilter", () => {
    let mockQuery: any;

    beforeEach(() => {
      mockQuery = {
        in: vi.fn().mockReturnThis(),
      };
    });

    it("should return query unchanged when no values", () => {
      const result = buildInFilter(mockQuery, "speed");

      expect(result).toBe(mockQuery);
      expect(mockQuery.in).not.toHaveBeenCalled();
    });

    it("should return query unchanged when empty array", () => {
      const result = buildInFilter(mockQuery, "speed", []);

      expect(result).toBe(mockQuery);
      expect(mockQuery.in).not.toHaveBeenCalled();
    });

    it("should apply in filter for single value", () => {
      buildInFilter(mockQuery, "speed", ["fast"]);

      expect(mockQuery.in).toHaveBeenCalledWith("speed", ["fast"]);
    });

    it("should apply in filter for multiple values", () => {
      buildInFilter(mockQuery, "speed", ["fast", "slow"]);

      expect(mockQuery.in).toHaveBeenCalledWith("speed", ["fast", "slow"]);
    });
  });

  describe("parseJsonFields", () => {
    it("should parse JSON string fields to objects", () => {
      const data = [
        {
          id: 1,
          name: "Dragon",
          attacks: '{"melee": "bite"}',
          abilities: '["fly", "breathe fire"]',
        },
      ];

      const result = parseJsonFields(data, ["attacks", "abilities"]);

      expect(result[0].attacks).toEqual({ melee: "bite" });
      expect(result[0].abilities).toEqual(["fly", "breathe fire"]);
    });

    it("should leave already-parsed fields unchanged", () => {
      const data = [
        {
          id: 1,
          name: "Dragon",
          attacks: { melee: "bite" },
          abilities: ["fly", "breathe fire"],
        },
      ];

      const result = parseJsonFields(data, ["attacks", "abilities"]);

      expect(result[0].attacks).toEqual({ melee: "bite" });
      expect(result[0].abilities).toEqual(["fly", "breathe fire"]);
    });

    it("should handle multiple records", () => {
      const data = [
        { id: 1, tags: '["undead", "evil"]' },
        { id: 2, tags: '["beast"]' },
      ];

      const result = parseJsonFields(data, ["tags"]);

      expect(result[0].tags).toEqual(["undead", "evil"]);
      expect(result[1].tags).toEqual(["beast"]);
    });

    it("should handle invalid JSON gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const data = [
        {
          id: 1,
          attacks: "invalid json{",
        },
      ];

      const result = parseJsonFields(data, ["attacks"]);

      expect(result[0].attacks).toBe("invalid json{"); // Unchanged
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle null/undefined fields", () => {
      const data = [
        {
          id: 1,
          attacks: null,
          abilities: undefined,
        },
      ];

      const result = parseJsonFields(data, ["attacks", "abilities"]);

      expect(result[0].attacks).toBeNull();
      expect(result[0].abilities).toBeUndefined();
    });

    it("should preserve other fields unchanged", () => {
      const data = [
        {
          id: 1,
          name: "Dragon",
          challenge_level: 5,
          attacks: '{"melee": "bite"}',
        },
      ];

      const result = parseJsonFields(data, ["attacks"]);

      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe("Dragon");
      expect(result[0].challenge_level).toBe(5);
    });
  });

  describe("sanitizeSearchQuery", () => {
    it("should trim whitespace", () => {
      const result = sanitizeSearchQuery("  dragon  ");

      expect(result).toBe("dragon");
    });

    it("should remove special characters", () => {
      const result = sanitizeSearchQuery("dragon@#$%^&*()");

      expect(result).toBe("dragon");
    });

    it("should preserve letters, numbers, spaces, hyphens, apostrophes", () => {
      const result = sanitizeSearchQuery("dragon's lair-123");

      expect(result).toBe("dragon's lair-123");
    });

    it("should truncate to 200 characters", () => {
      const longString = "a".repeat(300);
      const result = sanitizeSearchQuery(longString);

      expect(result).toHaveLength(200);
    });

    it("should handle empty string", () => {
      const result = sanitizeSearchQuery("");

      expect(result).toBe("");
    });

    it("should remove SQL injection attempts", () => {
      const result = sanitizeSearchQuery("'; DROP TABLE monsters; --");

      expect(result).toBe("' DROP TABLE monsters --");
    });

    it("should handle Unicode characters", () => {
      const result = sanitizeSearchQuery("dragón café");

      expect(result).toBe("dragn caf");
    });
  });
});
