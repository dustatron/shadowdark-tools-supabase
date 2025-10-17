import { describe, it, expect } from "vitest";

/**
 * Contract Test: GET /api/monsters/random
 * Tests random monster selection with filters
 * MUST FAIL initially - endpoint not implemented
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

describe("GET /api/monsters/random - Contract Tests", () => {
  it("should return a random monster", async () => {
    const response = await fetch(`${API_BASE}/api/monsters/random`);

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("challenge_level");
  });

  it("should support filters parameter", async () => {
    const filters = JSON.stringify({
      min_challenge_level: 1,
      max_challenge_level: 5,
      monster_types: ["humanoid"],
    });

    const response = await fetch(
      `${API_BASE}/api/monsters/random?filters=${encodeURIComponent(filters)}`,
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.challenge_level).toBeGreaterThanOrEqual(1);
    expect(data.challenge_level).toBeLessThanOrEqual(5);
  });

  it("should return 400 for invalid filter JSON", async () => {
    const response = await fetch(
      `${API_BASE}/api/monsters/random?filters=invalid-json`,
    );
    expect(response.status).toBe(400);
  });
});
