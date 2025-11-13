"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EncounterTableForm } from "@/components/encounter-tables/EncounterTableForm";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import type { EncounterTableCreateInput } from "@/lib/encounter-tables/schemas";
import type { EncounterTable } from "@/lib/encounter-tables/types";
import { toast } from "sonner";
import { PageTitle } from "@/components/page-title";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EncounterTableSettingsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [table, setTable] = useState<EncounterTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await fetch(`/api/encounter-tables/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch table");
        }

        const data = await response.json();
        setTable(data);
      } catch (error) {
        console.error("Error fetching table:", error);
        toast.error("Error", {
          description: "Failed to load encounter table",
        });
        router.push("/encounter-tables");
      } finally {
        setLoading(false);
      }
    };

    fetchTable();
  }, [id, router]);

  const handleUpdate = async (data: EncounterTableCreateInput) => {
    try {
      const response = await fetch(`/api/encounter-tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update table");
      }

      toast.success("Success", {
        description: "Encounter table updated successfully",
      });

      router.push(`/encounter-tables/${id}`);
    } catch (error) {
      console.error("Error updating table:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to update table",
      });
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await fetch(`/api/encounter-tables/${id}/generate`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to regenerate table");
      }

      toast.success("Success", {
        description: "Table regenerated successfully",
      });

      router.push(`/encounter-tables/${id}`);
    } catch (error) {
      console.error("Error regenerating table:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to regenerate table",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/encounter-tables/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete table");
      }

      toast.success("Success", {
        description: "Table deleted successfully",
      });

      router.push("/encounter-tables");
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete table",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!table) {
    return null;
  }

  const initialData: Partial<EncounterTableCreateInput> = {
    name: table.name,
    description: table.description || undefined,
    die_size: table.die_size,
    filters: table.filters,
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <PageTitle title="Encounter Table Settings" />
        <p className="text-muted-foreground mt-2">
          Update your encounter table settings and filters
        </p>
      </div>

      <div className="space-y-8">
        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Table Configuration</CardTitle>
            <CardDescription>
              Modify the table name, description, die size, and monster filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EncounterTableForm
              initialData={initialData}
              onSubmit={handleUpdate}
              onCancel={() => router.push(`/encounter-tables/${id}`)}
              isEdit
            />
          </CardContent>
        </Card>

        {/* Regenerate Section */}
        <Card>
          <CardHeader>
            <CardTitle>Regenerate Table</CardTitle>
            <CardDescription>
              Generate new random monsters using your current filter settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={regenerating}>
                  {regenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate All Entries
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Regenerate encounter table?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace all current monsters with new random
                    selections based on your filter settings. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerate}>
                    Regenerate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Separator className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Delete this encounter table</h3>
                <p className="text-sm text-muted-foreground">
                  Once deleted, this table and all its entries will be
                  permanently removed
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Table
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the encounter table <strong>{table.name}</strong> and all{" "}
                      {table.die_size} entries.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
