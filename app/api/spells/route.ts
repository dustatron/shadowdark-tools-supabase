import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { spellCreateSchema } from "@/lib/validations/spell";
import { generateSlug } from "@/lib/utils/slug";
import {
  buildPaginationParamsFromOffset,
  buildPaginationMeta,
  buildSearchQuery,
  buildSortQuery,
  parseJsonFields,
  buildArrayContainsFilter,
  buildRangeFilter,
} from "@/lib/api/query-builder";

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

    // Build pagination params (using offset mode for backwards compatibility)
    const pagination = buildPaginationParamsFromOffset(searchParams, 50, 100);

    // Build query for user_spells (RLS handles visibility automatically)
    let query = supabase.from("user_spells").select("*", { count: "exact" });

    // Apply tier filter
    const tier = searchParams.get("tier");
    if (tier) {
      const tierNum = parseInt(tier);
      if (isNaN(tierNum) || tierNum < 1 || tierNum > 5) {
        return NextResponse.json(
          { error: "Invalid tier value. Must be between 1 and 5." },
          { status: 400 },
        );
      }
      query = buildRangeFilter(query, "tier", tierNum, tierNum);
    }

    // Apply class filter
    const classFilter = searchParams.get("class");
    if (classFilter) {
      if (classFilter !== "wizard" && classFilter !== "priest") {
        return NextResponse.json(
          { error: "Invalid class. Must be wizard or priest." },
          { status: 400 },
        );
      }
      query = buildArrayContainsFilter(query, "classes", [classFilter]);
    }

    // Apply search
    const searchTerm = searchParams.get("search") || undefined;
    query = buildSearchQuery(
      query,
      searchTerm,
      ["name", "description"],
      "high",
    );

    // Apply sorting (default to name ascending)
    const sortField = searchParams.get("sort") || "name";
    const sortOrder = (searchParams.get("order") || "asc") as "asc" | "desc";
    query = buildSortQuery(query, sortField, sortOrder);

    // Apply pagination
    query = query.range(
      pagination.offset,
      pagination.offset + pagination.limit - 1,
    );

    const { data: spells, error, count } = await query;

    if (error) {
      console.error("Database error fetching spells:", error);
      return NextResponse.json(
        { error: "Failed to fetch spells" },
        { status: 500 },
      );
    }

    // Parse JSONB fields
    const parsedSpells = parseJsonFields(spells || [], ["classes"]);

    // Build pagination metadata
    const meta = buildPaginationMeta(pagination, count || 0);

    return NextResponse.json({
      data: parsedSpells,
      pagination: meta,
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
