import { z } from "zod";

export const SearchFormSchema = z.object({
  q: z.string().min(3, "Search requires at least 3 characters"),
  source: z.enum(["all", "core", "user"]).default("all"),
  includeMonsters: z.coerce.boolean().default(true),
  includeMagicItems: z.coerce.boolean().default(true),
  includeEquipment: z.coerce.boolean().default(true),
  limit: z.coerce
    .number()
    .pipe(z.union([z.literal(25), z.literal(50), z.literal(100)]))
    .default(25),
});

export type SearchFormValues = z.infer<typeof SearchFormSchema>;

export const defaultSearchFormValues: SearchFormValues = {
  q: "",
  source: "all",
  includeMonsters: true,
  includeMagicItems: true,
  includeEquipment: true,
  limit: 25,
};
