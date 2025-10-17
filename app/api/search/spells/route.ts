import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { z } from "zod";

// Schema for search parameters
const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  minTier: z.number().int().min(1).max(5).optional(),
  maxTier: z.number().int().min(1).max(5).optional(),
  classes: z.array(z.string()).optional(),
  durations: z.array(z.string()).optional(),
  ranges: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// GET /api/search/spells - Advanced search for spells
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const rawParams = {
      q: searchParams.get("q") || undefined,
      minTier: searchParams.get("minTier")
        ? parseInt(searchParams.get("minTier")!)
        : undefined,
      maxTier: searchParams.get("maxTier")
        ? parseInt(searchParams.get("maxTier")!)
        : undefined,
      classes: searchParams.get("classes")?.split(",").filter(Boolean),
      durations: searchParams.get("durations")?.split(",").filter(Boolean),
      ranges: searchParams.get("ranges")?.split(",").filter(Boolean),
      sources: searchParams.get("sources")?.split(",").filter(Boolean),
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 20,
    };

    const validatedParams = SearchParamsSchema.parse(rawParams);
    const {
      q,
      minTier,
      maxTier,
      classes,
      durations,
      ranges,
      sources,
      page,
      limit,
    } = validatedParams;
    const offset = (page - 1) * limit;

    let query = supabase.from("all_spells").select("*", { count: "exact" });

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (minTier) {
      query = query.gte("tier", minTier);
    }
    if (maxTier) {
      query = query.lte("tier", maxTier);
    }
    if (classes && classes.length > 0) {
      query = query.contains("classes", classes);
    }
    if (durations && durations.length > 0) {
      query = query.in("duration", durations);
    }
    if (ranges && ranges.length > 0) {
      query = query.in("range", ranges);
    }
    if (sources && sources.length > 0) {
      query = query.in("source", sources);
    }

    query = query
      .order("tier")
      .order("name")
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    const total = count || 0;

    return NextResponse.json({
      results: data || [],
      total,
      pagination: {
        page: page,
        limit: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      query: validatedParams,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
          details: error.flatten(),
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
