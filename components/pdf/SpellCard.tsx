/**
 * Spell Card Component - Single Source of Truth
 *
 * Contains shared design constants and PDF implementation of the spell card.
 * Used by both PDF export (via generator.tsx) and browser preview (via PDFViewer).
 *
 * This ensures WYSIWYG - what you see in preview is exactly what gets exported.
 */

import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { SpellForDeck } from "@/lib/validations/deck";

// ============================================================================
// SHARED DESIGN CONSTANTS
// ============================================================================

/**
 * Design constants for spell cards
 * Used by both PDF (@react-pdf/renderer) and Web (HTML/CSS) versions
 *
 * All dimensions follow the 2.5" x 3.5" poker card standard
 * 1 inch = 72 points (PDF) = 96 pixels (web at 96 DPI)
 */
export const SPELL_CARD_DESIGN = {
  /** Card dimensions (2.5" x 3.5" poker card) */
  dimensions: {
    width: {
      pt: 200, // PDF points
      px: 400, // Web pixels
      inches: "2.5in", // CSS
    },
    height: {
      pt: 270, // PDF points
      px: 500, // Web pixels
      inches: "3.5in", // CSS
    },
  },

  /** Color palette */
  colors: {
    background: "#ffffff",
    border: "#1a1a1a",
    headerBorder: "#333333",
    footerBorder: "#dddddd",
    name: "#333333",
    tier: "#2563eb", // Blue
    meta: "#666666", // Gray
    description: "#2a2a2a",
    footer: "#999999",
  },

  /** Typography (pt for PDF, px for web) */
  fonts: {
    name: { pt: 16, px: 16 },
    tier: { pt: 11, px: 11 },
    meta: { pt: 8, px: 8 },
    description: { pt: 9, px: 9 },
    footer: { pt: 7, px: 7 },
  },

  /** Border widths */
  borders: {
    outer: { pt: 3, px: 3 },
    header: { pt: 1.5, px: 1.5 },
    footer: { pt: 1, px: 1 },
  },

  /** Spacing */
  spacing: {
    cardPadding: { pt: 2, px: 2 },
    headerPaddingBottom: { pt: 8, px: 8 },
    headerMarginBottom: { pt: 10, px: 10 },
    metaMarginBottom: { pt: 3, px: 3 },
    descriptionMarginTop: { pt: 8, px: 8 },
    footerPaddingTop: { pt: 6, px: 6 },
    footerMarginTop: { pt: 8, px: 8 },
    nameMarginBottom: { pt: 6, px: 6 },
    tierMarginBottom: { pt: 4, px: 4 },
  },

  /** Line heights */
  lineHeights: {
    description: 1.5,
  },
} as const;

// Margin constants - different for PDF export vs browser preview
const MARGINS = {
  export: {
    rowOne: "3pt",
    rowTwo: "4pt",
    rowThree: "3pt",
  },
  preview: {
    rowOne: "5pt", // Browser needs more spacing
    rowTwo: "6pt",
    rowThree: "5pt",
  },
};

// ============================================================================
// PDF VERSION (for @react-pdf/renderer)
// ============================================================================

/** PDF-specific styles using @react-pdf/renderer StyleSheet */
export const pdfCardStyles = StyleSheet.create({
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

  spellName: {
    fontSize: "16pt",
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    color: "white",
    marginBottom: "2pt",
  },

  tierRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: "12pt",
    fontSize: "10pt",
  },

  tier: {
    fontSize: "10pt",
    fontWeight: "bold",
    width: "40%",
    color: "black",
    textAlign: "center",
    alignItems: "center",
  },

  classes: {
    fontSize: "12pt",
    color: "black",
    width: "58.5%",
    textAlign: "center",
    fontWeight: "900",
    textTransform: "capitalize",
  },

  metadataSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: "12pt",
    fontSize: "9.5pt",
    color: "#000000",
    width: "100%",
  },

  metaLabel: {
    fontWeight: "bold",
    width: "50%",
    textAlign: "center",
  },

  spellDescription: {
    padding: "5px 10px",
    fontSize: "9.5pt",
    lineHeight: 1.4,
    textAlign: "left",
    color: "#000000",
    flex: 1,
  },
});

/**
 * Spell Card Component for PDF rendering
 * Used by @react-pdf/renderer to generate printable cards
 */
export const SpellCardPDF = ({
  spell,
  isPreview,
}: {
  spell: SpellForDeck;
  isPreview?: boolean;
}) => {
  // Use absolute URL for image - required for server-side PDF generation
  const imageUrl =
    typeof window !== "undefined"
      ? "/blank-card.png" // Browser: relative path works
      : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blank-card.png`; // Server: absolute URL required

  // Use different margins for preview vs export
  const margins = isPreview ? MARGINS.preview : MARGINS.export;

  return (
    <View style={pdfCardStyles.singleCard}>
      {/* Background Image */}
      <Image src={imageUrl} style={pdfCardStyles.backgroundImage} />

      {/* Content Overlay */}
      <View style={pdfCardStyles.contentOverlay}>
        {/* Spell Name */}
        <Text style={pdfCardStyles.spellName}>{spell.name}</Text>

        {/* Tier and Classes Row */}
        <View style={[pdfCardStyles.tierRow, { marginTop: margins.rowOne }]}>
          {spell.classes && spell.classes.length > 0 && (
            <Text style={pdfCardStyles.classes}>
              {spell.classes.join(", ")}
            </Text>
          )}
          <Text style={pdfCardStyles.tier}>Tier {spell.tier}</Text>
        </View>

        {/* Metadata Section */}
        <View
          style={[pdfCardStyles.metadataSection, { marginTop: margins.rowTwo }]}
        >
          <Text style={pdfCardStyles.metaLabel}>{spell.range}</Text>
          <Text style={pdfCardStyles.metaLabel}>{spell.duration}</Text>
        </View>

        {/* Description Section */}
        <Text
          style={[
            pdfCardStyles.spellDescription,
            { marginTop: margins.rowThree },
          ]}
          hyphenationCallback={(word) => [word]}
        >
          {spell.description}
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SPELL_CARD_DESIGN,
  pdfCardStyles,
  SpellCardPDF,
};
