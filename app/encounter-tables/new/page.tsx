"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EncounterTableCreateSchema } from "@/lib/encounter-tables/schemas";
import type { EncounterTableCreateInput } from "@/lib/encounter-tables/schemas";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const COMMON_DIE_SIZES = [6, 8, 10, 12, 20, 100];
const MONSTER_SOURCES = [
  { value: "official", label: "Official Monsters" },
  { value: "user", label: "My Custom Monsters" },
  { value: "public", label: "Community Monsters" },
];
const ALIGNMENTS = [
  { value: "Lawful", label: "Lawful" },
  { value: "Neutral", label: "Neutral" },
  { value: "Chaotic", label: "Chaotic" },
];
const MOVEMENT_TYPES = [
  { value: "fly", label: "Flying" },
  { value: "swim", label: "Swimming" },
  { value: "burrow", label: "Burrowing" },
  { value: "climb", label: "Climbing" },
];

export default function NewEncounterTablePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EncounterTableCreateInput>({
    resolver: zodResolver(EncounterTableCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      die_size: 20,
      filters: {
        sources: ["official"],
        level_min: 1,
        level_max: 20,
        alignments: [],
        movement_types: [],
        search_query: "",
      },
      generate_immediately: true,
    },
  });

  const onSubmit = async (data: EncounterTableCreateInput) => {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const selectedSources = form.watch("filters.sources");
  const levelMin = form.watch("filters.level_min");
  const levelMax = form.watch("filters.level_max");

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Give your encounter table a name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Forest Encounters" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for your encounter table (3-100
                      characters)
                    </FormDescription>
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

              <FormField
                control={form.control}
                name="die_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Die Size</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a die size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMMON_DIE_SIZES.map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            d{size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The die to roll on this table (d6, d20, d100, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monster Filters</CardTitle>
              <CardDescription>
                Configure which monsters should be included in this table
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      {MONSTER_SOURCES.map((source) => (
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
                                          (val) => val !== source.value,
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
                          min={1}
                          max={20}
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
                          min={levelMin || 1}
                          max={20}
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
                name="filters.alignments"
                render={() => (
                  <FormItem>
                    <FormLabel>Alignments (Optional)</FormLabel>
                    <FormDescription>
                      Filter by creature alignment
                    </FormDescription>
                    <div className="grid grid-cols-3 gap-2">
                      {ALIGNMENTS.map((alignment) => (
                        <FormField
                          key={alignment.value}
                          control={form.control}
                          name="filters.alignments"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    alignment.value as any,
                                  )}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([
                                        ...current,
                                        alignment.value,
                                      ]);
                                    } else {
                                      field.onChange(
                                        current.filter(
                                          (val) => val !== alignment.value,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {alignment.label}
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
                                          (val) => val !== movement.value,
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
                      Filter by name or description (max 100 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Table...
                </>
              ) : (
                "Create Table"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
