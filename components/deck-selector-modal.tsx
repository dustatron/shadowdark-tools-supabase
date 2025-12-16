"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const CreateDeckSchema = z.object({
  name: z.string().min(1, "Deck name is required").max(100),
});

type CreateDeckInput = z.infer<typeof CreateDeckSchema>;

interface UserDeck {
  id: string;
  name: string;
  spell_count: number;
  created_at: string;
  user_id: string;
}

export interface DeckSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spellId: string;
  decks: UserDeck[];
  existingDeckIds: string[];
  onSelectDeck: (deckId: string) => Promise<void>;
  onCreateDeck: (name: string) => Promise<string>;
}

export function DeckSelectorModal({
  open,
  onOpenChange,
  spellId,
  decks,
  existingDeckIds,
  onSelectDeck,
  onCreateDeck,
}: DeckSelectorModalProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<CreateDeckInput>({
    resolver: zodResolver(CreateDeckSchema),
  });

  const handleClose = () => {
    setSelectedDeckId("");
    setIsCreating(false);
    resetForm();
    onOpenChange(false);
  };

  const handleAddToExistingDeck = async () => {
    if (!selectedDeckId) return;

    setIsSubmitting(true);
    try {
      await onSelectDeck(selectedDeckId);
      handleClose();
    } catch (error) {
      console.error("Error adding to deck:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAndAdd = async (data: CreateDeckInput) => {
    setIsSubmitting(true);
    try {
      const newDeckId = await onCreateDeck(data.name);
      await onSelectDeck(newDeckId);
      handleClose();
    } catch (error) {
      console.error("Error creating deck:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Deck</DialogTitle>
          <DialogDescription>
            Select an existing deck or create a new one to add this spell to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isCreating ? (
            <>
              {decks.length > 0 ? (
                <div className="space-y-2">
                  <Label>Select a deck</Label>
                  <RadioGroup
                    value={selectedDeckId}
                    onValueChange={setSelectedDeckId}
                    className="space-y-2"
                  >
                    {decks.map((deck) => {
                      const isAlreadyAdded = existingDeckIds.includes(deck.id);
                      const isFull = deck.spell_count >= 52;
                      const isDisabled = isAlreadyAdded || isFull;

                      return (
                        <div
                          key={deck.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={deck.id}
                            id={deck.id}
                            disabled={isDisabled}
                          />
                          <Label
                            htmlFor={deck.id}
                            className={`flex-1 cursor-pointer ${
                              isDisabled ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{deck.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {deck.spell_count}/52 cards
                                </span>
                                {isAlreadyAdded && (
                                  <span className="flex items-center text-xs text-muted-foreground">
                                    <Check className="mr-1 h-3 w-3" />
                                    Added
                                  </span>
                                )}
                                {isFull && !isAlreadyAdded && (
                                  <span className="text-xs text-destructive">
                                    Full
                                  </span>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any decks yet. Create one below!
                </p>
              )}

              <Button
                variant="outline"
                onClick={() => setIsCreating(true)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Deck
              </Button>
            </>
          ) : (
            <form
              onSubmit={handleSubmit(handleCreateAndAdd)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Deck Name *</Label>
                <Input
                  id="name"
                  placeholder="My Spell Deck"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
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

        {!isCreating && decks.length > 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAddToExistingDeck}
              disabled={
                !selectedDeckId ||
                existingDeckIds.includes(selectedDeckId) ||
                isSubmitting
              }
            >
              {isSubmitting ? "Adding..." : "Add to Deck"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
