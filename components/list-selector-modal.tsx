"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/primitives/radio-group";
import { Check, Plus } from "lucide-react";
import {
  CreateListSchema,
  type CreateListInput,
} from "@/lib/validations/list-schemas";

interface UserList {
  id: string;
  title: string;
  description: string | null;
  item_count?: number;
  created_at: string;
  user_id: string;
}

export interface ListSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityType: "monster" | "spell" | "magic_item" | "equipment";
  lists: UserList[];
  existingListIds: string[];
  onSelectList: (listId: string) => Promise<void>;
  onCreateList: (name: string, description?: string) => Promise<string>;
}

export function ListSelectorModal({
  open,
  onOpenChange,
  entityId,
  entityType,
  lists,
  existingListIds,
  onSelectList,
  onCreateList,
}: ListSelectorModalProps) {
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<CreateListInput>({
    resolver: zodResolver(CreateListSchema),
  });

  const handleClose = () => {
    setSelectedListId("");
    setIsCreating(false);
    resetForm();
    onOpenChange(false);
  };

  const handleAddToExistingList = async () => {
    if (!selectedListId) return;

    setIsSubmitting(true);
    try {
      await onSelectList(selectedListId);
      handleClose();
    } catch (error) {
      console.error("Error adding to list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAndAdd = async (data: CreateListInput) => {
    setIsSubmitting(true);
    try {
      const newListId = await onCreateList(
        data.name,
        data.description || undefined,
      );
      await onSelectList(newListId);
      handleClose();
    } catch (error) {
      console.error("Error creating list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
          <DialogDescription>
            Select an existing list or create a new one to add this {entityType}{" "}
            to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isCreating ? (
            <>
              {lists.length > 0 ? (
                <div className="space-y-2">
                  <Label>Select a list</Label>
                  <RadioGroup
                    value={selectedListId}
                    onValueChange={setSelectedListId}
                    className="space-y-2"
                  >
                    {lists.map((list) => {
                      const isAlreadyAdded = existingListIds.includes(list.id);
                      return (
                        <div
                          key={list.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={list.id}
                            id={list.id}
                            disabled={isAlreadyAdded}
                          />
                          <Label
                            htmlFor={list.id}
                            className={`flex-1 cursor-pointer ${
                              isAlreadyAdded ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{list.title}</span>
                              {isAlreadyAdded && (
                                <span className="flex items-center text-xs text-muted-foreground">
                                  <Check className="mr-1 h-3 w-3" />
                                  Already added
                                </span>
                              )}
                            </div>
                            {list.description && (
                              <p className="text-sm text-muted-foreground">
                                {list.description}
                              </p>
                            )}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any lists yet. Create one below!
                </p>
              )}

              <Button
                variant="outline"
                onClick={() => setIsCreating(true)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New List
              </Button>
            </>
          ) : (
            <form
              onSubmit={handleSubmit(handleCreateAndAdd)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">List Name *</Label>
                <Input
                  id="name"
                  placeholder="My Adventure List"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="A collection of monsters for my campaign"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create & Add"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {!isCreating && lists.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToExistingList}
              disabled={
                !selectedListId ||
                existingListIds.includes(selectedListId) ||
                isSubmitting
              }
            >
              {isSubmitting ? "Adding..." : "Add to List"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
