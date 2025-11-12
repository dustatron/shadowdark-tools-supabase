import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sword,
  Wand2,
  Users,
  Share2,
  BookOpen,
  Dice6,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | Shadowdark Guild",
  description:
    "Learn about Shadowdark Guild - a community-driven reference and toolkit for Shadowdark RPG. Browse official content, create custom monsters and spells, and share with the community.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl font-extrabold">About Shadowdark Guild</h1>
          <p className="text-xl text-muted-foreground">
            Your community-powered toolkit for running epic Shadowdark sessions
          </p>
        </div>

        {/* What is this */}
        <section className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">What is this?</h2>
          <div className="flex flex-col gap-4 text-muted-foreground">
            <p>
              Shadowdark Guild is a community-driven toolkit for GMs running the
              Shadowdark RPG. We provide reference databases for monsters,
              spells, and magic items from the core rules, plus powerful tools
              to create and share your own homebrew content.
            </p>
            <p>
              This isn&apos;t a replacement for the{" "}
              <a
                href="https://www.thearcanelibrary.com/collections/shadowdark-rpg/products/shadowdark-rpg-quickstart-set-pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                core rules
              </a>{" "}
              - you&apos;ll still need those to play. Instead, we&apos;re here
              to inspire and improve your game with quick reference tools and
              quality content, whether you&apos;re running a VTT session or
              playing at the table.
            </p>
            <p>
              Create custom monsters, spells, and magic items. Build random
              encounter tables. Generate print-and-play reference cards to hand
              out at your table. Share your creative ideas with other GMs and
              discover thousands of community-created stat blocks. Our goal? Get
              you to the table quicker with high-quality, playable content.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quick Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Fast access to official Shadowdark monsters, spells, and magic
                  items. Search and filter by challenge level, tier, type, and
                  more. Perfect for quick lookups during sessions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  Custom Monster Creation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build your own monsters with our easy-to-use creator. Define
                  stats, attacks, abilities, and treasure. Keep them private or
                  share with the community.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Spell & Item Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create custom spells and magic items for your campaigns. Track
                  your favorites and discover unique homebrew content from other
                  GMs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dice6 className="h-5 w-5" />
                  Random Encounter Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate random encounter tables filtered by challenge level,
                  monster type, and environment. Roll on tables during sessions
                  or share them publicly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Print & Play Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Build custom card decks from any monster, spell, or item.
                  Print professional-looking reference cards to bring to your
                  table.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Browse thousands of user-created monsters, spells, and items.
                  Save favorites, leave feedback, and contribute your own
                  creations for everyone&apos;s games.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Community */}
        <section className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">Community</h2>
          <div className="flex flex-col gap-4 text-muted-foreground">
            <p>
              The heart of Shadowdark Guild is sharing creative ideas. When you
              create a monster, spell, or magic item, you can publish it for
              other GMs to discover, use, and save to their favorites. Every
              contribution helps fellow GMs get to the table quicker with
              quality content.
            </p>
            <p>
              Got a unique undead variant? A clever spell for NPCs? An
              interesting magic item? Share it! Browse the community library for
              inspiration, discover creative stat blocks, and save favorites to
              your collection. We&apos;re building a shared resource that makes
              prep faster and games more interesting.
            </p>
            <p>
              Quality matters. Content can be flagged for review if it
              doesn&apos;t meet community standards, and our moderation team
              keeps things running smoothly.
            </p>
          </div>
        </section>

        {/* Getting Started */}
        <section className="flex flex-col gap-4">
          <h2 className="text-3xl font-bold">Getting Started</h2>
          <div className="flex flex-col gap-4 text-muted-foreground">
            <p>
              New to Shadowdark? Grab the{" "}
              <a
                href="https://www.thearcanelibrary.com/collections/shadowdark-rpg/products/shadowdark-rpg-quickstart-set-pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                free quickstart rules
              </a>{" "}
              first - you&apos;ll need those to play. Then come back here for
              tools and inspiration.
            </p>
            <p>
              Browse monsters, spells, and magic items without signing up. Click
              around, explore the reference databases, and see what the
              community has created.
            </p>
            <p>
              Want to create custom content or save favorites?{" "}
              <Link
                href="/auth/sign-up"
                className="text-primary hover:underline font-medium"
              >
                Create a free account
              </Link>{" "}
              to unlock the full toolkit. Build monsters, spells, magic items,
              encounter tables, and print-and-play card decks. Share your
              creations or keep them private - your choice.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col gap-4 items-center text-center p-8 bg-muted rounded-lg">
          <Share2 className="h-12 w-12 text-primary" />
          <h3 className="text-2xl font-bold">Ready to get started?</h3>
          <p className="text-muted-foreground max-w-2xl">
            Create an account to start building custom content and sharing with
            the Shadowdark community.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/monsters">Browse Monsters</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
