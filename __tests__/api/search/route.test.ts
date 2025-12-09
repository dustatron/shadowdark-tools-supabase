import { it, expect, describe } from "vitest";

describe("GET /api/search", () => {
  it("should return a successful search result for a valid query", async () => {
    // This test will initially fail because the API route is not yet implemented.
    // It asserts for a 200 status and a specific structure, which won't be met
    // until the route is implemented.
    const res = await fetch("http://localhost:3000/api/search?q=sword");
    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toEqual(
      expect.objectContaining({
        results: expect.any(Array),
        total: expect.any(Number),
        query: "sword",
        filters: expect.objectContaining({
          source: "all",
          includeMonsters: true,
          includeMagicItems: true,
          includeEquipment: true,
          limit: 25,
        }),
      }),
    );
    expect(data.results.length).toBeGreaterThanOrEqual(0); // Can be 0 if no data
  });
});
