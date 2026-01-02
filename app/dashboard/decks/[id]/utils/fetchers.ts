import { DeckWithItems } from "@/lib/validations/deck";

export async function fetchDeck(id: string): Promise<DeckWithItems> {
  const response = await fetch(`/api/decks/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch deck");
  }

  return response.json();
}

export async function deleteDeck(id: string) {
  const response = await fetch(`/api/decks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete deck");
  }
}

export async function removeSpell(deckId: string, spellId: string) {
  const response = await fetch(`/api/decks/${deckId}/spells/${spellId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove spell");
  }

  return response.json();
}

export async function removeMagicItem(deckId: string, itemId: string) {
  const response = await fetch(`/api/decks/${deckId}/magic-items/${itemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to remove magic item");
  }

  return response.json();
}
