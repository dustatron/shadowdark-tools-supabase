import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL ? `https://${process.env.VERCEL_URL || "localhost:3000"}` : "http://localhost:3000"}/api/monsters/${id}`,
      { cache: "no-store" },
    );

    if (response.ok) {
      const monster = await response.json();
      return {
        title: `Edit ${monster.name}`,
        description: `Edit your custom Shadowdark monster: ${monster.name}`,
        robots: {
          index: false,
          follow: false,
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Edit Monster",
    description: "Edit your custom Shadowdark monster.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function EditMonsterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
