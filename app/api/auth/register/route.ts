import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Schema for user registration
const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  displayName: z.string().min(1, "Display name is required").max(100),
});

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse and validate request body
    const body = await request.json();
    const { email, password, displayName } = RegisterSchema.parse(body);

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);

      // Handle specific auth errors
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: authError.message || "Registration failed" },
        { status: 400 },
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Registration failed" },
        { status: 400 },
      );
    }

    // Create user profile (this should be handled by the database trigger,
    // but we'll do it here as a fallback)
    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert([
        {
          id: authData.user.id,
          display_name: displayName,
          email: email,
          role: "user",
        },
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Don't fail the registration if profile creation fails
      // The user can update their profile later
    }

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          emailConfirmed: !!authData.user.email_confirmed_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
