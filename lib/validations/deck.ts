import { z } from "zod";

/**
 * Zod Validation Schemas for Deck Feature
 * Feature: 008-deck-building-for
 */

// Base Deck Schema (full database entity)
export const DeckSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Deck name is required")
    .max(100, "Deck name must be 100 characters or less"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Deck = z.infer<typeof DeckSchema>;

// Create Deck Schema (for POST /api/decks)
export const CreateDeckSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Deck name is required")
    .max(100, "Deck name must be 100 characters or less"),
});

export type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

// Update Deck Schema (for PUT /api/decks/[id])
export const UpdateDeckSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Deck name is required")
    .max(100, "Deck name must be 100 characters or less")
    .optional(),
  spell_ids: z
    .array(z.string().uuid())
    .max(52, "Deck cannot exceed 52 cards")
    .optional(),
});

export type UpdateDeckInput = z.infer<typeof UpdateDeckSchema>;

// Deck Item Schema (junction table entity)
export const DeckItemSchema = z.object({
  id: z.string().uuid(),
  deck_id: z.string().uuid(),
  spell_id: z.string().uuid(),
  position: z.number().int().positive().nullable(),
  added_at: z.coerce.date(),
});

export type DeckItem = z.infer<typeof DeckItemSchema>;

// Add Spell to Deck Schema (for POST /api/decks/[id]/spells)
export const AddSpellSchema = z.object({
  spell_id: z.string().uuid("Invalid spell ID"),
});

export type AddSpellInput = z.infer<typeof AddSpellSchema>;

// Deck with Spell Count (for list responses)
export const DeckWithCountSchema = DeckSchema.extend({
  spell_count: z.number().int().min(0).max(52),
});

export type DeckWithCount = z.infer<typeof DeckWithCountSchema>;

// Spell schema for deck details (subset of full spell)
export const SpellForDeckSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  tier: z.number().int().min(1).max(5),
  duration: z.string(),
  range: z.string(),
  description: z.string(),
  classes: z.array(z.string()).default([]),
});

export type SpellForDeck = z.infer<typeof SpellForDeckSchema>;

// Deck with Items (for GET /api/decks/[id])
export const DeckWithSpellsSchema = DeckSchema.extend({
  spell_count: z.number().int().min(0).max(52),
  spells: z.array(SpellForDeckSchema),
});

export type DeckWithSpells = z.infer<typeof DeckWithSpellsSchema>;

// Export PDF Schema (for POST /api/decks/[id]/export)
export const ExportPDFSchema = z.object({
  layout: z.enum(["grid", "single"]),
});

export type ExportPDFInput = z.infer<typeof ExportPDFSchema>;

// Query Parameters for GET /api/decks
export const ListDecksQuerySchema = z.object({
  sort: z.enum(["updated", "created", "name"]).optional().default("updated"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListDecksQuery = z.infer<typeof ListDecksQuerySchema>;

// API Response Schemas
export const ListDecksResponseSchema = z.object({
  decks: z.array(DeckWithCountSchema),
  total: z.number().int().min(0),
});

export type ListDecksResponse = z.infer<typeof ListDecksResponseSchema>;
