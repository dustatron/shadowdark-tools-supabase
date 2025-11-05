"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  AlertCircle,
  Check,
  Wand2,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
} from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { IconSelector } from "../ui/IconSelector";
import { createMonsterSchema } from "@/lib/validations/monster";
import {
  getRecommendedStats,
  calculateXP,
  getHPGuidance,
  getACGuidance,
  ATTACK_TEMPLATES,
  DISTANCE_BANDS,
} from "@/lib/utils/shadowdarkMonsterHelper";
import {
  SHADOWDARK_TALENTS,
  getTalentsByCategory,
  searchTalents,
  type TalentTemplate,
} from "@/lib/constants/shadowdarkTalents";

// Shadowdark-specific constants
const MOVEMENT_SPEEDS = Object.values(DISTANCE_BANDS);

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
const formSchema = createMonsterSchema.extend({
  customSpeed: z.string().optional(),
});

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
  const [talentPopoverOpen, setTalentPopoverOpen] = useState(false);
  const [talentSearch, setTalentSearch] = useState("");
  const [sectionsOpen, setSectionsOpen] = useState({
    abilityScores: true,
    attacks: true,
    abilities: true,
    details: true,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      challenge_level: initialData?.challenge_level || 1,
      hit_points: initialData?.hit_points || 4,
      armor_class: initialData?.armor_class || 12,
      speed: initialData?.speed || "near",
      customSpeed: "",
      attacks: initialData?.attacks || [],
      abilities: initialData?.abilities || [],
      treasure: initialData?.treasure || null,
      tags: initialData?.tags || { type: [], location: [] },
      source: initialData?.source || "Custom",
      author_notes: initialData?.author_notes || "",
      icon_url: initialData?.icon_url || "",
      strength_mod: initialData?.strength_mod || 0,
      dexterity_mod: initialData?.dexterity_mod || 0,
      constitution_mod: initialData?.constitution_mod || 0,
      intelligence_mod: initialData?.intelligence_mod || 0,
      wisdom_mod: initialData?.wisdom_mod || 0,
      charisma_mod: initialData?.charisma_mod || 0,
      is_public: initialData?.is_public ?? false,
    },
  });

  // Auto-fill stats based on challenge level
  const handleAutoFill = () => {
    const cl = form.getValues("challenge_level");
    const recommended = getRecommendedStats(cl);

    form.setValue("hit_points", recommended.hp);
    form.setValue("armor_class", recommended.ac);

    toast.success(`Auto-filled stats for CL ${cl}`, {
      description: `HP: ${recommended.hp}, AC: ${recommended.ac}`,
    });
  };

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

  const addAttack = (template?: keyof typeof ATTACK_TEMPLATES) => {
    if (template && ATTACK_TEMPLATES[template]) {
      appendAttack(ATTACK_TEMPLATES[template]);
    } else {
      appendAttack({
        name: "",
        type: "melee",
        damage: "",
        range: "close",
        description: "",
      });
    }
  };

  const addAbility = () => {
    appendAbility({
      name: "",
      description: "",
    });
  };

  const addTalentFromLibrary = (talent: TalentTemplate) => {
    appendAbility({
      name: talent.name,
      description: talent.description,
    });
    setTalentPopoverOpen(false);
    setTalentSearch("");
    toast.success(`Added: ${talent.name}`);
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

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief visual description (e.g., 'A green, sunken-faced woman. Seaweed hair and oozing flesh.')"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    1-2 sentence visual description of the monster
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end gap-2 mb-4">
              <FormField
                control={form.control as any}
                name="challenge_level"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
                    <FormDescription>
                      XP: {calculateXP(field.value || 1)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAutoFill}
                title="Auto-fill recommended stats"
                className="min-h-[44px] min-w-[44px]"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="hit_points"
                render={({ field }) => {
                  const cl = form.watch("challenge_level") || 1;
                  return (
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
                      <FormDescription className="text-xs">
                        {getHPGuidance(cl)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                    <FormDescription className="text-xs">
                      {getACGuidance(field.value || 10)}
                    </FormDescription>
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

        {/* Ability Modifiers - Collapsible */}
        <Collapsible
          open={sectionsOpen.abilityScores}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, abilityScores: open }))
          }
        >
          <Card>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle>Ability Score Modifiers</CardTitle>
                  {sectionsOpen.abilityScores ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <FormDescription>
                  Ability modifiers range from -4 to +4 and affect attacks,
                  saves, and abilities
                </FormDescription>

                {/* Top row: STR, DEX, CON */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control as any}
                    name="strength_mod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>STR</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={-5}
                            max={5}
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
                    name="dexterity_mod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DEX</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={-5}
                            max={5}
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
                    name="constitution_mod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CON</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={-5}
                            max={5}
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

                {/* Bottom row: INT, WIS, CHA */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control as any}
                    name="intelligence_mod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>INT</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={-5}
                            max={5}
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
                    name="wisdom_mod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WIS</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={-5}
                            max={5}
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
                    name="charisma_mod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CHA</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={-5}
                            max={5}
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
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible
          open={sectionsOpen.attacks}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, attacks: open }))
          }
        >
          <Card>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle>Attacks</CardTitle>
                  {sectionsOpen.attacks ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addAttack("melee_basic")}
                  className="min-h-[44px]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Melee Attack
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addAttack("ranged_basic")}
                  className="min-h-[44px]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ranged Attack
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addAttack("spell_basic")}
                  className="min-h-[44px]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Spell Attack
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addAttack()}
                  className="min-h-[44px]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Custom
                </Button>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {attackFields.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      No attacks added yet. Click &quot;Add Attack&quot; to
                      create one.
                    </AlertDescription>
                  </Alert>
                )}

                {attackFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          Attack #{index + 1}
                        </p>
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
                              <Select
                                value={field.value || "close"}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Range" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="close">
                                    Close (5 ft / melee)
                                  </SelectItem>
                                  <SelectItem value="near">
                                    Near (30 ft)
                                  </SelectItem>
                                  <SelectItem value="far">
                                    Far (120+ ft / longbow)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible
          open={sectionsOpen.abilities}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, abilities: open }))
          }
        >
          <Card>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle>Abilities</CardTitle>
                  {sectionsOpen.abilities ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <div className="flex flex-wrap gap-2 mt-4">
                <Popover
                  open={talentPopoverOpen}
                  onOpenChange={setTalentPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="min-h-[44px]"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Talents ({SHADOWDARK_TALENTS.length})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search talents..."
                        value={talentSearch}
                        onValueChange={setTalentSearch}
                      />
                      <CommandList>
                        <CommandEmpty>No talents found.</CommandEmpty>
                        {["innate", "ride-along", "thematic", "spell"].map(
                          (category) => {
                            const categoryTalents = talentSearch
                              ? searchTalents(talentSearch).filter(
                                  (t) => t.category === category,
                                )
                              : getTalentsByCategory(
                                  category as TalentTemplate["category"],
                                );

                            if (categoryTalents.length === 0) return null;

                            return (
                              <div key={category}>
                                <CommandGroup
                                  heading={
                                    category.charAt(0).toUpperCase() +
                                    category.slice(1)
                                  }
                                >
                                  {categoryTalents
                                    .slice(0, 50)
                                    .map((talent, idx) => (
                                      <CommandItem
                                        key={`${category}-${idx}`}
                                        value={talent.name}
                                        onSelect={() =>
                                          addTalentFromLibrary(talent)
                                        }
                                        className="cursor-pointer"
                                      >
                                        <div className="flex flex-col gap-1">
                                          <span className="font-medium">
                                            {talent.name}
                                          </span>
                                          <span className="text-xs text-muted-foreground line-clamp-2">
                                            {talent.description}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  {categoryTalents.length > 50 && (
                                    <div className="px-2 py-1 text-xs text-muted-foreground">
                                      +{categoryTalents.length - 50} more...
                                      (refine search)
                                    </div>
                                  )}
                                </CommandGroup>
                                <CommandSeparator />
                              </div>
                            );
                          },
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addAbility}
                  className="min-h-[44px]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Custom
                </Button>
              </div>
            </CardHeader>
            <CollapsibleContent>
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
                        <p className="text-sm font-medium">
                          Ability #{index + 1}
                        </p>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible
          open={sectionsOpen.details}
          onOpenChange={(open) =>
            setSectionsOpen((prev) => ({ ...prev, details: open }))
          }
        >
          <Card>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <CardTitle>Additional Details</CardTitle>
                  {sectionsOpen.details ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
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
                          onChange={(e) =>
                            field.onChange(e.target.value || null)
                          }
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
                  name="tactics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tactics</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How does this monster fight? (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Combat strategies, preferred targets, retreat conditions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="wants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wants</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What does this monster desire? (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Goals, motivations, treasures, or needs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="gm_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GM Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Private notes for the GM (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Plot hooks, encounter ideas, role-playing tips
                      </FormDescription>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Action buttons - sticky on mobile */}
        <div className="sticky bottom-4 md:static flex justify-end gap-2 bg-background p-4 md:p-0 rounded-lg shadow-lg md:shadow-none border md:border-0 -mx-4 md:mx-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel || (() => router.back())}
            disabled={isSubmitting}
            className="min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px]"
          >
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
