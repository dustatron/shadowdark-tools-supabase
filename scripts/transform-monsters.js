import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to transform the monster data to our schema
function transformMonster(monster) {
  // Convert attacks string to structured format
  const attacks = parseAttacks(monster.attacks);

  // Convert traits to abilities format
  const abilities =
    monster.traits?.map((trait) => ({
      name: trait.name,
      description: trait.description,
    })) || [];

  // Determine creature types from description and name
  const tags = inferTags(monster);

  // Handle special cases for variable-level monsters
  let challengeLevel = monster.level;
  let hitPoints = monster.hit_points;

  // Fix Hydra and other variable monsters with level 0
  if (challengeLevel === 0) {
    challengeLevel = 2; // Default to level 2 for variable monsters
  }

  // Fix monsters with 0 HP
  if (hitPoints === 0) {
    hitPoints = 11; // Default HP for variable monsters (from Hydra description)
  }

  // Ensure challenge level is at least 1 (max 50 for epic monsters like Tarrasque at 30)
  challengeLevel = Math.max(1, Math.min(50, challengeLevel));

  return {
    name: monster.name,
    challenge_level: challengeLevel,
    hit_points: hitPoints,
    armor_class: monster.armor_class,
    speed: monster.movement || "near",
    attacks: JSON.stringify(attacks),
    abilities: JSON.stringify(abilities),
    treasure: null, // Not provided in starter data
    tags: JSON.stringify(tags),
    source: "Shadowdark Core",
    author_notes: monster.description || null,
    icon_url: null,
    art_url: null,
    // Clamp modifiers to -10/+10 range (database constraint)
    strength_mod: Math.max(-10, Math.min(10, monster.strength ?? 0)),
    dexterity_mod: Math.max(-10, Math.min(10, monster.dexterity ?? 0)),
    constitution_mod: Math.max(-10, Math.min(10, monster.constitution ?? 0)),
    intelligence_mod: Math.max(-10, Math.min(10, monster.intelligence ?? 0)),
    wisdom_mod: Math.max(-10, Math.min(10, monster.wisdom ?? 0)),
    charisma_mod: Math.max(-10, Math.min(10, monster.charisma ?? 0)),
    alignment: monster.alignment || null,
  };
}

// Parse attack strings into structured format
function parseAttacks(attackString) {
  if (!attackString) return [];

  const attacks = [];
  const attackParts = attackString.split(" or ");

  attackParts.forEach((part) => {
    const trimmed = part.trim();

    // Primary pattern: [NUM] [NAME] ([RANGE]) +/-[BONUS] ([DAMAGE])
    // Example: "2 tentacle (near) +5 (1d8 + curse)"
    let match = trimmed.match(
      /^(\d+)\s+([^+\-\(]+?)\s*(?:\(([^)]+)\))?\s*([+\-]\d+)(?:\s*\(([^)]+)\))?/,
    );

    if (match) {
      const numberOfAttacks = parseInt(match[1], 10);
      const name = match[2].trim();
      const rangeText = match[3] || "close";
      const attackBonus = parseInt(match[4], 10);
      const damageText = match[5] || "1d4";

      // Extract just the dice portion from damage (e.g., "1d8" from "1d8 + curse")
      const damage = damageText.split(" ")[0].replace(/,+$/, "");

      // Determine type from range or name
      let type = "melee";
      if (rangeText.includes("far")) {
        type = "ranged";
      } else if (name.toLowerCase().includes("spell")) {
        type = "spell";
      } else if (rangeText.includes("near")) {
        type = "ranged";
      }

      attacks.push({
        name,
        type,
        damage,
        range: rangeText,
        description: "",
        attackBonus,
        numberOfAttacks,
      });
    } else {
      // Fallback pattern for special abilities without bonuses: [NUM] [NAME]
      // Example: "1 horn", "1 soulbind"
      match = trimmed.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const numberOfAttacks = parseInt(match[1], 10);
        const name = match[2].trim();

        attacks.push({
          name,
          type: "melee",
          damage: "special",
          range: "close",
          description: "",
          numberOfAttacks,
        });
      } else {
        // Last resort fallback
        console.warn(`Could not parse attack: ${trimmed}`);
      }
    }
  });

  return attacks;
}

