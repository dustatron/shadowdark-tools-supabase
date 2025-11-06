# PDF Generation for Spell Decks

## Overview

This module provides PDF generation capabilities for spell card decks using `@react-pdf/renderer`.

## Components

### SpellCardPDF

Individual spell card component (2.5" x 3.5").

### GridLayout

3x3 grid layout on 8.5" x 11" pages (9 cards per page).

### PDFDocument

Main document wrapper supporting two layouts:

- `"single"`: One card per page
- `"grid"`: 9 cards per page in 3x3 grid

## Usage in API Endpoint

### Example: POST /api/decks/[id]/export

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDeckPDF, estimatePDFSize } from "@/lib/pdf/generator";
import { ExportPDFSchema } from "@/lib/validations/deck";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify authentication
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
    const { layout } = ExportPDFSchema.parse(body);

    // Fetch deck with spells
    const { data: deck, error: deckError } = await supabase
      .from("decks")
      .select(
        `
        id,
        name,
        user_id,
        deck_items(
          spell:official_spells(
            id,
            name,
            tier,
            duration,
            range,
            description
          )
        )
      `,
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (deckError || !deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Extract spells from deck_items
    const spells = deck.deck_items
      .map((item) => item.spell)
      .filter((spell) => spell !== null);

    if (spells.length === 0) {
      return NextResponse.json(
        { error: "Deck has no spells to export" },
        { status: 400 },
      );
    }

    // Check estimated size (warn if > 10MB)
    const estimatedSizeMB = estimatePDFSize(spells.length, layout);
    if (estimatedSizeMB > 10) {
      console.warn(
        `Large PDF generation: ${estimatedSizeMB.toFixed(2)}MB for ${spells.length} cards`,
      );
    }

    // Generate PDF buffer
    const pdfBuffer = await generateDeckPDF({
      spells,
      layout,
      deckName: deck.name,
    });

    // Return PDF as downloadable file
    const filename = `${deck.name.replace(/[^a-z0-9]/gi, "_")}_${layout}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
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

    console.error("PDF export failed:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
```

## Client-Side Usage

### Trigger PDF Download

```typescript
async function downloadDeck(deckId: string, layout: "single" | "grid") {
  try {
    const response = await fetch(`/api/decks/${deckId}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ layout }),
    });

    if (!response.ok) {
      throw new Error("Failed to export deck");
    }

    // Convert response to blob
    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deck_${layout}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}
```

## Card Dimensions

- **Single Card**: 2.5" x 3.5" (standard playing card)
- **Grid Layout**: 8.5" x 11" letter size, 3x3 grid with 0.25" gutters
- **DPI**: 180 (web quality, suitable for home printing)

## Performance Considerations

- **Estimated Size**: ~40-50KB per card
- **Max Deck Size**: 52 cards (max ~2.6MB)
- **Generation Time**: ~100-500ms for typical decks
- **Memory Usage**: ~5-10MB per PDF generation

## Styling

Cards use Tailwind-inspired color scheme:

- **Tier 1**: Green (`#10b981`)
- **Tier 2-3**: Blue (`#3b82f6`)
- **Tier 4-5**: Purple (`#a855f7`)

## Error Handling

Generator throws errors for:

- Empty spell array
- Invalid spell data (missing required fields)
- Rendering failures

Always wrap in try-catch when calling `generateDeckPDF()`.
