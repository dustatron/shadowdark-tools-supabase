import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Magic Items",
  description:
    "Browse the complete Shadowdark magic item database. Search official magic items, filter by trait types, and reference items for your adventures.",
  openGraph: {
    title: "Magic Items | Dungeon Exchange",
    description:
      "Browse and search official Shadowdark magic items. Filter by traits including benefits, curses, bonuses, and personality. Complete magic item reference for GMs.",
  },
};

export default function MagicItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
