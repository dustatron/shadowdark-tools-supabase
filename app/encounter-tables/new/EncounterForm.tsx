"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EncounterTableCreateSchema } from "@/lib/encounter-tables/schemas";
import type { EncounterTableCreateInput } from "@/lib/encounter-tables/schemas";
import { generateEncounterTableName } from "@/lib/encounter-tables/utils/generate-name";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { EncounterTablePreview } from "./EncounterTablePreview";

const COMMON_DIE_SIZES = [4, 6, 8, 10, 12, 20, 100];
const MONSTER_SOURCES = [
  { value: "official", label: "Official Monsters" },
  { value: "user", label: "My Custom Monsters" },
  { value: "public", label: "Community Monsters" },
  { value: "favorites", label: "My Favorites" },
];
const MOVEMENT_TYPES = [
  { value: "fly", label: "Flying" },
  { value: "swim", label: "Swimming" },
  { value: "burrow", label: "Burrowing" },
  { value: "climb", label: "Climbing" },
];

type PreviewData = {
  name: string;
  description: string | null;
  die_size: number;
  filters: any;
  entries: any[];
} | null;

export default function EncounterForm() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const form = useForm({
    resolver: zodResolver(EncounterTableCreateSchema),
    defaultValues: {
      name: "",
      die_size: 6,
      description: "",
      filters: {
        sources: ["official" as const],
        level_min: 1,
        level_max: 20,
        movement_types: [],
        search_query: "",
      },
      generate_immediately: true,
    },
  });

  // Auto-generate name on mount
  useEffect(() => {
    try {
      form.setValue("name", generateEncounterTableName());
    } catch (err) {
      console.error("Error generating name:", err);
      toast.error("Failed to generate table name. Please enter manually.");
    }
  }, [form]);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Restore from localStorage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const pending = localStorage.getItem("pending_encounter_table");
      if (pending) {
        try {
          const data = JSON.parse(pending);
          setPreviewData(data);
          toast.info("Your generated table is ready to save!");
          localStorage.removeItem("pending_encounter_table");
        } catch (err) {
          console.error("Error restoring table:", err);
          localStorage.removeItem("pending_encounter_table");
        }
      }
    }
  }, [isAuthenticated]);

  const generatePreview = async (data: EncounterTableCreateInput) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/encounter-tables/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate preview");
      }

      const result = await response.json();
      setPreviewData(result.preview);

      // Save to localStorage for unauthenticated users
      if (!isAuthenticated) {
        try {
          localStorage.setItem(
            "pending_encounter_table",
            JSON.stringify(result.preview),
          );
        } catch (storageErr) {
          console.error("Failed to save to localStorage:", storageErr);
        }
      }
    } catch (err) {
      console.error("Error generating preview:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTable = async () => {
    if (!previewData) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/encounter-tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: previewData.name,
          description: previewData.description,
          die_size: previewData.die_size,
          filters: previewData.filters,
          generate_immediately: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save encounter table");
      }

      const result = await response.json();

      // Redirect to the newly created table
      router.push(`/encounter-tables/${result.id}`);
    } catch (err) {
      console.error("Error saving encounter table:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSaving(false);
    }
  };

  const LEVEL_MIN = form.watch("filters.level_min");
  const LEVEL_MAX = form.watch("filters.level_max");

  // Filter monster sources based on authentication
  const availableMonsterSources = isAuthenticated
    ? MONSTER_SOURCES
    : MONSTER_SOURCES.filter(
        (source) => source.value !== "user" && source.value !== "favorites",
      );

  return (
    <div className="container mx-auto px-4 py-6 md:p-6 lg:p-8 max-w-7xl">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Encounter Generate
        </h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form */}
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(generatePreview)}
              className="space-y-3"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Table Name</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              try {
                                form.setValue(
                                  "name",
                                  generateEncounterTableName(),
                                );
                              } catch (err) {
                                console.error("Error generating name:", err);
                                toast.error(
                                  "Failed to generate table name. Please enter manually.",
                                );
                              }
                            }}
                            className="h-8 px-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="e.g., Forest Encounters"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="die_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Table Size</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_DIE_SIZES.map((size) => (
                            <Button
                              type="button"
                              key={size}
                              value={size.toString()}
                              onClick={() => field.onChange(size)}
                              variant={
                                field.value === size ? "destructive" : "outline"
                              }
                              className="flex-1 min-w-[60px] sm:flex-initial"
                            >
                              d{size}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Random encounters for a dark forest at night"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional description (max 500 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Accordion type="single" collapsible>
                    <AccordionItem value="filters">
                      <AccordionTrigger>Monster Filters</AccordionTrigger>
                      <AccordionContent className="space-y-6 pt-4 px-2">
                        <FormField
                          control={form.control}
                          name="filters.sources"
                          render={() => (
                            <FormItem>
                              <FormLabel>Monster Sources</FormLabel>
                              <FormDescription>
                                Select at least one monster source
                              </FormDescription>
                              <div className="space-y-2">
                                {availableMonsterSources.map((source) => (
                                  <FormField
                                    key={source.value}
                                    control={form.control}
                                    name="filters.sources"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              source.value as any,
                                            )}
                                            onCheckedChange={(checked) => {
                                              const current = field.value || [];
                                              if (checked) {
                                                field.onChange([
                                                  ...current,
                                                  source.value,
                                                ]);
                                              } else {
                                                field.onChange(
                                                  current.filter(
                                                    (val) =>
                                                      val !== source.value,
                                                  ),
                                                );
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {source.label}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="filters.level_min"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Minimum Challenge Level</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={LEVEL_MIN}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="filters.level_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum Challenge Level</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    max={LEVEL_MAX}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="filters.movement_types"
                          render={() => (
                            <FormItem>
                              <FormLabel>Movement Types (Optional)</FormLabel>
                              <FormDescription>
                                Filter by special movement types
                              </FormDescription>
                              <div className="grid grid-cols-2 gap-2">
                                {MOVEMENT_TYPES.map((movement) => (
                                  <FormField
                                    key={movement.value}
                                    control={form.control}
                                    name="filters.movement_types"
                                    render={({ field }) => (
                                      <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              movement.value as any,
                                            )}
                                            onCheckedChange={(checked) => {
                                              const current = field.value || [];
                                              if (checked) {
                                                field.onChange([
                                                  ...current,
                                                  movement.value,
                                                ]);
                                              } else {
                                                field.onChange(
                                                  current.filter(
                                                    (val) =>
                                                      val !== movement.value,
                                                  ),
                                                );
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal cursor-pointer">
                                          {movement.label}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="filters.search_query"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Search Query (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., undead, dragon, forest"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Filter by name or description (max 100
                                characters)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isGenerating || isSaving}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating || isSaving}
                  className="w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Preview...
                    </>
                  ) : (
                    "Generate Preview"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <EncounterTablePreview
            previewData={previewData}
            isGenerating={isGenerating}
            isSaving={isSaving}
            isAuthenticated={isAuthenticated}
            onRegenerate={form.handleSubmit(generatePreview)}
            onSave={saveTable}
          />
        </div>
      </div>
    </div>
  );
}
