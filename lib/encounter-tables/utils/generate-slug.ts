/**
 * Public slug generation utility
 * Generates unique 8-character slugs for public encounter tables
 */

import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";

/**
 * Generate a unique public slug for an encounter table
 * Uses nanoid for cryptographically strong random IDs
 * Retries on collision (extremely rare with 8-character nanoid)
 *
 * @param maxAttempts - Maximum number of generation attempts (default 5)
 * @returns Promise with unique 8-character slug
 * @throws Error if unable to generate unique slug after max attempts
 */
export async function generateUniqueSlug(
  maxAttempts: number = 5,
): Promise<string> {
  const supabase = await createClient();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Generate 8-character slug using nanoid
    // nanoid uses URL-safe characters (A-Za-z0-9_-)
    const slug = nanoid(8);

    // Check if slug already exists
    const { count, error } = await supabase
      .from("encounter_tables")
      .select("id", { count: "exact", head: true })
      .eq("public_slug", slug);

    if (error) {
      console.error("Error checking slug uniqueness:", error);
      // Continue to next attempt on error
      continue;
    }

    // If count is 0, slug is unique
    if (count === 0) {
      return slug;
    }

    // Collision detected (extremely rare)
    console.warn(`Slug collision detected on attempt ${attempt}: ${slug}`);
  }

  // Failed to generate unique slug after all attempts
  throw new Error(
    `Failed to generate unique public slug after ${maxAttempts} attempts`,
  );
}

/**
 * Validate slug format
 * Ensures slug is exactly 8 characters and uses valid characters
 *
 * @param slug - Slug to validate
 * @returns Boolean indicating if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length !== 8) {
    return false;
  }

  // Check if slug contains only URL-safe characters
  // nanoid uses: A-Z, a-z, 0-9, _, -
  const validSlugPattern = /^[A-Za-z0-9_-]{8}$/;
  return validSlugPattern.test(slug);
}
