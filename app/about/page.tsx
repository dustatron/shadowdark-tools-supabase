import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/primitives/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Sword, Wand2, Users, Share2, BookOpen, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Dungeon Exchange",
  description:
    "Dungeon Exchange - A free stat reference and sharing platform for Shadowdark RPG. Find monsters, items, and spells to convert your favorite adventures.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="flex flex-col gap-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center">
          <h1 className="font-heading text-4xl font-extrabold">
            About Dungeon Exchange
          </h1>
          <p className="text-xl text-muted-foreground">
            A free stat reference for converting adventures to Shadowdark
          </p>
        </div>

        {/* What is this */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-3xl font-bold">What is this?</h2>
          <div className="flex flex-col gap-4 text-muted-foreground">
            <p>
              Dungeon Exchange is a community-powered stat reference for
              Shadowdark RPG. We help GMs convert and run published adventures -
              whether it&apos;s Curse of Strahd, a classic TSR module, or any
              other system&apos;s content.
            </p>
            <p>
              When you convert monsters or items for your game, share them here
              so other GMs don&apos;t have to do the same work. Find what you
              need, use it at your table, and contribute back to the community.
            </p>
            <p>
              We also provide print-and-play cards for spells and magic items -
              hand them directly to players at your table.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="flex flex-col gap-6">
          <h2 className="font-heading text-3xl font-bold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Stat Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quick access to monsters, spells, and items. Search by name,
                  filter by challenge level or type. Find what you need fast.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sword className="h-5 w-5" />
                  Convert & Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create Shadowdark stat blocks for creatures from other
                  systems. Share your conversions so other GMs can use them too.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Magic Items & Spells
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Browse and create custom spells and magic items. Perfect for
                  adapting treasure from published adventures.
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
                  Generate printable cards for spells and magic items. Hand them
                  to players at the table for easy reference.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Browse content shared by other GMs. Save favorites, discover
                  conversions, and skip the prep work others have already done.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Getting Started */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-3xl font-bold">Getting Started</h2>
          <div className="flex flex-col gap-4 text-muted-foreground">
            <p>
              Browse monsters, spells, and items without an account. Search,
              filter, and use whatever you find.
            </p>
            <p>
              Want to contribute?{" "}
              <Link
                href="/auth/sign-up"
                className="text-primary hover:underline font-medium"
              >
                Create a free account
              </Link>{" "}
              to add your own conversions and share them with the community.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="flex flex-col gap-4 items-center text-center p-8 bg-muted rounded-lg">
          <Share2 className="h-12 w-12 text-primary" />
          <h3 className="font-heading text-2xl font-bold">
            Help other GMs run great games
          </h3>
          <p className="text-muted-foreground max-w-2xl">
            Share your monster conversions and custom items. Every contribution
            makes it easier for someone else to run their next session.
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
