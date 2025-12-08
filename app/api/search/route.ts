import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all";

  // Redirect to specific search endpoints based on type
  const typeRoutes: Record<string, string> = {
    monsters: "/api/search/monsters",
    spells: "/api/search/spells",
    "magic-items": "/api/search/magic-items",
    filters: "/api/search/filters",
    suggestions: "/api/search/suggestions",
  };

  if (type in typeRoutes) {
    const newUrl = new URL(typeRoutes[type], request.url);
    searchParams.forEach((value, key) => {
      if (key !== "type") {
        newUrl.searchParams.set(key, value);
      }
    });
    return NextResponse.redirect(newUrl);
  }

  // Return info about available search endpoints
  return NextResponse.json({
    message: "Search API",
    endpoints: {
      monsters: "/api/search/monsters",
      spells: "/api/search/spells",
      "magic-items": "/api/search/magic-items",
      filters: "/api/search/filters",
      suggestions: "/api/search/suggestions",
    },
    usage:
      "Add ?type=monsters (or spells, magic-items) to search specific content",
  });
}
