import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Schema for encounter generation
const EncounterGenerationSchema = z.object({
  challengeLevel: z.number().int().min(1).max(20),
  partySize: z.number().int().min(1).max(12),
  monsterTypes: z.array(z.string()).optional(),
  location: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'deadly']).default('medium'),
  maxMonsters: z.number().int().min(1).max(20).default(8)
});

// Calculate encounter difficulty multiplier based on number of monsters
function getEncounterMultiplier(monsterCount: number): number {
  if (monsterCount === 1) return 1;
  if (monsterCount === 2) return 1.5;
  if (monsterCount <= 6) return 2;
  if (monsterCount <= 10) return 2.5;
  if (monsterCount <= 14) return 3;
  return 4;
}

// Calculate difficulty thresholds for party
function getDifficultyThresholds(partySize: number, partyLevel: number) {
  const baseXpPerPlayer = partyLevel * 25; // Shadowdark uses level * 25 XP
  return {
    easy: baseXpPerPlayer * partySize * 0.25,
    medium: baseXpPerPlayer * partySize * 0.5,
    hard: baseXpPerPlayer * partySize * 0.75,
    deadly: baseXpPerPlayer * partySize * 1.0
  };
}

// POST /api/encounters/generate - Generate random encounter
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();

    // Parse and validate request body
    const body = await request.json();
    const params = EncounterGenerationSchema.parse(body);

    // Calculate XP budget based on difficulty
    const thresholds = getDifficultyThresholds(params.partySize, params.challengeLevel);
    const targetXp = thresholds[params.difficulty];

    // Determine level range for monsters
    const minLevel = Math.max(1, params.challengeLevel - 2);
    const maxLevel = Math.min(20, params.challengeLevel + 2);

    // Get pool of suitable monsters
    const { data: monsterPool, error } = await supabase.rpc('search_monsters', {
      search_query: '',
      min_level: minLevel,
      max_level: maxLevel,
      monster_types: params.monsterTypes || null,
      locations: params.location ? [params.location] : null,
      sources: null,
      result_limit: 100,
      result_offset: 0
    });

    if (error || !monsterPool || monsterPool.length === 0) {
      return NextResponse.json(
        { error: 'No suitable monsters found for the specified criteria' },
        { status: 400 }
      );
    }

    // Generate encounter using greedy algorithm
    const encounter = [];
    let currentXp = 0;
    let attempts = 0;
    const maxAttempts = 50;

    while (currentXp < targetXp * 0.8 && encounter.length < params.maxMonsters && attempts < maxAttempts) {
      attempts++;

      // Calculate remaining XP budget accounting for multiplier
      const currentMultiplier = getEncounterMultiplier(encounter.length + 1);
      const remainingXp = (targetXp - currentXp) / currentMultiplier;

      // Filter monsters that fit in remaining budget
      const suitableMonsters = monsterPool.filter(monster => {
        const monsterXp = monster.challenge_level * 25;
        return monsterXp <= remainingXp * 1.5; // Allow some flexibility
      });

      if (suitableMonsters.length === 0) break;

      // Pick a random suitable monster
      const randomMonster = suitableMonsters[Math.floor(Math.random() * suitableMonsters.length)];
      encounter.push(randomMonster);

      // Recalculate total XP with multiplier
      const totalMonsterXp = encounter.reduce((sum, m) => sum + (m.challenge_level * 25), 0);
      const multiplier = getEncounterMultiplier(encounter.length);
      currentXp = totalMonsterXp * multiplier;
    }

    if (encounter.length === 0) {
      return NextResponse.json(
        { error: 'Unable to generate suitable encounter with given parameters' },
        { status: 400 }
      );
    }

    // Calculate final difficulty
    const finalMultiplier = getEncounterMultiplier(encounter.length);
    const totalXp = encounter.reduce((sum, m) => sum + (m.challenge_level * 25), 0);
    const adjustedXp = totalXp * finalMultiplier;

    let actualDifficulty: string;
    if (adjustedXp <= thresholds.easy) actualDifficulty = 'easy';
    else if (adjustedXp <= thresholds.medium) actualDifficulty = 'medium';
    else if (adjustedXp <= thresholds.hard) actualDifficulty = 'hard';
    else actualDifficulty = 'deadly';

    // Parse JSON fields for response
    const parsedEncounter = encounter.map(monster => ({
      ...monster,
      attacks: typeof monster.attacks === 'string' ? JSON.parse(monster.attacks) : monster.attacks,
      abilities: typeof monster.abilities === 'string' ? JSON.parse(monster.abilities) : monster.abilities,
      tags: typeof monster.tags === 'string' ? JSON.parse(monster.tags) : monster.tags
    }));

    return NextResponse.json({
      encounter: {
        monsters: parsedEncounter,
        totalXp: adjustedXp,
        baseXp: totalXp,
        multiplier: finalMultiplier,
        difficulty: actualDifficulty,
        targetDifficulty: params.difficulty,
        partySize: params.partySize,
        challengeLevel: params.challengeLevel
      },
      generation: {
        attempts,
        monsterPoolSize: monsterPool.length,
        thresholds
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid encounter parameters',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}