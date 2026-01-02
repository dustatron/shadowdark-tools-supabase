import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * DELETE /api/decks/[id]/magic-items/[item_id] - Remove magic item from deck
 * Authentication: Required (must be deck owner)
 * Note: item_id is the deck_items.id, not the magic_item_id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; item_id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id, item_id } = await params;

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

    // Delete the deck item (RLS will enforce ownership via deck)
    const { error: deleteError, count } = await supabase
      .from("deck_items")
      .delete({ count: "exact" })
      .eq("id", item_id)
      .eq("deck_id", id)
      .eq("item_type", "magic_item");

    if (deleteError) {
      console.error("Error removing magic item from deck:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove magic item from deck" },
        { status: 500 },
      );
    }

    if (count === 0) {
      return NextResponse.json(
        { error: "Magic item not found in deck" },
        { status: 404 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/decks/[id]/magic-items/[item_id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
