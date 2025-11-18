/**
 * Contract Tests for Magic Items API
 *
 * These tests validate the API contract defined in magic-items-api.yaml
 * Tests should FAIL initially (TDD) and pass after implementation
 */

import { describe, it, expect, beforeAll } from "vitest";
import { z } from "zod";

// Base URL for API (adjust for test environment)
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

// Zod schemas matching the OpenAPI contract
const TraitSchema = z.object({
  name: z.enum(["Benefit", "Curse", "Bonus", "Personality"]),
  description: z.string().min(1).max(1000),
});

const MagicItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9_-]+$/),
  description: z.string().min(1).max(2000),
  traits: z.array(TraitSchema).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const MagicItemListResponseSchema = z.object({
  data: z.array(MagicItemSchema),
});

const MagicItemSingleResponseSchema = z.object({
  data: MagicItemSchema,
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

describe("Magic Items API - Contract Tests", () => {
  describe("GET /api/magic-items", () => {
    it("should return 200 with array of magic items", async () => {
      const response = await fetch(`${API_BASE_URL}/api/magic-items`);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );

      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(Array.isArray(validation.data.data)).toBe(true);
        expect(validation.data.data.length).toBeGreaterThan(0);
      }
    });

    it("should return items in alphabetical order by name", async () => {
      const response = await fetch(`${API_BASE_URL}/api/magic-items`);
      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        const names = validation.data.data.map((item) => item.name);
        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
      }
    });

    it("should filter items by search term (name)", async () => {
      const searchTerm = "Ring";
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items?search=${searchTerm}`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        validation.data.data.forEach((item) => {
          const matchesName = item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesDescription = item.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          expect(matchesName || matchesDescription).toBe(true);
        });
      }
    });

    it("should filter items by search term (description)", async () => {
      const searchTerm = "invisibility";
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items?search=${searchTerm}`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.data.length).toBeGreaterThan(0);
        validation.data.data.forEach((item) => {
          const matchesName = item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesDescription = item.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          expect(matchesName || matchesDescription).toBe(true);
        });
      }
    });

    it("should return empty array for search with no matches", async () => {
      const searchTerm = "xyznonexistent123";
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items?search=${searchTerm}`,
      );

      expect(response.status).toBe(200);

      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.data.length).toBe(0);
      }
    });

    it("should return 400 for search term too long", async () => {
      const searchTerm = "a".repeat(101); // Max is 100
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items?search=${searchTerm}`,
      );

      expect(response.status).toBe(400);

      const body = await response.json();
      const validation = ErrorResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.error).toBeTruthy();
      }
    });

    it("should include all required fields for each item", async () => {
      const response = await fetch(`${API_BASE_URL}/api/magic-items`);
      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success && validation.data.data.length > 0) {
        const item = validation.data.data[0];
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.slug).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(Array.isArray(item.traits)).toBe(true);
        expect(item.created_at).toBeTruthy();
        expect(item.updated_at).toBeTruthy();
      }
    });

    it("should validate trait structure", async () => {
      const response = await fetch(`${API_BASE_URL}/api/magic-items`);
      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        // Find an item with traits
        const itemWithTraits = validation.data.data.find(
          (item) => item.traits.length > 0,
        );
        expect(itemWithTraits).toBeTruthy();

        if (itemWithTraits) {
          itemWithTraits.traits.forEach((trait) => {
            expect(["Benefit", "Curse", "Bonus", "Personality"]).toContain(
              trait.name,
            );
            expect(trait.description).toBeTruthy();
            expect(trait.description.length).toBeGreaterThan(0);
          });
        }
      }
    });
  });

  describe("GET /api/magic-items/[slug]", () => {
    let validSlug: string;

    beforeAll(async () => {
      // Get a valid slug from the list endpoint
      const response = await fetch(`${API_BASE_URL}/api/magic-items`);
      const body = await response.json();
      const validation = MagicItemListResponseSchema.safeParse(body);

      if (validation.success && validation.data.data.length > 0) {
        validSlug = validation.data.data[0].slug;
      }
    });

    it("should return 200 with magic item details", async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items/${validSlug}`,
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );

      const body = await response.json();
      const validation = MagicItemSingleResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.data.slug).toBe(validSlug);
      }
    });

    it("should return all fields for single item", async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items/${validSlug}`,
      );
      const body = await response.json();
      const validation = MagicItemSingleResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        const item = validation.data.data;
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.slug).toBe(validSlug);
        expect(item.description).toBeTruthy();
        expect(Array.isArray(item.traits)).toBe(true);
        expect(item.created_at).toBeTruthy();
        expect(item.updated_at).toBeTruthy();
      }
    });

    it("should return 404 for non-existent slug", async () => {
      const nonExistentSlug = "nonexistent-magic-item-xyz-123";
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items/${nonExistentSlug}`,
      );

      expect(response.status).toBe(404);

      const body = await response.json();
      const validation = ErrorResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.error).toBeTruthy();
      }
    });

    it("should return 400 for invalid slug format", async () => {
      const invalidSlug = "INVALID SLUG WITH SPACES";
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items/${invalidSlug}`,
      );

      expect(response.status).toBe(400);

      const body = await response.json();
      const validation = ErrorResponseSchema.safeParse(body);

      expect(validation.success).toBe(true);
      if (validation.success) {
        expect(validation.data.error).toBeTruthy();
      }
    });

    it("should handle items with multiple traits of same type", async () => {
      // Find an item with multiple Benefit traits (if exists)
      const listResponse = await fetch(`${API_BASE_URL}/api/magic-items`);
      const listBody = await listResponse.json();
      const listValidation = MagicItemListResponseSchema.safeParse(listBody);

      if (listValidation.success) {
        const itemWithMultipleTraits = listValidation.data.data.find((item) => {
          const benefitTraits = item.traits.filter((t) => t.name === "Benefit");
          return benefitTraits.length > 1;
        });

        if (itemWithMultipleTraits) {
          const response = await fetch(
            `${API_BASE_URL}/api/magic-items/${itemWithMultipleTraits.slug}`,
          );
          const body = await response.json();
          const validation = MagicItemSingleResponseSchema.safeParse(body);

          expect(validation.success).toBe(true);
          if (validation.success) {
            const benefits = validation.data.data.traits.filter(
              (t) => t.name === "Benefit",
            );
            expect(benefits.length).toBeGreaterThan(1);
          }
        }
      }
    });

    it("should handle items with no traits", async () => {
      // Find an item with no traits (if exists)
      const listResponse = await fetch(`${API_BASE_URL}/api/magic-items`);
      const listBody = await listResponse.json();
      const listValidation = MagicItemListResponseSchema.safeParse(listBody);

      if (listValidation.success) {
        const itemWithNoTraits = listValidation.data.data.find(
          (item) => item.traits.length === 0,
        );

        if (itemWithNoTraits) {
          const response = await fetch(
            `${API_BASE_URL}/api/magic-items/${itemWithNoTraits.slug}`,
          );
          const body = await response.json();
          const validation = MagicItemSingleResponseSchema.safeParse(body);

          expect(validation.success).toBe(true);
          if (validation.success) {
            expect(validation.data.data.traits).toEqual([]);
          }
        }
      }
    });
  });

  describe("Performance Requirements", () => {
    it("should respond to list request within 500ms", async () => {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/api/magic-items`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });

    it("should respond to search request within 500ms", async () => {
      const start = Date.now();
      const response = await fetch(
        `${API_BASE_URL}/api/magic-items?search=ring`,
      );
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });

    it("should respond to single item request within 300ms", async () => {
      // Get a valid slug first
      const listResponse = await fetch(`${API_BASE_URL}/api/magic-items`);
      const listBody = await listResponse.json();
      const listValidation = MagicItemListResponseSchema.safeParse(listBody);

      if (listValidation.success && listValidation.data.data.length > 0) {
        const slug = listValidation.data.data[0].slug;

        const start = Date.now();
        const response = await fetch(`${API_BASE_URL}/api/magic-items/${slug}`);
        const duration = Date.now() - start;

        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(300);
      }
    });
  });
});
