"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Swords, Wand2, Shield, Sparkles } from "lucide-react";

import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/primitives/radio-group";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/primitives/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/primitives/form";

import {
  SearchFormSchema,
  type SearchFormValues,
} from "@/lib/validations/search";

interface UnifiedSearchFormProps {
  onSubmit: (values: SearchFormValues) => void;
  isLoading?: boolean;
}

export function UnifiedSearchForm({
  onSubmit,
  isLoading = false,
}: UnifiedSearchFormProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      q: "",
      source: "all",
      includeTypes: ["monsters", "magicItems", "equipment", "spells"], // New default for toggle group
      limit: 25,
    } as any,
  });

  const handleSubmit = form.handleSubmit((values) => {
    const { includeTypes, ...rest } = values;

    const parsedValues = SearchFormSchema.parse({
      ...rest,
      includeMonsters: includeTypes?.includes("monsters") ?? false,
      includeMagicItems: includeTypes?.includes("magicItems") ?? false,
      includeEquipment: includeTypes?.includes("equipment") ?? false,
      includeSpells: includeTypes?.includes("spells") ?? false,
    });
    onSubmit(parsedValues);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Input */}
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Search monsters, magic items, equipment..."
                    {...field}
                    className="h-12 text-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="h-12 px-6"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-6 items-start">
          {/* Source Filter */}
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Source</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="source-all" />
                      <Label htmlFor="source-all" className="cursor-pointer">
                        All
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="core" id="source-core" />
                      <Label htmlFor="source-core" className="cursor-pointer">
                        Core
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="user" id="source-user" />
                      <Label htmlFor="source-user" className="cursor-pointer">
                        User Generated
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Content Type Toggle Group */}
          <FormField
            control={form.control}
            name="includeTypes"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">Include</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="justify-start flex-wrap"
                  >
                    <ToggleGroupItem
                      value="monsters"
                      aria-label="Toggle Monsters"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      <Swords className="h-4 w-4 mr-2" />
                      Monsters
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="magicItems"
                      aria-label="Toggle Magic Items"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Magic Items
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="equipment"
                      aria-label="Toggle Equipment"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Equipment
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="spells"
                      aria-label="Toggle Spells"
                      className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Spells
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Limit Selector */}
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">
                  Results per page
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="25" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
