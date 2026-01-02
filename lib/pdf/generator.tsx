import React from "react";
import {
  Document,
  Page,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { SpellForDeck, MagicItemForDeck } from "@/lib/validations/deck";
import { SpellCardPDF } from "@/components/pdf/SpellCard";
import { MagicItemCardPDF } from "@/components/pdf/MagicItemCard";

/**
 * PDF Generator for Spell & Magic Item Card Decks
 * Uses @react-pdf/renderer to generate printable cards
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

// Union type for deck items
type DeckCard =
  | { type: "spell"; data: SpellForDeck }
  | { type: "magic_item"; data: MagicItemForDeck };

interface PDFDocumentProps {
  deckName: string;
  cards: DeckCard[];
  layout: "grid" | "single";
}

/**
 * Main PDF Document Component
 * Supports mixed content: spells and magic items
 */
const DeckPDFDocument: React.FC<PDFDocumentProps> = ({
  deckName,
  cards,
  layout,
}) => {
  if (layout === "single") {
    // Single layout: one card per page
    return (
      <Document>
        {/* One page per card - 2.5" x 3.5" playing card size */}
        {cards.map((card, index) => (
          <Page
            key={`${card.type}-${card.data.id}-${index}`}
            size={{ width: 180, height: 252 }}
            style={styles.singlePage}
          >
            {card.type === "spell" ? (
              <SpellCardPDF spell={card.data} />
            ) : (
              <MagicItemCardPDF magicItem={card.data} />
            )}
          </Page>
        ))}
      </Document>
    );
  }

  // Grid layout: multiple cards per page (3 columns)
  const cardsPerPage = 9; // 3 columns x 3 rows
  const pages: DeckCard[][] = [];

  // Split cards into pages
  for (let i = 0; i < cards.length; i += cardsPerPage) {
    pages.push(cards.slice(i, i + cardsPerPage));
  }

  return (
    <Document>
      {/* Grid pages */}
      {pages.map((pageCards, pageIndex) => (
        <Page key={pageIndex} size="LETTER" style={styles.gridPage}>
          {pageCards.map((card, cardIndex) => (
            <View
              key={`${card.type}-${card.data.id}-${cardIndex}`}
              style={styles.gridCard}
            >
              {card.type === "spell" ? (
                <SpellCardPDF spell={card.data} />
              ) : (
                <MagicItemCardPDF magicItem={card.data} />
              )}
            </View>
          ))}
        </Page>
      ))}
    </Document>
  );
};

/**
 * Generate PDF buffer from deck data (spells only - legacy)
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
  // Convert spells to cards array for unified handling
  const cards: DeckCard[] = spells.map((spell) => ({
    type: "spell",
    data: spell,
  }));

  const pdfDocument = (
    <DeckPDFDocument deckName={deckName} cards={cards} layout={layout} />
  );

  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}

/**
 * Generate PDF buffer from mixed deck data (spells + magic items)
 * @param deckName - Name of the deck
 * @param spells - Array of spells to include
 * @param magicItems - Array of magic items to include
 * @param layout - Layout style ('grid' or 'single')
 * @returns Promise<Buffer> - PDF buffer ready to send as response
 */
export async function generateMixedDeckPDF(
  deckName: string,
  spells: SpellForDeck[],
  magicItems: MagicItemForDeck[],
  layout: "grid" | "single" = "grid",
): Promise<Buffer> {
  // Combine spells and magic items into cards array
  const cards: DeckCard[] = [
    ...spells.map(
      (spell): DeckCard => ({
        type: "spell",
        data: spell,
      }),
    ),
    ...magicItems.map(
      (item): DeckCard => ({
        type: "magic_item",
        data: item,
      }),
    ),
  ];

  const pdfDocument = (
    <DeckPDFDocument deckName={deckName} cards={cards} layout={layout} />
  );

  const buffer = await renderToBuffer(pdfDocument);
  return buffer;
}
