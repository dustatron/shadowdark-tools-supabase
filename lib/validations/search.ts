import { z } from "zod";

const booleanQueryParam = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === "string") {
      return val === "true";
    }
    return val;
  });

export const SearchFormSchema = z.object({
  q: z.string().min(3, "Search requires at least 3 characters"),
  source: z.enum(["all", "core", "user"]).optional(),
  includeMonsters: booleanQueryParam.optional(),
  includeMagicItems: booleanQueryParam.optional(),
  includeEquipment: booleanQueryParam.optional(),
  includeSpells: booleanQueryParam.optional(),
  includeTypes: z.array(z.string()).optional(),
  limit: z.coerce
    .number()
    .pipe(z.union([z.literal(25), z.literal(50), z.literal(100)]))
    .optional(),
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;
