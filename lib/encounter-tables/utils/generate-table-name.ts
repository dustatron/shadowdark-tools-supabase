/**
 * Generates evocative names for encounter tables in Shadowdark style
 * Dark fantasy, OSR aesthetic with danger and mystery
 */

const ADJECTIVES = [
  "Cursed",
  "Forgotten",
  "Burning",
  "Frozen",
  "Bleeding",
  "Twisted",
  "Haunted",
  "Shattered",
  "Whispering",
  "Dread",
  "Endless",
  "Rotting",
  "Vengeful",
  "Sunken",
  "Screaming",
  "Blighted",
  "Wretched",
  "Nameless",
  "Hungry",
  "Creeping",
] as const;

const NOUNS = [
  "Crypts",
  "Vale",
  "Depths",
  "Halls",
  "Tombs",
  "Wastes",
  "Ruins",
  "Shadows",
  "Cairns",
  "Barrows",
  "Spire",
  "Chambers",
  "Labyrinth",
  "Chasm",
  "Maw",
  "Ossuary",
  "Catacombs",
  "Sanctum",
  "Threshold",
  "Abyss",
] as const;

const PREFIXES = [
  "Beyond the",
  "Beneath the",
  "Within the",
  "Through the",
  "Into the",
  "From the",
  "Above the",
  "Of the",
  "Across the",
  "Among the",
  "Below the",
  "Inside the",
  "Toward the",
  "At the",
  "Near the",
] as const;

const INTENSIFIERS = [
  "of Darkness",
  "of Blood",
  "of Bone",
  "of Sorrow",
  "of Death",
  "of Despair",
  "of Ruin",
  "of Silence",
  "of Flame",
  "of Shadow",
] as const;

/**
 * Get random element from array
 */
function random<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random evocative encounter table name
 *
 * Patterns:
 * 1. "The [Adjective] [Noun]" - Example: "The Cursed Crypts"
 * 2. "[Adjective] [Noun]" - Example: "Burning Wastes"
 * 3. "[Noun] [Intensifier]" - Example: "Halls of Darkness"
 * 4. "The [Adjective] [Noun] [Intensifier]" - Example: "The Twisted Chambers of Despair"
 * 5. "[Prefix] [Adjective] [Noun]" - Example: "Beyond the Shattered Tombs"
 * 6. "[Prefix] [Noun] [Intensifier]" - Example: "Beneath the Crypts of Bone"
 *
 * @returns Randomly generated encounter table name
 */
export function generateEncounterTableName(): string {
  const patterns = [
    () => `The ${random(ADJECTIVES)} ${random(NOUNS)}`,
    () => `${random(ADJECTIVES)} ${random(NOUNS)}`,
    () => `${random(NOUNS)} ${random(INTENSIFIERS)}`,
    () => `The ${random(ADJECTIVES)} ${random(NOUNS)} ${random(INTENSIFIERS)}`,
    () => `${random(PREFIXES)} ${random(ADJECTIVES)} ${random(NOUNS)}`,
    () => `${random(PREFIXES)} ${random(NOUNS)} ${random(INTENSIFIERS)}`,
  ];

  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return selectedPattern();
}
