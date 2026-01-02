/**
 * Magic Item Card Component - PDF Implementation
 *
 * PDF implementation of the magic item card for deck export.
 * Follows same pattern as SpellCard.tsx but adapted for magic item content.
 */

import { View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { MagicItemForDeck } from "@/lib/validations/deck";
import path from "path";

// Register custom fonts - different approach for local vs Vercel
if (typeof window === "undefined") {
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    // Vercel: Use absolute URLs to deployed assets
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`;
    Font.register({
      family: "Beaufort",
      src: `${baseUrl}/fonts/beaufort-w01-bold.ttf`,
    });

    Font.register({
      family: "Avenir Next Condensed",
      src: `${baseUrl}/fonts/avenir-next-condensed-bold.ttf`,
    });
  } else {
    // Local: Use filesystem paths (synchronous)
    Font.register({
      family: "Beaufort",
      src: path.join(process.cwd(), "public", "fonts", "beaufort-w01-bold.ttf"),
    });

    Font.register({
      family: "Avenir Next Condensed",
      src: path.join(
        process.cwd(),
        "public",
        "fonts",
        "avenir-next-condensed-bold.ttf",
      ),
    });
  }
} else {
  // Browser-side: use relative URLs
  Font.register({
    family: "Beaufort",
    src: "/fonts/beaufort-w01-bold.ttf",
  });

  Font.register({
    family: "Avenir Next Condensed",
    src: "/fonts/avenir-next-condensed-bold.ttf",
  });
}

// ============================================================================
// DESIGN CONSTANTS
// ============================================================================

/** Card dimensions - standard playing card size (2.5" x 3.5") */
export const MAGIC_ITEM_CARD_DESIGN = {
  dimensions: {
    width: {
      inches: "2.5in",
      pt: 180, // 2.5 * 72
    },
    height: {
      inches: "3.5in",
      pt: 252, // 3.5 * 72
    },
  },
} as const;

// ============================================================================
// PDF VERSION (for @react-pdf/renderer)
// ============================================================================

/** PDF-specific styles using @react-pdf/renderer StyleSheet */
export const pdfMagicItemCardStyles = StyleSheet.create({
  singleCard: {
    position: "relative",
    height: "100%",
    width: "100%",
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  contentOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    paddingTop: "5pt",
    display: "flex",
    flexDirection: "column",
  },

  itemName: {
    fontFamily: "Beaufort",
    fontSize: "14pt",
    fontWeight: "900",
    textTransform: "uppercase",
    textAlign: "center",
    color: "white",
    marginTop: "3px",
    paddingHorizontal: "8px",
  },

  typeLabel: {
    fontFamily: "Avenir Next Condensed",
    fontSize: "11pt",
    fontWeight: "900",
    color: "black",
    textAlign: "center",
    marginTop: "3pt",
  },

  description: {
    fontFamily: "Avenir Next Condensed",
    padding: "5px 10px",
    fontSize: "8.5pt",
    lineHeight: 1.35,
    textAlign: "left",
    color: "#000000",
    marginTop: "8pt",
  },

  traitsContainer: {
    fontFamily: "Avenir Next Condensed",
    padding: "0 10px",
    fontSize: "8pt",
    lineHeight: 1.3,
    color: "#000000",
    flex: 1,
  },

  trait: {
    marginBottom: "4pt",
  },

  traitName: {
    fontWeight: "bold",
  },

  traitDescription: {
    fontWeight: "normal",
  },
});

/**
 * Magic Item Card Component for PDF rendering
 * Used by @react-pdf/renderer to generate printable cards
 */
export const MagicItemCardPDF = ({
  magicItem,
}: {
  magicItem: MagicItemForDeck;
  isPreview?: boolean;
}) => {
  // Use absolute URL for image - required for server-side PDF generation
  const imageUrl =
    typeof window !== "undefined"
      ? "/blank-card.png" // Browser: relative path works
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blank-card.png`; // Server: absolute URL required

  return (
    <View style={pdfMagicItemCardStyles.singleCard}>
      {/* Background Image */}
      <Image src={imageUrl} style={pdfMagicItemCardStyles.backgroundImage} />

      {/* Content Overlay */}
      <View style={pdfMagicItemCardStyles.contentOverlay}>
        {/* Magic Item Name */}
        <Text style={pdfMagicItemCardStyles.itemName}>{magicItem.name}</Text>

        {/* Type Label */}
        <Text style={pdfMagicItemCardStyles.typeLabel}>Magic Item</Text>

        {/* Description Section */}
        <Text
          style={pdfMagicItemCardStyles.description}
          hyphenationCallback={(word) => [word]}
        >
          {magicItem.description}
        </Text>

        {/* Traits Section */}
        {magicItem.traits && magicItem.traits.length > 0 && (
          <View style={pdfMagicItemCardStyles.traitsContainer}>
            {magicItem.traits.map((trait, index) => (
              <Text key={index} style={pdfMagicItemCardStyles.trait}>
                <Text style={pdfMagicItemCardStyles.traitName}>
                  {trait.name}:{" "}
                </Text>
                <Text style={pdfMagicItemCardStyles.traitDescription}>
                  {trait.description}
                </Text>
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default {
  MAGIC_ITEM_CARD_DESIGN,
  pdfMagicItemCardStyles,
  MagicItemCardPDF,
};
