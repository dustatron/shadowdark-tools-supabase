import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for monster updates
const MonsterUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    challenge_level: z.number().int().min(1).max(20).optional(),
    hit_points: z.number().int().min(1).optional(),
    armor_class: z.number().int().min(1).max(25).optional(),
    speed: z.string().min(1).optional(),
    attacks: z
      .array(
        z.object({
          name: z.string(),
          type: z.enum(["melee", "ranged"]),
          damage: z.string(),
          range: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
    abilities: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    treasure: z.string().nullable().optional(),
    tags: z
      .object({
        type: z.array(z.string()),
        location: z.array(z.string()),
      })
      .optional(),
    author_notes: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

// GET /api/monsters/[id] - Get specific monster
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid ID format", message: "ID must be a valid UUID" },
        { status: 400 },
      );
    }

    // First try to get from all_monsters view (includes both official and user monsters)
    const { data: monster, error } = await supabase
      .from("all_monsters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !monster) {
      console.error("Database error fetching monster:", error);
      return NextResponse.json({ error: "Monster not found" }, { status: 404 });
    }

    // Parse JSON fields if they're strings
    const responseMonster = {
      ...monster,
      attacks:
        typeof monster.attacks === "string"
          ? JSON.parse(monster.attacks)
          : monster.attacks,
      abilities:
        typeof monster.abilities === "string"
          ? JSON.parse(monster.abilities)
          : monster.abilities,
      tags:
        typeof monster.tags === "string"
          ? JSON.parse(monster.tags)
          : monster.tags,
    };

    return NextResponse.json(responseMonster);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/monsters/[id] - Update user monster
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

    // Check if monster exists and user owns it
    const { data: existingMonster, error: fetchError } = await supabase
      .from("user_monsters")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingMonster) {
      return NextResponse.json({ error: "Monster not found" }, { status: 404 });
    }

    if (existingMonster.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own monsters" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = MonsterUpdateSchema.parse(body);

    // Prepare update data (stringify JSON fields)
    const updateData: Record<string, any> = { ...validatedData };
    if (updateData.attacks) {
      updateData.attacks = JSON.stringify(updateData.attacks);
    }
    if (updateData.abilities) {
      updateData.abilities = JSON.stringify(updateData.abilities);
    }
    if (updateData.tags) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    // Update the monster
    const { data: monster, error } = await supabase
      .from("user_monsters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update monster" },
        { status: 500 },
      );
    }

    // Parse JSON fields back for response
    const responseMonster = {
      ...monster,
      attacks: JSON.parse(monster.attacks),
      abilities: JSON.parse(monster.abilities),
      tags: JSON.parse(monster.tags),
    };

    return NextResponse.json(responseMonster);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.format(),
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

// DELETE /api/monsters/[id] - Delete user monster
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

    // Check if monster exists and user owns it
    const { data: existingMonster, error: fetchError } = await supabase
      .from("user_monsters")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingMonster) {
      return NextResponse.json({ error: "Monster not found" }, { status: 404 });
    }

    if (existingMonster.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own monsters" },
        { status: 403 },
      );
    }

    // Delete the monster
    const { error } = await supabase
      .from("user_monsters")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to delete monster" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Monster deleted successfully" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
