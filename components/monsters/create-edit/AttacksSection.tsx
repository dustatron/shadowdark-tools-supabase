"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

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

import { ATTACK_TEMPLATES } from "@/lib/utils/shadowdarkMonsterHelper";
import { MonsterFormProps, ATTACK_TYPES } from "./types";

interface AttacksSectionProps extends MonsterFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttacksSection({
  form,
  isOpen,
  onOpenChange,
}: AttacksSectionProps) {
  const {
    fields: attackFields,
    append: appendAttack,
    remove: removeAttack,
  } = useFieldArray({
    control: form.control,
    name: "attacks",
  });

  const addAttack = (template?: keyof typeof ATTACK_TEMPLATES) => {
    if (template && ATTACK_TEMPLATES[template]) {
      appendAttack({ ...ATTACK_TEMPLATES[template], numberOfAttacks: 1 });
    } else {
      appendAttack({
        name: "",
        type: "melee",
        damage: "",
        range: "close",
        description: "",
        numberOfAttacks: 1,
      });
    }
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
              aria-controls="attacks-content"
            >
              <CardTitle>Attacks ({attackFields.length})</CardTitle>
              {isOpen ? (
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
        <CollapsibleContent id="attacks-content">
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
                      aria-label={`Remove attack ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
                      name={`attacks.${index}.numberOfAttacks`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              placeholder="# of attacks"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(
                                  val === "" ? undefined : parseInt(val, 10),
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                              <SelectItem value="near">Near (30 ft)</SelectItem>
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
                    control={form.control}
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
  );
}
