import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spellCreateSchema } from "@/lib/validations/spell";
import { generateSlug } from "@/lib/utils/slug";

// GET /api/spells - List spells with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isAuthenticated = !!user;

    // Build query for user_spells (RLS handles visibility automatically)
    let query = supabase.from("user_spells").select("*", { count: "exact" });

    // Apply filters
    const tier = searchParams.get("tier");
    if (tier) {
      const tierNum = parseInt(tier);
      if (isNaN(tierNum) || tierNum < 1 || tierNum > 5) {
        return NextResponse.json(
          { error: "Invalid tier value. Must be between 1 and 5." },
          { status: 400 },
        );
      }
      query = query.eq("tier", tierNum);
    }

    const classFilter = searchParams.get("class");
    if (classFilter) {
      if (classFilter !== "wizard" && classFilter !== "priest") {
        return NextResponse.json(
          { error: "Invalid class. Must be wizard or priest." },
          { status: 400 },
        );
      }
      query = query.contains("classes", [classFilter]);
    }

    const search = searchParams.get("search");
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50"), 1),
      100,
    );
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    // Apply sorting and pagination
    query = query.order("name", { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data: spells, error, count } = await query;

    if (error) {
      console.error("Database error fetching spells:", error);
      return NextResponse.json(
        { error: "Failed to fetch spells" },
        { status: 500 },
      );
    }

    // Parse JSONB classes field if needed
    const parsedSpells = (spells || []).map((spell) => ({
      ...spell,
      classes:
        typeof spell.classes === "string"
          ? JSON.parse(spell.classes)
          : spell.classes,
    }));

    return NextResponse.json({
      data: parsedSpells,
      count: count || 0,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/spells:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/spells - Create new spell
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
        {
          error: "Unauthorized",
          message: "Authentication required to create spells",
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = spellCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: "Invalid spell data provided",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const spellData = validationResult.data;

    // Check name uniqueness across all_spells view (official + custom)
    const { data: existing, error: checkError } = await supabase
      .from("all_spells")
      .select("name")
      .ilike("name", spellData.name)
      .limit(1);

    if (checkError) {
      console.error("Error checking spell name uniqueness:", checkError);
      return NextResponse.json(
        { error: "Failed to validate spell name" },
        { status: 500 },
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate name",
          message: "A spell with this name already exists",
        },
        { status: 409 },
      );
    }

    // Generate slug from name
    const slug = generateSlug(spellData.name);

    // Insert spell into user_spells table
    const { data: newSpell, error: insertError } = await supabase
      .from("user_spells")
      .insert({
        ...spellData,
        slug,
        user_id: user.id,
        is_public: spellData.is_public ?? false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating spell:", insertError);
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to create spell",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    // Parse JSONB classes field before returning
    const parsedSpell = {
      ...newSpell,
      classes:
        typeof newSpell.classes === "string"
          ? JSON.parse(newSpell.classes)
          : newSpell.classes,
    };

    return NextResponse.json(parsedSpell, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/spells:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while creating the spell",
      },
      { status: 500 },
    );
  }
}
