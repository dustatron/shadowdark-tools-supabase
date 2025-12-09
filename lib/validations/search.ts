import { z } from "zod";

export const SearchFormSchema = z.object({
  q: z.string().min(3, "Search requires at least 3 characters"),
  source: z.enum(["all", "core", "user"]).optional(),
  includeMonsters: z.coerce.boolean().optional(),
  includeMagicItems: z.coerce.boolean().optional(),
  includeEquipment: z.coerce.boolean().optional(),
  includeSpells: z.coerce.boolean().optional(),
  includeTypes: z.array(z.string()).optional(),
  limit: z.coerce
    .number()
    .pipe(z.union([z.literal(25), z.literal(50), z.literal(100)]))
    .optional(),
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;
