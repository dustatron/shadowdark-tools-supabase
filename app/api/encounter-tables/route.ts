/**
 * API Route: /api/encounter-tables
 * Handles listing and creating encounter tables
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  EncounterTableCreateSchema,
  PaginationSchema,
} from "@/lib/encounter-tables/schemas";
import { generateTableEntries } from "@/lib/encounter-tables/utils/generate-table";
import { TABLE_SELECT } from "@/lib/encounter-tables/queries";

/**
 * GET /api/encounter-tables
 * List user's encounter tables with pagination
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

    // Parse and validate pagination params
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const paginationResult = PaginationSchema.safeParse({ page, limit });
    if (!paginationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid pagination parameters",
          details: paginationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { page: validPage, limit: validLimit } = paginationResult.data;

    // Calculate offset
    const offset = (validPage! - 1) * validLimit!;

    // Get total count
    const { count: total, error: countError } = await supabase
      .from("encounter_tables")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      console.error("Error counting tables:", countError);
      return NextResponse.json(
        { error: "Failed to count tables" },
        { status: 500 },
      );
    }

    // Fetch paginated tables
    const { data: tables, error: fetchError } = await supabase
      .from("encounter_tables")
      .select(TABLE_SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + validLimit! - 1);

    if (fetchError) {
      console.error("Error fetching tables:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch tables" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: tables || [],
      pagination: {
        page: validPage,
        limit: validLimit,
        total: total || 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/encounter-tables:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/encounter-tables
 * Create new encounter table with optional immediate entry generation
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
    const validationResult = EncounterTableCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { name, description, die_size, filters, generate_immediately } =
      validationResult.data;

    // Create the table first (without entries)
    const { data: table, error: tableError } = await supabase
      .from("encounter_tables")
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        die_size,
        filters,
        is_public: false,
        public_slug: null,
      })
      .select(TABLE_SELECT)
      .single();

    if (tableError) {
      console.error("Error creating table:", tableError);
      return NextResponse.json(
        { error: "Failed to create encounter table" },
        { status: 500 },
      );
    }

    // Generate entries if requested (default true)
    if (generate_immediately !== false) {
      try {
        const entries = await generateTableEntries(table.id, die_size, filters);

        // Insert all entries
        const { error: entriesError } = await supabase
          .from("encounter_table_entries")
          .insert(entries);

        if (entriesError) {
          console.error("Error creating entries:", entriesError);
          // Delete the table since entry generation failed
          await supabase.from("encounter_tables").delete().eq("id", table.id);

          return NextResponse.json(
            { error: "Failed to generate table entries" },
            { status: 500 },
          );
        }

        // Fetch the complete table with entries
        const { data: completeTable, error: fetchError } = await supabase
          .from("encounter_tables")
          .select(
            `
            ${TABLE_SELECT},
            entries:encounter_table_entries(
              id,
              table_id,
              roll_number,
              monster_id,
              monster_snapshot,
              created_at,
              updated_at
            )
          `,
          )
          .eq("id", table.id)
          .order("roll_number", {
            foreignTable: "encounter_table_entries",
            ascending: true,
          })
          .single();

        if (fetchError) {
          console.error("Error fetching complete table:", fetchError);
          return NextResponse.json(table, { status: 201 });
        }

        return NextResponse.json(completeTable, { status: 201 });
      } catch (error) {
        console.error("Error generating table entries:", error);

        // Delete the table since entry generation failed
        await supabase.from("encounter_tables").delete().eq("id", table.id);

        // Check if error is about insufficient monsters
        if (error instanceof Error) {
          return NextResponse.json(
            {
              error: error.message.includes("monsters match")
                ? error.message
                : "Insufficient monsters match your criteria",
            },
            { status: 400 },
          );
        }

        return NextResponse.json(
          { error: "Failed to generate encounter table" },
          { status: 500 },
        );
      }
    }

    // Return table without entries
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/encounter-tables:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
