import { createClient } from "@/lib/supabase/server";
import { getUserSpells } from "@/lib/api/dashboard";
import { UserSpellsClient } from "./UserSpellsClient";

export default async function SpellsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const spells = await getUserSpells(user.id);

  return (
    <div>
      <UserSpellsClient spells={spells} currentUserId={user.id} />
    </div>
  );
}
