import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for spell updates
const SpellUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-z0-9_-]+$/,
        "Slug must be lowercase with hyphens or underscores",
      )
      .optional(),
    description: z.string().min(1).optional(),
    classes: z
      .array(z.string())
      .min(1, "At least one class must be specified")
      .optional(),
    duration: z.string().min(1).optional(),
    range: z.string().min(1).optional(),
    tier: z.number().int().min(1).max(5).optional(),
    source: z.string().optional(),
    author_notes: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// GET /api/spells/[id] - Get specific spell
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // First try to get from all_spells view (includes both official and user spells)
    const { data: spell, error } = await supabase
      .from("all_spells")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !spell) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    // Parse JSON fields if they're strings
    const responseSpell = {
      ...spell,
      classes:
        typeof spell.classes === "string"
          ? JSON.parse(spell.classes)
          : spell.classes,
    };

    return NextResponse.json(responseSpell);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/spells/[id] - Update user spell
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
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

    // Check if spell exists and user owns it
    const { data: existingSpell, error: fetchError } = await supabase
      .from("user_spells")
      .select("creator_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingSpell) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    if (existingSpell.creator_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own spells" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = SpellUpdateSchema.parse(body);

    // Prepare update data (stringify JSON fields)
    const updateData: any = { ...validatedData };
    if (updateData.classes) {
      updateData.classes = JSON.stringify(updateData.classes);
    }

    // Update the spell
    const { data: spell, error } = await supabase
      .from("user_spells")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A spell with this slug already exists" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to update spell" },
        { status: 500 },
      );
    }

    // Parse JSON fields back for response
    const responseSpell = {
      ...spell,
      classes: JSON.parse(spell.classes),
    };

    return NextResponse.json(responseSpell);
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

// DELETE /api/spells/[id] - Delete user spell
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
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

    // Check if spell exists and user owns it
    const { data: existingSpell, error: fetchError } = await supabase
      .from("user_spells")
      .select("creator_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingSpell) {
      return NextResponse.json({ error: "Spell not found" }, { status: 404 });
    }

    if (existingSpell.creator_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own spells" },
        { status: 403 },
      );
    }

    // Delete the spell
    const { error } = await supabase.from("user_spells").delete().eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete spell" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Spell deleted successfully" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
