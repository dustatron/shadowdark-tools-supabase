import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch monster data from the API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL ? `https://${process.env.VERCEL_URL || "localhost:3000"}` : "http://localhost:3000"}/api/monsters/${id}`,
      { cache: "no-store" },
    );

    if (response.ok) {
      const monster = await response.json();

      const title = `${monster.name} (CL ${monster.challenge_level})`;
      const description = monster.author_notes
        ? `${monster.author_notes.substring(0, 160)}...`
        : `Challenge Level ${monster.challenge_level} monster from ${monster.source}. View complete stats, attacks, and abilities.`;

      return {
        title,
        description,
        openGraph: {
          title: `${monster.name} | Shadowdark Monsters`,
          description,
          type: "article",
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Monster Details",
    description: "View detailed information about this Shadowdark monster.",
  };
}

export default function MonsterDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
