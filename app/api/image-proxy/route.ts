import { NextRequest, NextResponse } from "next/server";

/**
 * Image proxy for PDF rendering
 * Fetches external images server-side to avoid CORS issues in browser PDF preview
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  // Only allow Cloudinary URLs for security
  if (!url.includes("res.cloudinary.com")) {
    return NextResponse.json(
      { error: "Invalid image source" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 502 },
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 },
    );
  }
}
