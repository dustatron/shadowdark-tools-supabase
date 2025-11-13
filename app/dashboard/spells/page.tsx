import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SpellCard } from "@/src/components/spells/SpellCard";
import { getUserSpells } from "@/lib/api/dashboard";
import { PageTitle } from "@/components/page-title";

export default async function SpellsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const spells = await getUserSpells(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="My Spells" />
        <Button asChild>
          <Link href="/spells/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Spell
          </Link>
        </Button>
      </div>
      {spells.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spells.map((spell) => (
            <SpellCard
              key={spell.id}
              spell={spell}
              currentUserId={user.id}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No custom spells yet. Create your first spell to get started!
        </div>
      )}
    </div>
  );
}
