"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Search,
  Swords,
  Wand2,
  Shield,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/primitives/popover";

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
    resolver: zodResolver(SearchFormSchema) as any,
    defaultValues: {
      q: "",
      source: "all",
      includeTypes: ["monsters", "magicItems", "equipment", "spells"],
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Input Row */}
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Filters Popover - First on mobile, inline on desktop */}
          <div className="flex justify-end sm:order-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-14 w-14 px-0 rounded-xl border-muted-foreground/20 shadow-sm shrink-0"
                  aria-label="Filters"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="min-w-80 p-2 space-y-2">
                <div className="space-y-4">
                  {/* Content Type Filter */}
                  <FormField
                    control={form.control}
                    name="includeTypes"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormControl>
                          <ToggleGroup
                            type="multiple"
                            variant="outline"
                            value={field.value}
                            onValueChange={field.onChange}
                            className="justify-start flex-wrap gap-2"
                            spacing={2}
                          >
                            <ToggleGroupItem
                              value="monsters"
                              aria-label="Toggle Monsters"
                              className="h-9 px-3 rounded-md border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all text-xs"
                            >
                              <Swords className="h-3.5 w-3.5 mr-1.5" />
                              Monsters
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="magicItems"
                              aria-label="Toggle Magic Items"
                              className="h-9 px-3 rounded-md border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all text-xs"
                            >
                              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                              Items
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="equipment"
                              aria-label="Toggle Equipment"
                              className="h-9 px-3 rounded-md border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all text-xs"
                            >
                              <Shield className="h-3.5 w-3.5 mr-1.5" />
                              Gear
                            </ToggleGroupItem>
                            <ToggleGroupItem
                              value="spells"
                              aria-label="Toggle Spells"
                              className="h-9 px-3 rounded-md border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all text-xs"
                            >
                              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                              Spells
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Source Filter */}
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="source-all" />
                              <Label
                                htmlFor="source-all"
                                className="cursor-pointer"
                              >
                                All Content
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="core" id="source-core" />
                              <Label
                                htmlFor="source-core"
                                className="cursor-pointer"
                              >
                                Core Rules Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="user" id="source-user" />
                              <Label
                                htmlFor="source-user"
                                className="cursor-pointer"
                              >
                                User Generated Only
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
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
                            <SelectTrigger>
                              <SelectValue placeholder="25" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="25">25 results</SelectItem>
                            <SelectItem value="50">50 results</SelectItem>
                            <SelectItem value="100">100 results</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Search Input - Second on mobile, first on desktop */}
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem className="flex-1 relative sm:order-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <FormControl>
                  <Input
                    placeholder="Search monsters, magic items, equipment..."
                    {...field}
                    className="h-14 pl-12 text-lg shadow-sm rounded-xl border-muted-foreground/20 focus-visible:ring-primary/20"
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
            className="h-14 px-8 rounded-xl shadow-sm hidden sm:flex sm:order-3"
          >
            Search
          </Button>
        </div>

        {/* Mobile Search Button (Visible only on small screens) */}
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="w-full h-12 rounded-xl shadow-sm sm:hidden"
        >
          Search
        </Button>
      </form>
    </Form>
  );
}
