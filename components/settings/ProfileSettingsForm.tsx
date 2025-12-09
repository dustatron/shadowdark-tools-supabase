"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/primitives/button";
import { Label } from "@/components/primitives/label";
import {
  ProfileSettingsSchema,
  type ProfileSettingsFormData,
} from "@/app/settings/schemas";
import { updateUserProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { useState } from "react";

interface ProfileSettingsFormProps {
  initialData: {
    username: string;
    display_name?: string;
    bio?: string;
  };
}

export function ProfileSettingsForm({ initialData }: ProfileSettingsFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: initialData,
  });

  const bioLength = form.watch("bio")?.length || 0;

  const onSubmit = async (data: ProfileSettingsFormData) => {
    setLoading(true);

    try {
      const result = await updateUserProfile(data);

      if (result.error) {
        toast.error("Error", {
          description: result.error,
        });
        return;
      }

      toast.success("Success", {
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...form.register("username")}
          aria-invalid={!!form.formState.errors.username}
        />
        <p className="text-sm text-muted-foreground">
          Your unique username (3-30 characters, letters, numbers, spaces,
          hyphens)
        </p>
        {form.formState.errors.username && (
          <p className="text-sm text-destructive">
            {form.formState.errors.username.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          {...form.register("display_name")}
          aria-invalid={!!form.formState.errors.display_name}
        />
        <p className="text-sm text-muted-foreground">Your display name</p>
        {form.formState.errors.display_name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.display_name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          rows={4}
          maxLength={500}
          {...form.register("bio")}
          aria-invalid={!!form.formState.errors.bio}
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Tell us about yourself
          </p>
          <p className="text-sm text-muted-foreground">
            {bioLength}/500 characters
          </p>
        </div>
        {form.formState.errors.bio && (
          <p className="text-sm text-destructive">
            {form.formState.errors.bio.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
