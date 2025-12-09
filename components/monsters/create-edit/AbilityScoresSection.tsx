"use client";

import { Input } from "@/components/primitives/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/primitives/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/primitives/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MonsterFormProps } from "./types";

interface AbilityScoresSectionProps extends MonsterFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ABILITY_FIELDS = [
  { name: "strength_mod" as const, label: "STR" },
  { name: "dexterity_mod" as const, label: "DEX" },
  { name: "constitution_mod" as const, label: "CON" },
  { name: "intelligence_mod" as const, label: "INT" },
  { name: "wisdom_mod" as const, label: "WIS" },
  { name: "charisma_mod" as const, label: "CHA" },
];

export function AbilityScoresSection({
  form,
  isOpen,
  onOpenChange,
}: AbilityScoresSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center justify-between cursor-pointer"
              role="button"
              aria-expanded={isOpen}
              aria-controls="ability-scores-content"
            >
              <CardTitle>Ability Score Modifiers</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent id="ability-scores-content">
          <CardContent className="space-y-4">
            <FormDescription>
              Ability modifiers range from -4 to +4 and affect attacks, saves,
              and abilities
            </FormDescription>

            {/* Top row: STR, DEX, CON */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ABILITY_FIELDS.slice(0, 3).map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
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
              ))}
            </div>

            {/* Bottom row: INT, WIS, CHA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ABILITY_FIELDS.slice(3).map(({ name, label }) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
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
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
