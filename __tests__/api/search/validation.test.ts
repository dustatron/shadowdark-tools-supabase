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

describe("GET /api/search - Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when query is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/search");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation error");
    expect(data.details).toBeDefined();
  });

  it("should return 400 when query is too short", async () => {
    const request = new NextRequest("http://localhost:3000/api/search?q=ab");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation error");
    expect(data.details).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining("3 characters"),
      }),
    );
  });

  it("should return 400 when query is empty string", async () => {
    const request = new NextRequest("http://localhost:3000/api/search?q=");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation error");
  });

  it("should accept query with exactly 3 characters", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest("http://localhost:3000/api/search?q=abc");
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("should use default values for optional parameters", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    const request = new NextRequest("http://localhost:3000/api/search?q=sword");
    await GET(request);

    expect(mockRpc).toHaveBeenCalledWith(
      "search_all_content",
      expect.objectContaining({
        source_filter: "all",
        include_monsters: true,
        include_magic_items: true,
        include_equipment: true,
        result_limit: 25,
      }),
    );
  });

  it("should reject invalid source filter value", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/search?q=sword&source=invalid",
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation error");
  });

  it("should reject invalid limit value", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/search?q=sword&limit=30",
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Validation error");
  });

  it("should accept valid limit values (25, 50, 100)", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const mockRpc = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(createClient).mockResolvedValue({
      rpc: mockRpc,
    } as never);

    for (const limit of [25, 50, 100]) {
      const request = new NextRequest(
        `http://localhost:3000/api/search?q=sword&limit=${limit}`,
      );
      const response = await GET(request);
      expect(response.status).toBe(200);
    }
  });

  it("should coerce boolean string values correctly", async () => {
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
});
