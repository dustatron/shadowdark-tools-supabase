import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/primitives/button";
import { HomeSearchClient } from "@/components/search";
import { getServerSession } from "@/lib/auth-helpers";

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
  const session = await getServerSession();
  return (
    <div>
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <div className="flex flex-col gap-4 items-center text-center">
          <h1 className="text-5xl font-extrabold leading-tight">
            Dungeon Exchange
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A free community resource for Shadowdark RPG. Search monsters, magic
            items, and equipment. Discover content from GMs worldwide.
          </p>
          <p className="text-sm text-muted-foreground">
            Compatible with Shadowdark RPG | 100% Free
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto w-full">
          <HomeSearchClient />
        </div>
      </div>
    </div>
  );
}
