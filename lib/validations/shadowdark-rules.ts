/**
 * Shadowdark RPG Rules and Validation
 * Based on official Shadowdark RPG rules by The Arcane Library
 */

import { z } from "zod";

/**
 * Shadowdark Challenge Level (CL) Constraints
 * CL represents the difficulty of a monster
 * CL 1-20 are standard, with exponentially scaling difficulty
 */
export const CHALLENGE_LEVELS = {
  MIN: 1,
  MAX: 20,
  // Difficulty tiers
  TIER_1: { min: 1, max: 3, name: "Apprentice" }, // Low-level threats
  TIER_2: { min: 4, max: 7, name: "Journeyman" }, // Mid-level threats
  TIER_3: { min: 8, max: 12, name: "Expert" }, // High-level threats
  TIER_4: { min: 13, max: 20, name: "Master" }, // Epic threats
} as const;

/**
 * Armor Class ranges in Shadowdark
 * AC 10 is unarmored, AC 21 is maximum natural/magical protection
 */
export const ARMOR_CLASS = {
  MIN: 1,
  MAX: 21,
  UNARMORED: 10,
  LEATHER: 11,
  CHAINMAIL: 13,
  PLATE: 15,
} as const;

/**
 * Movement speeds in Shadowdark
 * Measured in feet per round and abstract ranges
 */
export const MOVEMENT = {
  NEAR: "30ft", // Adjacent, within immediate reach
  CLOSE: "60ft", // Short distance, a few seconds away
  FAR: "120ft+", // Long distance, across a room or field
  // Special movement types
  FLY: "fly",
  SWIM: "swim",
  CLIMB: "climb",
  BURROW: "burrow",
} as const;

/**
 * Damage dice used in Shadowdark
 */
export const DAMAGE_DICE = [
  "1",
  "1d2",
  "1d3",
  "1d4",
  "1d6",
  "1d8",
  "1d10",
  "1d12",
  "2d4",
  "2d6",
  "2d8",
  "2d10",
  "2d12",
  "3d6",
  "3d8",
  "4d6",
] as const;

/**
 * Attack types in Shadowdark
 */
export const ATTACK_TYPES = ["melee", "ranged", "spell"] as const;

/**
 * Monster types (based on classic fantasy)
 */
export const MONSTER_TYPES = [
  "Aberration", // Alien, bizarre creatures
  "Beast", // Natural animals
  "Celestial", // Divine beings
  "Construct", // Animated objects, golems
  "Dragon", // Dragons and draconic creatures
  "Elemental", // Beings of pure element
  "Fey", // Faerie creatures
  "Fiend", // Devils, demons
  "Giant", // Large humanoids
  "Humanoid", // Human-like creatures
  "Monstrosity", // Magical beasts
  "Ooze", // Amorphous creatures
  "Plant", // Animated plants
  "Undead", // Risen dead
] as const;

/**
 * Common ability keywords in Shadowdark monsters
 */
export const ABILITY_KEYWORDS = [
  "Resistance", // Takes half damage from type
  "Immunity", // Takes no damage from type
  "Vulnerability", // Takes double damage from type
  "Regeneration", // Heals HP each round
  "Invisibility", // Cannot be seen
  "Darkvision", // Can see in darkness
  "Blindsight", // Can sense without seeing
  "Telepathy", // Mental communication
  "Shapechanger", // Can change form
  "Magic Resistance", // Advantage on spell saves
  "Pack Tactics", // Advantage when allies nearby
  "Ambusher", // Advantage on surprise
  "Keen Senses", // Advantage on perception
] as const;

/**
 * Calculate XP based on Challenge Level
 * In Shadowdark, XP = CL × 25
 */
export function calculateXP(challengeLevel: number): number {
  if (
    challengeLevel < CHALLENGE_LEVELS.MIN ||
    challengeLevel > CHALLENGE_LEVELS.MAX
  ) {
    throw new Error(
      `Challenge level must be between ${CHALLENGE_LEVELS.MIN} and ${CHALLENGE_LEVELS.MAX}`,
    );
  }
  return challengeLevel * 25;
}

/**
 * Get difficulty tier for a challenge level
 */
export function getDifficultyTier(challengeLevel: number): string {
  if (challengeLevel <= CHALLENGE_LEVELS.TIER_1.max)
    return CHALLENGE_LEVELS.TIER_1.name;
  if (challengeLevel <= CHALLENGE_LEVELS.TIER_2.max)
    return CHALLENGE_LEVELS.TIER_2.name;
  if (challengeLevel <= CHALLENGE_LEVELS.TIER_3.max)
    return CHALLENGE_LEVELS.TIER_3.name;
  return CHALLENGE_LEVELS.TIER_4.name;
}

/**
 * Validate a damage string (e.g., "1d6+2", "2d8", "10")
 */
