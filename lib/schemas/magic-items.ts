import { z } from "zod";

// Trait types matching Shadowdark magic item traits
export const TraitTypeSchema = z.enum([
  "Benefit",
  "Curse",
  "Bonus",
  "Personality",
]);

export type TraitType = z.infer<typeof TraitTypeSchema>;

// Individual trait object
export const TraitSchema = z.object({
  name: TraitTypeSchema,
  description: z.string().min(1, "Trait description is required").max(1000),
});

export type Trait = z.infer<typeof TraitSchema>;

// Schema for creating a new magic item
export const MagicItemCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be 5000 characters or less"),
  traits: z.array(TraitSchema),
  is_public: z.boolean(),
  // Accepts either a full URL (uploaded images) or a Cloudinary public_id (default icons)
  image_url: z.string().max(500).nullable().optional(),
});

export type MagicItemCreateInput = z.infer<typeof MagicItemCreateSchema>;

// Schema for updating a magic item (all fields optional)
export const MagicItemUpdateSchema = MagicItemCreateSchema.partial();

export type MagicItemUpdateInput = z.infer<typeof MagicItemUpdateSchema>;

// Schema for query parameters on list endpoint
export const MagicItemListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(200).optional(),
});

export type MagicItemListQuery = z.infer<typeof MagicItemListQuerySchema>;

// Schema for search endpoint query parameters
export const MagicItemSearchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
  traitTypes: z.array(z.string()).optional(),
  source: z.enum(["official", "community", "all"]).optional(),
  favorites: z.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type MagicItemSearchQuery = z.infer<typeof MagicItemSearchQuerySchema>;

// Helper to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}
