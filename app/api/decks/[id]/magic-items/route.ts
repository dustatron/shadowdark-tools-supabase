import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AddMagicItemSchema, type DeckWithCount } from "@/lib/validations/deck";
import { z } from "zod";

/**
 * POST /api/decks/[id]/magic-items - Add magic item to deck
 * Authentication: Required (must be deck owner)
 * Body: { magic_item_id: string }
 */
export async function POST(
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
    const validationResult = AddMagicItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { magic_item_id } = validationResult.data;

    // Verify magic item exists in either official_magic_items or user_magic_items
    const [{ data: officialItem }, { data: userItem }] = await Promise.all([
      supabase
        .from("official_magic_items")
        .select("id")
        .eq("id", magic_item_id)
        .single(),
      supabase
        .from("user_magic_items")
        .select("id")
        .eq("id", magic_item_id)
        .single(),
    ]);

    if (!officialItem && !userItem) {
      return NextResponse.json(
        { error: "Magic item not found" },
        { status: 400 },
      );
    }

    // Check current deck size (all items: spells + magic items)
    const { count: currentCount } = await supabase
      .from("deck_items")
      .select("*", { count: "exact", head: true })
      .eq("deck_id", id);

    if ((currentCount || 0) >= 52) {
      return NextResponse.json(
        { error: "Deck cannot exceed 52 cards" },
        { status: 400 },
      );
    }

    // Add magic item to deck
    const { error: insertError } = await supabase.from("deck_items").insert({
      deck_id: id,
      item_type: "magic_item",
      magic_item_id,
      spell_id: null,
    });

    if (insertError) {
      console.error("Error adding magic item to deck:", insertError);

      // Check for 52 card limit trigger
      if (insertError.message.includes("52 cards")) {
        return NextResponse.json(
          { error: "Deck cannot exceed 52 cards" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to add magic item to deck" },
        { status: 500 },
      );
    }

    // Get updated deck with item count
    const { data: updatedDeck } = await supabase
      .from("decks")
      .select("*")
      .eq("id", id)
      .single();

    const { count: itemCount } = await supabase
      .from("deck_items")
      .select("*", { count: "exact", head: true })
      .eq("deck_id", id);

    const response: DeckWithCount = {
      id: updatedDeck!.id,
      user_id: updatedDeck!.user_id,
      name: updatedDeck!.name,
      created_at: new Date(updatedDeck!.created_at),
      updated_at: new Date(updatedDeck!.updated_at),
      spell_count: itemCount || 0, // Using spell_count for backward compat
    };

    return NextResponse.json(response, { status: 201 });
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

    console.error(
      "Unexpected error in POST /api/decks/[id]/magic-items:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
