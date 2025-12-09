"use client";

import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/primitives/form";
import { Alert, AlertDescription } from "@/components/primitives/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/primitives/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/primitives/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/primitives/command";

import {
  SHADOWDARK_TALENTS,
  getTalentsByCategory,
  searchTalents,
  type TalentTemplate,
} from "@/lib/constants/shadowdarkTalents";
import { MonsterFormProps } from "./types";

interface AbilitiesSectionProps extends MonsterFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AbilitiesSection({
  form,
  isOpen,
  onOpenChange,
}: AbilitiesSectionProps) {
  const [talentPopoverOpen, setTalentPopoverOpen] = useState(false);
  const [talentSearch, setTalentSearch] = useState("");

  const {
    fields: abilityFields,
    append: appendAbility,
    remove: removeAbility,
  } = useFieldArray({
    control: form.control,
    name: "abilities",
  });

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
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center justify-between cursor-pointer"
              role="button"
              aria-expanded={isOpen}
              aria-controls="abilities-content"
            >
              <CardTitle>Abilities ({abilityFields.length})</CardTitle>
              {isOpen ? (
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
                                  +{categoryTalents.length - 50} more... (refine
                                  search)
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
        <CollapsibleContent id="abilities-content">
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
                      aria-label={`Remove ability ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
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
                    control={form.control}
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
  );
}
