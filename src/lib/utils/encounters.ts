// Encounter generation utilities for Shadowdark

export interface Monster {
  id: string;
  name: string;
  challenge_level: number;
  hit_points: number;
  armor_class: number;
  xp: number;
  tags: {
    type: string[];
    location: string[];
  };
}

export interface EncounterSettings {
  challengeLevel: number;
  partySize: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  monsterTypes?: string[];
  location?: string;
  maxMonsters?: number;
}

export interface GeneratedEncounter {
  monsters: Monster[];
  totalXp: number;
  baseXp: number;
  multiplier: number;
  difficulty: string;
  balanceScore: number;
}

// Encounter difficulty multipliers based on number of monsters
export const ENCOUNTER_MULTIPLIERS: Record<number, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.0,
  4: 2.0,
  5: 2.5,
  6: 2.5,
  7: 3.0,
  8: 3.0,
  9: 3.5,
  10: 3.5,
  11: 4.0,
  12: 4.0,
  13: 4.5,
  14: 4.5,
  15: 5.0
};

export function getEncounterMultiplier(monsterCount: number): number {
  return ENCOUNTER_MULTIPLIERS[Math.min(monsterCount, 15)] || 5.0;
}

// Difficulty thresholds per character level (XP)
export const DIFFICULTY_THRESHOLDS_PER_LEVEL: Record<number, {
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
}> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 300 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1000 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1200 },
  7: { easy: 350, medium: 700, hard: 1050, deadly: 1400 },
  8: { easy: 450, medium: 900, hard: 1350, deadly: 1800 },
  9: { easy: 550, medium: 1100, hard: 1650, deadly: 2200 },
  10: { easy: 600, medium: 1200, hard: 1800, deadly: 2400 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3200 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4000 },
  13: { easy: 1100, medium: 2200, hard: 3300, deadly: 4400 },
  14: { easy: 1250, medium: 2500, hard: 3750, deadly: 5000 },
  15: { easy: 1400, medium: 2800, hard: 4200, deadly: 5600 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 6400 },
  17: { easy: 2000, medium: 4000, hard: 6000, deadly: 8000 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 8400 },
  19: { easy: 2400, medium: 4800, hard: 7200, deadly: 9600 },
  20: { easy: 2800, medium: 5600, hard: 8400, deadly: 11200 }
};

export function getDifficultyThresholds(partyLevel: number, partySize: number) {
  const thresholds = DIFFICULTY_THRESHOLDS_PER_LEVEL[Math.min(partyLevel, 20)] ||
                    DIFFICULTY_THRESHOLDS_PER_LEVEL[20];

  return {
    easy: thresholds.easy * partySize,
    medium: thresholds.medium * partySize,
    hard: thresholds.hard * partySize,
    deadly: thresholds.deadly * partySize
  };
}

export function calculateEncounterDifficulty(
  monsters: Monster[],
  partyLevel: number,
  partySize: number
): {
  difficulty: string;
  totalXp: number;
  baseXp: number;
  multiplier: number;
  thresholds: ReturnType<typeof getDifficultyThresholds>;
} {
  const baseXp = monsters.reduce((sum, monster) => sum + monster.xp, 0);
  const multiplier = getEncounterMultiplier(monsters.length);
  const totalXp = baseXp * multiplier;

  const thresholds = getDifficultyThresholds(partyLevel, partySize);

  let difficulty: string;
  if (totalXp < thresholds.easy) {
    difficulty = 'trivial';
  } else if (totalXp < thresholds.medium) {
    difficulty = 'easy';
  } else if (totalXp < thresholds.hard) {
    difficulty = 'medium';
  } else if (totalXp < thresholds.deadly) {
    difficulty = 'hard';
  } else {
    difficulty = 'deadly';
  }

  return {
    difficulty,
    totalXp,
    baseXp,
    multiplier,
    thresholds
  };
}

