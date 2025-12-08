import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/search/route";

// Mock Supabase client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      rpc: vi.fn(),
    }),
  ),
}));

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return search results for valid query", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [
        {
          id: "123",
          name: "Goblin",
          content_type: "monster",
          source: "official",
          detail_url: "/monsters/123",
          relevance: 0.8,
          description: null,
        },
      ],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest(
      "http://localhost:3000/api/search?q=goblin",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(1);
    expect(data.results[0].name).toBe("Goblin");
    expect(data.results[0].type).toBe("monster");
    expect(data.query).toBe("goblin");
  });

  it("should apply source filter correctly", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest(
      "http://localhost:3000/api/search?q=sword&source=core",
    );
    await GET(request);

    expect(mockRpc).toHaveBeenCalledWith(
      "search_all_content",
      expect.objectContaining({
        source_filter: "core",
      }),
    );
  });

  it("should apply content type filters correctly", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest(
      "http://localhost:3000/api/search?q=sword&includeMonsters=false&includeMagicItems=true",
    );
    await GET(request);

    expect(mockRpc).toHaveBeenCalledWith(
      "search_all_content",
      expect.objectContaining({
        include_monsters: false,
        include_magic_items: true,
      }),
    );
  });

  it("should apply limit correctly", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest(
      "http://localhost:3000/api/search?q=sword&limit=50",
    );
    await GET(request);

    expect(mockRpc).toHaveBeenCalledWith(
      "search_all_content",
      expect.objectContaining({
        result_limit: 50,
      }),
    );
  });

  it("should return empty results when no matches", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest(
      "http://localhost:3000/api/search?q=xyznonexistent",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  it("should handle database errors gracefully", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "Database connection failed" },
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest("http://localhost:3000/api/search?q=sword");
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});
