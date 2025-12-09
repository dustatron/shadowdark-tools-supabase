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
    resolver: zodResolver(SearchFormSchema),
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
        <div className="relative flex items-center gap-2">
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem className="flex-1 relative">
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
            className="h-14 px-8 rounded-xl shadow-sm hidden sm:flex"
          >
            Search
          </Button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-center">
          {/* Content Type Toggle Group (Scrollable on mobile) */}
          <FormField
            control={form.control}
            name="includeTypes"
            render={({ field }) => (
              <FormItem className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
                <FormControl>
                  <ToggleGroup
                    type="multiple"
                    variant="outline"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="justify-start sm:flex-wrap gap-0"
                  >
                    <ToggleGroupItem
                      value="monsters"
                      aria-label="Toggle Monsters"
                      className="h-9 px-4 rounded-full border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all"
                    >
                      <Swords className="h-4 w-4 mr-2" />
                      Monsters
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="magicItems"
                      aria-label="Toggle Magic Items"
                      className="h-9 px-4 rounded-full border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all"
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Magic Items
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="equipment"
                      aria-label="Toggle Equipment"
                      className="h-9 px-4 rounded-full border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Equipment
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="spells"
                      aria-label="Toggle Spells"
                      className="h-9 px-4 rounded-full border border-muted-foreground/20 hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary transition-all"
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

          {/* Advanced Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-10 gap-2 rounded-lg border-muted-foreground/20 ml-auto sm:ml-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Sources
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-4 space-y-4">
              <div className="space-y-4">
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
