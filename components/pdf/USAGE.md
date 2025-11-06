# PDF Components Usage Guide

## Quick Start

The PDF generation system uses the existing `lib/pdf/generator.tsx` which was modified by the linter. The original component-based approach has been consolidated into a single generator file.

## Current Implementation

### File Structure

```
lib/pdf/
├── generator.tsx     # Main PDF generator (modified by linter from original .ts)
└── README.md         # API endpoint usage guide

components/pdf/
├── SpellCardPDF.tsx  # Individual card component
├── GridLayout.tsx    # Grid layout component
├── PDFDocument.tsx   # Document wrapper
└── USAGE.md          # This file
```

**Note**: The `lib/pdf/generator.tsx` file contains a working implementation that uses inline components. The separate component files in `components/pdf/` are provided as an alternative modular approach if you want to refactor later.

## Using the Current Generator

### In an API Route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateDeckPDF } from "@/lib/pdf/generator";
import type { SpellForDeck } from "@/lib/validations/deck";

export async function POST(request: NextRequest) {
  const { deckName, spells, layout } = await request.json();

  // Generate PDF
  const pdfBuffer = await generateDeckPDF(
    deckName, // "My Wizard Deck"
    spells, // SpellForDeck[]
    layout, // "grid" | "single"
  );

  // Return as download
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="deck.pdf"`,
    },
  });
}
```

## Using the Modular Components (Alternative)

If you prefer the modular approach, you can refactor `lib/pdf/generator.tsx` to use the separate components:

```typescript
import { renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "@/components/pdf/PDFDocument";
import type { SpellForDeck } from "@/lib/validations/deck";

export async function generateDeckPDF(
  deckName: string,
  spells: SpellForDeck[],
  layout: "grid" | "single" = "grid",
): Promise<Buffer> {
  const document = (
    <PDFDocument
      spells={spells}
      layout={layout}
      deckName={deckName}
    />
  );

  const buffer = await renderToBuffer(document);
  return buffer;
}
```

## Component Props

### PDFDocument

```typescript
interface PDFDocumentProps {
  spells: SpellForDeck[];
  layout: "single" | "grid";
  deckName: string;
}
```

### SpellCardPDF

```typescript
interface SpellCardPDFProps {
  spell: SpellForDeck;
}
```

### GridLayout

```typescript
interface GridLayoutProps {
  spells: SpellForDeck[];
}
```

## Layout Options

### Grid Layout

- 8.5" x 11" pages (Letter size)
- 3x3 grid (9 cards per page)
- 0.25" gutters between cards
- 0.5" page margins
- Best for bulk printing

### Single Layout

- 2.5" x 3.5" per page (standard playing card size)
- One card per page
- Best for cutting out individual cards
- Higher paper usage

## Spell Data Shape

The `SpellForDeck` type from validations:

```typescript
type SpellForDeck = {
  id: string; // UUID
  name: string; // "Fireball"
  tier: number; // 1-5
  duration: string; // "Instant", "Focus", "1 hour"
  range: string; // "Near", "Far", "Self"
  description: string; // Full spell description
};
```

## Example Client-Side Download Trigger

```typescript
"use client";

import { Button } from "@/components/ui/button";

export function ExportButton({ deckId }: { deckId: string }) {
  async function handleExport(layout: "grid" | "single") {
    const response = await fetch(`/api/decks/${deckId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout }),
    });

    if (!response.ok) {
      console.error("Export failed");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deck-${layout}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => handleExport("grid")}>
        Export Grid (9 per page)
      </Button>
      <Button onClick={() => handleExport("single")}>
        Export Single (1 per page)
      </Button>
    </div>
  );
}
```

## Performance Tips

1. **Limit deck size**: Keep decks under 52 cards for reasonable file sizes
2. **Grid layout**: More efficient than single (fewer pages)
3. **Caching**: Consider caching generated PDFs for frequently accessed decks
4. **Streaming**: For large decks, consider `renderToStream()` instead of `renderToBuffer()`

## Styling Customization

To modify card appearance, edit styles in:

- `components/pdf/SpellCardPDF.tsx` (individual card)
- `components/pdf/GridLayout.tsx` (grid layout)

Or modify inline styles in `lib/pdf/generator.tsx` if using the current implementation.

## Future Enhancements

- [ ] Add card backs option
- [ ] Support custom card dimensions
- [ ] Add watermark/footer customization
- [ ] Support images on cards (spell icons)
- [ ] Add bleed margins for professional printing
