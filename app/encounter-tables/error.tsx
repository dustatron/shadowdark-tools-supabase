"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Dices } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/primitives/alert";
import { Button } from "@/components/primitives/button";
import Link from "next/link";

export default function EncounterTablesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Encounter tables error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load encounter tables</AlertTitle>
        <AlertDescription>
          {error.message ||
            "An error occurred while loading encounter table data"}
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex gap-2">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/encounter-tables">
            <Dices className="mr-2 h-4 w-4" />
            Back to tables
          </Link>
        </Button>
      </div>
    </div>
  );
}
