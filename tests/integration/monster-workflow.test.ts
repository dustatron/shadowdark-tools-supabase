import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@/lib/supabase/server";

// Integration tests for complete monster management workflows
describe("Monster Management Integration Tests", () => {
  let supabase: any;
  let testUserId: string;
  let createdMonsterId: string;

  beforeAll(async () => {
    supabase = await createClient();
    // Note: In real implementation, we'd set up test user authentication
    testUserId = "test-user-id";
  });

  afterAll(async () => {
    // Clean up test data
    if (createdMonsterId) {
      await supabase.from("user_monsters").delete().eq("id", createdMonsterId);
    }
  });

  describe("Complete Monster Lifecycle", () => {
    it("should create, read, update, and delete a custom monster", async () => {
      // Step 1: Create a new custom monster
      const newMonster = {
        name: "Test Integration Monster",
        challenge_level: 3,
        hit_points: 24,
        armor_class: 14,
        speed: "near",
        attacks: [
          {
            name: "claw",
            type: "melee",
            damage: "1d6+2",
            range: "close",
            description: "Sharp claws",
          },
        ],
        abilities: [
          {
            name: "Pack Tactics",
            description: "Advantage when ally is nearby",
          },
        ],
        tags: {
          type: ["beast"],
          location: ["forest"],
        },
        author_notes: "Created for integration testing",
      };

      const createResponse = await supabase
        .from("user_monsters")
        .insert([{ ...newMonster, creator_id: testUserId }])
        .select()
        .single();

      expect(createResponse.error).toBeNull();
      expect(createResponse.data).toBeTruthy();
      createdMonsterId = createResponse.data.id;

      // Step 2: Read the created monster
      const readResponse = await supabase
        .from("user_monsters")
        .select("*")
        .eq("id", createdMonsterId)
        .single();

      expect(readResponse.error).toBeNull();
      expect(readResponse.data.name).toBe(newMonster.name);
      expect(readResponse.data.challenge_level).toBe(
        newMonster.challenge_level,
      );

      // Step 3: Update the monster
      const updateData = {
        name: "Updated Integration Monster",
        challenge_level: 4,
        hit_points: 32,
      };

      const updateResponse = await supabase
        .from("user_monsters")
        .update(updateData)
        .eq("id", createdMonsterId)
        .select()
        .single();

      expect(updateResponse.error).toBeNull();
      expect(updateResponse.data.name).toBe(updateData.name);
      expect(updateResponse.data.challenge_level).toBe(
        updateData.challenge_level,
      );

      // Step 4: Verify the monster appears in search
      const searchResponse = await supabase.rpc("search_monsters", {
        search_query: "Updated Integration",
        min_level: 1,
        max_level: 10,
        monster_types: null,
        locations: null,
        sources: null,
        result_limit: 10,
        result_offset: 0,
      });

      expect(searchResponse.error).toBeNull();
      const found = searchResponse.data.some(
        (monster: any) => monster.id === createdMonsterId,
      );
      expect(found).toBe(true);

      // Step 5: Delete the monster (done in afterAll)
    });
  });

  describe("Monster List Integration", () => {
    it("should create list, add monsters, and export", async () => {
      // Create a new monster list
      const newList = {
        name: "Integration Test List",
        description: "Test list for integration testing",
        creator_id: testUserId,
        is_public: false,
      };

      const listResponse = await supabase
        .from("user_lists")
        .insert([newList])
        .select()
        .single();

      expect(listResponse.error).toBeNull();
      const listId = listResponse.data.id;

      // Add a monster to the list
      if (createdMonsterId) {
        const addMonsterResponse = await supabase
          .from("user_list_monsters")
          .insert([
            {
              list_id: listId,
              monster_id: createdMonsterId,
              monster_type: "user",
            },
          ]);

        expect(addMonsterResponse.error).toBeNull();
      }

      // Verify list contains the monster
      const listWithMonstersResponse = await supabase
        .from("user_lists")
        .select(
          `
          *,
          user_list_monsters (
            monster_id,
            monster_type
          )
        `,
        )
        .eq("id", listId)
        .single();

      expect(listWithMonstersResponse.error).toBeNull();
      expect(
        listWithMonstersResponse.data.user_list_monsters.length,
      ).toBeGreaterThan(0);

      // Clean up
      await supabase.from("user_lists").delete().eq("id", listId);
    });
  });

  describe("Search and Filter Integration", () => {
    it("should search monsters with complex filters", async () => {
      // Test search with multiple filters
      const searchResponse = await supabase.rpc("search_monsters", {
        search_query: "goblin",
        min_level: 1,
        max_level: 3,
        monster_types: ["humanoid"],
        locations: ["any"],
        sources: ["Shadowdark Core"],
        result_limit: 5,
        result_offset: 0,
      });

      expect(searchResponse.error).toBeNull();
      expect(Array.isArray(searchResponse.data)).toBe(true);

      // Verify all results match the filters
      searchResponse.data.forEach((monster: any) => {
        expect(monster.challenge_level).toBeGreaterThanOrEqual(1);
        expect(monster.challenge_level).toBeLessThanOrEqual(3);
        expect(monster.tags.type).toContain("humanoid");
        expect(monster.source).toBe("Shadowdark Core");
      });
    });

    it("should generate random monsters with filters", async () => {
      const randomResponse = await supabase.rpc("get_random_monsters", {
        monster_count: 3,
        min_level: 2,
        max_level: 6,
      });

      expect(randomResponse.error).toBeNull();
      expect(randomResponse.data.length).toBeLessThanOrEqual(3);

      randomResponse.data.forEach((monster: any) => {
        expect(monster.challenge_level).toBeGreaterThanOrEqual(2);
        expect(monster.challenge_level).toBeLessThanOrEqual(6);
      });
    });
  });

  describe("Database Performance Integration", () => {
    it("should handle large result sets efficiently", async () => {
      const startTime = Date.now();

      // Search for common terms that might return many results
      const searchResponse = await supabase.rpc("search_monsters", {
        search_query: "a", // Single letter to get many results
        min_level: 1,
        max_level: 10,
        monster_types: null,
        locations: null,
        sources: null,
        result_limit: 100,
        result_offset: 0,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(searchResponse.error).toBeNull();
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it("should handle pagination correctly", async () => {
      // Get first page
      const page1Response = await supabase.rpc("search_monsters", {
        search_query: "",
        min_level: 1,
        max_level: 10,
        monster_types: null,
        locations: null,
        sources: null,
        result_limit: 10,
        result_offset: 0,
      });

      // Get second page
      const page2Response = await supabase.rpc("search_monsters", {
        search_query: "",
        min_level: 1,
        max_level: 10,
        monster_types: null,
        locations: null,
        sources: null,
        result_limit: 10,
        result_offset: 10,
      });

      expect(page1Response.error).toBeNull();
      expect(page2Response.error).toBeNull();

      // Results should not overlap
      const page1Ids = page1Response.data.map((m: any) => m.id);
      const page2Ids = page2Response.data.map((m: any) => m.id);
      const intersection = page1Ids.filter((id: string) =>
        page2Ids.includes(id),
      );
      expect(intersection.length).toBe(0);
    });
  });
});
