"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { CreateDeckSchema, type CreateDeckInput } from "@/lib/validations/deck";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function createDeck(data: CreateDeckInput) {
  const response = await fetch("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create deck");
  }

  return response.json();
}

export default function CreateDeckPage() {
  const router = useRouter();

  const form = useForm<CreateDeckInput>({
    resolver: zodResolver(CreateDeckSchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createDeck,
    onSuccess: (data) => {
      toast.success("Deck created successfully");
      router.push(`/dashboard/decks/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create deck");
    },
  });

  const handleSubmit = (data: CreateDeckInput) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/decks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Decks
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Deck</CardTitle>
          <CardDescription>
            Give your spell card deck a name. You can add spells after creating
            it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Deck Name</Label>
              <Input
                id="name"
                placeholder="e.g., My Wizard Spells, Party Cleric Deck"
                {...form.register("name")}
                aria-invalid={!!form.formState.errors.name}
                disabled={createMutation.isPending}
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Choose a descriptive name (1-100 characters)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/decks")}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Deck"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
