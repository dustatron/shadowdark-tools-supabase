"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Zod schema for form validation
const monsterFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  challenge_level: z
    .number()
    .int()
    .min(1)
    .max(20, "Challenge level must be 1-20"),
  hit_points: z.number().int().min(1, "Hit points must be at least 1"),
  armor_class: z.number().int().min(1).max(25, "Armor class must be 1-25"),
  speed: z.string().min(1, "Speed is required"),
  attacks: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["melee", "ranged"]),
      damage: z.string(),
      range: z.string(),
      description: z.string().optional(),
    }),
  ),
  abilities: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    }),
  ),
  tags: z.object({
    type: z.array(z.string()).min(1, "At least one monster type is required"),
    location: z.array(z.string()).min(1, "At least one location is required"),
  }),
  author_notes: z.string().optional(),
});

type MonsterFormData = z.infer<typeof monsterFormSchema>;

interface Attack {
  name: string;
  type: "melee" | "ranged";
  damage: string;
  range: string;
  description: string;
}

interface Ability {
  name: string;
  description: string;
}

interface Monster extends MonsterFormData {
  id?: string;
  source?: string;
  monster_type?: "official" | "user";
}

interface MonsterFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: MonsterFormData) => Promise<void>;
  monster?: Monster | null;
  loading?: boolean;
}

const MONSTER_TYPES = [
  "beast",
  "celestial",
  "dragon",
  "elemental",
  "fey",
  "fiend",
  "giant",
  "humanoid",
  "monstrosity",
  "ooze",
  "plant",
  "undead",
];

const LOCATIONS = [
  "any",
  "cave",
  "city",
  "coastal",
  "desert",
  "dungeon",
  "forest",
  "mountain",
  "plains",
  "swamp",
  "underground",
  "water",
];

const ATTACK_TYPES = [
  { value: "melee", label: "Melee" },
  { value: "ranged", label: "Ranged" },
];

export function MonsterForm({
  opened,
  onClose,
  onSubmit,
  monster = null,
  loading = false,
}: MonsterFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<MonsterFormData>({
    resolver: zodResolver(monsterFormSchema),
    defaultValues: {
      name: monster?.name || "",
      challenge_level: monster?.challenge_level || 1,
      hit_points: monster?.hit_points || 10,
      armor_class: monster?.armor_class || 10,
      speed: monster?.speed || "near",
      attacks: monster?.attacks || [],
      abilities: monster?.abilities || [],
      tags: {
        type: monster?.tags?.type || [],
        location: monster?.tags?.location || [],
      },
      author_notes: monster?.author_notes || "",
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

  // Reset form when monster changes or modal opens
  useEffect(() => {
    if (opened) {
      form.reset({
        name: monster?.name || "",
        challenge_level: monster?.challenge_level || 1,
        hit_points: monster?.hit_points || 10,
        armor_class: monster?.armor_class || 10,
        speed: monster?.speed || "near",
        attacks: monster?.attacks || [],
        abilities: monster?.abilities || [],
        tags: {
          type: monster?.tags?.type || [],
          location: monster?.tags?.location || [],
        },
        author_notes: monster?.author_notes || "",
      });
    }
  }, [opened, monster, form]);

  const handleSubmit = async (values: MonsterFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(values);
      form.reset();
      onClose();
      toast.success(`Monster ${monster ? "updated" : "created"} successfully`);
    } catch (error: any) {
      toast.error(
        error.message || `Failed to ${monster ? "update" : "create"} monster`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const addAttack = () => {
    appendAttack({
      name: "",
      type: "melee" as const,
      damage: "1d6",
      range: "close",
      description: "",
    });
  };

  const addAbility = () => {
    appendAbility({
      name: "",
      description: "",
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={opened} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {monster ? "Edit Monster" : "Create Monster"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Monster name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                            field.onChange(parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hit_points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hit Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="HP"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="armor_class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Armor Class</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="AC"
                          min={1}
                          max={25}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speed</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., near, far, close"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tags.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monster Types</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={MONSTER_TYPES.map((t) => ({
                            value: t,
                            label: t.charAt(0).toUpperCase() + t.slice(1),
                          }))}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Select types"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Locations</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={LOCATIONS.map((l) => ({
                            value: l,
                            label: l.charAt(0).toUpperCase() + l.slice(1),
                          }))}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Select locations"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Attacks */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">Attacks</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addAttack}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Attack
                  </Button>
                </div>

                <div className="space-y-2">
                  {attackFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-4">
                            <FormField
                              control={form.control}
                              name={`attacks.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Attack name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`attacks.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {ATTACK_TYPES.map((type) => (
                                        <SelectItem
                                          key={type.value}
                                          value={type.value}
                                        >
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <FormField
                              control={form.control}
                              name={`attacks.${index}.damage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="1d6+2" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="md:col-span-3">
                            <FormField
                              control={form.control}
                              name={`attacks.${index}.range`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Range" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="md:col-span-1 flex items-start">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeAttack(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="md:col-span-12">
                            <FormField
                              control={form.control}
                              name={`attacks.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Attack description (optional)"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Abilities */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">Abilities</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addAbility}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Ability
                  </Button>
                </div>

                <div className="space-y-2">
                  {abilityFields.map((field, index) => (
                    <Card key={field.id}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                          <div className="md:col-span-11 space-y-3">
                            <FormField
                              control={form.control}
                              name={`abilities.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Ability name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`abilities.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Ability description"
                                      rows={2}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="md:col-span-1 flex items-start">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeAbility(index)}
                              className="text-destructive hover:text-destructive mt-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="author_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this monster..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || loading}>
                {submitting || loading
                  ? "Saving..."
                  : monster
                    ? "Update Monster"
                    : "Create Monster"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
