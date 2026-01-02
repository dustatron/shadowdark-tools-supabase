/**
 * Cloudinary URL transform utilities for magic item images
 */

export type ImageSize = "thumb" | "card" | "detail" | "pdf";

interface TransformConfig {
  width: number;
  height?: number;
  crop: "fill" | "fit" | "scale";
  quality: string;
}

const TRANSFORM_PRESETS: Record<ImageSize, TransformConfig> = {
  thumb: { width: 80, height: 80, crop: "fill", quality: "auto" },
  card: { width: 200, height: 200, crop: "fill", quality: "auto" },
  detail: { width: 400, height: 400, crop: "fill", quality: "auto" },
  pdf: { width: 600, crop: "scale", quality: "auto:best" },
};

/**
 * Get a transformed Cloudinary image URL with specified size preset
 *
 * @param url - Full Cloudinary URL or public_id
 * @param size - Size preset: thumb (80x80), card (200x200), detail (400x400), pdf (600w)
 * @returns Transformed URL or original if not a Cloudinary URL
 */
export function getTransformedImageUrl(
  url: string | null | undefined,
  size: ImageSize,
): string | null {
  if (!url) return null;

  const config = TRANSFORM_PRESETS[size];

  // Build transform string
  const transforms = [
    `w_${config.width}`,
    config.height ? `h_${config.height}` : null,
    `c_${config.crop}`,
    `q_${config.quality}`,
    "f_auto", // Auto format (webp when supported)
  ]
    .filter(Boolean)
    .join(",");

  // Check if it's a full Cloudinary URL
  const cloudinaryMatch = url.match(
    /^https:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\/(.+)$/,
  );

  if (cloudinaryMatch) {
    const [, cloudName, pathWithVersion] = cloudinaryMatch;
    // Remove any existing transforms (v1234567890/ prefix is version)
    const cleanPath = pathWithVersion.replace(/^v\d+\//, "");
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${cleanPath}`;
  }

  // Check if it's just a public_id (no URL scheme)
  if (!url.startsWith("http")) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.warn("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set");
      return null;
    }
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${url}`;
  }

  // Return original URL if not Cloudinary (external URLs)
  return url;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/**
 * Extract public_id from a Cloudinary URL
 */
export function getPublicIdFromUrl(url: string): string | null {
  const match = url.match(
    /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)$/,
  );
  return match ? match[1] : null;
}
