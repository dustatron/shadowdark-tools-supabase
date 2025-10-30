/**
 * Zod validation schemas for Random Encounter Tables
 * Based on data-model.md specifications
 */

import { z } from "zod";

// ============================================
// Filter Schemas
// ============================================

export const EncounterTableFiltersSchema = z
  .object({
    sources: z
      .array(z.enum(["official", "user", "public", "favorites"]))
      .min(1, "At least one monster source required"),
    level_min: z.number().int().min(1).max(20).optional().default(1),
    level_max: z.number().int().min(1).max(20).optional().default(20),
    movement_types: z
      .array(z.enum(["fly", "swim", "burrow", "climb"]))
      .optional(),
    search_query: z.string().max(100).optional(),
  })
  .refine((data) => data.level_min! <= data.level_max!, {
    message: "Minimum level must be less than or equal to maximum level",
    path: ["level_min"],
  });

export type EncounterTableFiltersInput = z.infer<
  typeof EncounterTableFiltersSchema
>;

// ============================================
// Table CRUD Schemas
// ============================================

export const EncounterTableCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Table name must be at least 3 characters")
    .max(100, "Table name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  die_size: z
    .number()
    .int()
    .min(2, "Die size must be at least 2")
    .max(1000, "Die size cannot exceed 1000"),
  filters: EncounterTableFiltersSchema,
  generate_immediately: z.boolean().default(true).optional(),
});

export type EncounterTableCreateInput = z.infer<
  typeof EncounterTableCreateSchema
>;

export const EncounterTableUpdateSchema = z.object({
  name: z
    .string()
    .min(3, "Table name must be at least 3 characters")
    .max(100, "Table name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  filters: EncounterTableFiltersSchema.optional(),
});

export type EncounterTableUpdateInput = z.infer<
  typeof EncounterTableUpdateSchema
>;

// ============================================
// Entry Replacement Schema
// ============================================

export const ReplaceEntrySchema = z
  .object({
    mode: z.enum(["random", "search"], {
      message: 'Mode must be either "random" or "search"',
    }),
    monster_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      // If mode is search, monster_id is required
      if (data.mode === "search") {
        return !!data.monster_id;
      }
      return true;
    },
    {
      message: "monster_id is required when mode is 'search'",
      path: ["monster_id"],
    },
  );

export type ReplaceEntryInput = z.infer<typeof ReplaceEntrySchema>;

// ============================================
// Share/Public Schema
// ============================================

export const ShareTableSchema = z.object({
  is_public: z.boolean(),
});

export type ShareTableInput = z.infer<typeof ShareTableSchema>;

// ============================================
// Pagination Schema
// ============================================

export const PaginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1, "Page must be at least 1")
    .default(1)
    .optional(),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20)
    .optional(),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

// ============================================
// UUID Validation Schema
// ============================================

export const UUIDSchema = z.string().uuid({
  message: "Invalid UUID format",
});

// ============================================
// Public Slug Validation Schema
// ============================================

export const PublicSlugSchema = z
  .string()
  .length(8, "Public slug must be exactly 8 characters");

// ============================================
// Monster Snapshot Schema (for validation)
// ============================================

const AttackSchema = z.object({
  name: z.string(),
  bonus: z.number().int(),
  damage: z.string(),
  damage_type: z.string(),
  range: z.string().nullable(),
  description: z.string().nullable(),
});

const AbilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  usage: z.string().nullable(),
});

const TreasureSchema = z.object({
  copper: z.number().int().nonnegative(),
  silver: z.number().int().nonnegative(),
  gold: z.number().int().nonnegative(),
  items: z.array(z.string()),
});

export const MonsterSnapshotSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  source: z.enum(["official", "user"]),
  challenge_level: z.number().int().min(1).max(20),
  armor_class: z.number().int(),
  hit_points: z.number().int().positive(),
  hit_dice: z.string(),
  speed: z.string(),
  movement_types: z.array(z.string()),
  str: z.number().int(),
  dex: z.number().int(),
  con: z.number().int(),
  int: z.number().int(),
  wis: z.number().int(),
  cha: z.number().int(),
  str_mod: z.number().int(),
  dex_mod: z.number().int(),
  con_mod: z.number().int(),
  int_mod: z.number().int(),
  wis_mod: z.number().int(),
  cha_mod: z.number().int(),
  attacks: z.array(AttackSchema),
  abilities: z.array(AbilitySchema),
  traits: z.string().nullable(),
  alignment: z.enum(["Lawful", "Neutral", "Chaotic"]).nullable(),
  size: z.string().nullable(),
  type: z.string().nullable(),
  description: z.string().nullable(),
  lore: z.string().nullable(),
  treasure: TreasureSchema.nullable(),
  user_id: z.string().uuid().nullable(),
  is_public: z.boolean(),
  icon_url: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type MonsterSnapshotInput = z.infer<typeof MonsterSnapshotSchema>;
