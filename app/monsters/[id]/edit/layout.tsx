import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data: monster } = await supabase
      .from("user_monsters")
      .select("name")
      .eq("id", id)
      .single();

    if (monster) {
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
