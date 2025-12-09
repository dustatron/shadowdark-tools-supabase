/**
 * Shadowdark Color Utilities
 *
 * Centralized color scheme functions for challenge levels and spell tiers
 * following Shadowdark RPG difficulty progression patterns.
 */

/**
 * Get Tailwind color classes for a monster's challenge level
 *
 * @param challengeLevel - Monster challenge level (1-20+)
 * @returns Tailwind CSS classes for background and text colors
 *
 * Color scheme:
 * - Levels 1-3: Green (Easy)
 * - Levels 4-7: Yellow (Moderate)
 * - Levels 8-12: Orange (Hard)
 * - Levels 13+: Red (Deadly)
 */
export function getChallengeLevelColor(challengeLevel: number): string {
  if (challengeLevel <= 3) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  } else if (challengeLevel <= 7) {
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  } else if (challengeLevel <= 12) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  } else {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
}

/**
 * Get Tailwind color classes for a spell's tier
 *
 * @param tier - Spell tier (1-5)
 * @returns Tailwind CSS classes for background and text colors
 *
 * Color scheme:
 * - Tier 1: Green (Cantrips/Basic)
 * - Tier 2: Blue (Intermediate)
 * - Tier 3: Purple (Advanced)
 * - Tier 4: Orange (Expert)
 * - Tier 5: Red (Master)
 */
export function getTierColor(tier: number): string {
  if (tier <= 1) {
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  } else if (tier <= 2) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  } else if (tier <= 3) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
  } else if (tier <= 4) {
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  } else {
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
}

/**
 * Get subtle background color classes for spell tier (for card UI)
 *
 * @param tier - Spell tier (1-5)
 * @returns Tailwind CSS classes for subtle background and text colors
 */
export function getTierColorSubtle(tier: number): string {
  if (tier <= 1) {
    return "bg-green-500/10 text-green-700 dark:text-green-400";
  } else if (tier <= 3) {
    return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
  } else {
    return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
  }
}

/**
 * Get PDF-compatible hex color for spell tier
 *
 * @param tier - Spell tier (1-5)
 * @returns Hex color code for use in PDF rendering
 */
export function getTierColorPDF(tier: number): string {
  if (tier <= 1) {
    return "#333"; // Dark gray for tier 1
  } else if (tier <= 3) {
    return "#333"; // Dark gray for tiers 2-3
  } else {
    return "#a855f7"; // Purple for higher tiers
  }
}
