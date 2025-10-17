import { describe, it, expect } from "vitest";

// Test suite for search API endpoints
describe("Search API Contract Tests", () => {
  describe("GET /api/search/monsters", () => {
    it("should return search results with full-text search", async () => {
      const response = await fetch("/api/search/monsters?q=dragon&limit=5");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("results");
      expect(data).toHaveProperty("total");
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.results.length).toBeLessThanOrEqual(5);

      // Each result should contain the search term
      data.results.forEach((monster: any) => {
        const searchableText =
          `${monster.name} ${monster.author_notes || ""}`.toLowerCase();
        expect(searchableText).toContain("dragon");
      });
    });

    it("should support advanced filtering in search", async () => {
      const response = await fetch(
        "/api/search/monsters?q=humanoid&minLevel=2&maxLevel=6&types=humanoid",
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      data.results.forEach((monster: any) => {
        expect(monster.challenge_level).toBeGreaterThanOrEqual(2);
        expect(monster.challenge_level).toBeLessThanOrEqual(6);
        expect(monster.tags.type).toContain("humanoid");
      });
    });

    it("should return empty results for no matches", async () => {
      const response = await fetch(
        "/api/search/monsters?q=nonexistentmonster123",
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.results).toEqual([]);
      expect(data.total).toBe(0);
    });

    it("should handle pagination in search results", async () => {
      const response = await fetch("/api/search/monsters?q=a&page=1&limit=3");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("pagination");
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(3);
      expect(data.results.length).toBeLessThanOrEqual(3);
    });
  });

  describe("GET /api/search/suggestions", () => {
    it("should return search suggestions/autocomplete", async () => {
      const response = await fetch("/api/search/suggestions?q=gob");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty("suggestions");
      expect(Array.isArray(data.suggestions)).toBe(true);

      // Suggestions should start with or contain the query
      data.suggestions.forEach((suggestion: string) => {
        expect(suggestion.toLowerCase()).toContain("gob");
      });
    });

    it("should limit number of suggestions", async () => {
      const response = await fetch("/api/search/suggestions?q=a&limit=5");

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.suggestions.length).toBeLessThanOrEqual(5);
    });
  });
});
