import { z } from "zod";

// Base spell schema for create operations
export const spellCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Spell name is required")
    .max(100, "Spell name must be at most 100 characters"),
  tier: z
    .number()
    .int("Tier must be an integer")
    .min(1, "Tier must be at least 1")
    .max(5, "Tier must be at most 5"),
  classes: z
    .array(
      z.enum(["wizard", "priest"], {
        message: "Class must be wizard or priest",
      }),
    )
    .min(1, "At least one class is required")
    .max(2, "Maximum of two classes allowed"),
  duration: z.string().min(1, "Duration is required"),
  range: z.string().min(1, "Range is required"),
  description: z.string().min(1, "Spell effect description is required"),
  author_notes: z.string().optional(),
  is_public: z.boolean().default(false),
});

// Update schema allows partial updates
export const spellUpdateSchema = spellCreateSchema.partial().extend({
  // Maintain tier constraints even when optional
  tier: z
    .number()
    .int("Tier must be an integer")
    .min(1, "Tier must be at least 1")
    .max(5, "Tier must be at most 5")
    .optional(),
  // Maintain classes constraints when provided
  classes: z
    .array(z.enum(["wizard", "priest"]))
    .min(1, "At least one class is required")
    .max(2, "Maximum of two classes allowed")
    .optional(),
});

// Type exports for TypeScript
export type SpellCreate = z.infer<typeof spellCreateSchema>;
export type SpellUpdate = z.infer<typeof spellUpdateSchema>;

// Complete spell schema (for database entities with all fields)
export const spellSchema = spellCreateSchema.extend({
  id: z.string().uuid(),
  slug: z.string(),
  source: z.string().default("Custom"),
  icon_url: z.string().url().optional().or(z.literal("")).nullable(),
  art_url: z.string().url().optional().or(z.literal("")).nullable(),
  user_id: z.string().uuid(),
  creator_id: z.string().uuid().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Spell = z.infer<typeof spellSchema>;
