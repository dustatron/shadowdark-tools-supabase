"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { logger } from "@/lib/utils/logger";

import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import { Switch } from "@/components/primitives/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/primitives/form";
import { spellCreateSchema, type SpellCreate } from "@/lib/validations/spell";
import { OfficialEditWarning } from "@/components/magic-items/OfficialEditWarning";

// Spell tiers (Shadowdark standard)
const SPELL_TIERS = [1, 2, 3, 4, 5];

// Spell classes (Shadowdark standard)
const SPELL_CLASSES = [
  { value: "wizard", label: "Wizard" },
  { value: "priest", label: "Priest" },
];

interface SpellFormProps {
  initialData?: Partial<SpellCreate> & { id?: string; slug?: string };
  onSubmit?: (data: SpellCreate) => Promise<void>;
  onCancel?: () => void;
  mode?: "create" | "edit";
  isOfficial?: boolean;
}

export function SpellForm({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
  isOfficial = false,
}: SpellFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOfficialWarning, setShowOfficialWarning] = useState(false);
  const [pendingData, setPendingData] = useState<SpellCreate | null>(null);

  const form = useForm({
    resolver: zodResolver(spellCreateSchema),
    defaultValues: {
      name: initialData?.name || "",
      tier: initialData?.tier || 1,
      classes: initialData?.classes || ["wizard"],
      duration: initialData?.duration || "",
      range: initialData?.range || "",
      description: initialData?.description || "",
      author_notes: initialData?.author_notes || "",
      is_public: initialData?.is_public ?? false,
    },
  });

  const performSubmit = async (data: SpellCreate) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default submit behavior - call API
        let url: string;
        if (mode === "create") {
          url = "/api/spells";
        } else if (isOfficial) {
          url = `/api/official/spells/${initialData?.id}`;
        } else {
          url = `/api/spells/${initialData?.id}`;
        }
        const method = mode === "edit" ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to save spell");
        }

        const spell = await response.json();
        toast.success(
          mode === "edit"
            ? "Spell updated successfully"
            : "Spell created successfully",
        );

        // Redirect to spell detail page
        router.push(`/spells/${spell.slug || spell.id}`);
      }
    } catch (error) {
      logger.error("Error saving spell:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while saving the spell",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (data: SpellCreate) => {
    // Show warning for official items before saving
    if (isOfficial && mode === "edit") {
      setPendingData(data);
      setShowOfficialWarning(true);
      return;
    }
    await performSubmit(data);
  };

  const handleOfficialWarningConfirm = async () => {
    setShowOfficialWarning(false);
    if (pendingData) {
      await performSubmit(pendingData);
      setPendingData(null);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Watch classes to enable multi-select
  const selectedClasses = form.watch("classes");

  const toggleClass = (classValue: string) => {
    const current = selectedClasses || [];
    if (current.includes(classValue as "wizard" | "priest")) {
      // Remove class if already selected
      form.setValue(
        "classes",
        current.filter((c) => c !== classValue),
      );
    } else {
      // Add class
      form.setValue("classes", [...current, classValue as "wizard" | "priest"]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {mode === "edit" ? "Edit Spell" : "Create New Spell"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spell Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fire Bolt" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be unique across all spells (official and custom)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tier */}
            <FormField
              control={form.control}
              name="tier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select spell tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPELL_TIERS.map((tier) => (
                        <SelectItem key={tier} value={tier.toString()}>
                          Tier {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Spell power level (1-5, Shadowdark standard)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Classes */}
            <FormField
              control={form.control}
              name="classes"
              render={() => (
                <FormItem>
                  <FormLabel>Classes *</FormLabel>
                  <FormDescription>
                    Select which classes can cast this spell
                  </FormDescription>
                  <div className="flex gap-2">
                    {SPELL_CLASSES.map((classOption) => (
                      <Button
                        key={classOption.value}
                        type="button"
                        variant={
                          selectedClasses?.includes(
                            classOption.value as "wizard" | "priest",
                          )
                            ? "default"
                            : "outline"
                        }
                        onClick={() => toggleClass(classOption.value)}
                        className="flex-1"
                      >
                        {classOption.label}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Instantaneous, Concentration (1 minute)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    How long the spell lasts (free text)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Range */}
            <FormField
              control={form.control}
              name="range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Range *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Self, Touch, 60 feet, Near"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum distance the spell can reach (free text)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (Effect) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spell Effect *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what the spell does, including damage, effects, saving throws, etc."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Full description of the spell&apos;s mechanics and effects
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author Notes (optional school/notes) */}
            <FormField
              control={form.control}
              name="author_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School / Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Evocation, Necromancy"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional school of magic or additional notes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Public toggle - hide for official items */}
            {!isOfficial && (
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Spell</FormLabel>
                      <FormDescription>
                        Make this spell visible to all users (defaults to
                        private)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === "edit" ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{mode === "edit" ? "Update Spell" : "Create Spell"}</>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>

      <OfficialEditWarning
        open={showOfficialWarning}
        onOpenChange={setShowOfficialWarning}
        onConfirm={handleOfficialWarningConfirm}
      />
    </Form>
  );
}
