import { notFound } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/primitives/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { getProfileBySlug } from "@/lib/api/profiles";
import { createClient } from "@/lib/supabase/server";
import { MonsterCard } from "@/components/monsters/MonsterCard";
import { Swords, Sparkles, Dice6 } from "lucide-react";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) return {};

  return {
    title: `${profile.username} | Shadowdark Tools`,
    description:
      profile.bio || `View ${profile.username}'s custom Shadowdark content`,
    openGraph: {
      title: profile.display_name || profile.username,
      description: profile.bio,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  // Fetch user's public monsters
  const supabase = await createClient();
  const { data: monsters } = await supabase
    .from("user_monsters")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("name", { ascending: true });

  // Parse JSONB fields for monsters
  const parsedMonsters = (monsters || []).map((monster) => ({
    ...monster,
    attacks:
      typeof monster.attacks === "string"
        ? JSON.parse(monster.attacks)
        : monster.attacks,
    abilities:
      typeof monster.abilities === "string"
        ? JSON.parse(monster.abilities)
        : monster.abilities,
    tags:
      typeof monster.tags === "string"
        ? JSON.parse(monster.tags)
        : monster.tags,
  }));

  return (
    <div className="container mx-auto max-w-7xl py-10">
      <div className="space-y-8">
        <ProfileHeader profile={profile} />
        <ProfileStats stats={profile.stats} />

        <Tabs defaultValue="monsters">
          <TabsList>
            <TabsTrigger value="monsters" className="flex items-center gap-2">
              <Swords size={16} />
              Monsters ({profile.stats.monstersCount})
            </TabsTrigger>
            <TabsTrigger value="spells" className="flex items-center gap-2">
              <Sparkles size={16} />
              Spells ({profile.stats.spellsCount})
            </TabsTrigger>
            <TabsTrigger value="encounters" className="flex items-center gap-2">
              <Dice6 size={16} />
              Encounters ({profile.stats.encounterTablesCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monsters" className="mt-4">
            {parsedMonsters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parsedMonsters.map((monster) => (
                  <MonsterCard
                    key={monster.id}
                    monster={monster}
                    showActions={false}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No public monsters yet
              </div>
            )}
          </TabsContent>
          <TabsContent value="spells" className="mt-4">
            <div className="text-center py-12 text-muted-foreground">
              Public spells will be listed here
            </div>
          </TabsContent>
          <TabsContent value="encounters" className="mt-4">
            <div className="text-center py-12 text-muted-foreground">
              Public encounters will be listed here
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
