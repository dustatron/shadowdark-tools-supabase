"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Trash, User } from "lucide-react";
import { updateUserAvatar } from "@/app/actions/profile";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentUrl?: string;
  userId: string;
}

export function AvatarUpload({ currentUrl, userId }: AvatarUploadProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Error", {
        description: "File size must be less than 5MB",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Error", {
        description: "File must be an image",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!,
      );
      formData.append("folder", `shadowdark/avatars/${userId}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );

      const data = await response.json();

      // Update profile
      const result = await updateUserAvatar(data.secure_url);

      if (result.error) {
        throw new Error(result.error);
      }

      setPreviewUrl(data.secure_url);
      toast.success("Success", {
        description: "Avatar updated successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to upload avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      const result = await updateUserAvatar("");
      if (result.error) throw new Error(result.error);

      setPreviewUrl(undefined);
      toast.success("Success", {
        description: "Avatar removed",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to remove avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Avatar className="h-32 w-32">
        <AvatarImage src={previewUrl} alt="User avatar" />
        <AvatarFallback>
          <User className="h-16 w-16" />
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={loading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Camera className="mr-2 h-4 w-4" />
          {loading ? "Uploading..." : "Upload Photo"}
        </Button>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={loading}
          >
            <Trash className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Max 5MB. Formats: JPG, PNG, GIF, WEBP
      </p>
    </div>
  );
}
