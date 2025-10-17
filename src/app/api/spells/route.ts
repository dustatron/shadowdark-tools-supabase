import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for spell creation/update
const SpellSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-z0-9_-]+$/,
      "Slug must be lowercase with hyphens or underscores",
    ),
  description: z.string().min(1),
  classes: z.array(z.string()).min(1, "At least one class must be specified"),
  duration: z.string().min(1),
  range: z.string().min(1),
  tier: z.number().int().min(1).max(5),
  source: z.string().optional().default("Custom"),
  author_notes: z.string().nullable().optional(),
});

// GET /api/spells - List spells with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const offset = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const minTier = searchParams.get("minTier")
      ? parseInt(searchParams.get("minTier")!)
      : null;
    const maxTier = searchParams.get("maxTier")
      ? parseInt(searchParams.get("maxTier")!)
      : null;
    const classes =
      searchParams.get("classes")?.split(",").filter(Boolean) || null;
    const durations =
      searchParams.get("durations")?.split(",").filter(Boolean) || null;
    const ranges =
      searchParams.get("ranges")?.split(",").filter(Boolean) || null;
    const sources =
      searchParams.get("sources")?.split(",").filter(Boolean) || null;

    // Use the search function if we have search parameters
    if (
      search ||
      minTier ||
      maxTier ||
      classes ||
      durations ||
      ranges ||
      sources
    ) {
      const { data: spells, error } = await supabase.rpc("search_spells", {
        search_query: search,
        min_tier: minTier || 1,
        max_tier: maxTier || 5,
        spell_classes: classes,
        spell_durations: durations,
        spell_ranges: ranges,
        spell_sources: sources,
        page_number: page,
        page_size: limit,
      });

      if (error) {
        console.error("Search error:", error);
        return NextResponse.json(
          { error: "Failed to search spells" },
          { status: 500 },
        );
      }

      // Extract total count from first result
      const total =
        spells && spells.length > 0 ? Number(spells[0].total_count) : 0;

      return NextResponse.json({
        spells,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Simple list without search
    const {
      data: spells,
      error,
      count,
    } = await supabase
      .from("all_spells")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("tier", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch spells" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      spells,
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

// POST /api/spells - Create new user spell
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
    const validatedData = SpellSchema.parse(body);

    // Create the spell
    const { data: spell, error } = await supabase
      .from("user_spells")
      .insert([
        {
          ...validatedData,
          classes: JSON.stringify(validatedData.classes),
          user_id: user.id,
          creator_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);

      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A spell with this slug already exists" },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: "Failed to create spell" },
        { status: 500 },
      );
    }

    // Parse JSON fields back for response
    const responseSpell = {
      ...spell,
      classes: JSON.parse(spell.classes),
    };

    return NextResponse.json(responseSpell, { status: 201 });
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
