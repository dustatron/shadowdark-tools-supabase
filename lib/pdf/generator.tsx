import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";
import type { SpellForDeck } from "@/lib/validations/deck";

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
    padding: 10,
    gap: 1,
  },
  gridCard: {
    width: "2.5in",
    height: "3.5in",
    border: "4pt solid #000",
    padding: 4,
  },

  // Single Layout Styles (one card per page - 2.5" x 3.5")
  singlePage: {
    padding: 1,
    display: "flex",
    flexDirection: "column",
  },
  singleCard: {
    border: "3pt solid #1a1a1a",
    borderRadius: 1,
    padding: 2,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },

  metadata: {
    display: "flex",
  },

  // Shared Card Styles
  cardHeader: {
    borderBottom: "1.5pt solid #333",
    paddingBottom: 8,
    marginBottom: 10,
    textAlign: "center",
  },
  spellName: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 6,
    textAlign: "center",
    color: "#333",
  },
  spellMeta: {
    fontSize: 8,
    color: "#666",
    marginBottom: 3,
    textAlign: "center",
  },
  spellDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    marginTop: 8,
    flex: 1,
    textAlign: "justify",
    color: "#2a2a2a",
  },
  tier: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
    marginBottom: 4,
  },
  footer: {
    borderTop: "1pt solid #ddd",
    paddingTop: 6,
    marginTop: 8,
    textAlign: "center",
    fontSize: 7,
    color: "#999",
  },

  // Title Page
  titlePage: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deckTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  deckSubtitle: {
    fontSize: 12,
    color: "#666",
  },
});

interface PDFDocumentProps {
  deckName: string;
  spells: SpellForDeck[];
  layout: "grid" | "single";
}

/**
 * Spell Card Component (for grid layout)
 */
const SpellCardGrid = ({ spell }: { spell: SpellForDeck }) => (
  <View style={styles.gridCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.spellName}>{spell.name}</Text>
      {spell.classes && spell.classes.length > 0 && (
        <Text style={styles.spellMeta}>{spell.classes.join(", ")}</Text>
      )}
      <Text style={styles.tier}>Tier {spell.tier}</Text>
    </View>
    <View>
      <Text style={styles.spellMeta}>Duration: {spell.duration}</Text>
      <Text style={styles.spellMeta}>Range: {spell.range}</Text>
      <Text style={styles.spellDescription}>{spell.description}</Text>
    </View>
  </View>
);

/**
 * Spell Card Component (for single layout)
 */
const SpellCardSingle = ({ spell }: { spell: SpellForDeck }) => (
  <View style={styles.singleCard}>
    {/* Header Section */}
    <View style={styles.cardHeader}>
      <Text style={styles.spellName}>{spell.name}</Text>
      <Text style={styles.tier}>Tier {spell.tier}</Text>
      {spell.classes && spell.classes.length > 0 && (
        <Text style={styles.spellMeta}>{spell.classes.join(", ")}</Text>
      )}
    </View>

    {/* Metadata Section */}
    <View>
      <Text style={styles.spellMeta}>Duration: {spell.duration}</Text>
      <Text style={styles.spellMeta}>Range: {spell.range}</Text>
    </View>

    {/* Description Section */}
    <Text style={styles.spellDescription}>{spell.description}</Text>

    {/* Footer */}
    <View style={styles.footer}>
      <Text>Shadowdark RPG</Text>
    </View>
  </View>
);

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
            <SpellCardSingle spell={spell} />
          </Page>
        ))}
      </Document>
    );
  }

  // Grid layout: multiple cards per page (2 columns)
  const cardsPerPage = 6; // 2 columns x 3 rows
  const pages: SpellForDeck[][] = [];

  // Split spells into pages
  for (let i = 0; i < spells.length; i += cardsPerPage) {
    pages.push(spells.slice(i, i + cardsPerPage));
  }

  return (
    <Document>
      {/* Grid pages */}
      {pages.map((pageSpells, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.gridPage}>
          {pageSpells.map((spell) => (
            <SpellCardGrid key={spell.id} spell={spell} />
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
