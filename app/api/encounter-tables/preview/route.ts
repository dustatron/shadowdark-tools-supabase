/**
 * API Route: /api/encounter-tables/preview
 * Generate preview of encounter table without saving
 * Public endpoint - no authentication required
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EncounterTableCreateSchema } from "@/lib/encounter-tables/schemas";
import { generateTableEntries } from "@/lib/encounter-tables/utils/generate-table";

/**
 * POST /api/encounter-tables/preview
 * Generate preview entries without saving table
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = EncounterTableCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { name, description, die_size, filters } = validationResult.data;

    try {
      // Generate entries without saving the table
      // Use a temporary ID for preview
      const previewId = `preview-${Date.now()}`;
      const entries = await generateTableEntries(previewId, die_size, filters);

      // Return preview data
      return NextResponse.json({
        preview: {
          name,
          description,
          die_size,
          filters,
          entries,
        },
      });
    } catch (error) {
      console.error("Error generating preview:", error);

      // Check if error is about insufficient monsters
      if (error instanceof Error) {
        return NextResponse.json(
          {
            error: error.message.includes("monsters match")
              ? error.message
              : "Insufficient monsters match your criteria",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Failed to generate preview" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error(
      "Unexpected error in POST /api/encounter-tables/preview:",
      error,
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
