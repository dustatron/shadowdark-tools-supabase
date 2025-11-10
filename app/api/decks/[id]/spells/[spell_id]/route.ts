import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { type DeckWithCount } from "@/lib/validations/deck";

/**
 * DELETE /api/decks/[id]/spells/[spell_id] - Remove spell from deck
 * Authentication: Required (must be deck owner)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; spell_id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id, spell_id } = await params;

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

    // Check if spell is in deck
    const { data: deckItem, error: findError } = await supabase
      .from("deck_items")
      .select("*")
      .eq("deck_id", id)
      .eq("spell_id", spell_id)
      .single();

    if (findError || !deckItem) {
      return NextResponse.json(
        { error: "Spell not found in deck" },
        { status: 404 },
      );
    }

    // Delete deck item
    const { error: deleteError } = await supabase
      .from("deck_items")
      .delete()
      .eq("deck_id", id)
      .eq("spell_id", spell_id);

    if (deleteError) {
      console.error("Error removing spell from deck:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove spell from deck" },
        { status: 500 },
      );
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
    console.error(
      "Unexpected error in DELETE /api/decks/[id]/spells/[spell_id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
