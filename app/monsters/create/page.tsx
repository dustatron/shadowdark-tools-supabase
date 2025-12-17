import { redirect } from "next/navigation";
import { MonsterCreateEditForm } from "@/components/monsters/MonsterCreateEditForm";
import { createClient } from "@/lib/supabase/server";

export default async function CreateMonsterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=" + encodeURIComponent("/monsters/create"));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MonsterCreateEditForm mode="create" />
    </div>
  );
}
