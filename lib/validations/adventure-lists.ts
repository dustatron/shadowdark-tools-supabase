import { z } from "zod";

export const adventureListSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .nullable()
    .optional(),
  notes: z
    .string()
    .max(2000, "Notes must be 2000 characters or less")
    .nullable()
    .optional(),
  image_url: z
    .string()
    .url("Please enter a valid URL")
    .max(500, "URL must be 500 characters or less")
    .nullable()
    .optional()
    .or(z.literal("")),
  is_public: z.boolean().default(false),
});

export type AdventureListInput = z.infer<typeof adventureListSchema>;

export const adventureListItemSchema = z.object({
  item_type: z.enum(["monster", "spell", "magic_item"]),
  item_id: z.string().uuid("Invalid item ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity must be 99 or less")
    .default(1),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less")
    .nullable()
    .optional(),
});

export type AdventureListItemInput = z.infer<typeof adventureListItemSchema>;

export const adventureListItemUpdateSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity must be 99 or less")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or less")
    .nullable()
    .optional(),
});

export type AdventureListItemUpdateInput = z.infer<
  typeof adventureListItemUpdateSchema
>;
