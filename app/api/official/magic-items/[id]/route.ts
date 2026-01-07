import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { checkAdminStatus } from "@/lib/services/admin";
import { TraitSchema, generateSlug } from "@/lib/schemas/magic-items";

// Schema for updating official magic items (subset of user item fields)
const OfficialMagicItemUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be 5000 characters or less")
    .optional(),
  traits: z.array(TraitSchema).optional(),
});

// GET /api/official/magic-items/[id] - Get a specific official magic item
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

    // Fetch the official magic item (public read access)
    const { data, error } = await supabase
      .from("official_magic_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Unexpected error in GET /api/official/magic-items/[id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/official/magic-items/[id] - Update an official magic item (admin only)
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

    // Check if item exists
    const { data: existing, error: fetchError } = await supabase
      .from("official_magic_items")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = OfficialMagicItemUpdateSchema.parse(body);

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
          .from("official_magic_items")
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

    if (validated.description !== undefined) {
      updates.description = validated.description;
    }

    if (validated.traits !== undefined) {
      updates.traits = validated.traits;
    }

    // Update the item
    const { data, error } = await supabase
      .from("official_magic_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating official magic item:", error);
      return NextResponse.json(
        { error: "Failed to update magic item" },
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

    console.error(
      "Unexpected error in PUT /api/official/magic-items/[id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
