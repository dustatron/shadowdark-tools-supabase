import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import type { SpellForDeck } from "@/lib/validations/deck";

/**
 * Individual Spell Card PDF Component
 * Renders a single spell card at 2.5" x 3.5" (standard playing card size)
 * 180 DPI: 450px x 630px
 */

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
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  tier: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 2,
  },
  metadata: {
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 1,
  },
  body: {
    flex: 1,
    marginTop: 4,
  },
  description: {
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
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
  },
});

export function SpellCardPDF({ spell }: SpellCardPDFProps) {
  const getTierColor = (tier: number): string => {
    if (tier <= 1) return "#333"; // green
    if (tier <= 3) return "#333"; // blue
    return "#a855f7"; // purple
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{spell.name}</Text>
        <Text style={[styles.tier, { color: getTierColor(spell.tier) }]}>
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
