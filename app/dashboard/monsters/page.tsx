import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MonsterCard } from "@/src/components/monsters/MonsterCard";
import { getUserMonsters } from "@/lib/api/dashboard";

export default async function MonstersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const monsters = await getUserMonsters(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Monsters</h2>
        <Button asChild>
          <Link href="/monsters/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Monster
          </Link>
        </Button>
      </div>
      {monsters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monsters.map((monster) => (
            <MonsterCard
              key={monster.id}
              monster={monster}
              currentUserId={user.id}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No custom monsters yet. Create your first monster to get started!
        </div>
      )}
    </div>
  );
}
