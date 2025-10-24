/**
 * API Route: /api/encounter-tables/[id]
 * Handles individual encounter table operations
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { selectTableWithEntries } from "@/lib/encounter-tables/queries";
import {
  EncounterTableUpdateSchema,
  UUIDSchema,
} from "@/lib/encounter-tables/schemas";
import { z } from "zod";

/**
 * GET /api/encounter-tables/[id]
 * Fetch single table with entries
 * - Public tables can be viewed by anyone
 * - Private tables require ownership
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID format
    try {
      UUIDSchema.parse(id);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid table ID format" },
        { status: 400 },
      );
    }

    // Check authentication (optional for public tables)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch the table with entries
    const { data: table, error: fetchError } = await selectTableWithEntries(
      supabase,
      id,
    );

    if (fetchError || !table) {
      return NextResponse.json(
        { error: "Encounter table not found" },
        { status: 404 },
      );
    }

    // Check access permissions
    // Allow if: table is public OR user owns the table
    if (!table.is_public && (!user || table.user_id !== user.id)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have access to this table" },
        { status: 403 },
      );
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
 * Update table settings (name, description, filters)
 * - Requires authentication and ownership
 * - Does not regenerate entries automatically
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID format
    try {
      UUIDSchema.parse(id);
    } catch (error) {
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

    const updateData = validationResult.data;

    // Check if table exists and user owns it
    const { data: existingTable, error: fetchError } = await supabase
      .from("encounter_tables")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingTable) {
      return NextResponse.json(
        { error: "Encounter table not found" },
        { status: 404 },
      );
    }

    if (existingTable.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only modify your own tables" },
        { status: 403 },
      );
    }

    // Update the table
    const { data: updatedTable, error: updateError } = await supabase
      .from("encounter_tables")
      .update({
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && {
          description: updateData.description,
        }),
        ...(updateData.filters && { filters: updateData.filters }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Database error updating table:", updateError);
      return NextResponse.json(
        { error: "Failed to update encounter table" },
        { status: 500 },
      );
    }

    // Fetch complete table with entries
    const { data: completeTable, error: completeError } =
      await selectTableWithEntries(supabase, id);

    if (completeError) {
      // Return updated table without entries if fetch fails
      return NextResponse.json(updatedTable);
    }

    return NextResponse.json(completeTable);
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
      "Unexpected error in PATCH /api/encounter-tables/[id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/encounter-tables/[id]
 * Delete encounter table
 * - Requires authentication and ownership
 * - Cascade deletes entries via foreign key constraint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID format
    try {
      UUIDSchema.parse(id);
    } catch (error) {
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

    // Check if table exists and user owns it
    const { data: existingTable, error: fetchError } = await supabase
      .from("encounter_tables")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingTable) {
      return NextResponse.json(
        { error: "Encounter table not found" },
        { status: 404 },
      );
    }

    if (existingTable.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own tables" },
        { status: 403 },
      );
    }

    // Delete the table (cascade will handle entries)
    const { error: deleteError } = await supabase
      .from("encounter_tables")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database error deleting table:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete encounter table" },
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
