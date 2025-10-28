"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EncounterTableCreateInput } from "@/lib/encounter-tables/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EncounterTableForm } from "@/components/encounter-tables/EncounterTableForm";

export default function NewEncounterTablePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: EncounterTableCreateInput) => {
    setError(null);

    try {
      const response = await fetch("/api/encounter-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create encounter table");
      }

      const result = await response.json();

      // Redirect to the newly created table
      router.push(`/encounter-tables/${result.id}`);
    } catch (err) {
      console.error("Error creating encounter table:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err; // Re-throw so form knows submission failed
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/encounter-tables">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tables
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Encounter Table
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate a random encounter table based on your filters and
          preferences
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Table Configuration</CardTitle>
          <CardDescription>
            Configure your encounter table settings and filters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EncounterTableForm
            onSubmit={onSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
