import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { adventureListItemSchema } from "@/lib/validations/adventure-lists";
import { z } from "zod";

export async function POST(
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
    const validatedData = adventureListItemSchema.parse(body);

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if item already exists in the list
    const { data: existingItem } = await supabase
      .from("adventure_list_items")
      .select("id")
      .eq("list_id", id)
      .eq("item_type", validatedData.item_type)
      .eq("item_id", validatedData.item_id)
      .single();

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already exists in the list" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("adventure_list_items")
      .insert({
        list_id: id,
        ...validatedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding item to adventure list:", error);
      return NextResponse.json(
        { error: "Failed to add item to adventure list" },
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

    console.error("Error in POST /api/adventure-lists/[id]/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
