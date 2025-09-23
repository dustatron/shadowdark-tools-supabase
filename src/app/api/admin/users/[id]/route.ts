import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for user updates
const UserUpdateSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  is_banned: z.boolean().optional(),
  ban_reason: z.string().max(500).nullable().optional()
}).refine(data => {
  // If banning user, require ban reason
  if (data.is_banned === true && !data.ban_reason) {
    return false;
  }
  return true;
}, {
  message: "Ban reason is required when banning a user"
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

  if (profileError || !profile || profile.role !== 'admin') {
    return { error: 'Admin access required', status: 403 };
  }

  return { user, profile };
}

// PUT /api/admin/users/[id] - Update user role or ban status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient();
    const { id: targetUserId } = params;

    // Check admin access
    const adminCheck = await checkAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { user: adminUser } = adminCheck;

    // Prevent self-modification
    if (adminUser.id === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot modify your own account' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UserUpdateSchema.parse(body);

    // Prevent demoting the last admin
    if (validatedData.role && validatedData.role !== 'admin' && existingUser.role === 'admin') {
      const { count: adminCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if (adminCount && adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin user' },
          { status: 400 }
        );
      }
    }

    // Update the user
    const updateData: any = {};
    if (validatedData.role) updateData.role = validatedData.role;
    if (validatedData.is_banned !== undefined) {
      updateData.is_banned = validatedData.is_banned;
      updateData.ban_reason = validatedData.is_banned ? validatedData.ban_reason : null;
      updateData.banned_at = validatedData.is_banned ? new Date().toISOString() : null;
    }

    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', targetUserId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Log the admin action
    const actionDetails: any = {};
    if (validatedData.role) {
      actionDetails.old_role = existingUser.role;
      actionDetails.new_role = validatedData.role;
    }
    if (validatedData.is_banned !== undefined) {
      actionDetails.old_banned = existingUser.is_banned;
      actionDetails.new_banned = validatedData.is_banned;
      if (validatedData.ban_reason) {
        actionDetails.ban_reason = validatedData.ban_reason;
      }
    }

    await supabase.rpc('create_audit_log', {
      p_action_type: validatedData.is_banned ? 'user_ban' : validatedData.role ? 'role_change' : 'user_update',
      p_admin_user_id: adminUser.id,
      p_target_type: 'user',
      p_target_id: targetUserId,
      p_details: JSON.stringify(actionDetails),
      p_notes: validatedData.ban_reason || `Updated user ${existingUser.display_name}`
    });

    return NextResponse.json(updatedUser);

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