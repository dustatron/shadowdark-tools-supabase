"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/primitives/alert";
import { Button } from "@/components/primitives/button";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load dashboard</AlertTitle>
        <AlertDescription>
          {error.message || "An error occurred while loading your dashboard"}
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex gap-2">
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
