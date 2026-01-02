import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  UpdateDeckSchema,
  type DeckWithItems,
  type DeckWithCount,
  type SpellForDeck,
  type MagicItemForDeck,
} from "@/lib/validations/deck";
import { z } from "zod";

/**
 * GET /api/decks/[id] - Get deck with spells and magic items
 * Authentication: Required (must be deck owner)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get deck (RLS will enforce ownership)
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", id)
      .single();

    if (deckError || !deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Get deck items with type info
    const { data: items, error: itemsError } = await supabase
      .from("deck_items")
      .select("id, item_type, spell_id, magic_item_id, added_at")
      .eq("deck_id", id)
      .order("added_at");

    if (itemsError) {
      console.error("Error fetching deck items:", itemsError);
      return NextResponse.json(
        { error: "Failed to fetch deck items" },
        { status: 500 },
      );
    }

    // Separate spell and magic item IDs
    const spellItems = (items || []).filter(
      (item) => item.item_type === "spell",
    );
    const magicItemItems = (items || []).filter(
      (item) => item.item_type === "magic_item",
    );

    const spellIds = spellItems.map((item) => item.spell_id).filter(Boolean);
    const magicItemIds = magicItemItems
      .map((item) => item.magic_item_id)
      .filter(Boolean);

    // Fetch spells
    const spells: SpellForDeck[] = [];
    if (spellIds.length > 0) {
      const [{ data: officialSpells }, { data: userSpells }] =
        await Promise.all([
          supabase
            .from("official_spells")
            .select("id, name, tier, duration, range, description, classes")
            .in("id", spellIds),
          supabase
            .from("user_spells")
            .select("id, name, tier, duration, range, description, classes")
            .in("id", spellIds),
        ]);

      // Combine spells maintaining order from deck_items
      for (const item of spellItems) {
        const spell =
          officialSpells?.find((s) => s.id === item.spell_id) ||
          userSpells?.find((s) => s.id === item.spell_id);

        if (spell) {
          spells.push(spell as SpellForDeck);
        }
      }
    }

    // Fetch magic items
    const magicItems: MagicItemForDeck[] = [];
    if (magicItemIds.length > 0) {
      const [{ data: officialItems }, { data: userItems }] = await Promise.all([
        supabase
          .from("official_magic_items")
          .select("id, name, slug, description, traits, image_url")
          .in("id", magicItemIds),
        supabase
          .from("user_magic_items")
          .select("id, name, slug, description, traits, image_url")
          .in("id", magicItemIds),
      ]);

      // Combine magic items maintaining order from deck_items
      for (const item of magicItemItems) {
        const magicItem =
          officialItems?.find((m) => m.id === item.magic_item_id) ||
          userItems?.find((m) => m.id === item.magic_item_id);

        if (magicItem) {
          magicItems.push(magicItem as MagicItemForDeck);
        }
      }
    }

    const response: DeckWithItems = {
      id: deck.id,
      user_id: deck.user_id,
      name: deck.name,
      created_at: new Date(deck.created_at),
      updated_at: new Date(deck.updated_at),
      item_count: (items || []).length,
      spells,
      magic_items: magicItems,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/decks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/decks/[id] - Update deck name or spell list
 * Authentication: Required (must be deck owner)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Verify deck exists and user owns it
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select("*")
      .eq("id", id)
      .single();

    if (deckError || !deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = UpdateDeckSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { name, spell_ids } = validationResult.data;

    // Update name if provided
    if (name !== undefined) {
      const { error: updateError } = await supabase
        .from("decks")
        .update({ name })
        .eq("id", id);

      if (updateError) {
        console.error("Error updating deck name:", updateError);
        return NextResponse.json(
          { error: "Failed to update deck" },
          { status: 500 },
        );
      }
    }

    // Update spell list if provided
    if (spell_ids !== undefined) {
      // Check for duplicates
      const uniqueSpellIds = new Set(spell_ids);
      if (uniqueSpellIds.size !== spell_ids.length) {
        return NextResponse.json(
          { error: "Duplicate spells not allowed" },
          { status: 409 },
        );
      }

      // Delete existing items
      const { error: deleteError } = await supabase
        .from("deck_items")
        .delete()
        .eq("deck_id", id);

      if (deleteError) {
        console.error("Error deleting deck items:", deleteError);
        return NextResponse.json(
          { error: "Failed to update deck" },
          { status: 500 },
        );
      }

      // Insert new items
      if (spell_ids.length > 0) {
        const items = spell_ids.map((spell_id) => ({
          deck_id: id,
          item_type: "spell" as const,
          spell_id,
          magic_item_id: null,
        }));

        const { error: insertError } = await supabase
          .from("deck_items")
          .insert(items);

        if (insertError) {
          console.error("Error inserting deck items:", insertError);
          // Check if it's a constraint violation (52 card limit)
          if (insertError.message.includes("52 cards")) {
            return NextResponse.json(
              { error: "Deck cannot exceed 52 cards" },
              { status: 400 },
            );
          }
          return NextResponse.json(
            { error: "Failed to update deck" },
            { status: 500 },
          );
        }
      }
    }

    // Get updated deck with spell count
    const { data: updatedDeck } = await supabase
      .from("decks")
      .select("*")
      .eq("id", id)
      .single();

    const { count: spellCount } = await supabase
      .from("deck_items")
      .select("*", { count: "exact", head: true })
      .eq("deck_id", id);

    const response: DeckWithCount = {
      id: updatedDeck!.id,
      user_id: updatedDeck!.user_id,
      name: updatedDeck!.name,
      created_at: new Date(updatedDeck!.created_at),
      updated_at: new Date(updatedDeck!.updated_at),
      spell_count: spellCount || 0,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Unexpected error in PUT /api/decks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/decks/[id] - Delete deck
 * Authentication: Required (must be deck owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Delete deck (RLS will enforce ownership, cascade will delete items)
    const { error: deleteError } = await supabase
      .from("decks")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting deck:", deleteError);
      // Check if deck doesn't exist
      if (deleteError.code === "PGRST116") {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to delete deck" },
        { status: 500 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/decks/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
