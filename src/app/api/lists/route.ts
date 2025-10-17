import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for list creation
const ListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  is_public: z.boolean().default(false),
  category: z.string().max(50).optional(),
});

// GET /api/lists - Get monster lists
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const offset = (page - 1) * limit;

    const visibility = searchParams.get("visibility"); // 'public', 'private', or null for all
    const category = searchParams.get("category");

    // Get current user (optional for public lists)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query
    let query = supabase
      .from("user_lists")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("updated_at", { ascending: false });

    // Apply visibility filter
    if (visibility === "public") {
      query = query.eq("is_public", true);
    } else if (visibility === "private" && user) {
      query = query.eq("is_public", false).eq("creator_id", user.id);
    } else if (user) {
      // Show public lists and user's own private lists
      query = query.or(`is_public.eq.true,creator_id.eq.${user.id}`);
    } else {
      // Not authenticated, only show public lists
      query = query.eq("is_public", true);
    }

    // Apply category filter
    if (category) {
      query = query.eq("category", category);
    }

    const { data: lists, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch lists" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      lists,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/lists - Create new monster list
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ListSchema.parse(body);

    // Create the list
    const { data: list, error } = await supabase
      .from("user_lists")
      .insert([
        {
          ...validatedData,
          creator_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create list" },
        { status: 500 },
      );
    }

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
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
