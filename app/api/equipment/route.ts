import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for search parameters
const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  itemType: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const rawParams = {
      q: searchParams.get("q") || undefined,
      itemType: searchParams.get("itemType") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    let query = supabase.from("equipment").select("*", { count: "exact" });

    // Apply filters
    if (validatedParams.q) {
      query = query.ilike("name", `%${validatedParams.q}%`);
    }
    if (validatedParams.itemType) {
      query = query.eq("item_type", validatedParams.itemType);
    }

    // Apply pagination
    query = query.range(offset, offset + validatedParams.limit - 1);

    const { data: equipment, count, error } = await query;

    if (error) {
      console.error("Error fetching equipment:", error);
      return NextResponse.json(
        { error: "Failed to fetch equipment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      equipment,
      total: count,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count,
        totalPages: count ? Math.ceil(count / validatedParams.limit) : 0,
      },
      query: validatedParams,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
          details: error.issues,
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
