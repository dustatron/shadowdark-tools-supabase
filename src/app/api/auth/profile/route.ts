import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for profile updates
const ProfileUpdateSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).nullable().optional(),
  website: z.string().url().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      browser: z.boolean().optional()
    }).optional()
  }).optional()
});

// GET /api/auth/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Parse JSON fields if they exist
    const responseProfile = {
      ...profile,
      preferences: typeof profile.preferences === 'string'
        ? JSON.parse(profile.preferences)
        : profile.preferences
    };

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...responseProfile
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/auth/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ProfileUpdateSchema.parse(body);

    // Prepare update data
    const updateData: any = { ...validatedData };
    if (updateData.preferences) {
      updateData.preferences = JSON.stringify(updateData.preferences);
    }

    // Update user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Parse JSON fields back for response
    const responseProfile = {
      ...profile,
      preferences: typeof profile.preferences === 'string'
        ? JSON.parse(profile.preferences)
        : profile.preferences
    };

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...responseProfile
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