import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import type { SearchResult } from "@/lib/types/search";

describe("SearchResultsList", () => {
  const mockResults: SearchResult[] = [
    {
      id: "123",
      name: "Goblin",
      type: "monster",
      source: "official",
      detailUrl: "/monsters/123",
      relevance: 0.9,
      description: null,
    },
    {
      id: "ring-of-fire",
      name: "Ring of Fire",
      type: "magic_item",
      source: "official",
      detailUrl: "/magic-items/ring-of-fire",
      relevance: 0.85,
      description: "A magical ring",
    },
    {
      id: "456",
      name: "Longsword",
      type: "equipment",
      source: "official",
      detailUrl: "/equipment/456",
      relevance: 0.8,
      description: null,
    },
  ];

  it("renders all results", () => {
    render(<SearchResultsList results={mockResults} isLoading={false} />);
    expect(screen.getByText("Goblin")).toBeInTheDocument();
    expect(screen.getByText("Ring of Fire")).toBeInTheDocument();
    expect(screen.getByText("Longsword")).toBeInTheDocument();
  });

  it("displays empty state when no results", () => {
    render(<SearchResultsList results={[]} isLoading={false} />);
    expect(screen.getByText(/no results found/i)).toBeInTheDocument();
  });

  it("displays loading state when isLoading is true", () => {
    render(<SearchResultsList results={[]} isLoading={true} />);
    expect(screen.getByText(/searching/i)).toBeInTheDocument();
  });

  it("does not display loading state when results are present", () => {
    render(<SearchResultsList results={mockResults} isLoading={false} />);
    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();
  });

  it("renders correct number of result cards", () => {
    render(<SearchResultsList results={mockResults} isLoading={false} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("displays result count", () => {
    render(
      <SearchResultsList results={mockResults} isLoading={false} total={100} />,
    );
    expect(screen.getByText(/showing 3 of 100/i)).toBeInTheDocument();
  });

  it("displays initial state message when hasSearched is false", () => {
    render(
      <SearchResultsList results={[]} isLoading={false} hasSearched={false} />,
    );
    expect(screen.getByText(/enter a search term/i)).toBeInTheDocument();
  });
});
