import { z } from "zod";

/**
 * Zod schema for search filters/query parameters
 * Used to validate incoming search requests
 */
export const SearchFiltersSchema = z.object({
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

export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

/**
 * Schema for validating form input (uses strings for select values)
 */
export const SearchFormSchema = z
  .object({
    q: z.string().min(3, "Search requires at least 3 characters"),
    source: z.enum(["all", "core", "user"]),
    includeMonsters: z.boolean(),
    includeMagicItems: z.boolean(),
    includeEquipment: z.boolean(),
    limit: z.enum(["25", "50", "100"]),
  })
  .refine(
    (data) =>
      data.includeMonsters || data.includeMagicItems || data.includeEquipment,
    {
      message: "At least one content type must be selected",
      path: ["includeMonsters"],
    },
  );

export type SearchFormValues = z.infer<typeof SearchFormSchema>;

/**
 * Default form values for the search form
 */
export const defaultSearchFormValues: SearchFormValues = {
  q: "",
  source: "all",
  includeMonsters: true,
  includeMagicItems: true,
  includeEquipment: true,
  limit: "25",
};
