import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AvatarUpload } from "@/components/settings/AvatarUpload";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { PageTitle } from "@/components/page-title";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  let { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Create profile if it doesn't exist
  if (!profile) {
    const defaultUsername =
      user.email?.split("@")[0] || `user_${user.id.substring(0, 8)}`;

    const { data: newProfile, error: createError } = await supabase
      .from("user_profiles")
      .insert({
        id: user.id,
        username: defaultUsername,
        display_name: user.email,
      })
      .select()
      .single();

    if (createError || !newProfile) {
      console.error("Failed to create profile:", createError);
      redirect("/auth/login");
    }

    profile = newProfile;
  }

  // Generate default username if not in database
  const defaultUsername =
    user.email?.split("@")[0] || `user_${user.id.substring(0, 8)}`;

  // Try to add username column if it doesn't exist (will fail silently if column doesn't exist)
  if (!profile.username) {
    const { data: updatedProfile } = await supabase
      .from("user_profiles")
      .update({ username: defaultUsername })
      .eq("id", user.id)
      .select()
      .single();

    if (updatedProfile && updatedProfile.username) {
      profile = updatedProfile;
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <PageTitle title="Settings" />
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Avatar</h3>
              <AvatarUpload
                currentUrl={profile.avatar_url || undefined}
                userId={user.id}
              />
            </div>

            <Separator />

            <ProfileSettingsForm
              initialData={{
                username: profile.username || defaultUsername,
                display_name: profile.display_name || undefined,
                bio: profile.bio || undefined,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
