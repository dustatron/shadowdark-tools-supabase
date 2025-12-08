"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  SearchFormSchema,
  defaultSearchFormValues,
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
    defaultValues: defaultSearchFormValues,
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
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
        <div className="flex flex-wrap gap-6 items-start">
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

          {/* Content Type Checkboxes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Include</Label>
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="includeMonsters"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="include-monsters"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label
                      htmlFor="include-monsters"
                      className="cursor-pointer text-sm"
                    >
                      Monsters
                    </Label>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="includeMagicItems"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="include-magic-items"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label
                      htmlFor="include-magic-items"
                      className="cursor-pointer text-sm"
                    >
                      Magic Items
                    </Label>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="includeEquipment"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        id="include-equipment"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label
                      htmlFor="include-equipment"
                      className="cursor-pointer text-sm"
                    >
                      Equipment
                    </Label>
                  </FormItem>
                )}
              />
            </div>
            {form.formState.errors.includeMonsters && (
              <p className="text-sm text-destructive">
                {form.formState.errors.includeMonsters.message}
              </p>
            )}
          </div>

          {/* Limit Selector */}
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium">
                  Results per page
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
