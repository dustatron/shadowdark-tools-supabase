import { createClient } from "@/lib/supabase/server";
import { getFavoriteSpells } from "@/lib/api/dashboard";
import { FavoriteSpellsClient } from "./FavoriteSpellsClient";

export default async function FavoriteSpellsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const favSpells = await getFavoriteSpells(user.id);

  return <FavoriteSpellsClient favorites={favSpells} currentUserId={user.id} />;
}
