import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

// GET /api/admin/audit - Get audit log entries
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Check admin access
    const adminCheck = await checkAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;

    const actionType = searchParams.get('action');
    const adminUserId = searchParams.get('admin');
    const targetType = searchParams.get('targetType');
    const dateFrom = searchParams.get('from');
    const dateTo = searchParams.get('to');

    // Build query
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin_user:user_profiles!audit_logs_admin_user_id_fkey(display_name, email)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('timestamp', { ascending: false });

    // Apply filters
    if (actionType) {
      query = query.eq('action_type', actionType);
    }
    if (adminUserId) {
      query = query.eq('admin_user_id', adminUserId);
    }
    if (targetType) {
      query = query.eq('target_type', targetType);
    }
    if (dateFrom) {
      query = query.gte('timestamp', dateFrom);
    }
    if (dateTo) {
      query = query.lte('timestamp', dateTo);
    }

    const { data: auditLogs, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch audit logs' },
        { status: 500 }
      );
    }

    // Parse JSON details for each log entry
    const enrichedLogs = auditLogs.map((log: any) => ({
      ...log,
      details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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