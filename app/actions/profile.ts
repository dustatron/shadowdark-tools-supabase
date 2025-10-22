"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUsernameAvailable } from "@/lib/api/profiles";
import { ProfileSettingsSchema } from "@/app/settings/schemas";

export async function updateUserProfile(formData: {
  username: string;
  display_name?: string;
  bio?: string;
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  // Validate input
  const result = ProfileSettingsSchema.safeParse(formData);
  if (!result.success) {
    return { error: "Validation error", details: result.error.issues };
  }

  // Check username availability
  const available = await isUsernameAvailable(result.data.username, user.id);
  if (!available) {
    return { error: "Username already taken" };
  }

  // Build update object
  const updateData = {
    username: result.data.username,
    display_name: result.data.display_name || null,
    bio: result.data.bio || null,
  };

  // Update profile
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Profile update error:", error);
    return { error: `Failed to update profile: ${error.message}` };
  }

  // Revalidate pages
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  if (profile.username_slug) {
    revalidatePath(`/users/${profile.username_slug}`);
  }

  return { success: true, profile };
}

export async function updateUserAvatar(avatarUrl: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Authentication required" };
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "Failed to update avatar" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/users/${profile.username_slug}`);

  return { success: true, profile };
}
