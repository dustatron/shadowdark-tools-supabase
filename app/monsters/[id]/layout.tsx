import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch monster data directly from Supabase
    const supabase = await createClient();
    const { data: monster } = await supabase
      .from("all_monsters")
      .select("name, challenge_level, author_notes, source")
      .eq("id", id)
      .single();

    if (monster) {
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
