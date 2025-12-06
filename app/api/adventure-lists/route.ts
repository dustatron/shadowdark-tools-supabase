import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { adventureListSchema } from "@/lib/validations/adventure-lists";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase
      .from("adventure_lists")
      .select(
        `
        *,
        adventure_list_items (
          item_type
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching adventure lists:", error);
      return NextResponse.json(
        { error: "Failed to fetch adventure lists" },
        { status: 500 },
      );
    }

    // Process the data to include item counts
    const processedData = data.map((list) => {
      const items = list.adventure_list_items || [];
      const itemCounts = {
        monsters: items.filter((i: any) => i.item_type === "monster").length,
        spells: items.filter((i: any) => i.item_type === "spell").length,
        magic_items: items.filter((i: any) => i.item_type === "magic_item")
          .length,
        total: items.length,
      };

      // Remove the raw items array to keep the response clean
      const { adventure_list_items, ...rest } = list;

      return {
        ...rest,
        item_counts: itemCounts,
      };
    });

    return NextResponse.json({
      data: processedData,
      count,
    });
  } catch (error) {
    console.error("Error in GET /api/adventure-lists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validatedData = adventureListSchema.parse(body);

    const { data, error } = await supabase
      .from("adventure_lists")
      .insert({
        user_id: user.id,
        ...validatedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating adventure list:", error);
      return NextResponse.json(
        { error: "Failed to create adventure list" },
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

    console.error("Error in POST /api/adventure-lists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
