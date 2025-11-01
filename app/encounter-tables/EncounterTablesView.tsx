"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { EncounterTable } from "@/lib/encounter-tables/types";

type ViewMode = "table" | "cards";

interface EncounterTablesViewProps {
  tables: EncounterTable[];
}

export function EncounterTablesView({ tables }: EncounterTablesViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and set default view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Only set default view on initial mount
      if (mobile && viewMode === "table") {
        setViewMode("cards");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Save preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("encounterTablesView", viewMode);
    }
  }, [viewMode]);

  if (tables.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold">No encounter tables yet</h3>
              <p className="text-sm max-w-md mx-auto mt-2">
                Get started by creating your first random encounter table.
                Choose a die size, set your filters, and generate a table
                instantly.
              </p>
            </div>
            <Button asChild>
              <Link href="/encounter-tables/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Table
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <TabsList>
          <TabsTrigger value="table" className="gap-2">
            <Table2 className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Cards</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Description
                  </TableHead>
                  <TableHead>Die Size</TableHead>
                  <TableHead className="hidden md:table-cell">Levels</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Sources
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/encounter-tables/${table.id}`}
                        className="hover:underline"
                      >
                        {table.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell max-w-xs">
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        {table.description || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">d{table.die_size}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {table.filters.level_min} - {table.filters.level_max}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {table.filters.sources.length}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={table.is_public ? "default" : "secondary"}
                      >
                        {table.is_public ? "Public" : "Private"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(table.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/encounter-tables/${table.id}/settings`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <Link
              key={table.id}
              href={`/encounter-tables/${table.id}`}
              className="block transition-all hover:scale-105"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{table.name}</CardTitle>
                    <Badge variant={table.is_public ? "default" : "secondary"}>
                      {table.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                  {table.description && (
                    <CardDescription className="line-clamp-2">
                      {table.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Die Size:</span>
                      <Badge variant="outline">d{table.die_size}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Levels:</span>
                      <span className="font-medium">
                        {table.filters.level_min} - {table.filters.level_max}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sources:</span>
                      <span className="font-medium">
                        {table.filters.sources.length}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created {new Date(table.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
