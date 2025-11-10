import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CreateDeckSchema,
  ListDecksQuerySchema,
  type ListDecksResponse,
  type DeckWithCount,
} from "@/lib/validations/deck";
import { z } from "zod";

/**
 * GET /api/decks - List user's decks
 * Authentication: Required
 * Query params: sort, order
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      sort: searchParams.get("sort") || "updated",
      order: searchParams.get("order") || "desc",
    };

    const validationResult = ListDecksQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { sort, order } = validationResult.data;

    // Build query to get decks with spell counts
    const sortColumn =
      sort === "name"
        ? "name"
        : sort === "created"
          ? "created_at"
          : "updated_at";
    const ascending = order === "asc";

    // Query decks with spell count
    const { data: decksData, error: decksError } = await supabase
      .from("decks")
      .select(
        `
        id,
        name,
        created_at,
        updated_at,
        user_id
      `,
      )
      .eq("user_id", user.id)
      .order(sortColumn, { ascending });

    if (decksError) {
      console.error("Error fetching decks:", decksError);
      return NextResponse.json(
        { error: "Failed to fetch decks" },
        { status: 500 },
      );
    }

    // Get spell counts for each deck
    const decksWithCounts: DeckWithCount[] = await Promise.all(
      (decksData || []).map(async (deck) => {
        const { count } = await supabase
          .from("deck_items")
          .select("*", { count: "exact", head: true })
          .eq("deck_id", deck.id);

        return {
          id: deck.id,
          user_id: deck.user_id,
          name: deck.name,
          created_at: new Date(deck.created_at),
          updated_at: new Date(deck.updated_at),
          spell_count: count || 0,
        };
      }),
    );

    const response: ListDecksResponse = {
      decks: decksWithCounts,
      total: decksWithCounts.length,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/decks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/decks - Create new deck
 * Authentication: Required
 * Body: { name: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = CreateDeckSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { name } = validationResult.data;

    // Create deck
    const { data: newDeck, error: insertError } = await supabase
      .from("decks")
      .insert({
        name,
        user_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating deck:", insertError);
      return NextResponse.json(
        { error: "Failed to create deck" },
        { status: 500 },
      );
    }

    // Return deck with spell_count = 0
    const response: DeckWithCount = {
      id: newDeck.id,
      user_id: newDeck.user_id,
      name: newDeck.name,
      created_at: new Date(newDeck.created_at),
      updated_at: new Date(newDeck.updated_at),
      spell_count: 0,
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

    console.error("Unexpected error in POST /api/decks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
