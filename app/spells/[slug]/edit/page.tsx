import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditSpellClient } from "./EditSpellClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditSpellPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/auth/login?redirect=${encodeURIComponent(`/spells/${slug}/edit`)}`,
    );
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin === true;

  // Try to find the spell - check multiple sources based on permissions
  let spell: Record<string, unknown> | null = null;
  let isOfficial = false;

  // First, try user's own spells
  const { data: userSpell } = await supabase
    .from("user_spells")
    .select("*")
    .eq("user_id", user.id)
    .eq("slug", slug)
    .single();

  if (userSpell) {
    spell = userSpell;
    isOfficial = false;
  } else if (isAdmin) {
    // Admin can edit any user's spell
    const { data: anyUserSpell } = await supabase
      .from("user_spells")
      .select("*")
      .eq("slug", slug)
      .single();

    if (anyUserSpell) {
      spell = anyUserSpell;
      isOfficial = false;
    } else {
      // Admin can also edit official spells
      const { data: officialSpell } = await supabase
        .from("official_spells")
        .select("*")
        .eq("slug", slug)
        .single();

      if (officialSpell) {
        spell = officialSpell;
        isOfficial = true;
      }
    }
  }

  if (!spell) {
    notFound();
  }

  // Parse JSONB classes field if needed
  const spellData = {
    ...spell,
    classes:
      typeof spell.classes === "string"
        ? JSON.parse(spell.classes)
        : spell.classes,
  };

  return <EditSpellClient spell={spellData} isOfficial={isOfficial} />;
}
