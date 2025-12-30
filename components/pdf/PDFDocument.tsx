import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import { SpellCardPDF } from "./SpellCardPDF";
import { GridLayout } from "./GridLayout";
import type { SpellForDeck } from "@/lib/validations/deck";

/**
 * Main PDF Document Component
 * Wraps spell cards in @react-pdf/renderer Document
 * Supports two layouts:
 * - "single": One card per page (2.5" x 3.5")
 * - "grid": 3x3 grid on 8.5" x 11" pages (9 cards per page)
 */

interface PDFDocumentProps {
  spells: SpellForDeck[];
  layout: "single" | "grid";
  deckName: string;
}

const styles = StyleSheet.create({
  singlePage: {
    width: "2.5in",
    height: "3.5in",
    backgroundColor: "#ffffff",
  },
});

export function PDFDocument({ spells, layout, deckName }: PDFDocumentProps) {
  if (layout === "grid") {
    return (
      <Document
        title={`${deckName} - Spell Deck`}
        author="Dungeon Exchange"
        subject="Spell Cards"
        keywords="shadowdark, spells, cards, deck"
      >
        <GridLayout spells={spells} />
      </Document>
    );
  }

  // Single card layout - one card per page
  return (
    <Document
      title={`${deckName} - Spell Deck`}
      author="Dungeon Exchange"
      subject="Spell Cards"
      keywords="shadowdark, spells, cards, deck"
    >
      {spells.map((spell) => (
        <Page key={spell.id} size={[180, 252]} style={styles.singlePage}>
          <SpellCardPDF spell={spell} />
        </Page>
      ))}
    </Document>
  );
}
