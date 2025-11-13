import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Skull, Layers, ArrowRight } from "lucide-react";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dungeon Exchange - Manage your campaigns",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const features = [
    {
      title: "Deck Builder",
      description:
        "Create custom spell card decks and export as printable PDFs",
      icon: Layers,
      href: "/decks",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Monsters",
      description: "Browse official monsters and create custom creatures",
      icon: Skull,
      href: "/monsters",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      title: "Spells",
      description: "Search through all Shadowdark spells",
      icon: Sparkles,
      href: "/spells",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Encounters",
      description: "Generate random encounter tables (coming soon)",
      icon: BookOpen,
      href: "#",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      disabled: true,
    },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <PageTitle title="GM Dashboard" />
        <p className="text-muted-foreground">
          Welcome back! Choose a tool to get started.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                feature.disabled ? "opacity-60" : ""
              }`}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="flex items-center gap-2">
                  {feature.title}
                  {feature.disabled && (
                    <span className="text-xs font-normal text-muted-foreground">
                      (Soon)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {feature.disabled ? (
                  <Button disabled variant="secondary" className="w-full">
                    Coming Soon
                  </Button>
                ) : (
                  <Button asChild variant="default" className="w-full group">
                    <Link href={feature.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
