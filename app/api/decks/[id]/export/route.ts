import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ExportPDFSchema } from "@/lib/validations/deck";
import { z } from "zod";

/**
 * POST /api/decks/[id]/export - Generate PDF for deck
 * Authentication: Required (must be deck owner)
 * Body: { layout: "grid" | "single" }
 * TODO: Implement actual PDF generation with @react-pdf/renderer
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

    // Check if deck has spells
    const { count: spellCount } = await supabase
      .from("deck_items")
      .select("*", { count: "exact", head: true })
      .eq("deck_id", id);

    if (!spellCount || spellCount === 0) {
      return NextResponse.json(
        { error: "Cannot export empty deck" },
        { status: 400 },
      );
    }

    // TODO: Implement PDF generation
    // For now, return error indicating feature not yet implemented
    return NextResponse.json(
      {
        error: "Feature not yet implemented",
        message: "PDF export will be implemented in next phase",
        debug: {
          deck_id: id,
          deck_name: deck.name,
          spell_count: spellCount,
          layout,
        },
      },
      { status: 501 }, // 501 Not Implemented
    );

    // Future implementation will:
    // 1. Fetch all spells for deck
    // 2. Generate PDF using @react-pdf/renderer
    // 3. Return PDF with appropriate headers:
    //    Content-Type: application/pdf
    //    Content-Disposition: attachment; filename="deck-name.pdf"
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
