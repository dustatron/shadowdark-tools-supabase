import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResultCard } from "@/components/search/SearchResultCard";
import type { SearchResult } from "@/lib/types/search";

describe("SearchResultCard", () => {
  const mockMonsterResult: SearchResult = {
    id: "123-456-789",
    name: "Goblin",
    type: "monster",
    source: "official",
    detailUrl: "/monsters/123-456-789",
    relevance: 0.85,
    description: null,
  };

  const mockMagicItemResult: SearchResult = {
    id: "ring-of-fire",
    name: "Ring of Fire",
    type: "magic_item",
    source: "official",
    detailUrl: "/magic-items/ring-of-fire",
    relevance: 0.9,
    description: "A ring that grants fire resistance",
  };

  const mockEquipmentResult: SearchResult = {
    id: "456-789-012",
    name: "Longsword",
    type: "equipment",
    source: "official",
    detailUrl: "/equipment/456-789-012",
    relevance: 0.75,
    description: null,
  };

  const mockUserResult: SearchResult = {
    id: "user-monster-1",
    name: "Custom Dragon",
    type: "monster",
    source: "user",
    detailUrl: "/monsters/user-monster-1",
    relevance: 0.7,
    description: null,
  };

  it("renders monster result with correct name", () => {
    render(<SearchResultCard result={mockMonsterResult} />);
    expect(screen.getByText("Goblin")).toBeInTheDocument();
  });

  it("renders magic item result with description", () => {
    render(<SearchResultCard result={mockMagicItemResult} />);
    expect(screen.getByText("Ring of Fire")).toBeInTheDocument();
    expect(
      screen.getByText("A ring that grants fire resistance"),
    ).toBeInTheDocument();
  });

  it("displays content type badge for monster", () => {
    render(<SearchResultCard result={mockMonsterResult} />);
    expect(screen.getByText(/monster/i)).toBeInTheDocument();
  });

  it("displays content type badge for magic item", () => {
    render(<SearchResultCard result={mockMagicItemResult} />);
    expect(screen.getByText(/magic item/i)).toBeInTheDocument();
  });

  it("displays content type badge for equipment", () => {
    render(<SearchResultCard result={mockEquipmentResult} />);
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
  });

  it("renders as a clickable link with correct href", () => {
    render(<SearchResultCard result={mockMonsterResult} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/monsters/123-456-789");
  });

  it("displays user badge for user-generated content", () => {
    render(<SearchResultCard result={mockUserResult} />);
    expect(screen.getByText(/user/i)).toBeInTheDocument();
  });

  it("displays official indicator for official content", () => {
    render(<SearchResultCard result={mockMonsterResult} />);
    // Official content should have some indicator (badge or icon)
    expect(screen.getByText(/official/i)).toBeInTheDocument();
  });
});
