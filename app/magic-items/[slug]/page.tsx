import { createClient } from "@/lib/supabase/server";
import { TraitsSection } from "@/components/magic-items/TraitsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface MagicItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  traits: { name: string; description: string }[];
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MagicItemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("official_magic_items")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const item = data as MagicItem;

  // Group traits by type
  const groupedTraits: Record<string, { name: string; description: string }[]> =
    {
      Benefit: [],
      Curse: [],
      Bonus: [],
      Personality: [],
    };

  item.traits.forEach((trait) => {
    if (groupedTraits[trait.name]) {
      groupedTraits[trait.name].push(trait);
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/magic-items">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Magic Items
        </Link>
      </Button>

      <div className="space-y-6">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{item.description}</p>
          </CardContent>
        </Card>

        {/* Traits Section */}
        {item.traits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Traits</CardTitle>
            </CardHeader>
            <CardContent>
              <TraitsSection
                groupedTraits={{
                  Benefit: groupedTraits.Benefit,
                  Curse: groupedTraits.Curse,
                  Bonus: groupedTraits.Bonus,
                  Personality: groupedTraits.Personality,
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
