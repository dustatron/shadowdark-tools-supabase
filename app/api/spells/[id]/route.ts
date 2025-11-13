import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spellUpdateSchema } from "@/lib/validations/spell";
import { generateSlug } from "@/lib/utils/slug";

// GET /api/spells/[id] - Get single spell by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // RLS handles visibility (owned OR public)
    const { data: spell, error } = await supabase
      .from("user_spells")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !spell) {
      console.error("Database error fetching spell:", error);
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    // Parse JSONB classes field
    const parsedSpell = {
      ...spell,
      classes:
        typeof spell.classes === "string"
          ? JSON.parse(spell.classes)
          : spell.classes,
    };

    return NextResponse.json(parsedSpell);
  } catch (error) {
    console.error("API error in GET /api/spells/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/spells/[id] - Update spell
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to update spells",
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data (partial update)
    const validationResult = spellUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid spell data provided",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const updateData = validationResult.data;

    // If name is being changed, check uniqueness and regenerate slug
    if (updateData.name) {
      // Check name uniqueness (excluding current spell)
      const { data: existing, error: checkError } = await supabase
        .from("all_spells")
        .select("id, name")
        .ilike("name", updateData.name)
        .neq("id", id)
        .limit(1);

      if (checkError) {
        console.error("Error checking spell name uniqueness:", checkError);
        return NextResponse.json(
          { error: "Failed to validate spell name" },
          { status: 500 },
        );
      }

      if (existing && existing.length > 0) {
        return NextResponse.json(
          {
            error: "Duplicate name",
            message: "A spell with this name already exists",
          },
          { status: 409 },
        );
      }

      // Regenerate slug if name changed
      (updateData as any).slug = generateSlug(updateData.name);
    }

    // Update spell (RLS enforces ownership)
    const { data: updatedSpell, error: updateError } = await supabase
      .from("user_spells")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating spell:", updateError);

      // Check if error is due to RLS (permission denied)
      if (updateError.code === "PGRST301") {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "You don't have permission to update this spell",
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to update spell",
          details: updateError.message,
        },
        { status: 500 },
      );
    }

    if (!updatedSpell) {
      return NextResponse.json(
        { error: "Spell not found or you don't have permission to update it" },
        { status: 404 },
      );
    }

    // Parse JSONB classes field before returning
    const parsedSpell = {
      ...updatedSpell,
      classes:
        typeof updatedSpell.classes === "string"
          ? JSON.parse(updatedSpell.classes)
          : updatedSpell.classes,
    };

    return NextResponse.json(parsedSpell);
  } catch (error) {
    console.error("Unexpected error in PUT /api/spells/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while updating the spell",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/spells/[id] - Delete spell
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required to delete spells",
        },
        { status: 401 },
      );
    }

    // Delete spell (RLS enforces ownership)
    const { error: deleteError } = await supabase
      .from("user_spells")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting spell:", deleteError);

      // Check if error is due to RLS (permission denied)
      if (deleteError.code === "PGRST301") {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "You don't have permission to delete this spell",
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to delete spell",
          details: deleteError.message,
        },
        { status: 500 },
      );
    }

    // Return 204 No Content on successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/spells/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while deleting the spell",
      },
      { status: 500 },
    );
  }
}
