import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ShareTableSchema, UUIDSchema } from "@/lib/encounter-tables/schemas";
import { generateUniqueSlug } from "@/lib/encounter-tables/utils/generate-slug";

/**
 * PATCH /api/encounter-tables/[id]/share
 * Toggle public/private status of an encounter table
 * - Making public: generates a unique slug
 * - Making private: removes the slug
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
    const { is_public } = ShareTableSchema.parse(body);

    // Check if table exists and user owns it
    const { data: existingTable, error: fetchError } = await supabase
      .from("encounter_tables")
      .select("id, user_id, is_public, public_slug")
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

    // No change needed
    if (existingTable.is_public === is_public) {
      return NextResponse.json({
        message: `Table is already ${is_public ? "public" : "private"}`,
        is_public,
        public_slug: existingTable.public_slug,
      });
    }

    // Prepare update data
    const updateData: { is_public: boolean; public_slug: string | null } = {
      is_public,
      public_slug: null,
    };

    // If making public, generate unique slug
    if (is_public) {
      try {
        const slug = await generateUniqueSlug();
        updateData.public_slug = slug;
      } catch (error) {
        console.error("Failed to generate unique slug:", error);
        return NextResponse.json(
          { error: "Failed to generate public link. Please try again." },
          { status: 500 },
        );
      }
    }

    // Update the table
    const { data: updatedTable, error: updateError } = await supabase
      .from("encounter_tables")
      .update(updateData)
      .eq("id", id)
      .select("id, is_public, public_slug")
      .single();

    if (updateError) {
      console.error("Database error updating table:", updateError);
      return NextResponse.json(
        { error: "Failed to update table sharing status" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: `Table is now ${is_public ? "public" : "private"}`,
      is_public: updatedTable.is_public,
      public_slug: updatedTable.public_slug,
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

    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
