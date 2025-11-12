import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spells",
  description:
    "Browse the complete Shadowdark spell database. Search official spells, filter by tier and class, and reference spells for your adventures.",
  openGraph: {
    title: "Spells | Shadowdark Guild",
    description:
      "Browse and search official Shadowdark spells. Filter by tier, class, duration, and range. Complete spell reference for GMs and players.",
  },
};

export default function SpellsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
