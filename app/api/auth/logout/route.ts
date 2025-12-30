import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/logout - User logout
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Always attempt to sign out - don't require active session
    // This handles edge cases where client/server session state diverges
    await supabase.auth.signOut();

    // Create response and explicitly clear auth cookies
    // Route handlers can't set cookies via the server client's setAll
    const response = NextResponse.json({ message: "Logout successful" });

    // Clear all Supabase auth cookies (they start with sb-)
    const cookiesToClear = request.cookies
      .getAll()
      .filter((c) => c.name.startsWith("sb-"));

    for (const cookie of cookiesToClear) {
      response.cookies.delete(cookie.name);
    }

    return response;
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
