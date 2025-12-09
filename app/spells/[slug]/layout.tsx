import type { Metadata } from "next";
import { getBaseUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const response = await fetch(`${getBaseUrl()}/api/spells/${slug}`, {
      cache: "no-store",
    });

    if (response.ok) {
      const spell = await response.json();

      const title = `${spell.name} (Tier ${spell.tier})`;
      const description = spell.description
        ? `${spell.description.substring(0, 160)}...`
        : `Tier ${spell.tier} spell for ${spell.classes.join(", ")}. Range: ${spell.range}. Duration: ${spell.duration}.`;

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
