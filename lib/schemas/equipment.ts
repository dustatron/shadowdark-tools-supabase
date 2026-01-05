import { z } from "zod";

// Item type enum for equipment categories
export const ItemTypeSchema = z.enum(["armor", "weapon", "gear"]);

export type ItemType = z.infer<typeof ItemTypeSchema>;

// Currency enum for cost
export const CurrencySchema = z.enum(["gp", "sp", "cp"]);

export type Currency = z.infer<typeof CurrencySchema>;

// Cost object schema
export const CostSchema = z.object({
  amount: z.number().min(0, "Amount must be 0 or greater"),
  currency: CurrencySchema,
});

export type Cost = z.infer<typeof CostSchema>;

// Schema for creating a new equipment item
export const EquipmentCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  item_type: ItemTypeSchema,
  cost: CostSchema,
  attack_type: z.string().max(50).optional(),
  range: z.string().max(100).optional(),
  damage: z.string().max(100).optional(),
  armor: z.string().max(50).optional(),
  properties: z
    .array(z.string().max(50, "Property must be 50 characters or less"))
    .default([]),
  slot: z.number().int().min(0).max(10).default(1),
  quantity: z.string().max(50).optional(),
  is_public: z.boolean().default(false),
});

export type EquipmentCreateInput = z.infer<typeof EquipmentCreateSchema>;

// Schema for updating equipment (all fields optional)
export const EquipmentUpdateSchema = EquipmentCreateSchema.partial();

export type EquipmentUpdateInput = z.infer<typeof EquipmentUpdateSchema>;

// Schema for query parameters on list endpoint
export const EquipmentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().max(200).optional(),
});

export type EquipmentListQuery = z.infer<typeof EquipmentListQuerySchema>;

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
