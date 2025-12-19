import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { adventureListSchema } from "@/lib/validations/adventure-lists";
import { z } from "zod";
import { getAdventureListItems } from "@/lib/services/adventure-list-items";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // First fetch the list details
    const { data: list, error: listError } = await supabase
      .from("adventure_lists")
      .select("*")
      .eq("id", id)
      .single();

    if (listError) {
      console.error("Error fetching adventure list:", listError);
      return NextResponse.json(
        { error: "Adventure list not found" },
        { status: 404 },
      );
    }

    // Check permissions
    if (!list.is_public && (!user || list.user_id !== user.id)) {
      // Check if user is admin
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!profile?.is_admin) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Fetch items using TypeScript helper
    let items;
    try {
      items = await getAdventureListItems(supabase, id);
    } catch (itemsError) {
      console.error("Error fetching adventure list items:", itemsError);
      return NextResponse.json(
        { error: "Failed to fetch list items" },
        { status: 500 },
      );
    }

    // Group items by type
    const groupedItems = {
      monsters: items.filter((i) => i.item_type === "monster"),
      spells: items.filter((i) => i.item_type === "spell"),
      magic_items: items.filter((i) => i.item_type === "magic_item"),
      equipment: items.filter((i) => i.item_type === "equipment"),
      encounter_tables: items.filter((i) => i.item_type === "encounter_table"),
    };

    return NextResponse.json({
      list,
      items: groupedItems,
    });
  } catch (error) {
    console.error("Error in GET /api/adventure-lists/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    // We use partial here because PUT can update specific fields
    const validatedData = adventureListSchema.partial().parse(body);

    // Check ownership
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
      .from("adventure_lists")
      .update(validatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating adventure list:", error);
      return NextResponse.json(
        { error: "Failed to update adventure list" },
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

    console.error("Error in PUT /api/adventure-lists/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
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
      .from("adventure_lists")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting adventure list:", error);
      return NextResponse.json(
        { error: "Failed to delete adventure list" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/adventure-lists/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
