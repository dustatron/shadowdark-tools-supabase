import { z } from "zod";

export const CreateListSchema = z.object({
  name: z
    .string()
    .min(1, "List name is required")
    .max(100, "List name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable(),
});

export type CreateListInput = z.infer<typeof CreateListSchema>;

export const AddToListSchema = z.object({
  listId: z.string().uuid("Invalid list ID"),
  entityId: z.string().uuid("Invalid entity ID"),
  entityType: z.enum(["monster", "spell"]),
  quantity: z.number().int().min(1).default(1),
  notes: z.string().max(500).optional().nullable(),
});

export type AddToListInput = z.infer<typeof AddToListSchema>;
