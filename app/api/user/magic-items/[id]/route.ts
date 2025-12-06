import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { MagicItemUpdateSchema, generateSlug } from "@/lib/schemas/magic-items";

// GET /api/user/magic-items/[id] - Get a specific magic item
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

    // Fetch the magic item (RLS will handle access control)
    const { data, error } = await supabase
      .from("user_magic_items")
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
    console.error("Unexpected error in GET /api/user/magic-items/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/user/magic-items/[id] - Update a magic item
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
      .from("user_magic_items")
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
    const validated = MagicItemUpdateSchema.parse(body);

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
          .from("user_magic_items")
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

    if (validated.traits !== undefined) {
      updates.traits = validated.traits;
    }

    if (validated.is_public !== undefined) {
      updates.is_public = validated.is_public;
    }

    // Update the item
    const { data, error } = await supabase
      .from("user_magic_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error updating magic item:", error);
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

    console.error("Unexpected error in PUT /api/user/magic-items/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/magic-items/[id] - Delete a magic item
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
      .from("user_magic_items")
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
      .from("user_magic_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error deleting magic item:", error);
      return NextResponse.json(
        { error: "Failed to delete magic item" },
        { status: 500 },
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/user/magic-items/[id]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
