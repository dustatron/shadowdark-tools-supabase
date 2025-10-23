import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Helper function to check admin access
async function checkAdminAccess(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Authentication required", status: 401 };
  }

  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { error: "Admin access required", status: 403 };
  }

  return { user, profile };
}

// GET /api/admin/users - Get user list with pagination and search
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check admin access
    const adminCheck = await checkAdminAccess(supabase);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status },
      );
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20")),
    );
    const offset = (page - 1) * limit;

    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status"); // active, banned

    // Build query
    let query = supabase
      .from("user_profiles")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,email.ilike.%${search}%`,
      );
    }

    // Apply role filter
    if (role && ["user", "moderator", "admin"].includes(role)) {
      query = query.eq("role", role);
    }

    // Apply status filter
    if (status === "banned") {
      query = query.eq("is_banned", true);
    } else if (status === "active") {
      query = query.eq("is_banned", false);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 },
      );
    }

    // Get additional stats for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user: any) => {
        const [
          { count: monstersCount },
          { count: listsCount },
          { count: flagsCount },
        ] = await Promise.all([
          supabase
            .from("user_monsters")
            .select("*", { count: "exact", head: true })
            .eq("creator_id", user.id),

          supabase
            .from("user_lists")
            .select("*", { count: "exact", head: true })
            .eq("creator_id", user.id),

          supabase
            .from("flags")
            .select("*", { count: "exact", head: true })
            .eq("reporter_user_id", user.id),
        ]);

        return {
          ...user,
          stats: {
            monsters_created: monstersCount || 0,
            lists_created: listsCount || 0,
            flags_submitted: flagsCount || 0,
          },
        };
      }),
    );

    return NextResponse.json({
      users: enrichedUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
