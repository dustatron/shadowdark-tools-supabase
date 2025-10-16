import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <div className="flex-1 flex flex-col gap-12 max-w-7xl w-full p-8 pt-16">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Shadowdark GM Tools
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your monsters, create encounters, and organize your
              campaigns for Shadowdark RPG
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Monsters Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Monsters</CardTitle>
                <CardDescription>
                  Browse and manage your monster collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access a comprehensive database of official Shadowdark
                  monsters. Search, filter by challenge level, and create your
                  own custom monsters.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/monsters">Browse Monsters</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Encounters Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Encounters</CardTitle>
                <CardDescription>Generate random encounters</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create balanced encounters for your party. Roll on encounter
                  tables or build custom encounters with your monster
                  collection.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/encounters">Create Encounter</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Lists Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl">Lists</CardTitle>
                <CardDescription>Organize your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Create custom monster lists for different regions, dungeons,
                  or campaign themes. Keep your sessions organized and ready.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/lists">View Lists</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Start Section */}
          <div className="mt-12 text-center space-y-4">
            <h2 className="text-2xl font-semibold">Get Started</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start by browsing the monster database, or sign up to create
              custom monsters and manage your own campaigns.
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Button asChild size="lg">
                <Link href="/monsters">Explore Monsters</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8 mt-auto">
          <p className="text-muted-foreground">
            Built for Shadowdark RPG enthusiasts
          </p>
        </footer>
      </div>
    </main>
  );
}
