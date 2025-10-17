import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monsters",
  description:
    "Browse the complete Shadowdark monster database. Search official monsters, filter by challenge level, create custom monsters, and build your bestiary.",
  openGraph: {
    title: "Monsters | Shadowdark GM Tools",
    description:
      "Browse and search official Shadowdark monsters. Filter by challenge level, type, and location. Create your own custom monsters.",
  },
};

export default function MonstersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
