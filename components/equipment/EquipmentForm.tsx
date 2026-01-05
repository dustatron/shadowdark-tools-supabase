"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/button";
import {
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from "@/lib/hooks/use-equipment-mutations";
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
  EquipmentCreateSchema,
  type EquipmentCreateInput,
  type ItemType,
  type Currency,
} from "@/lib/schemas/equipment";
import type { UserEquipment } from "@/lib/types/equipment";

interface EquipmentFormProps {
  mode: "create" | "edit";
  initialData?: UserEquipment;
  userId: string;
  onSuccess?: (item: UserEquipment) => void;
}

const ITEM_TYPES: ItemType[] = ["armor", "weapon", "gear"];
const CURRENCIES: Currency[] = ["gp", "sp", "cp"];

export function EquipmentForm({
  mode,
  initialData,
  userId,
  onSuccess,
}: EquipmentFormProps) {
  const router = useRouter();

  // TanStack Query mutations
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment(initialData?.id || "");
  const deleteMutation = useDeleteEquipment();

  // Determine which mutation is active for loading states
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const mutationError =
    createMutation.error || updateMutation.error || deleteMutation.error;

  const handleDelete = () => {
    if (!initialData?.id) return;

    deleteMutation.mutate(initialData.id, {
      onSuccess: () => {
        router.push("/dashboard/equipment");
        router.refresh();
      },
    });
  };

  const form = useForm<EquipmentCreateInput>({
    resolver: zodResolver(EquipmentCreateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      item_type: (initialData?.item_type || "gear") as ItemType,
      cost: initialData?.cost
        ? {
            amount: initialData.cost.amount,
            currency: initialData.cost.currency as Currency,
          }
        : { amount: 0, currency: "gp" as Currency },
      attack_type: initialData?.attack_type || "",
      range: initialData?.range || "",
      damage: initialData?.damage || "",
      armor: initialData?.armor || "",
      properties: initialData?.properties || [],
      slot: initialData?.slot || 1,
      quantity: initialData?.quantity || "",
      is_public: initialData?.is_public || false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    // @ts-expect-error - TypeScript has issues with useFieldArray typing
    name: "properties",
  });

  const itemType = form.watch("item_type");

  const onSubmit = (data: EquipmentCreateInput) => {
    if (mode === "create") {
      createMutation.mutate(data, {
        onSuccess: (savedItem) => {
          if (onSuccess) {
            onSuccess(savedItem);
          } else {
            router.push(`/equipment/${savedItem.id}`);
            router.refresh();
          }
        },
      });
    } else {
      updateMutation.mutate(data, {
        onSuccess: (savedItem) => {
          if (onSuccess) {
            onSuccess(savedItem);
          } else {
            router.push(`/equipment/${savedItem.id}`);
            router.refresh();
          }
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {mutationError && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            {mutationError.message}
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
                    <Input placeholder="Longsword" {...field} />
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
                      placeholder="A well-crafted blade..."
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
              name="item_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Type *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ITEM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost.amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Amount *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost.currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Number of inventory slots (0-10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional quantity notation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

        {itemType === "weapon" && (
          <Card>
            <CardHeader>
              <CardTitle>Weapon Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="attack_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attack Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Melee" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Range</FormLabel>
                    <FormControl>
                      <Input placeholder="Close" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="damage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Damage</FormLabel>
                    <FormControl>
                      <Input placeholder="1d8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {itemType === "armor" && (
          <Card>
            <CardHeader>
              <CardTitle>Armor Attributes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="armor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Armor Class</FormLabel>
                    <FormControl>
                      <Input placeholder="11 + DEX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Properties</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append("")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No properties added yet. Click &quot;Add Property&quot; to add
                one.
              </p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    {...form.register(`properties.${index}`)}
                    placeholder="Two-handed, Versatile, etc."
                  />
                  {form.formState.errors.properties?.[index] && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.properties[index]?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  aria-label={`Remove property ${index + 1}`}
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
                  <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this equipment? This action
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
              {mode === "create" ? "Create Equipment" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
