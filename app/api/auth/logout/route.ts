import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/logout - User logout
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Always attempt to sign out - don't require active session
    // This handles edge cases where client/server session state diverges
    await supabase.auth.signOut();

    return NextResponse.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
