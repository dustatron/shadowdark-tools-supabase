"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BookOpen, Calendar, Layers } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { DeckWithCount } from "@/lib/validations/deck";

interface DeckListProps {
  onCreateClick?: () => void;
}

async function fetchDecks(): Promise<DeckWithCount[]> {
  const response = await fetch("/api/decks");

  if (!response.ok) {
    throw new Error("Failed to fetch decks");
  }

  const data = await response.json();
  return data.decks;
}

export function DeckList({ onCreateClick }: DeckListProps) {
  const {
    data: decks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["decks"],
    queryFn: fetchDecks,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
          <CardDescription>Failed to load decks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!decks || decks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>No Decks Yet</CardTitle>
          <CardDescription>
            Create your first spell card deck to get started
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Create Deck
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Decks</h2>
          <p className="text-muted-foreground">
            {decks.length} {decks.length === 1 ? "deck" : "decks"}
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          New Deck
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <Link key={deck.id} href={`/decks/${deck.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="truncate">{deck.name}</CardTitle>
                  <Badge
                    variant={deck.spell_count >= 52 ? "default" : "secondary"}
                  >
                    <Layers className="w-3 h-3 mr-1" />
                    {deck.spell_count}/52
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="w-3 h-3" />
                  Updated{" "}
                  {formatDistanceToNow(new Date(deck.updated_at), {
                    addSuffix: true,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {deck.spell_count === 0 && (
                    <p className="text-muted-foreground italic">Empty deck</p>
                  )}
                  {deck.spell_count > 0 && (
                    <p>
                      {deck.spell_count}{" "}
                      {deck.spell_count === 1 ? "spell" : "spells"}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <span>View Deck</span>
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
