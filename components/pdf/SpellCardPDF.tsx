import React from "react";
import { View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type { SpellForDeck } from "@/lib/validations/deck";
import path from "path";
import { getTierColorPDF } from "@/lib/utils/shadowdark-colors";

/**
 * Individual Spell Card PDF Component
 * Renders a single spell card at 2.5" x 3.5" (standard playing card size)
 * 180 DPI: 450px x 630px
 */

// Register custom fonts - different approach for local vs Vercel
if (typeof window === "undefined") {
  const isVercel = process.env.VERCEL === "1";

  if (isVercel) {
    // Vercel: Use absolute URLs to deployed assets
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`;
    Font.register({
      family: "Beaufort",
      src: `${baseUrl}/fonts/beaufort-w01-regular.ttf`,
    });

    Font.register({
      family: "Avenir Next Condensed",
      src: `${baseUrl}/fonts/avenir-next-condensed-bold.ttf`,
    });
  } else {
    // Local: Use filesystem paths
    Font.register({
      family: "Beaufort",
      src: path.join(
        process.cwd(),
        "public",
        "fonts",
        "beaufort-w01-regular.ttf",
      ),
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
    src: "/fonts/beaufort-w01-regular.ttf",
  });

  Font.register({
    family: "Avenir Next Condensed",
    src: "/fonts/avenir-next-condensed-bold.ttf",
  });
}

interface SpellCardPDFProps {
  spell: SpellForDeck;
}

const styles = StyleSheet.create({
  card: {
    width: "2.5in",
    height: "3.5in",
    border: "5pt solid #1f2937",
    borderRadius: 0,
    padding: 1,
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottom: "1pt solid #e5e7eb",
    paddingBottom: 8,
    marginBottom: 8,
  },
  name: {
    fontFamily: "Beaufort",
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  tier: {
    fontFamily: "Avenir Next Condensed",
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  metadata: {
    fontFamily: "Avenir Next Condensed",
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 1,
  },
  body: {
    flex: 1,
    marginTop: 4,
  },
  description: {
    fontFamily: "Avenir Next Condensed",
    fontSize: 9,
    lineHeight: 1.4,
    color: "#374151",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 8,
    borderTop: "1pt solid #e5e7eb",
  },
  footerText: {
    fontFamily: "Avenir Next Condensed",
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export function SpellCardPDF({ spell }: SpellCardPDFProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{spell.name}</Text>
        <Text style={[styles.tier, { color: getTierColorPDF(spell.tier) }]}>
          Tier {spell.tier}
        </Text>
        <Text style={styles.metadata}>Duration: {spell.duration}</Text>
        <Text style={styles.metadata}>Range: {spell.range}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.description}>{spell.description}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Shadowdark RPG</Text>
      </View>
    </View>
  );
}
