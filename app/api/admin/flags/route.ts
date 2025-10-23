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

  if (
    profileError ||
    !profile ||
    !["admin", "moderator"].includes(profile.role)
  ) {
    return { error: "Admin access required", status: 403 };
  }

  return { user, profile };
}

// GET /api/admin/flags - Get content flags for moderation
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

    const status = searchParams.get("status") || "pending";
    const reason = searchParams.get("reason");
    const flaggedItemType = searchParams.get("type");

    // Build query
    let query = supabase
      .from("flags")
      .select(
        `
        *,
        reporter:user_profiles!flags_reporter_user_id_fkey(display_name, email),
        resolver:user_profiles!flags_resolved_by_fkey(display_name, email)
      `,
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && ["pending", "resolved", "dismissed"].includes(status)) {
      query = query.eq("status", status);
    }
    if (reason) {
      query = query.eq("reason", reason);
    }
    if (flaggedItemType && ["monster", "group"].includes(flaggedItemType)) {
      query = query.eq("flagged_item_type", flaggedItemType);
    }

    const { data: flags, error, count } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch flags" },
        { status: 500 },
      );
    }

    // Enrich flags with flagged content details
    const enrichedFlags = await Promise.all(
      flags.map(async (flag: any) => {
        let flaggedContent = null;

        if (flag.flagged_item_type === "monster") {
          // Try user monsters first, then official monsters
          const { data: userMonster } = await supabase
            .from("user_monsters")
            .select("name, creator_id")
            .eq("id", flag.flagged_item_id)
            .single();

          if (userMonster) {
            flaggedContent = { ...userMonster, type: "user_monster" };
          } else {
            const { data: officialMonster } = await supabase
              .from("official_monsters")
              .select("name, source")
              .eq("id", flag.flagged_item_id)
              .single();

            if (officialMonster) {
              flaggedContent = { ...officialMonster, type: "official_monster" };
            }
          }
        } else if (flag.flagged_item_type === "group") {
          const { data: group } = await supabase
            .from("user_groups")
            .select("name, creator_id")
            .eq("id", flag.flagged_item_id)
            .single();

          if (group) {
            flaggedContent = { ...group, type: "user_group" };
          }
        }

        return {
          ...flag,
          flagged_content: flaggedContent,
        };
      }),
    );

    return NextResponse.json({
      flags: enrichedFlags,
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
