"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Switch } from "@/components/primitives/switch";
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
import { MultiSelect } from "@/components/primitives/multi-select";

import { MonsterFormProps, COMMON_TAGS } from "./types";

interface AdditionalDetailsSectionProps extends MonsterFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdditionalDetailsSection({
  form,
  isOpen,
  onOpenChange,
}: AdditionalDetailsSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center justify-between cursor-pointer"
              role="button"
              aria-expanded={isOpen}
              aria-controls="details-content"
            >
              <CardTitle>Additional Details</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent id="details-content">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
  );
}
