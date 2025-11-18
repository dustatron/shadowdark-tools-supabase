import { z } from "zod";

// Trait schema for magic item traits
export const TraitSchema = z.object({
  name: z.enum(["Benefit", "Curse", "Bonus", "Personality"]),
  description: z
    .string()
    .min(1, "Trait description is required")
    .max(2000, "Trait description must be less than 2000 characters"),
});

// Main magic item schema
export const MagicItemSchema = z.object({
  id: z.string().uuid("Invalid magic item ID format"),
  name: z
    .string()
    .min(1, "Magic item name is required")
    .max(200, "Magic item name must be less than 200 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9_-]+$/,
      "Slug must contain only lowercase letters, numbers, hyphens, and underscores",
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be less than 5000 characters"),
  traits: z
    .array(TraitSchema)
    .min(1, "At least one trait is required")
    .max(10, "Maximum 10 traits allowed"),
  created_at: z.string().datetime("Invalid created_at timestamp"),
  updated_at: z.string().datetime("Invalid updated_at timestamp"),
});

// Response schema for list endpoint
export const MagicItemListResponseSchema = z.object({
  data: z.array(MagicItemSchema),
  count: z.number().int().min(0, "Count must be a non-negative integer"),
});

// TypeScript types inferred from Zod schemas
export type Trait = z.infer<typeof TraitSchema>;
export type MagicItem = z.infer<typeof MagicItemSchema>;
export type MagicItemListResponse = z.infer<typeof MagicItemListResponseSchema>;
