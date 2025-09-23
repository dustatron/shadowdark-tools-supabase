import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for user login
const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// POST /api/auth/login - User login
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Parse and validate request body
    const body = await request.json();
    const { email, password } = LoginSchema.parse(body);

    // Attempt login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Auth error:', authError);

      // Handle specific auth errors
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please confirm your email address before logging in' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: authError.message || 'Login failed' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // Continue without profile data
    }

    // Parse JSON fields if they exist
    const responseProfile = profile ? {
      ...profile,
      preferences: typeof profile.preferences === 'string'
        ? JSON.parse(profile.preferences)
        : profile.preferences
    } : null;

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        emailConfirmed: !!authData.user.email_confirmed_at,
        ...(responseProfile || {})
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}