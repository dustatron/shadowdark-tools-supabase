/**
 * API Route: /api/encounter-tables/[id]
 * Handles single encounter table operations: GET, PATCH, DELETE
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  EncounterTableUpdateSchema,
  UUIDSchema,
} from "@/lib/encounter-tables/schemas";
import { selectTableWithEntries } from "@/lib/encounter-tables/queries";

/**
 * GET /api/encounter-tables/[id]
 * Fetch single encounter table with all entries
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID
    const uuidResult = UUIDSchema.safeParse(id);
    if (!uuidResult.success) {
      return NextResponse.json(
        { error: "Invalid table ID format" },
        { status: 400 },
      );
    }

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

    // Fetch table with entries using query helper
    const { data: table, error: fetchError } = await selectTableWithEntries(
      supabase,
      id,
    );

    if (fetchError) {
      console.error("Error fetching table:", fetchError);

      // Check if it's a not found error
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Table not found" }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Failed to fetch table" },
        { status: 500 },
      );
    }

    if (!table) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (table.user_id !== user.id) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error("Unexpected error in GET /api/encounter-tables/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/encounter-tables/[id]
 * Update encounter table settings (name, description, filters)
 * Note: Updating filters does NOT regenerate entries automatically
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID
    const uuidResult = UUIDSchema.safeParse(id);
    if (!uuidResult.success) {
      return NextResponse.json(
        { error: "Invalid table ID format" },
        { status: 400 },
      );
    }

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
    const validationResult = EncounterTableUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const updates = validationResult.data;

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Verify table exists and user owns it
    const { data: existingTable, error: checkError } = await supabase
      .from("encounter_tables")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Update the table
    const { data: updatedTable, error: updateError } = await supabase
      .from("encounter_tables")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `
        id,
        user_id,
        name,
        description,
        die_size,
        is_public,
        public_slug,
        filters,
        created_at,
        updated_at,
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
      .order("roll_number", {
        foreignTable: "encounter_table_entries",
        ascending: true,
      })
      .single();

    if (updateError) {
      console.error("Error updating table:", updateError);
      return NextResponse.json(
        { error: "Failed to update table" },
        { status: 500 },
      );
    }

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error(
      "Unexpected error in PATCH /api/encounter-tables/[id]:",
      error,
    );

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

/**
 * DELETE /api/encounter-tables/[id]
 * Delete encounter table and all its entries
 * Note: Entries should cascade delete via foreign key constraint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID
    const uuidResult = UUIDSchema.safeParse(id);
    if (!uuidResult.success) {
      return NextResponse.json(
        { error: "Invalid table ID format" },
        { status: 400 },
      );
    }

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

    // Verify table exists and user owns it
    const { data: existingTable, error: checkError } = await supabase
      .from("encounter_tables")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Delete the table (entries will cascade delete)
    const { error: deleteError } = await supabase
      .from("encounter_tables")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting table:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete table" },
        { status: 500 },
      );
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/encounter-tables/[id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
