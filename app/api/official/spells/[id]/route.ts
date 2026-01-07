import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { checkAdminStatus } from "@/lib/services/admin";

// Schema for updating official spells
const OfficialSpellUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  tier: z.number().int().min(1).max(5).optional(),
  classes: z
    .array(z.enum(["wizard", "priest"]))
    .min(1)
    .max(2)
    .optional(),
  duration: z.string().min(1).optional(),
  range: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET /api/official/spells/[id] - Get a specific official spell
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
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // Fetch the official spell (public read access)
    const { data, error } = await supabase
      .from("official_spells")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in GET /api/official/spells/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/official/spells/[id] - Update an official spell (admin only)
export async function PUT(
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
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
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

    // Check admin status
    const isAdmin = await checkAdminStatus(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Check if spell exists
    const { data: existing, error: fetchError } = await supabase
      .from("official_spells")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = OfficialSpellUpdateSchema.parse(body);

    // Build update object
    const updates: Record<string, unknown> = {};

    if (validated.name !== undefined) {
      updates.name = validated.name;
      // Regenerate slug if name changed
      const baseSlug = generateSlug(validated.name);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const { data: slugCheck } = await supabase
          .from("official_spells")
          .select("id")
          .eq("slug", slug)
          .neq("id", id)
          .single();

        if (!slugCheck) break;

        counter++;
        slug = `${baseSlug}-${counter}`;
      }
      updates.slug = slug;
    }

    if (validated.tier !== undefined) {
      updates.tier = validated.tier;
    }

    if (validated.classes !== undefined) {
      updates.classes = validated.classes;
    }

    if (validated.duration !== undefined) {
      updates.duration = validated.duration;
    }

    if (validated.range !== undefined) {
      updates.range = validated.range;
    }

    if (validated.description !== undefined) {
      updates.description = validated.description;
    }

    // Update the spell
    const { data, error } = await supabase
      .from("official_spells")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating official spell:", error);
      return NextResponse.json(
        { error: "Failed to update spell" },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Unexpected error in PUT /api/official/spells/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
