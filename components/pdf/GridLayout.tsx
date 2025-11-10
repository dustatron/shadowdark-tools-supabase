import React from "react";
import { Page, View, StyleSheet } from "@react-pdf/renderer";
import { SpellCardPDF } from "./SpellCardPDF";
import type { SpellForDeck } from "@/lib/validations/deck";

/**
 * Grid Layout for PDF
 * Renders spells in a 3x3 grid on 8.5" x 11" pages (9 cards per page)
 * Cards are 2.5" x 3.5" with 0.25" gutters
 */

interface GridLayoutProps {
  spells: SpellForDeck[];
}

const styles = StyleSheet.create({
  page: {
    width: "8.5in",
    height: "11in",
    padding: "0.5in",
    backgroundColor: "#ffffff",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    gap: "0.1in",
  },
  cardWrapper: {
    marginBottom: "0.1in",
  },
});

export function GridLayout({ spells }: GridLayoutProps) {
  // Chunk spells into pages of 9
  const pages: SpellForDeck[][] = [];
  for (let i = 0; i < spells.length; i += 9) {
    pages.push(spells.slice(i, i + 9));
  }

  return (
    <>
      {pages.map((pageSpells, pageIndex) => (
        <Page key={pageIndex} size="LETTER" style={styles.page}>
          <View style={styles.grid}>
            {pageSpells.map((spell) => (
              <View key={spell.id} style={styles.cardWrapper}>
                <SpellCardPDF spell={spell} />
              </View>
            ))}
          </View>
        </Page>
      ))}
    </>
  );
}
