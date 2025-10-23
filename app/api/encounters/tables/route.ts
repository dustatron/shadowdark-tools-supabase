import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for encounter table creation
const EncounterTableSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().min(10).max(1000),
    environment: z.string().min(1).max(50),
    challenge_level_min: z.number().int().min(1).max(20).default(1),
    challenge_level_max: z.number().int().min(1).max(20).default(20),
    entries: z
      .array(
        z.object({
          roll_min: z.number().int().min(1).max(100),
          roll_max: z.number().int().min(1).max(100),
          encounter_description: z.string().min(1).max(500),
        }),
      )
      .min(1)
      .max(100),
  })
  .refine((data) => data.challenge_level_min <= data.challenge_level_max, {
    message: "Minimum challenge level must be less than or equal to maximum",
  })
  .refine(
    (data) => {
      // Validate that roll ranges don't overlap and cover consecutive ranges
      const sortedEntries = data.entries.sort(
        (a, b) => a.roll_min - b.roll_min,
      );
      for (let i = 0; i < sortedEntries.length; i++) {
        const entry = sortedEntries[i];
        if (entry.roll_min > entry.roll_max) {
          return false; // Invalid range
        }
        if (i > 0 && entry.roll_min <= sortedEntries[i - 1].roll_max) {
          return false; // Overlapping ranges
        }
      }
      return true;
    },
    {
      message: "Roll ranges must not overlap and must be valid",
    },
  );

// GET /api/encounters/tables - List encounter tables
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

    const environment = searchParams.get("environment");
    const minLevel = searchParams.get("minLevel")
      ? parseInt(searchParams.get("minLevel")!)
      : null;
    const maxLevel = searchParams.get("maxLevel")
      ? parseInt(searchParams.get("maxLevel")!)
      : null;

    // Build query
    let query = supabase
      .from("encounter_tables")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("name");

    // Apply filters
    if (environment) {
      query = query.eq("environment", environment);
    }
    if (minLevel !== null) {
      query = query.lte("challenge_level_min", minLevel);
    }
    if (maxLevel !== null) {
      query = query.gte("challenge_level_max", maxLevel);
    }

    const { data: tables, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch encounter tables" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      tables,
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

// POST /api/encounters/tables - Create new encounter table
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
    const validatedData = EncounterTableSchema.parse(body);

    // Create the encounter table
    const { data: table, error: tableError } = await supabase
      .from("encounter_tables")
      .insert([
        {
          name: validatedData.name,
          description: validatedData.description,
          environment: validatedData.environment,
          challenge_level_min: validatedData.challenge_level_min,
          challenge_level_max: validatedData.challenge_level_max,
          creator_id: user.id,
        },
      ])
      .select()
      .single();

    if (tableError) {
      console.error("Database error:", tableError);
      return NextResponse.json(
        { error: "Failed to create encounter table" },
        { status: 500 },
      );
    }

    // Create the table entries
    const entries = validatedData.entries.map((entry) => ({
      ...entry,
      table_id: table.id,
    }));

    const { error: entriesError } = await supabase
      .from("encounter_table_entries")
      .insert(entries);

    if (entriesError) {
      console.error("Database error:", entriesError);
      // Clean up the table if entries failed
      await supabase.from("encounter_tables").delete().eq("id", table.id);
      return NextResponse.json(
        { error: "Failed to create encounter table entries" },
        { status: 500 },
      );
    }

    // Return the table with entries
    const { data: completeTable, error: fetchError } = await supabase
      .from("encounter_tables")
      .select(
        `
        *,
        encounter_table_entries (*)
      `,
      )
      .eq("id", table.id)
      .single();

    if (fetchError) {
      console.error("Database error:", fetchError);
      return NextResponse.json(table, { status: 201 });
    }

    return NextResponse.json(completeTable, { status: 201 });
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
