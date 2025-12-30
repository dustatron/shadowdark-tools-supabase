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
    padding: 0,
    backgroundColor: "#ffffff",
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cardWrapper: {
    width: "2.5in",
    height: "3.5in",
    margin: 0,
    padding: 0,
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
        <Page key={pageIndex} size={[612, 792]} style={styles.page}>
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
