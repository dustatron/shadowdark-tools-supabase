import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { adventureListItemUpdateSchema } from "@/lib/validations/adventure-lists";
import { z } from "zod";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const supabase = await createClient();
    const { id, itemId } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validatedData = adventureListItemUpdateSchema.parse(body);

    // Check ownership of the list
    const { data: list, error: listError } = await supabase
      .from("adventure_lists")
      .select("user_id")
      .eq("id", id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Adventure list not found" },
        { status: 404 },
      );
    }

    if (list.user_id !== user.id) {
      // Check if admin
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from("adventure_list_items")
      .update(validatedData)
      .eq("id", itemId)
      .eq("list_id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating adventure list item:", error);
      return NextResponse.json(
        { error: "Failed to update adventure list item" },
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
      "Error in PUT /api/adventure-lists/[id]/items/[itemId]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  try {
    const supabase = await createClient();
    const { id, itemId } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership of the list
    const { data: list, error: listError } = await supabase
      .from("adventure_lists")
      .select("user_id")
      .eq("id", id)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: "Adventure list not found" },
        { status: 404 },
      );
    }

    if (list.user_id !== user.id) {
      // Check if admin
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const { error } = await supabase
      .from("adventure_list_items")
      .delete()
      .eq("id", itemId)
      .eq("list_id", id);

    if (error) {
      console.error("Error deleting adventure list item:", error);
      return NextResponse.json(
        { error: "Failed to delete adventure list item" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error in DELETE /api/adventure-lists/[id]/items/[itemId]:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
