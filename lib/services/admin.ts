import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Check if a user has admin privileges
 * @param supabase - Supabase client instance
 * @param userId - The user ID to check
 * @returns Promise<boolean> - True if user is admin, false otherwise
 */
export async function checkAdminStatus(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    return false;
  }

  return profile.is_admin === true;
}

/**
 * Get admin status for current authenticated user
 * @param supabase - Supabase client instance
 * @returns Promise<boolean> - True if current user is admin, false otherwise
 */
export async function getCurrentUserAdminStatus(
  supabase: SupabaseClient,
): Promise<boolean> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return false;
  }

  return checkAdminStatus(supabase, user.id);
}
