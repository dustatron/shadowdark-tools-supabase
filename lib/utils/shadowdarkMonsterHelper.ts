/**
 * Shadowdark Monster Creation Helpers
 * Based on "Creating & Adapting Monsters for use in Shadowdark RPG" by Night Noon Games
 */

export interface MonsterStatRecommendation {
  hp: number;
  ac: number;
  avgStatMod: number;
  talentDC: number;
  xp: number;
}

/**
 * Official Shadowdark HP Formula: (LV × 4.5) + CON modifier
 * Reference: Creating and Adapting Shadowdark Monsters guide
 */
export function calculateHP(
  challengeLevel: number,
  constitutionMod: number = 0,
): number {
  const baseHP = challengeLevel * 4.5 + constitutionMod;
  return Math.ceil(baseHP); // Round up
}

/**
 * Get recommended stats based on Challenge Level
 * Source: Quick Combat Statistics table (Creating and Adapting Monsters guide)
 */
export function getRecommendedStats(
  challengeLevel: number,
): MonsterStatRecommendation {
  // Quick Combat Statistics table
  const statsByLevel: Record<number, MonsterStatRecommendation> = {
    0: { hp: 1, ac: 11, avgStatMod: -2, talentDC: 9, xp: 0 },
    1: { hp: 4, ac: 12, avgStatMod: 0, talentDC: 12, xp: 25 },
    2: { hp: 10, ac: 12, avgStatMod: 0, talentDC: 12, xp: 50 },
    3: { hp: 14, ac: 13, avgStatMod: 1, talentDC: 12, xp: 75 },
    4: { hp: 19, ac: 13, avgStatMod: 1, talentDC: 12, xp: 100 },
    5: { hp: 24, ac: 13, avgStatMod: 1, talentDC: 15, xp: 125 },
    6: { hp: 29, ac: 14, avgStatMod: 1, talentDC: 15, xp: 150 },
    7: { hp: 34, ac: 14, avgStatMod: 1, talentDC: 15, xp: 175 },
    8: { hp: 38, ac: 14, avgStatMod: 1, talentDC: 15, xp: 200 },
    9: { hp: 43, ac: 15, avgStatMod: 2, talentDC: 15, xp: 225 },
    10: { hp: 48, ac: 15, avgStatMod: 2, talentDC: 15, xp: 250 },
    11: { hp: 52, ac: 15, avgStatMod: 3, talentDC: 15, xp: 275 },
    12: { hp: 58, ac: 16, avgStatMod: 3, talentDC: 15, xp: 300 },
    13: { hp: 61, ac: 16, avgStatMod: 3, talentDC: 15, xp: 325 },
    14: { hp: 68, ac: 16, avgStatMod: 3, talentDC: 15, xp: 350 },
    15: { hp: 70, ac: 17, avgStatMod: 3, talentDC: 18, xp: 375 },
    16: { hp: 76, ac: 17, avgStatMod: 4, talentDC: 18, xp: 400 },
    17: { hp: 80, ac: 17, avgStatMod: 4, talentDC: 18, xp: 425 },
    18: { hp: 85, ac: 18, avgStatMod: 4, talentDC: 18, xp: 450 },
    19: { hp: 89, ac: 18, avgStatMod: 4, talentDC: 18, xp: 475 },
    20: { hp: 93, ac: 18, avgStatMod: 4, talentDC: 18, xp: 500 },
  };

  return (
    statsByLevel[challengeLevel] || {
      hp: challengeLevel * 4.5,
      ac: 10 + Math.floor(challengeLevel / 2),
      avgStatMod: Math.floor(challengeLevel / 3),
      talentDC: challengeLevel >= 15 ? 18 : challengeLevel >= 5 ? 15 : 12,
      xp: challengeLevel * 25,
    }
  );
}

/**
 * Shadowdark distance bands
 */
export const DISTANCE_BANDS = {
  close: { value: "close", label: "Close (5 ft / melee)", distance: "5 ft" },
  near: { value: "near", label: "Near (30 ft)", distance: "30 ft" },
  far: { value: "far", label: "Far (120+ ft / longbow)", distance: "120+ ft" },
  custom: { value: "custom", label: "Custom", distance: "custom" },
} as const;

/**
 * Attack templates for quick monster creation
 */
export const ATTACK_TEMPLATES = {
  melee_basic: {
    name: "Claw",
    type: "melee" as const,
    damage: "1d6",
    range: "close",
    description: "",
  },
  melee_heavy: {
    name: "Greataxe",
    type: "melee" as const,
    damage: "1d10",
    range: "close",
    description: "",
  },
  ranged_basic: {
    name: "Shortbow",
    type: "ranged" as const,
    damage: "1d4",
    range: "far",
    description: "",
  },
  spell_basic: {
    name: "Magic Bolt",
    type: "spell" as const,
    damage: "1d4",
    range: "near",
    description: "",
  },
} as const;

/**
 * Calculate XP for a monster
 * Formula: XP = Challenge Level × 25
 */
export function calculateXP(challengeLevel: number): number {
  return challengeLevel * 25;
}

/**
 * Get HP range guidance for a given Challenge Level
 */
export function getHPGuidance(challengeLevel: number): string {
  const recommended = getRecommendedStats(challengeLevel);
  const min = Math.max(3, recommended.hp - 5);
  const max = recommended.hp + 10;
  return `Typical HP for CL ${challengeLevel}: ${min}-${max} (avg ${recommended.hp})`;
}

/**
 * Get AC guidance for a given Challenge Level
 */
export function getACGuidance(ac: number): string {
  if (ac <= 12) return "Low (unarmored, leather)";
  if (ac <= 15) return "Medium (chainmail, natural armor)";
  if (ac <= 18) return "High (plate armor, thick hide)";
  return "Extreme (magical protection)";
}

/**
 * Validate monster stats against Shadowdark guidelines
 */
export function validateMonsterBalance(
  challengeLevel: number,
  hp: number,
  ac: number,
): string[] {
  const recommended = getRecommendedStats(challengeLevel);
  const warnings: string[] = [];

  if (hp < recommended.hp - 10) {
    warnings.push(
      `Low HP for CL ${challengeLevel} (expected ~${recommended.hp})`,
    );
  }
  if (hp > recommended.hp + 20) {
    warnings.push(
      `Very high HP for CL ${challengeLevel} (expected ~${recommended.hp})`,
    );
  }
  if (ac < recommended.ac - 3) {
    warnings.push(
      `Low AC for CL ${challengeLevel} (expected ~${recommended.ac})`,
    );
  }
  if (ac > recommended.ac + 4) {
    warnings.push(
      `High AC for CL ${challengeLevel} (expected ~${recommended.ac})`,
    );
  }

  return warnings;
}
