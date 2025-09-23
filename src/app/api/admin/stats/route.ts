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

// GET /api/admin/stats - Get dashboard statistics
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

    // Get various statistics
    const [
      { data: officialMonstersStats },
      { data: userMonstersStats },
      { data: userListsStats },
      { data: encounterTablesStats },
      { data: userStats },
      { data: flagsStats },
      { data: recentActivity }
    ] = await Promise.all([
      // Official monsters count
      supabase
        .from('official_monsters')
        .select('*', { count: 'exact', head: true }),

      // User monsters count
      supabase
        .from('user_monsters')
        .select('*', { count: 'exact', head: true }),

      // User lists count
      supabase
        .from('user_lists')
        .select('*', { count: 'exact', head: true }),

      // Encounter tables count
      supabase
        .from('encounter_tables')
        .select('*', { count: 'exact', head: true }),

      // User count and registrations
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),

      // Pending flags count
      supabase
        .from('flags')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),

      // Recent user activity (last 30 days)
      supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Get challenge level distribution
    const { data: challengeLevelDist } = await supabase
      .from('official_monsters')
      .select('challenge_level')
      .order('challenge_level');

    const challengeLevelCounts = challengeLevelDist?.reduce((acc: any, monster: any) => {
      acc[monster.challenge_level] = (acc[monster.challenge_level] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get most popular monster types
    const { data: monstersWithTags } = await supabase
      .from('official_monsters')
      .select('tags')
      .limit(1000);

    const typeCounts: any = {};
    monstersWithTags?.forEach((monster: any) => {
      const tags = typeof monster.tags === 'string' ? JSON.parse(monster.tags) : monster.tags;
      tags.type?.forEach((type: string) => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });

    const stats = {
      monsters: {
        official: officialMonstersStats?.length || 0,
        userCreated: userMonstersStats?.length || 0,
        total: (officialMonstersStats?.length || 0) + (userMonstersStats?.length || 0)
      },
      content: {
        lists: userListsStats?.length || 0,
        encounterTables: encounterTablesStats?.length || 0
      },
      users: {
        total: userStats?.length || 0,
        recentRegistrations: recentActivity?.length || 0
      },
      moderation: {
        pendingFlags: flagsStats?.length || 0
      },
      distribution: {
        challengeLevels: challengeLevelCounts,
        monsterTypes: Object.entries(typeCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 10)
          .reduce((acc, [type, count]) => ({ ...acc, [type]: count }), {})
      },
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}