import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/logout - User logout
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current session to ensure user is logged in
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 },
      );
    }

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Sign out error:", signOutError);
      return NextResponse.json(
        { error: "Failed to sign out" },
        { status: 500 },
      );
    }

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
