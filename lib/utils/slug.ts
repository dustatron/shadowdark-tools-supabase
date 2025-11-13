/**
 * Generate a URL-friendly slug from a given string
 * @param text - The input text to convert to a slug
 * @returns A lowercase, hyphenated slug
 *
 * @example
 * generateSlug("Fire Bolt") // "fire-bolt"
 * generateSlug("Magic Missile!") // "magic-missile"
 * generateSlug("  Extra   Spaces  ") // "extra-spaces"
 */
export function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Remove special characters (keep alphanumeric, spaces, hyphens, underscores)
      .replace(/[^\w\s-]/g, "")
      // Replace spaces and underscores with hyphens
      .replace(/[\s_-]+/g, "-")
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, "")
  );
}