// Generate balanced encounter
export function generateBalancedEncounter(
  monsterPool: Monster[],
  settings: EncounterSettings
): GeneratedEncounter | null {
  const thresholds = getDifficultyThresholds(settings.challengeLevel, settings.partySize);
  const targetXp = thresholds[settings.difficulty];

  // Filter monsters by level range and criteria
  const minLevel = Math.max(1, settings.challengeLevel - 2);
  const maxLevel = Math.min(20, settings.challengeLevel + 2);

  let filteredPool = monsterPool.filter(monster =>
    monster.challenge_level >= minLevel &&
    monster.challenge_level <= maxLevel
  );

  // Apply type filter
  if (settings.monsterTypes && settings.monsterTypes.length > 0) {
    filteredPool = filteredPool.filter(monster =>
      settings.monsterTypes!.some(type => monster.tags.type.includes(type))
    );
  }

  // Apply location filter
  if (settings.location) {
    filteredPool = filteredPool.filter(monster =>
      monster.tags.location.includes(settings.location!) ||
      monster.tags.location.includes('any')
    );
  }

  if (filteredPool.length === 0) {
    return null;
  }

  // Greedy algorithm to build encounter
  const encounter: Monster[] = [];
  const maxMonsters = settings.maxMonsters || 8;
  let attempts = 0;
  const maxAttempts = 100;

  while (encounter.length < maxMonsters && attempts < maxAttempts) {
    attempts++;

    const currentMultiplier = getEncounterMultiplier(encounter.length + 1);
    const currentBaseXp = encounter.reduce((sum, m) => sum + m.xp, 0);
    const remainingXp = (targetXp - currentBaseXp * currentMultiplier) / currentMultiplier;

    // Find monsters that fit in remaining budget (with some flexibility)
    const candidates = filteredPool.filter(monster =>
      monster.xp <= remainingXp * 1.5
    );

    if (candidates.length === 0) break;

    // Prefer monsters closer to the target XP
    candidates.sort((a, b) => {
      const aFit = Math.abs(remainingXp - a.xp);
      const bFit = Math.abs(remainingXp - b.xp);
      return aFit - bFit;
    });

    // Add some randomness while favoring better fits
    const topCandidates = candidates.slice(0, Math.min(5, candidates.length));
    const selectedMonster = topCandidates[Math.floor(Math.random() * topCandidates.length)];

    encounter.push(selectedMonster);

    // Check if we're close enough to target
    const result = calculateEncounterDifficulty(encounter, settings.challengeLevel, settings.partySize);
    if (result.totalXp >= targetXp * 0.8) break;
  }

  if (encounter.length === 0) {
    return null;
  }

  const result = calculateEncounterDifficulty(encounter, settings.challengeLevel, settings.partySize);

  // Calculate balance score (how close to target difficulty)
  const balanceScore = Math.max(0, 100 - Math.abs(result.totalXp - targetXp) / targetXp * 100);

  return {
    monsters: encounter,
    totalXp: result.totalXp,
    baseXp: result.baseXp,
    multiplier: result.multiplier,
    difficulty: result.difficulty,
    balanceScore
  };
}

// Dice rolling utilities
export function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollMultipleDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => rollDice(sides));
}

export function parseDiceString(diceString: string): { count: number; sides: number; modifier: number } {
  const match = diceString.match(/(\d+)d(\d+)([+-]\d+)?/i);
  if (!match) {
    return { count: 1, sides: 6, modifier: 0 };
  }

  return {
    count: parseInt(match[1]),
    sides: parseInt(match[2]),
    modifier: match[3] ? parseInt(match[3]) : 0
  };
}

export function rollDiceString(diceString: string): {
  total: number;
  rolls: number[];
  modifier: number;
} {
  const { count, sides, modifier } = parseDiceString(diceString);
  const rolls = rollMultipleDice(count, sides);
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

  return { total, rolls, modifier };
}