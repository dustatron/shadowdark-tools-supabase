import { describe, it, expect, beforeAll, afterAll } from "vitest";

/**
 * Contract Test: GET /api/monsters
 *
 * Tests the monster search and listing API endpoint according to the OpenAPI specification.
 * This test MUST FAIL initially as the endpoint is not yet implemented.
 *
 * Contract Requirements from monsters-api.yaml:
 * - GET /api/monsters
 * - Query parameters: q, fuzziness, min_cl, max_cl, tags, type, limit, offset
 * - Returns: { monsters: Monster[], total: number, has_more: boolean }
 * - Status codes: 200 (success), 400 (bad request)
 *
 * Expected to FAIL until app/api/monsters/route.ts is implemented
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

describe("GET /api/monsters - Contract Tests", () => {
  beforeAll(async () => {
    // Note: These tests expect Next.js dev server to be running
    // In CI/CD, we would programmatically start the server
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe("Endpoint Existence and Basic Response", () => {
    it("should exist and return proper response structure", async () => {
      try {
        const response = await fetch(`${API_BASE}/api/monsters`);

        // Should not be 404 once implemented
        expect(response.status).not.toBe(404);
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toContain(
          "application/json",
        );

        const data = await response.json();

        // Validate required response structure from OpenAPI spec
        expect(data).toHaveProperty("monsters");
        expect(data).toHaveProperty("total");
        expect(data).toHaveProperty("has_more");

        expect(Array.isArray(data.monsters)).toBe(true);
        expect(typeof data.total).toBe("number");
        expect(typeof data.has_more).toBe("boolean");

        // Should return some monsters (assumes database is seeded)
        expect(data.total).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // This will fail until the endpoint is implemented
        expect.fail(`API endpoint /api/monsters does not exist yet: ${error}`);
      }
    });

    it("should return monsters with valid Monster schema", async () => {
      try {
        const response = await fetch(`${API_BASE}/api/monsters?limit=1`);
        expect(response.status).toBe(200);

        const data = await response.json();

        if (data.monsters.length > 0) {
          const monster = data.monsters[0];

          // Required fields from Monster schema in OpenAPI spec
          expect(monster).toHaveProperty("id");
          expect(monster).toHaveProperty("name");
          expect(monster).toHaveProperty("challenge_level");
          expect(monster).toHaveProperty("hit_points");
          expect(monster).toHaveProperty("armor_class");
          expect(monster).toHaveProperty("speed");
          expect(monster).toHaveProperty("attacks");
          expect(monster).toHaveProperty("abilities");
          expect(monster).toHaveProperty("treasure");
          expect(monster).toHaveProperty("tags");
          expect(monster).toHaveProperty("source");
          expect(monster).toHaveProperty("is_official");
          expect(monster).toHaveProperty("is_public");
          expect(monster).toHaveProperty("created_at");
          expect(monster).toHaveProperty("updated_at");

          // Validate field types
          expect(typeof monster.id).toBe("string");
          expect(typeof monster.name).toBe("string");
          expect(typeof monster.challenge_level).toBe("number");
          expect(typeof monster.hit_points).toBe("number");
          expect(typeof monster.armor_class).toBe("number");
          expect(typeof monster.speed).toBe("string");
          expect(Array.isArray(monster.attacks)).toBe(true);
          expect(Array.isArray(monster.abilities)).toBe(true);
          expect(typeof monster.tags).toBe("object");
          expect(typeof monster.source).toBe("string");
          expect(typeof monster.is_official).toBe("boolean");
          expect(typeof monster.is_public).toBe("boolean");

          // Validate constraints from OpenAPI spec
          expect(monster.challenge_level).toBeGreaterThanOrEqual(1);
          expect(monster.challenge_level).toBeLessThanOrEqual(20);
          expect(monster.hit_points).toBeGreaterThanOrEqual(1);
          expect(monster.armor_class).toBeGreaterThanOrEqual(1);
          expect(monster.armor_class).toBeLessThanOrEqual(21);
        }
      } catch (error) {
        expect.fail(`API endpoint /api/monsters does not exist yet: ${error}`);
      }
    });
  });

  describe("Query Parameters Support", () => {
    it("should support text search with q parameter", async () => {
      try {
        const response = await fetch(`${API_BASE}/api/monsters?q=goblin`);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty("monsters");

        // Should filter results based on search term
        if (data.monsters.length > 0) {
          const hasRelevantResults = data.monsters.some(
            (monster: any) =>
              monster.name.toLowerCase().includes("goblin") ||
              monster.source?.toLowerCase().includes("goblin") ||
              monster.author_notes?.toLowerCase().includes("goblin"),
          );
          expect(hasRelevantResults).toBe(true);
        }
      } catch (error) {
        expect.fail(`Search functionality not implemented: ${error}`);
      }
    });

    it("should support fuzziness parameter", async () => {
      try {
        const validFuzziness = ["low", "medium", "high"];

        for (const fuzz of validFuzziness) {
          const response = await fetch(
            `${API_BASE}/api/monsters?q=gobln&fuzziness=${fuzz}`,
          );
          expect(response.status).toBe(200);
        }

        // Invalid fuzziness should return 400
        const invalidResponse = await fetch(
          `${API_BASE}/api/monsters?fuzziness=invalid`,
        );
        expect(invalidResponse.status).toBe(400);
      } catch (error) {
        expect.fail(`Fuzziness parameter not implemented: ${error}`);
      }
    });

    it("should support challenge level filtering", async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/monsters?min_cl=1&max_cl=3`,
        );
        expect(response.status).toBe(200);

        const data = await response.json();

        // All returned monsters should be within challenge level range
        data.monsters.forEach((monster: any) => {
          expect(monster.challenge_level).toBeGreaterThanOrEqual(1);
          expect(monster.challenge_level).toBeLessThanOrEqual(3);
        });
      } catch (error) {
        expect.fail(`Challenge level filtering not implemented: ${error}`);
      }
    });

    it("should support tags filtering", async () => {
      try {
        const response = await fetch(`${API_BASE}/api/monsters?tags=humanoid`);
        expect(response.status).toBe(200);

        const data = await response.json();

        // All returned monsters should have the specified tag
        data.monsters.forEach((monster: any) => {
          expect(monster.tags).toBeDefined();
          expect(monster.tags.type).toBeDefined();
          expect(monster.tags.type.includes("humanoid")).toBe(true);
        });
      } catch (error) {
        expect.fail(`Tags filtering not implemented: ${error}`);
      }
    });

    it("should support type filtering", async () => {
      try {
        const validTypes = ["official", "custom", "public"];

        for (const type of validTypes) {
          const response = await fetch(`${API_BASE}/api/monsters?type=${type}`);
          expect(response.status).toBe(200);

          const data = await response.json();

          if (type === "official") {
            data.monsters.forEach((monster: any) => {
              expect(monster.is_official).toBe(true);
            });
          } else if (type === "custom") {
            data.monsters.forEach((monster: any) => {
              expect(monster.is_official).toBe(false);
            });
          }
        }
      } catch (error) {
        expect.fail(`Type filtering not implemented: ${error}`);
      }
    });

    it("should support pagination with limit and offset", async () => {
      try {
        const page1 = await fetch(`${API_BASE}/api/monsters?limit=5&offset=0`);
        const page2 = await fetch(`${API_BASE}/api/monsters?limit=5&offset=5`);

        expect(page1.status).toBe(200);
        expect(page2.status).toBe(200);

        const page1Data = await page1.json();
        const page2Data = await page2.json();

        expect(page1Data.monsters.length).toBeLessThanOrEqual(5);
        expect(page2Data.monsters.length).toBeLessThanOrEqual(5);

        // Should correctly set has_more flag
        if (page1Data.total > 5) {
          expect(page1Data.has_more).toBe(true);
        }

        // Pages should have different monsters (unless total < 10)
        if (page1Data.total > 5) {
          const page1Ids = page1Data.monsters.map((m: any) => m.id);
          const page2Ids = page2Data.monsters.map((m: any) => m.id);
          const overlap = page1Ids.filter((id: string) =>
            page2Ids.includes(id),
          );
          expect(overlap.length).toBe(0);
        }
      } catch (error) {
        expect.fail(`Pagination not implemented: ${error}`);
      }
    });
  });

  describe("Validation and Error Handling", () => {
    it("should validate limit parameter constraints", async () => {
      try {
        // Limit too high should be capped at 100 or return 400
        const highLimit = await fetch(`${API_BASE}/api/monsters?limit=200`);
        expect([200, 400].includes(highLimit.status)).toBe(true);

        if (highLimit.status === 200) {
          const data = await highLimit.json();
          expect(data.monsters.length).toBeLessThanOrEqual(100);
        }

        // Negative limit should return 400
        const negativeLimit = await fetch(`${API_BASE}/api/monsters?limit=-1`);
        expect(negativeLimit.status).toBe(400);
      } catch (error) {
        expect.fail(`Limit validation not implemented: ${error}`);
      }
    });

    it("should validate challenge level range", async () => {
      try {
        // Invalid challenge levels should return 400
        const invalidMin = await fetch(`${API_BASE}/api/monsters?min_cl=25`);
        expect(invalidMin.status).toBe(400);

        const invalidMax = await fetch(`${API_BASE}/api/monsters?max_cl=0`);
        expect(invalidMax.status).toBe(400);

        const invalidRange = await fetch(
          `${API_BASE}/api/monsters?min_cl=10&max_cl=5`,
        );
        expect(invalidRange.status).toBe(400);
      } catch (error) {
        expect.fail(`Challenge level validation not implemented: ${error}`);
      }
    });

    it("should validate offset parameter", async () => {
      try {
        // Negative offset should return 400
        const response = await fetch(`${API_BASE}/api/monsters?offset=-1`);
        expect(response.status).toBe(400);
      } catch (error) {
        expect.fail(`Offset validation not implemented: ${error}`);
      }
    });
  });

  describe("Performance Requirements", () => {
    it("should respond within 500ms performance target", async () => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${API_BASE}/api/monsters?limit=20`);
        const endTime = Date.now();

        expect(response.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(500);
      } catch (error) {
        expect.fail(
          `Performance target not met or endpoint not implemented: ${error}`,
        );
      }
    });

    it("should handle large result sets efficiently", async () => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${API_BASE}/api/monsters?limit=100`);
        const endTime = Date.now();

        expect(response.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(1000);
      } catch (error) {
        expect.fail(`Large result set handling not implemented: ${error}`);
      }
    });
  });

  describe("Security Requirements", () => {
    it("should only return public and official monsters for unauthenticated requests", async () => {
      try {
        const response = await fetch(`${API_BASE}/api/monsters`);
        expect(response.status).toBe(200);

        const data = await response.json();

        // All monsters should be either official or public custom monsters
        data.monsters.forEach((monster: any) => {
          if (!monster.is_official) {
            expect(monster.is_public).toBe(true);
          }
        });
      } catch (error) {
        expect.fail(`Security filtering not implemented: ${error}`);
      }
    });

    it("should handle malicious input safely", async () => {
      try {
        const maliciousInputs = [
          "'; DROP TABLE monsters; --",
          "<script>alert('xss')</script>",
          "../../../../etc/passwd",
          "eval(String.fromCharCode(97,108,101,114,116,40,49,41))",
        ];

        for (const input of maliciousInputs) {
          const response = await fetch(
            `${API_BASE}/api/monsters?q=${encodeURIComponent(input)}`,
          );
          // Should not crash the server
          expect([200, 400].includes(response.status)).toBe(true);
        }
      } catch (error) {
        expect.fail(`Input sanitization not implemented: ${error}`);
      }
    });
  });

  describe("Default Behavior", () => {
    it("should apply sensible defaults when no parameters provided", async () => {
      try {
        const response = await fetch(`${API_BASE}/api/monsters`);
        expect(response.status).toBe(200);

        const data = await response.json();

        // Should have default limit (likely 20 based on OpenAPI spec)
        expect(data.monsters.length).toBeLessThanOrEqual(20);
        expect(data.monsters.length).toBeGreaterThanOrEqual(0);

        // Should include total count
        expect(typeof data.total).toBe("number");
        expect(data.total).toBeGreaterThanOrEqual(0);

        // Should correctly calculate has_more
        expect(typeof data.has_more).toBe("boolean");
      } catch (error) {
        expect.fail(`Default behavior not implemented: ${error}`);
      }
    });
  });
});
