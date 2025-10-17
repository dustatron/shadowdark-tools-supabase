import { z } from "zod";

// Base UUID schema
const uuidSchema = z.string().uuid();

// Attack schema based on OpenAPI specification
export const attackSchema = z.object({
  name: z.string().min(1, "Attack name is required"),
  type: z.enum(["melee", "ranged", "spell"], {
    message: "Attack type must be melee, ranged, or spell",
  }),
  damage: z.string().min(1, "Attack damage is required"),
  range: z.string().optional(),
  description: z.string().optional(),
});

// Ability schema based on OpenAPI specification
export const abilitySchema = z.object({
  name: z.string().min(1, "Ability name is required"),
  description: z.string().min(1, "Ability description is required"),
});

// Treasure schema - flexible JSONB field for Shadowdark
export const treasureSchema = z
  .union([
    z.object({
      type: z.enum(["coins", "items", "mixed", "none"]).optional(),
      amount: z.string().optional(),
      items: z.array(z.string()).optional(),
    }),
    z.string(), // Allow string format for simple treasure descriptions
    z.null(),
  ])
  .optional();

// Tags schema based on OpenAPI specification
export const tagsSchema = z.object({
  type: z.array(z.string()).optional(),
  location: z.array(z.string()).optional(),
});

// Complete Monster schema for database entities
export const monsterSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, "Monster name is required"),
  challenge_level: z
    .number()
    .int()
    .min(1, "Challenge level must be at least 1")
    .max(20, "Challenge level must be at most 20"),
  hit_points: z.number().int().min(1, "Hit points must be at least 1"),
  armor_class: z
    .number()
    .int()
    .min(1, "Armor class must be at least 1")
    .max(21, "Armor class must be at most 21"),
  speed: z.string().min(1, "Speed is required"),
  attacks: z.array(attackSchema).default([]),
  abilities: z.array(abilitySchema).default([]),
  treasure: treasureSchema.optional(),
  tags: tagsSchema.default({ type: [], location: [] }),
  source: z.string().min(1, "Source is required"),
  author_notes: z.string().optional(),
  icon_url: z.string().url().optional(),
  art_url: z.string().url().optional(),
  is_official: z.boolean().default(false),
  is_public: z.boolean().default(false),
  user_id: uuidSchema.optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Create Monster Request schema for POST /api/monsters
export const createMonsterSchema = z.object({
  name: z
    .string()
    .min(1, "Monster name is required")
    .max(100, "Monster name must be at most 100 characters"),
  challenge_level: z
    .number()
    .int()
    .min(1, "Challenge level must be at least 1")
    .max(20, "Challenge level must be at most 20"),
  hit_points: z.number().int().min(1, "Hit points must be at least 1"),
  armor_class: z
    .number()
    .int()
    .min(1, "Armor class must be at least 1")
    .max(21, "Armor class must be at most 21"),
  speed: z.string().min(1, "Speed is required"),
  attacks: z.array(attackSchema).default([]),
  abilities: z.array(abilitySchema).default([]),
  treasure: treasureSchema.optional(),
  tags: tagsSchema.default({ type: [], location: [] }),
  source: z.string().min(1, "Source is required"),
  author_notes: z.string().optional(),
  icon_url: z.string().url().optional(),
  art_url: z.string().url().optional(),
  is_public: z.boolean().default(false),
});

// Update Monster Request schema for PUT /api/monsters/{id}
export const updateMonsterSchema = createMonsterSchema;

// Monster search query parameters for GET /api/monsters
export const monsterSearchSchema = z.object({
  q: z.string().optional(),
  fuzziness: z.enum(["low", "medium", "high"]).optional(),
  min_cl: z
    .number()
    .int()
    .min(1, "Minimum challenge level must be at least 1")
    .max(20, "Minimum challenge level must be at most 20")
    .optional(),
  max_cl: z
    .number()
    .int()
    .min(1, "Maximum challenge level must be at least 1")
    .max(20, "Maximum challenge level must be at most 20")
    .optional(),
  tags: z
    .array(z.string())
    .or(z.string().transform((str) => [str]))
    .optional(),
  type: z.enum(["official", "custom", "public"]).optional(),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(20),
  offset: z.number().int().min(0, "Offset must be at least 0").default(0),
});

// Monster search response schema
export const monsterSearchResponseSchema = z.object({
  monsters: z.array(monsterSchema),
  total: z.number().int().min(0),
  has_more: z.boolean(),
});

// Random monster query parameters for GET /api/monsters/random
export const randomMonsterSchema = z.object({
  filters: z.string().optional(), // JSON encoded filter object
});

// Type exports for TypeScript
export type Monster = z.infer<typeof monsterSchema>;
export type CreateMonsterRequest = z.infer<typeof createMonsterSchema>;
export type UpdateMonsterRequest = z.infer<typeof updateMonsterSchema>;
export type MonsterSearchParams = z.infer<typeof monsterSearchSchema>;
export type MonsterSearchResponse = z.infer<typeof monsterSearchResponseSchema>;
export type Attack = z.infer<typeof attackSchema>;
export type Ability = z.infer<typeof abilitySchema>;
export type Treasure = z.infer<typeof treasureSchema>;
export type Tags = z.infer<typeof tagsSchema>;

// Validation helper functions
export function validateMonsterSearch(params: unknown) {
  return monsterSearchSchema.safeParse(params);
}

export function validateCreateMonster(data: unknown) {
  return createMonsterSchema.safeParse(data);
}

export function validateUpdateMonster(data: unknown) {
  return updateMonsterSchema.safeParse(data);
}

export function validateMonster(data: unknown) {
  return monsterSchema.safeParse(data);
}

// Custom validation rules based on Shadowdark rules
export const shadowdarkValidations = {
  // XP calculation: XP = challenge_level × 25
  calculateXP: (challengeLevel: number): number => {
    return challengeLevel * 25;
  },

  // Validate that min_cl <= max_cl
  validateChallengeRange: (min_cl?: number, max_cl?: number): boolean => {
    if (min_cl !== undefined && max_cl !== undefined) {
      return min_cl <= max_cl;
    }
    return true;
  },

  // Sanitize search query to prevent injection
  sanitizeSearchQuery: (query: string): string => {
    return query.replace(/[^\w\s-_.]/g, "").trim();
  },

  // Validate URL format
  validateImageUrl: (url?: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};
