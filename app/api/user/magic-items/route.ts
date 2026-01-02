import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  MagicItemCreateSchema,
  MagicItemListQuerySchema,
  generateSlug,
} from "@/lib/schemas/magic-items";

// GET /api/user/magic-items - List current user's magic items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const rawParams = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      q: searchParams.get("q") || undefined,
    };

    const params = MagicItemListQuerySchema.parse(rawParams);
    const { page, limit, q } = params;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("user_magic_items")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // Apply search filter
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Apply pagination and ordering
    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Database error fetching user magic items:", error);
      return NextResponse.json(
        { error: "Failed to fetch magic items" },
        { status: 500 },
      );
    }

    const total = count || 0;

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Unexpected error in GET /api/user/magic-items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/user/magic-items - Create a new magic item
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse and validate body
    const body = await request.json();
    const validated = MagicItemCreateSchema.parse(body);

    // Generate slug from name
    const baseSlug = generateSlug(validated.name);

    // Check for existing slug and make unique if needed
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from("user_magic_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .single();

      if (!existing) break;

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Insert the magic item
    const { data, error } = await supabase
      .from("user_magic_items")
      .insert({
        user_id: user.id,
        name: validated.name,
        slug,
        description: validated.description,
        traits: validated.traits,
        is_public: validated.is_public,
        image_url: validated.image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating magic item:", error);
      return NextResponse.json(
        { error: "Failed to create magic item" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Unexpected error in POST /api/user/magic-items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
