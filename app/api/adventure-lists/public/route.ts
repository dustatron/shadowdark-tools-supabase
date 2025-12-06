import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);

    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");

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
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching public adventure lists:", error);
      return NextResponse.json(
        { error: "Failed to fetch public adventure lists" },
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
    console.error("Error in GET /api/adventure-lists/public:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
