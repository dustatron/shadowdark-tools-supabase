import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import {
  EquipmentCreateSchema,
  EquipmentListQuerySchema,
  generateSlug,
} from "@/lib/schemas/equipment";

// GET /api/user/equipment - List current user's equipment
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

    const params = EquipmentListQuerySchema.parse(rawParams);
    const { page, limit, q } = params;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("user_equipment")
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
      console.error("Database error fetching user equipment:", error);
      return NextResponse.json(
        { error: "Failed to fetch equipment" },
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

    console.error("Unexpected error in GET /api/user/equipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/user/equipment - Create a new equipment item
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
    const validated = EquipmentCreateSchema.parse(body);

    // Generate slug from name
    const baseSlug = generateSlug(validated.name);

    // Check for existing slug and make unique if needed
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from("user_equipment")
        .select("id")
        .eq("user_id", user.id)
        .eq("slug", slug)
        .single();

      if (!existing) break;

      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Insert the equipment item
    const { data, error } = await supabase
      .from("user_equipment")
      .insert({
        user_id: user.id,
        name: validated.name,
        slug,
        description: validated.description,
        item_type: validated.item_type,
        cost: validated.cost,
        attack_type: validated.attack_type || null,
        range: validated.range || null,
        damage: validated.damage || null,
        armor: validated.armor || null,
        properties: validated.properties,
        slot: validated.slot,
        quantity: validated.quantity || null,
        is_public: validated.is_public,
        image_url: validated.image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error creating equipment:", error);
      return NextResponse.json(
        { error: "Failed to create equipment" },
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

    console.error("Unexpected error in POST /api/user/equipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
