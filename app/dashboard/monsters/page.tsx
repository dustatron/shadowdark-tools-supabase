import { createClient } from "@/lib/supabase/server";
import { getUserMonsters } from "@/lib/api/dashboard";
import { UserMonstersClient } from "./UserMonstersClient";

export default async function MonstersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const monsters = await getUserMonsters(user.id);

  return (
    <div>
      <UserMonstersClient monsters={monsters} currentUserId={user.id} />
    </div>
  );
}
