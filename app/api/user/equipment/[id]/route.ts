import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { EquipmentUpdateSchema, generateSlug } from "@/lib/schemas/equipment";

// GET /api/user/equipment/[id] - Get a specific equipment item
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

    // Fetch the equipment item (RLS will handle access control)
    const { data, error } = await supabase
      .from("user_equipment")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if user owns this item or is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (data.user_id !== user.id && !profile?.is_admin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in GET /api/user/equipment/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/user/equipment/[id] - Update an equipment item
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

    // Check if item exists and user has permission
    const { data: existing, error: fetchError } = await supabase
      .from("user_equipment")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check ownership or admin status
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (existing.user_id !== user.id && !profile?.is_admin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = EquipmentUpdateSchema.parse(body);

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
          .from("user_equipment")
          .select("id")
          .eq("user_id", existing.user_id)
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

    if (validated.item_type !== undefined) {
      updates.item_type = validated.item_type;
    }

    if (validated.cost !== undefined) {
      updates.cost = validated.cost;
    }

    if (validated.attack_type !== undefined) {
      updates.attack_type = validated.attack_type;
    }

    if (validated.range !== undefined) {
      updates.range = validated.range;
    }

    if (validated.damage !== undefined) {
      updates.damage = validated.damage;
    }

    if (validated.armor !== undefined) {
      updates.armor = validated.armor;
    }

    if (validated.properties !== undefined) {
      updates.properties = validated.properties;
    }

    if (validated.slot !== undefined) {
      updates.slot = validated.slot;
    }

    if (validated.quantity !== undefined) {
      updates.quantity = validated.quantity;
    }

    if (validated.is_public !== undefined) {
      updates.is_public = validated.is_public;
    }

    if (validated.image_url !== undefined) {
      updates.image_url = validated.image_url;
    }

    // Update the item
    const { data, error } = await supabase
      .from("user_equipment")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating equipment item:", error);
      return NextResponse.json(
        { error: "Failed to update equipment item" },
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

    console.error("Unexpected error in PUT /api/user/equipment/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/equipment/[id] - Delete an equipment item
export async function DELETE(
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

    // Check if item exists and user has permission
    const { data: existing, error: fetchError } = await supabase
      .from("user_equipment")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check ownership or admin status
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (existing.user_id !== user.id && !profile?.is_admin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the item
    const { error } = await supabase
      .from("user_equipment")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error deleting equipment item:", error);
      return NextResponse.json(
        { error: "Failed to delete equipment item" },
        { status: 500 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/user/equipment/[id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
