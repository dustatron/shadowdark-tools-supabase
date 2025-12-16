import { createClient } from "@/lib/supabase/server";
import { getFavoriteMonsters } from "@/lib/api/dashboard";
import { FavoriteMonstersClient } from "./FavoriteMonstersClient";

export default async function FavoriteMonstersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const favMonsters = await getFavoriteMonsters(user.id);

  return (
    <FavoriteMonstersClient favorites={favMonsters} currentUserId={user.id} />
  );
}
