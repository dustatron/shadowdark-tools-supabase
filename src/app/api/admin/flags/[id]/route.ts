import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for flag resolution
const FlagResolutionSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  admin_notes: z.string().min(1).max(1000)
});

// Helper function to check admin access
async function checkAdminAccess(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Authentication required', status: 401 };
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !['admin', 'moderator'].includes(profile.role)) {
    return { error: 'Admin access required', status: 403 };
  }

  return { user, profile };
}

// PUT /api/admin/flags/[id] - Resolve or dismiss a flag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id } = params;

    // Check admin access
    const adminCheck = await checkAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { user } = adminCheck;

    // Check if flag exists and is pending
    const { data: existingFlag, error: fetchError } = await supabase
      .from('flags')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingFlag) {
      return NextResponse.json(
        { error: 'Flag not found' },
        { status: 404 }
      );
    }

    if (existingFlag.status !== 'pending') {
      return NextResponse.json(
        { error: 'Flag has already been resolved' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { status, admin_notes } = FlagResolutionSchema.parse(body);

    // Update the flag
    const { data: updatedFlag, error } = await supabase
      .from('flags')
      .update({
        status,
        admin_notes,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id
      })
      .eq('id', id)
      .select(`
        *,
        reporter:user_profiles!flags_reporter_user_id_fkey(display_name, email),
        resolver:user_profiles!flags_resolved_by_fkey(display_name, email)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update flag' },
        { status: 500 }
      );
    }

    // Log the admin action
    await supabase.rpc('create_audit_log', {
      p_action_type: `flag_${status}`,
      p_admin_user_id: user.id,
      p_target_type: 'flag',
      p_target_id: id,
      p_details: JSON.stringify({
        flag_reason: existingFlag.reason,
        flagged_item_type: existingFlag.flagged_item_type,
        flagged_item_id: existingFlag.flagged_item_id,
        admin_notes
      }),
      p_notes: admin_notes
    });

    return NextResponse.json(updatedFlag);

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