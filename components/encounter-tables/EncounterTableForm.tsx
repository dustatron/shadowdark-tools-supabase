"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  EncounterTableCreateSchema,
  type EncounterTableCreateInput,
} from "@/lib/encounter-tables/schemas";
import type {
  MonsterSource,
  Alignment,
  MovementType,
} from "@/lib/encounter-tables/types";
import { useState } from "react";
import { DiceSizeSelector } from "./DiceSizeSelector";

interface EncounterTableFormProps {
  onSubmit: (data: EncounterTableCreateInput) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<EncounterTableCreateInput>;
  isEdit?: boolean;
}

const MONSTER_SOURCES: { value: MonsterSource; label: string }[] = [
  { value: "official", label: "Official Monsters" },
  { value: "user", label: "My Custom Monsters" },
  { value: "public", label: "Community Monsters" },
];

const ALIGNMENTS: { value: Alignment; label: string }[] = [
  { value: "Lawful", label: "Lawful" },
  { value: "Neutral", label: "Neutral" },
  { value: "Chaotic", label: "Chaotic" },
];

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: "fly", label: "Flying" },
  { value: "swim", label: "Swimming" },
  { value: "burrow", label: "Burrowing" },
  { value: "climb", label: "Climbing" },
];

export function EncounterTableForm({
  onSubmit,
  onCancel,
  initialData,
  isEdit = false,
}: EncounterTableFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(EncounterTableCreateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      die_size: initialData?.die_size || 20,
      generate_immediately: initialData?.generate_immediately ?? true,
      filters: {
        sources: initialData?.filters?.sources || ["official"],
        level_min: initialData?.filters?.level_min || 1,
        level_max: initialData?.filters?.level_max || 20,
        alignments: initialData?.filters?.alignments || [],
        movement_types: initialData?.filters?.movement_types || [],
        search_query: initialData?.filters?.search_query || "",
      },
    },
  });

  const descriptionLength = form.watch("description")?.length || 0;
  const selectedSources = form.watch("filters.sources") || [];

  const handleSubmit = async (data: EncounterTableCreateInput) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Table Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Table Name</Label>
        <Input
          id="name"
          placeholder="e.g., Forest Encounters, Dungeon Level 1"
          {...form.register("name")}
          aria-invalid={!!form.formState.errors.name}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          rows={3}
          maxLength={500}
          placeholder="Describe when and how to use this encounter table..."
          {...form.register("description")}
          aria-invalid={!!form.formState.errors.description}
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Add context about this encounter table
          </p>
          <p className="text-sm text-muted-foreground">
            {descriptionLength}/500 characters
          </p>
        </div>
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      {/* Die Size Selection */}
      <div className="space-y-2">
        <Label htmlFor="die_size">Die Size</Label>
        <Controller
          control={form.control}
          name="die_size"
          render={({ field }) => (
            <DiceSizeSelector
              value={field.value}
              onChange={field.onChange}
              error={form.formState.errors.die_size?.message}
            />
          )}
        />
        <p className="text-sm text-muted-foreground">
          Number of entries in the encounter table (1-1000)
        </p>
      </div>

      {/* Monster Sources */}
      <div className="space-y-3">
        <Label>Monster Sources</Label>
        <p className="text-sm text-muted-foreground">
          Select at least one source for random encounters
        </p>
        <div className="space-y-2">
          {MONSTER_SOURCES.map((source) => (
            <div key={source.value} className="flex items-center space-x-2">
              <Controller
                control={form.control}
                name="filters.sources"
                render={({ field }) => (
                  <Checkbox
                    id={`source-${source.value}`}
                    checked={field.value?.includes(source.value)}
                    onCheckedChange={(checked) => {
                      const currentSources = field.value || [];
                      if (checked) {
                        field.onChange([...currentSources, source.value]);
                      } else {
                        field.onChange(
                          currentSources.filter((s) => s !== source.value),
                        );
                      }
                    }}
                  />
                )}
              />
              <Label
                htmlFor={`source-${source.value}`}
                className="font-normal cursor-pointer"
              >
                {source.label}
              </Label>
            </div>
          ))}
        </div>
        {form.formState.errors.filters?.sources && (
          <p className="text-sm text-destructive">
            {form.formState.errors.filters.sources.message}
          </p>
        )}
      </div>

      {/* Challenge Level Range */}
      <div className="space-y-3">
        <Label>Challenge Level Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="level_min"
              className="text-sm text-muted-foreground"
            >
              Minimum
            </Label>
            <Input
              id="level_min"
              type="number"
              min={1}
              max={20}
              {...form.register("filters.level_min", { valueAsNumber: true })}
              aria-invalid={!!form.formState.errors.filters?.level_min}
            />
            {form.formState.errors.filters?.level_min && (
              <p className="text-sm text-destructive">
                {form.formState.errors.filters.level_min.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="level_max"
              className="text-sm text-muted-foreground"
            >
              Maximum
            </Label>
            <Input
              id="level_max"
              type="number"
              min={1}
              max={20}
              {...form.register("filters.level_max", { valueAsNumber: true })}
              aria-invalid={!!form.formState.errors.filters?.level_max}
            />
            {form.formState.errors.filters?.level_max && (
              <p className="text-sm text-destructive">
                {form.formState.errors.filters.level_max.message}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Monsters within this challenge level range will be included
        </p>
      </div>

      {/* Additional Filters */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="additional-filters">
          <AccordionTrigger>Additional Filters (Optional)</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* Alignments */}
            <div className="space-y-3">
              <Label>Alignments</Label>
              <p className="text-sm text-muted-foreground">
                Filter by alignment, or leave unchecked for all alignments
              </p>
              <div className="space-y-2">
                {ALIGNMENTS.map((alignment) => (
                  <div
                    key={alignment.value}
                    className="flex items-center space-x-2"
                  >
                    <Controller
                      control={form.control}
                      name="filters.alignments"
                      render={({ field }) => (
                        <Checkbox
                          id={`alignment-${alignment.value}`}
                          checked={field.value?.includes(alignment.value)}
                          onCheckedChange={(checked) => {
                            const currentAlignments = field.value || [];
                            if (checked) {
                              field.onChange([
                                ...currentAlignments,
                                alignment.value,
                              ]);
                            } else {
                              field.onChange(
                                currentAlignments.filter(
                                  (a) => a !== alignment.value,
                                ),
                              );
                            }
                          }}
                        />
                      )}
                    />
                    <Label
                      htmlFor={`alignment-${alignment.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {alignment.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Movement Types */}
            <div className="space-y-3">
              <Label>Special Movement</Label>
              <p className="text-sm text-muted-foreground">
                Filter for monsters with specific movement abilities
              </p>
              <div className="space-y-2">
                {MOVEMENT_TYPES.map((movement) => (
                  <div
                    key={movement.value}
                    className="flex items-center space-x-2"
                  >
                    <Controller
                      control={form.control}
                      name="filters.movement_types"
                      render={({ field }) => (
                        <Checkbox
                          id={`movement-${movement.value}`}
                          checked={field.value?.includes(movement.value)}
                          onCheckedChange={(checked) => {
                            const currentMovements = field.value || [];
                            if (checked) {
                              field.onChange([
                                ...currentMovements,
                                movement.value,
                              ]);
                            } else {
                              field.onChange(
                                currentMovements.filter(
                                  (m) => m !== movement.value,
                                ),
                              );
                            }
                          }}
                        />
                      )}
                    />
                    <Label
                      htmlFor={`movement-${movement.value}`}
                      className="font-normal cursor-pointer"
                    >
                      {movement.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Query */}
            <div className="space-y-2">
              <Label htmlFor="search_query">Search Query</Label>
              <Input
                id="search_query"
                maxLength={100}
                placeholder="e.g., dragon, undead, goblin"
                {...form.register("filters.search_query")}
                aria-invalid={!!form.formState.errors.filters?.search_query}
              />
              <p className="text-sm text-muted-foreground">
                Filter monsters by name, type, or description
              </p>
              {form.formState.errors.filters?.search_query && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.filters.search_query.message}
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Generate Immediately Checkbox */}
      {!isEdit && (
        <div className="flex items-center space-x-2">
          <Controller
            control={form.control}
            name="generate_immediately"
            render={({ field }) => (
              <Checkbox
                id="generate_immediately"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label
            htmlFor="generate_immediately"
            className="font-normal cursor-pointer"
          >
            Generate encounter table immediately
          </Label>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Table"
              : "Create Table"}
        </Button>
      </div>
    </form>
  );
}