// Infer creature type and location tags from description and name
function inferTags(monster) {
  const name = (monster.name || "").toLowerCase();
  const description = (monster.description || "").toLowerCase();
  const combined = `${name} ${description}`;

  const types = [];
  const locations = [];

  // Type inference
  if (
    combined.includes("human") ||
    combined.includes("elf") ||
    combined.includes("dwarf") ||
    combined.includes("orc") ||
    combined.includes("goblin") ||
    combined.includes("cultist") ||
    combined.includes("bandit") ||
    combined.includes("acolyte") ||
    combined.includes("apprentice")
  ) {
    types.push("humanoid");
  } else if (
    combined.includes("undead") ||
    combined.includes("skeleton") ||
    combined.includes("zombie") ||
    combined.includes("ghost") ||
    combined.includes("wraith")
  ) {
    types.push("undead");
  } else if (combined.includes("dragon")) {
    types.push("dragon");
  } else if (combined.includes("demon") || combined.includes("devil")) {
    types.push("fiend");
  } else if (combined.includes("angel") || combined.includes("celestial")) {
    types.push("celestial");
  } else if (combined.includes("elemental")) {
    types.push("elemental");
  } else if (
    combined.includes("beast") ||
    combined.includes("wolf") ||
    combined.includes("bear") ||
    combined.includes("boar") ||
    combined.includes("ape") ||
    combined.includes("bat") ||
    combined.includes("crab") ||
    combined.includes("spider")
  ) {
    types.push("beast");
  } else if (
    combined.includes("insect") ||
    combined.includes("centipede") ||
    combined.includes("beetle")
  ) {
    types.push("beast");
  } else {
    types.push("monstrosity"); // Default
  }

  // Location inference
  if (
    combined.includes("cave") ||
    combined.includes("underground") ||
    combined.includes("deep")
  ) {
    locations.push("cave", "underground");
  } else if (
    combined.includes("forest") ||
    combined.includes("tree") ||
    combined.includes("wood")
  ) {
    locations.push("forest");
  } else if (
    combined.includes("mountain") ||
    combined.includes("peak") ||
    combined.includes("high")
  ) {
    locations.push("mountain");
  } else if (
    combined.includes("sea") ||
    combined.includes("ocean") ||
    combined.includes("water") ||
    combined.includes("swim")
  ) {
    locations.push("water", "coastal");
  } else if (
    combined.includes("swamp") ||
    combined.includes("marsh") ||
    combined.includes("bog")
  ) {
    locations.push("swamp");
  } else if (
    combined.includes("desert") ||
    combined.includes("sand") ||
    combined.includes("arid")
  ) {
    locations.push("desert");
  } else if (
    combined.includes("dungeon") ||
    combined.includes("ruins") ||
    combined.includes("castle")
  ) {
    locations.push("dungeon");
  } else {
    locations.push("any"); // Default
  }

  return {
    type: types,
    location: locations,
  };
}

// Read and transform the monsters
const monstersPath = path.join(
  __dirname,
  "..",
  "starter-data",
  "monsters.json",
);
const monsters = JSON.parse(fs.readFileSync(monstersPath, "utf8"));

const transformedMonsters = monsters.map(transformMonster);

// Generate SQL statements
const sqlStatements = transformedMonsters.map((monster) => {
  const values = [
    `'${monster.name.replace(/'/g, "''")}'`,
    monster.challenge_level,
    monster.hit_points,
    monster.armor_class,
    `'${monster.speed.replace(/'/g, "''")}'`,
    `'${monster.attacks.replace(/'/g, "''")}'::jsonb`,
    `'${monster.abilities.replace(/'/g, "''")}'::jsonb`,
    monster.treasure
      ? `'${monster.treasure.replace(/'/g, "''")}'::jsonb`
      : "NULL",
    `'${monster.tags.replace(/'/g, "''")}'::jsonb`,
    `'${monster.source.replace(/'/g, "''")}'`,
    monster.author_notes
      ? `'${monster.author_notes.replace(/'/g, "''")}'`
      : "NULL",
    monster.icon_url ? `'${monster.icon_url}'` : "NULL",
    monster.art_url ? `'${monster.art_url}'` : "NULL",
    monster.strength_mod,
    monster.dexterity_mod,
    monster.constitution_mod,
    monster.intelligence_mod,
    monster.wisdom_mod,
    monster.charisma_mod,
    monster.alignment ? `'${monster.alignment}'` : "NULL",
  ];

  return `INSERT INTO public.official_monsters (name, challenge_level, hit_points, armor_class, speed, attacks, abilities, treasure, tags, source, author_notes, icon_url, art_url, strength_mod, dexterity_mod, constitution_mod, intelligence_mod, wisdom_mod, charisma_mod, alignment) VALUES (${values.join(", ")});`;
});

// Write to migration file
const migrationContent = `-- Seed official monsters from Shadowdark starter data
-- Generated from starter-data/monsters.json

-- Clear existing data to allow re-seeding with updated fields
DELETE FROM official_monsters;

${sqlStatements.join("\n")}
`;

const migrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20250921000014_seed_official_monsters.sql",
);
fs.writeFileSync(migrationPath, migrationContent);

console.log(`Generated migration with ${transformedMonsters.length} monsters`);
console.log(`Migration saved to: ${migrationPath}`);
