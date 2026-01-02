import { z } from "zod";

/**
 * Zod Validation Schemas for Deck Feature
 * Feature: 008-deck-building-for
 * Extended: 018-we-already-have (Magic Item Cards in Decks)
 */

// Item type discriminator for deck_items
export const DeckItemType = z.enum(["spell", "magic_item"]);
export type DeckItemType = z.infer<typeof DeckItemType>;

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

// Deck Item Schema (junction table entity) - updated for magic items
export const DeckItemSchema = z.object({
  id: z.string().uuid(),
  deck_id: z.string().uuid(),
  item_type: DeckItemType.default("spell"),
  spell_id: z.string().uuid().nullable(),
  magic_item_id: z.string().uuid().nullable(),
  position: z.number().int().positive().nullable(),
  added_at: z.coerce.date(),
});

export type DeckItem = z.infer<typeof DeckItemSchema>;

// Add Spell to Deck Schema (for POST /api/decks/[id]/spells)
export const AddSpellSchema = z.object({
  spell_id: z.string().uuid("Invalid spell ID"),
});

export type AddSpellInput = z.infer<typeof AddSpellSchema>;

// Add Magic Item to Deck Schema (for POST /api/decks/[id]/magic-items)
export const AddMagicItemSchema = z.object({
  magic_item_id: z.string().uuid("Invalid magic item ID"),
});

export type AddMagicItemInput = z.infer<typeof AddMagicItemSchema>;

// Trait schema for magic items
export const TraitSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export type Trait = z.infer<typeof TraitSchema>;

// Magic Item schema for deck details (subset of full magic item)
export const MagicItemForDeckSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  traits: z.array(TraitSchema),
  image_url: z.string().nullable().optional(),
});

export type MagicItemForDeck = z.infer<typeof MagicItemForDeckSchema>;

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

// Deck with Items (for GET /api/decks/[id]) - legacy, spell-only
export const DeckWithSpellsSchema = DeckSchema.extend({
  spell_count: z.number().int().min(0).max(52),
  spells: z.array(SpellForDeckSchema),
});

export type DeckWithSpells = z.infer<typeof DeckWithSpellsSchema>;

// Deck with all Items including magic items (for GET /api/decks/[id])
export const DeckWithItemsSchema = DeckSchema.extend({
  item_count: z.number().int().min(0).max(52),
  spells: z.array(SpellForDeckSchema),
  magic_items: z.array(MagicItemForDeckSchema),
});

export type DeckWithItems = z.infer<typeof DeckWithItemsSchema>;

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
