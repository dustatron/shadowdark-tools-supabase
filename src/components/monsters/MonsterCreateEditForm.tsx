"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, AlertCircle, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconSelector } from "../ui/IconSelector";
import { createMonsterSchema } from "@/lib/validations/monster";

// Shadowdark-specific constants
const MOVEMENT_SPEEDS = [
  { value: "near", label: "Near (30ft)" },
  { value: "close", label: "Close (60ft)" },
  { value: "far", label: "Far (120ft+)" },
  { value: "custom", label: "Custom" },
];

const ATTACK_TYPES = [
  { value: "melee", label: "Melee" },
  { value: "ranged", label: "Ranged" },
  { value: "spell", label: "Spell" },
];

const COMMON_TAGS = {
  type: [
    "Aberration",
    "Beast",
    "Celestial",
    "Construct",
    "Dragon",
    "Elemental",
    "Fey",
    "Fiend",
    "Giant",
    "Humanoid",
    "Monstrosity",
    "Ooze",
    "Plant",
    "Undead",
  ],
  location: [
    "Dungeon",
    "Forest",
    "Mountain",
    "Swamp",
    "Desert",
    "Ocean",
    "City",
    "Underground",
    "Planar",
    "Arctic",
  ],
};

// Extended schema with customSpeed field for form state
// We need to override attacks and abilities to make them required arrays
const formSchema = createMonsterSchema
  .extend({
    customSpeed: z.string().optional(),
  })
  .merge(
    z.object({
      attacks: z.array(
        z.object({
          name: z.string(),
          type: z.enum(["melee", "ranged", "spell"]),
          damage: z.string(),
          range: z.string().optional(),
          description: z.string().optional(),
        }),
      ),
      abilities: z.array(
        z.object({
          name: z.string(),
          description: z.string(),
        }),
      ),
    }),
  );

type FormData = z.infer<typeof formSchema>;

interface MonsterCreateEditFormProps {
  initialData?: z.infer<typeof createMonsterSchema> & { id?: string };
  onSubmit?: (data: z.infer<typeof createMonsterSchema>) => Promise<void>;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

export function MonsterCreateEditForm({
  initialData,
  onSubmit,
  onCancel,
  mode = "create",
}: MonsterCreateEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSpeed, setCustomSpeed] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      challenge_level: initialData?.challenge_level || 1,
      hit_points: initialData?.hit_points || 10,
      armor_class: initialData?.armor_class || 10,
      speed: initialData?.speed || "near",
      customSpeed: "",
      attacks: initialData?.attacks || [],
      abilities: initialData?.abilities || [],
      treasure: initialData?.treasure || null,
      tags: initialData?.tags || { type: [], location: [] },
      source: initialData?.source || "Custom",
      author_notes: initialData?.author_notes || "",
      icon_url: initialData?.icon_url || "",
      is_public: initialData?.is_public ?? false,
    },
  });

  const {
    fields: attackFields,
    append: appendAttack,
    remove: removeAttack,
  } = useFieldArray({
    control: form.control,
    name: "attacks",
  });

  const {
    fields: abilityFields,
    append: appendAbility,
    remove: removeAbility,
  } = useFieldArray({
    control: form.control,
    name: "abilities",
  });

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      // Prepare the data
      const submitData = {
        ...values,
        speed:
          values.speed === "custom" ? values.customSpeed || "" : values.speed,
        icon_url: values.icon_url || undefined, // Transform empty string to undefined
      };

      // Remove customSpeed field
      const { customSpeed: _, ...finalData } = submitData;

      if (onSubmit) {
        // Use provided submit handler
        await onSubmit(finalData as z.infer<typeof createMonsterSchema>);
      } else {
        // Default API submission
        const url =
          mode === "edit" && initialData?.id
            ? `/api/monsters/${initialData.id}`
            : "/api/monsters";

        const method = mode === "edit" ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to ${mode} monster`);
        }

        const monster = await response.json();

        toast.success(
          `Monster ${mode === "create" ? "created" : "updated"} successfully!`,
          {
            icon: <Check className="h-4 w-4" />,
          },
        );

        // Redirect to monster detail page
        router.push(`/monsters/${monster.id}`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing monster:`, error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${mode} monster`,
        {
          icon: <AlertCircle className="h-4 w-4" />,
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAttack = () => {
    appendAttack({
      name: "",
      type: "melee",
      damage: "",
      range: "",
      description: "",
    });
  };

  const addAbility = () => {
    appendAbility({
      name: "",
      description: "",
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit as any)}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monster Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter monster name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control as any}
                name="challenge_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenge Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1-20"
                        min={1}
                        max={20}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="hit_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hit Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Minimum 1"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="armor_class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Armor Class</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1-21"
                        min={1}
                        max={21}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control as any}
                name="speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movement Speed</FormLabel>
                    <Select
                      value={customSpeed ? "custom" : field.value}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setCustomSpeed(true);
                        } else {
                          setCustomSpeed(false);
                          field.onChange(value);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select speed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOVEMENT_SPEEDS.map((speed) => (
                          <SelectItem key={speed.value} value={speed.value}>
                            {speed.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {customSpeed && (
                <FormField
                  control={form.control as any}
                  name="customSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="e.g., fly 60ft, swim 30ft"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control as any}
              name="icon_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <IconSelector
                      label="Monster Icon"
                      value={field.value}
                      onChange={(icon: string | null) =>
                        field.onChange(icon || "")
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attacks</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addAttack}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Attack
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {attackFields.length === 0 && (
              <Alert>
                <AlertDescription>
                  No attacks added yet. Click &quot;Add Attack&quot; to create
                  one.
                </AlertDescription>
              </Alert>
            )}

            {attackFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Attack #{index + 1}</p>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAttack(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as any}
                      name={`attacks.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Attack name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name={`attacks.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Attack type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ATTACK_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name={`attacks.${index}.damage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Damage (e.g., 1d6+2)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
                      name={`attacks.${index}.range`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Range (e.g., reach 5ft)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control as any}
                    name={`attacks.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Additional description (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Abilities</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addAbility}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Ability
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {abilityFields.length === 0 && (
              <Alert>
                <AlertDescription>
                  No abilities added yet. Click &quot;Add Ability&quot; to
                  create one.
                </AlertDescription>
              </Alert>
            )}

            {abilityFields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Ability #{index + 1}</p>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAbility(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control as any}
                    name={`abilities.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Ability name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name={`abilities.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Ability description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control as any}
              name="treasure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treasure</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Treasure description (optional)"
                      {...field}
                      value={
                        typeof field.value === "string"
                          ? field.value
                          : field.value
                            ? JSON.stringify(field.value)
                            : ""
                      }
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="tags.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type Tags</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={COMMON_TAGS.type.map((tag) => ({
                        value: tag,
                        label: tag,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select or type monster types"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="tags.location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Tags</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={COMMON_TAGS.location.map((tag) => ({
                        value: tag,
                        label: tag,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Select or type locations"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Homebrew, Campaign Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="author_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or context (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Make this monster public
                    </FormLabel>
                    <FormDescription>
                      Allow other users to view and use this monster
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
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel || (() => router.back())}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create Monster"
                : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
