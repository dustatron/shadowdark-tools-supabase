"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Switch } from "@/components/primitives/switch";
import { Label } from "@/components/primitives/label";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/primitives/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/primitives/alert-dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  MagicItemCreateSchema,
  type MagicItemCreateInput,
  type TraitType,
} from "@/lib/schemas/magic-items";
import type { UserMagicItem } from "@/lib/types/magic-items";
import { MagicItemImagePicker } from "./MagicItemImagePicker";

interface MagicItemFormProps {
  mode: "create" | "edit";
  initialData?: UserMagicItem;
  userId: string;
  onSuccess?: (item: UserMagicItem) => void;
}

const TRAIT_TYPES: TraitType[] = ["Benefit", "Curse", "Bonus", "Personality"];

export function MagicItemForm({
  mode,
  initialData,
  userId,
  onSuccess,
}: MagicItemFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/magic-items/${initialData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete magic item");
      }

      router.push("/magic-items/my-items");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsDeleting(false);
    }
  };

  const form = useForm<MagicItemCreateInput>({
    resolver: zodResolver(MagicItemCreateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      traits: initialData?.traits || [],
      is_public: initialData?.is_public || false,
      image_url: initialData?.image_url || null,
      is_ai_generated: initialData?.is_ai_generated || false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "traits",
  });

  const onSubmit = async (data: MagicItemCreateInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url =
        mode === "create"
          ? "/api/user/magic-items"
          : `/api/user/magic-items/${initialData?.id}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save magic item");
      }

      const savedItem = await response.json();

      if (onSuccess) {
        onSuccess(savedItem);
      } else {
        router.push(`/magic-items/${savedItem.slug}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

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
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Sword of Flames" {...field} />
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
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A sword that burns with magical fire..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
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
                    <FormLabel className="text-base">Public</FormLabel>
                    <FormDescription>
                      Make this item visible to other users
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MagicItemImagePicker
              value={form.watch("image_url")}
              onChange={(url) => form.setValue("image_url", url)}
              userId={userId}
              disabled={isSubmitting}
            />
            {form.watch("image_url") && (
              <FormField
                control={form.control}
                name="is_ai_generated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      AI-generated image
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Traits</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "Benefit", description: "" })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trait
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No traits added yet. Click &quot;Add Trait&quot; to add one.
              </p>
            )}

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-4 items-start p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-40">
                      <Label>Type</Label>
                      <Select
                        value={form.watch(`traits.${index}.name`)}
                        onValueChange={(value) =>
                          form.setValue(
                            `traits.${index}.name`,
                            value as TraitType,
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRAIT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>Description</Label>
                      <Input
                        {...form.register(`traits.${index}.description`)}
                        placeholder="Trait description..."
                      />
                      {form.formState.errors.traits?.[index]?.description && (
                        <p className="text-sm text-destructive mt-1">
                          {
                            form.formState.errors.traits[index]?.description
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="mt-6"
                  aria-label={`Remove trait ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-between">
          {mode === "edit" && initialData ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isSubmitting || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Magic Item</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this magic item? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div />
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {mode === "create" ? "Create Magic Item" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
