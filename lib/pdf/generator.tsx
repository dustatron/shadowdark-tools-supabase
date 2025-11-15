import React from "react";
import {
  Document,
  Page,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { SpellForDeck } from "@/lib/validations/deck";
import { SpellCardPDF } from "@/components/pdf/SpellCard";

/**
 * PDF Generator for Spell Card Decks
 * Uses @react-pdf/renderer to generate printable spell cards
 */

const styles = StyleSheet.create({
  // Grid Layout Styles (multiple cards per page)
  gridPage: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: "0.2in",
    gap: "0.01in",
  },
  gridCard: {
    width: "2.5in",
    height: "3.5in",
    margin: 0,
    padding: 0,
  },

  // Single Layout Styles (one card per page - 2.5" x 3.5")
  singlePage: {
    padding: 0,
  },
});

interface PDFDocumentProps {
  deckName: string;
  spells: SpellForDeck[];
  layout: "grid" | "single";
}

// SpellCardPDF component imported from @/components/pdf/SpellCard
// Used for both grid and single layouts

/**
 * Main PDF Document Component
 */
const DeckPDFDocument: React.FC<PDFDocumentProps> = ({
  deckName,
  spells,
  layout,
}) => {
  if (layout === "single") {
    // Single layout: one card per page
    return (
      <Document>
        {/* One page per spell - 2.5" x 3.5" playing card size */}
        {spells.map((spell) => (
          <Page
            key={spell.id}
            size={{ width: 180, height: 252 }}
            style={styles.singlePage}
          >
            <SpellCardPDF spell={spell} />
          </Page>
        ))}
      </Document>
    );
  }

  // Grid layout: multiple cards per page (3 columns)
  const cardsPerPage = 9; // 3 columns x 3 rows
  const pages: SpellForDeck[][] = [];

  // Split spells into pages
  for (let i = 0; i < spells.length; i += cardsPerPage) {
    pages.push(spells.slice(i, i + cardsPerPage));
  }

  return (
    <Document>
      {/* Grid pages */}
      {pages.map((pageSpells, pageIndex) => (
        <Page key={pageIndex} size="LETTER" style={styles.gridPage}>
          {pageSpells.map((spell) => (
            <View key={spell.id} style={styles.gridCard}>
              <SpellCardPDF spell={spell} />
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
};

/**
 * Generate PDF buffer from deck data
 * @param deckName - Name of the deck
 * @param spells - Array of spells to include
 * @param layout - Layout style ('grid' or 'single')
 * @returns Promise<Buffer> - PDF buffer ready to send as response
 */
export async function generateDeckPDF(
  deckName: string,
  spells: SpellForDeck[],
  layout: "grid" | "single" = "grid",
): Promise<Buffer> {
  const pdfDocument = (
    <DeckPDFDocument deckName={deckName} spells={spells} layout={layout} />
  );

  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
