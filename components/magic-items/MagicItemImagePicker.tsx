"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/primitives/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/primitives/tabs";
import { cn } from "@/lib/utils";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_MAGIC_ITEM_IMAGES,
  getCategories,
  type DefaultMagicItemImage,
} from "@/lib/config/default-magic-item-images";
import { getTransformedImageUrl } from "@/lib/utils/cloudinary";

interface MagicItemImagePickerProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function MagicItemImagePicker({
  value,
  onChange,
  userId,
  disabled = false,
}: MagicItemImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Error", {
        description: "File size must be less than 15MB",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Error", {
        description: "File must be an image",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!,
      );
      formData.append("folder", `shadowdark/magic-items/${userId}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onChange(data.secure_url);

      toast.success("Success", {
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error", {
        description: "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDefaultIconSelect = (image: DefaultMagicItemImage) => {
    if (disabled) return;
    onChange(image.publicId);
  };

  const handleRemove = () => {
    onChange(null);
  };

  const previewUrl = value ? getTransformedImageUrl(value, "detail") : null;

  const categories = getCategories();

  return (
    <div className="space-y-4">
      {/* Preview Section */}
      {value && previewUrl && (
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted">
            <Image
              src={previewUrl}
              alt="Selected preview"
              fill
              className="object-cover"
              unoptimized // Cloudinary handles optimization
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove image"
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      )}

      <Tabs defaultValue="default" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default" disabled={disabled}>
            Default Icons
          </TabsTrigger>
          <TabsTrigger value="upload" disabled={disabled}>
            Upload Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="default" className="mt-4">
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="text-sm font-medium mb-2 capitalize">
                  {category}s
                </h4>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_MAGIC_ITEM_IMAGES.filter(
                    (img) => img.category === category,
                  ).map((image) => {
                    const isSelected = value === image.publicId;
                    const iconUrl = getTransformedImageUrl(
                      image.publicId,
                      "thumb",
                    );

                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => handleDefaultIconSelect(image)}
                        disabled={disabled}
                        aria-label={`Select ${image.name} icon`}
                        className={cn(
                          "relative w-16 h-16 rounded-lg border-2 overflow-hidden transition-all",
                          "hover:border-primary hover:ring-2 hover:ring-primary/20",
                          "focus:outline-none focus:ring-2 focus:ring-primary",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isSelected
                            ? "border-primary ring-2 ring-primary/40 selected"
                            : "border-muted",
                        )}
                      >
                        {iconUrl ? (
                          <Image
                            src={iconUrl}
                            alt={image.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <span className="sr-only">{image.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || isUploading}
              data-testid="image-file-input"
            />

            {isUploading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    aria-label="Upload image"
                  >
                    Choose Image
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Max 15MB. Formats: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
