import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import type { Profile } from "@/lib/types/profile.types";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Avatar className="h-32 w-32">
        <AvatarImage
          src={profile.avatar_url || undefined}
          alt={profile.username}
        />
        <AvatarFallback>
          <User className="h-16 w-16" />
        </AvatarFallback>
      </Avatar>

      <div className="text-center">
        <h1 className="text-2xl font-bold">{profile.username}</h1>

        <div className="flex items-center justify-center gap-2 mt-1">
          <Calendar size={14} />
          <p className="text-sm text-muted-foreground">Joined {joinDate}</p>
        </div>
      </div>

      {profile.bio && (
        <p className="text-sm text-center max-w-2xl">{profile.bio}</p>
      )}
    </div>
  );
}
