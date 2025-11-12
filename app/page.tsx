import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sword, Wand2, Dice6 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Home | Dungeon Exchange",
  description:
    "Dungeon Exchange - Your complete toolkit for running Shadowdark RPG sessions. Browse monsters, search spells, and create balanced encounters for your campaigns.",
  openGraph: {
    title: "Dungeon Exchange - Complete GM Toolkit for Shadowdark RPG",
    description:
      "Browse official monsters and spells, create custom content, and build balanced encounters for your Shadowdark RPG campaigns.",
  },
};

export default async function Home() {
  // Check if user is authenticated and redirect to dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-12">
        {/* Hero Section */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h1 className="text-5xl font-extrabold leading-tight">
            Dungeon Exchange
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A free community resource for Shadowdark RPG. Share custom monsters,
            spells, and magic items. Build quick references and discover content
            from GMs worldwide.
          </p>
          <p className="text-sm text-muted-foreground">
            Compatible with Shadowdark RPG | 100% Free
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          <Link href="/monsters" className="no-underline h-full">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-4">
                    <Sword className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Monsters</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex-grow">
                    Access a comprehensive database of official Shadowdark
                    monsters. Search, filter by challenge level, and create your
                    own custom monsters.
                  </p>
                  <Button variant="secondary" className="w-full mt-auto">
                    Browse Monsters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/spells" className="no-underline h-full">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-4">
                    <Wand2 className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Spells</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex-grow">
                    Browse the complete spell database for Shadowdark. Filter by
                    tier, class, and search by name or description.
                  </p>
                  <Button variant="secondary" className="w-full mt-auto">
                    Browse Spells
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/encounter-tables" className="no-underline h-full">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-center gap-4">
                    <Dice6 className="h-8 w-8 text-primary" />
                    <h3 className="text-xl font-bold">Encounter Tables</h3>
                  </div>
                  <p className="text-sm text-muted-foreground flex-grow">
                    Create random encounter tables with monster filtering. Roll
                    on tables during gameplay, share publicly, and copy tables
                    from the community.
                  </p>
                  <Button variant="secondary" className="w-full mt-auto">
                    Browse Encounter Tables
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col gap-4 items-center text-center mt-12">
          <h2 className="text-3xl font-bold">Get Started</h2>
          <p className="text-muted-foreground max-w-2xl">
            Start by browsing the monster database, or sign up to create custom
            monsters and manage your own campaigns.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button size="lg" asChild>
              <Link href="/monsters">Explore Monsters</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