export function validateDamageString(damage: string): boolean {
  // Pattern: optional number of dice (default 1), d, die size, optional modifier
  const damagePattern = /^(\d+)?d(\d+)([+-]\d+)?$|^\d+$/;
  return damagePattern.test(damage);
}

/**
 * Parse a damage string to get average damage
 */
export function calculateAverageDamage(damage: string): number {
  // Handle flat damage
  const flatMatch = damage.match(/^(\d+)$/);
  if (flatMatch) {
    return parseInt(flatMatch[1]);
  }

  // Handle dice notation
  const diceMatch = damage.match(/^(\d+)?d(\d+)([+-]\d+)?$/);
  if (diceMatch) {
    const numDice = parseInt(diceMatch[1] || "1");
    const dieSize = parseInt(diceMatch[2]);
    const modifier = parseInt(diceMatch[3] || "0");

    // Average of a die is (size + 1) / 2
    const averagePerDie = (dieSize + 1) / 2;
    return numDice * averagePerDie + modifier;
  }

  return 0;
}

/**
 * Estimate appropriate hit points for a challenge level
 * This is a guideline based on Shadowdark balance
 */
export function suggestHitPoints(challengeLevel: number): {
  min: number;
  max: number;
  suggested: number;
} {
  const baseHP = challengeLevel * 8;
  const variance = Math.ceil(challengeLevel * 3);

  return {
    min: Math.max(1, baseHP - variance),
    max: baseHP + variance,
    suggested: baseHP,
  };
}

/**
 * Estimate appropriate armor class for a challenge level
 */
export function suggestArmorClass(challengeLevel: number): number {
  if (challengeLevel <= 3) return 11; // Leather armor equivalent
  if (challengeLevel <= 7) return 13; // Chainmail equivalent
  if (challengeLevel <= 12) return 15; // Plate equivalent
  return 17; // Magical protection
}

/**
 * Validate if attacks are balanced for the challenge level
 */
export function validateAttackBalance(
  challengeLevel: number,
  attacks: Array<{ damage: string }>,
): { isBalanced: boolean; message: string } {
  if (attacks.length === 0) {
    return { isBalanced: true, message: "No attacks to validate" };
  }

  const totalAverageDamage = attacks.reduce((sum, attack) => {
    return sum + calculateAverageDamage(attack.damage);
  }, 0);

  // Expected damage output scales with CL
  const expectedMinDamage = challengeLevel * 3;
  const expectedMaxDamage = challengeLevel * 8;

  if (totalAverageDamage < expectedMinDamage) {
    return {
      isBalanced: false,
      message: `Attacks seem weak for CL ${challengeLevel}. Consider increasing damage.`,
    };
  }

  if (totalAverageDamage > expectedMaxDamage) {
    return {
      isBalanced: false,
      message: `Attacks seem too strong for CL ${challengeLevel}. Consider reducing damage.`,
    };
  }

  return {
    isBalanced: true,
    message: "Attacks are balanced for this challenge level",
  };
}

/**
 * Enhanced Zod schema for Shadowdark monster validation
 */
export const shadowdarkMonsterSchema = z
  .object({
    name: z.string().min(1).max(100),
    challenge_level: z
      .number()
      .int()
      .min(CHALLENGE_LEVELS.MIN)
      .max(CHALLENGE_LEVELS.MAX),
    hit_points: z.number().int().min(1),
    armor_class: z.number().int().min(ARMOR_CLASS.MIN).max(ARMOR_CLASS.MAX),
    speed: z.string().min(1),
    attacks: z.array(
      z.object({
        name: z.string().min(1),
        type: z.enum(ATTACK_TYPES),
        damage: z.string().refine(validateDamageString, {
          message:
            'Invalid damage format. Use formats like "1d6", "2d8+2", or "10"',
        }),
        range: z.string().optional(),
        description: z.string().optional(),
      }),
    ),
    abilities: z.array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
      }),
    ),
  })
  .refine(
    (data) => {
      // Validate that HP is reasonable for the CL
      const hpRange = suggestHitPoints(data.challenge_level);
      return (
        data.hit_points >= hpRange.min * 0.5 &&
        data.hit_points <= hpRange.max * 2
      );
    },
    {
      message: "Hit points seem unusual for the challenge level",
      path: ["hit_points"],
    },
  );

/**
 * Generate a monster stat block summary
 */
export function generateStatBlock(monster: {
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  speed: string;
  attacks: Array<{ name: string; damage: string }>;
}): string {
  const xp = calculateXP(monster.challenge_level);
  const tier = getDifficultyTier(monster.challenge_level);

  return `
${monster.name.toUpperCase()}
${tier} Threat (CL ${monster.challenge_level}, ${xp} XP)
HP: ${monster.hit_points} | AC: ${monster.armor_class} | Speed: ${monster.speed}
${monster.attacks.map((a) => `• ${a.name}: ${a.damage} damage`).join("\n")}
  `.trim();
}
