"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

import { IconSelector } from "@/src/components/ui/IconSelector";
import {
  getRecommendedStats,
  calculateXP,
  getHPGuidance,
  getACGuidance,
  DISTANCE_BANDS,
} from "@/lib/utils/shadowdarkMonsterHelper";
import { MonsterFormProps } from "./types";

const MOVEMENT_SPEEDS = Object.values(DISTANCE_BANDS);

interface BasicInfoSectionProps extends MonsterFormProps {
  customSpeed: boolean;
  setCustomSpeed: (value: boolean) => void;
}

export function BasicInfoSection({
  form,
  customSpeed,
  setCustomSpeed,
}: BasicInfoSectionProps) {
  const handleAutoFill = () => {
    const cl = form.getValues("challenge_level");
    const recommended = getRecommendedStats(cl);

    form.setValue("hit_points", recommended.hp);
    form.setValue("armor_class", recommended.ac);

    toast.success(`Auto-filled stats for CL ${cl}`, {
      description: `HP: ${recommended.hp}, AC: ${recommended.ac}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
            control={form.control}
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
            aria-label="Auto-fill recommended stats based on challenge level"
            className="min-h-[44px] min-w-[44px]"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
              control={form.control}
              name="customSpeed"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="e.g., fly 60ft, swim 30ft" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="icon_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <IconSelector
                  label="Monster Icon"
                  value={field.value}
                  onChange={(icon: string | null) => field.onChange(icon || "")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
