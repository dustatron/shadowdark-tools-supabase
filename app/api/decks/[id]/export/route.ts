import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ExportPDFSchema, type SpellForDeck } from "@/lib/validations/deck";
import * as PDFGenerator from "@/lib/pdf/generator";
import { z } from "zod";

/**
 * POST /api/decks/[id]/export - Generate PDF for deck
 * Authentication: Required (must be deck owner)
 * Body: { layout: "grid" | "single" }
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
    const validationResult = ExportPDFSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { layout } = validationResult.data;

    // Get deck items with spell IDs
    const { data: items, error: itemsError } = await supabase
      .from("deck_items")
      .select("spell_id, added_at")
      .eq("deck_id", id)
      .order("added_at");

    if (itemsError) {
      console.error("Error fetching deck items:", itemsError);
      return NextResponse.json(
        { error: "Failed to fetch deck items" },
        { status: 500 },
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cannot export empty deck" },
        { status: 400 },
      );
    }

    // Fetch spell data from both official_spells and user_spells
    const spellIds = items.map((item) => item.spell_id);
    const spells: SpellForDeck[] = [];

    // Fetch from official_spells
    const { data: officialSpells } = await supabase
      .from("official_spells")
      .select("id, name, tier, duration, range, description, classes")
      .in("id", spellIds);

    // Fetch from user_spells
    const { data: userSpells } = await supabase
      .from("user_spells")
      .select("id, name, tier, duration, range, description, classes")
      .in("id", spellIds);

    // Combine spells maintaining order from deck_items
    for (const item of items) {
      const spell =
        officialSpells?.find((s) => s.id === item.spell_id) ||
        userSpells?.find((s) => s.id === item.spell_id);

      if (spell) {
        spells.push(spell as SpellForDeck);
      }
    }

    // Generate PDF
    const pdfBuffer = await PDFGenerator.generateDeckPDF(
      deck.name,
      spells,
      layout,
    );

    // Sanitize filename (remove special chars, limit length)
    const sanitizedName = deck.name
      .replace(/[^a-z0-9-_]/gi, "-")
      .substring(0, 50);
    const filename = `${sanitizedName}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF with appropriate headers
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
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

    console.error("Unexpected error in POST /api/decks/[id]/export:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
