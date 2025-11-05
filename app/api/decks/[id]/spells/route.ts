import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AddSpellSchema, type DeckWithCount } from "@/lib/validations/deck";
import { z } from "zod";

/**
 * POST /api/decks/[id]/spells - Add spell to deck
 * Authentication: Required (must be deck owner)
 * Body: { spell_id: string }
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
    const validationResult = AddSpellSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { spell_id } = validationResult.data;

    // Verify spell exists in either official_spells or user_spells
    const [{ data: officialSpell }, { data: userSpell }] = await Promise.all([
      supabase.from("official_spells").select("id").eq("id", spell_id).single(),
      supabase.from("user_spells").select("id").eq("id", spell_id).single(),
    ]);

    if (!officialSpell && !userSpell) {
      return NextResponse.json({ error: "Spell not found" }, { status: 400 });
    }

    // Check current deck size
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

    // Add spell to deck
    const { error: insertError } = await supabase.from("deck_items").insert({
      deck_id: id,
      spell_id,
    });

    if (insertError) {
      console.error("Error adding spell to deck:", insertError);

      // Check for duplicate (unique constraint violation)
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Spell already in deck" },
          { status: 400 },
        );
      }

      // Check for 52 card limit trigger
      if (insertError.message.includes("52 cards")) {
        return NextResponse.json(
          { error: "Deck cannot exceed 52 cards" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to add spell to deck" },
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

    console.error("Unexpected error in POST /api/decks/[id]/spells:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
