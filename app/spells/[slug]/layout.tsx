import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = await createClient();
    const { data: spell } = await supabase
      .from("all_spells")
      .select("name, tier, description, classes, range, duration")
      .eq("slug", slug)
      .single();

    if (spell) {
      const classes = Array.isArray(spell.classes) ? spell.classes : [];
      const title = `${spell.name} (Tier ${spell.tier})`;
      const description = spell.description
        ? `${spell.description.substring(0, 160)}...`
        : `Tier ${spell.tier} spell for ${classes.join(", ")}. Range: ${spell.range}. Duration: ${spell.duration}.`;

      return {
        title,
        description,
        openGraph: {
          title: `${spell.name} | Shadowdark Spells`,
          description,
          type: "article",
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Spell Details",
    description: "View detailed information about this Shadowdark spell.",
  };
}

export default function SpellDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
