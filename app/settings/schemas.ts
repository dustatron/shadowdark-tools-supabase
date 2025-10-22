import { z } from "zod";

export const ProfileSettingsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores",
    )
    .regex(/^[a-zA-Z0-9]/, "Username must start with a letter or number")
    .regex(/[a-zA-Z0-9]$/, "Username must end with a letter or number"),

  display_name: z
    .string()
    .max(50, "Display name must be at most 50 characters")
    .optional()
    .or(z.literal("")),

  bio: z
    .string()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
});

export type ProfileSettingsFormData = z.infer<typeof ProfileSettingsSchema>;
