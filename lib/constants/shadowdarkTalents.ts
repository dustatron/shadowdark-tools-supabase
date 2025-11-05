/**
 * Shadowdark Monster Talents Library
 * Source: "Creating & Adapting Monsters for use in Shadowdark RPG" by Night Noon Games
 */

export interface TalentTemplate {
  name: string;
  description: string;
  category: "innate" | "ride-along" | "thematic";
}

export const SHADOWDARK_TALENTS: TalentTemplate[] = [
  // INNATE TALENTS
  {
    name: "Alert",
    description: "ADV on checks to detect sneaking or hiding creatures.",
    category: "innate",
  },
  {
    name: "Alert (Cannot be surprised)",
    description: "Cannot be surprised.",
    category: "innate",
  },
  {
    name: "Bloodlust",
    description: "+2 damage with melee weapons (included).",
    category: "innate",
  },
  {
    name: "Brutal",
    description: "+1 damage with melee weapons (included).",
    category: "innate",
  },
  {
    name: "Camouflage",
    description: "Hard to see in cave terrain or rocks.",
    category: "innate",
  },
  {
    name: "Clever",
    description: "+1d4 damage when attacking with surprise.",
    category: "innate",
  },
  {
    name: "Fearless",
    description: "Immune to morale checks.",
    category: "innate",
  },
  {
    name: "Feyblood",
    description: "ADV on DEX checks while in the natural wilds.",
    category: "innate",
  },
  {
    name: "Fireblood",
    description: "Fire immune.",
    category: "innate",
  },
  {
    name: "Frostblood",
    description: "Cold immune.",
    category: "innate",
  },
  {
    name: "Stormblood",
    description: "Electricity immune.",
    category: "innate",
  },
  {
    name: "Greater Undead",
    description:
      "Immune to morale checks. Only damaged by silver or magical sources.",
    category: "innate",
  },
  {
    name: "Half-Amphibious",
    description: "Must be submerged in water every 4 hours or suffocates.",
    category: "innate",
  },
  {
    name: "Impervious (Magic only)",
    description: "Can only be harmed by magical sources.",
    category: "innate",
  },
  {
    name: "Impervious (Silver or magic)",
    description: "Only damaged by silver or magic sources.",
    category: "innate",
  },
  {
    name: "Incorporeal",
    description: "In place of attacks, become corporeal or incorporeal.",
    category: "innate",
  },
  {
    name: "Invisible",
    description: "Naturally invisible.",
    category: "innate",
  },
  {
    name: "Iron Hide",
    description: "Half damage from non-magical weapons.",
    category: "innate",
  },
  {
    name: "Keen Senses",
    description: "Can't be surprised.",
    category: "innate",
  },
  {
    name: "Pack Hunter",
    description: "Deals +1 damage while an ally is close.",
    category: "innate",
  },
  {
    name: "Rubbery",
    description: "Half damage from stabbing weapons.",
    category: "innate",
  },
  {
    name: "Savage",
    description: "ADV on attacks against creatures below half their HP.",
    category: "innate",
  },
  {
    name: "Stealthy",
    description: "ADV on checks to sneak and hide.",
    category: "innate",
  },
  {
    name: "Stone Hide",
    description: "Half damage from stabbing and cutting weapons.",
    category: "innate",
  },
  {
    name: "Sunblind",
    description: "Blinded in bright light.",
    category: "innate",
  },
  {
    name: "Telepathic",
    description: "Read the thoughts of all creatures within far.",
    category: "innate",
  },
  {
    name: "Thick Fur",
    description: "Cold immune.",
    category: "innate",
  },
  {
    name: "Truesight",
    description: "Can see all invisible creatures and objects.",
    category: "innate",
  },
  {
    name: "Undead",
    description: "Immune to morale checks.",
    category: "innate",
  },
  {
    name: "Vampire",
    description:
      "Must sleep in a coffin daily or loses 2d6 HP each day that can't be healed until resting in coffin. Takes 3d8 damage each round while in direct sunlight. Cannot be killed unless pierced through heart with a wooden stake while at 0 HP.",
    category: "innate",
  },

  // RIDE-ALONG TALENTS
  {
    name: "Ambush",
    description: "Deal an extra die of damage when undetected.",
    category: "ride-along",
  },
  {
    name: "Attach",
    description:
      "Attach to target; attack auto-hits next round. DC 12 STR on turn to tear off.",
    category: "ride-along",
  },
  {
    name: "Backstab",
    description: "Deal x2 damage against surprised creatures.",
    category: "ride-along",
  },
  {
    name: "Blood Drain",
    description:
      "Attach to bitten target; auto-hit the next round. DC 9 STR on turn to remove.",
    category: "ride-along",
  },
  {
    name: "Crush",
    description:
      "Deals an extra die of damage if it hits the same target with both attacks.",
    category: "ride-along",
  },
  {
    name: "Disease",
    description:
      "DC 9 CON or 1d4 CON damage (can't heal while ill). Repeat check once per day; ends on success. Die at 0 CON.",
    category: "ride-along",
  },
  {
    name: "Disease (DC 12)",
    description:
      "DC 12 CON or 1d4 CON damage (can't heal while ill). Repeat check once per day; ends on success. Die at 0 CON.",
    category: "ride-along",
  },
  {
    name: "Dissolve",
    description: "One random piece of non-magical gear is destroyed.",
    category: "ride-along",
  },
  {
    name: "Drain (Shadow)",
    description:
      "DC 12 CON or target's STR reduced by 1. At 0 STR, target dies and becomes a shadow.",
    category: "ride-along",
  },
  {
    name: "Grab",
    description: "DC 12 STR or target held. DC 12 STR on turn to break free.",
    category: "ride-along",
  },
  {
    name: "Grab (DC 15)",
    description: "DC 15 STR or held in place. DC 15 STR to break free on turn.",
    category: "ride-along",
  },
  {
    name: "Gore",
    description:
      "Deals an extra die of damage if it hits the same target with both attacks.",
    category: "ride-along",
  },
  {
    name: "Knock",
    description: "DC 9 STR or pushed a close distance and fall down.",
    category: "ride-along",
  },
  {
    name: "Life Drain",
    description: "1d4 CON damage. Death if reduced to 0 CON.",
    category: "ride-along",
  },
  {
    name: "Lop",
    description: "On a natural attack roll of 18-20, behead the target.",
    category: "ride-along",
  },
  {
    name: "Lycanthropy",
    description:
      "If 12 or more damage from the same monster, contract lycanthropy.",
    category: "ride-along",
  },
  {
    name: "Paralyze",
    description: "DC 12 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Paralysis (DC 15)",
    description: "DC 15 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Petrify",
    description: "DC 12 CON or petrified.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 9, 1d4 damage)",
    description: "DC 9 CON or take 1d4 damage.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 9, drop to 0 HP)",
    description: "DC 9 CON or go to 0 HP.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 12, paralyzed)",
    description: "DC 12 CON or paralyzed 1d4 hours.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 12, sleep)",
    description: "DC 12 CON or fall into deep sleep for 1d4 hours.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, drop to 0 HP)",
    description: "DC 15 CON or go to 0 HP.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, paralyzed)",
    description: "DC 15 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Sever",
    description:
      "On a natural attack roll of 18+, the attack also severs a random limb. 1d6: 1. Head, 2-4. Arm, 5-6. Leg.",
    category: "ride-along",
  },
  {
    name: "Swallow",
    description:
      "DC 18 STR or swallowed whole. Total darkness inside and 4d10 damage per round. Monster regurgitates all swallowed if dealt at least 30 damage in one round to the inside of its gullet.",
    category: "ride-along",
  },
  {
    name: "Toxin",
    description: "DC 9 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Venom",
    description: "DC 9 CON or go to 0 HP.",
    category: "ride-along",
  },

  // THEMATIC TALENTS
  {
    name: "Animate Tree",
    description:
      "2/day. In place of attacks, one tree within near awakens as an ally without this ability. Reverts back in 1 day.",
    category: "thematic",
  },
  {
    name: "Bless",
    description: "3/day, touch one target to give it a luck token.",
    category: "thematic",
  },
  {
    name: "Breath, Fire (near)",
    description:
      "Fills a near-sized cube extending from monster. DC 15 DEX or 3d8 damage. Cannot use again for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Breath, Fire (double near)",
    description:
      "Fills a double near-sized cube extending from monster. DC 15 DEX or 6d10 damage.",
    category: "thematic",
  },
  {
    name: "Breath, Frost",
    description:
      "Fills a near-sized cube extending from monster. DC 15 DEX or 3d8 damage. Cannot use again for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Breath, Lightning",
    description:
      "A straight line (5' wide) extending double near from monster. DC 15 DEX or 4d8 damage (DISADV on check if wearing metal armor).",
    category: "thematic",
  },
  {
    name: "Breath, Poison",
    description:
      "Fills a near-sized cube extending from monster. DC 15 CON or 3d8 damage.",
    category: "thematic",
  },
  {
    name: "Change Shape (any creature)",
    description:
      "In place of attacks, transform into any similarly-sized creature.",
    category: "thematic",
  },
  {
    name: "Change Shape (humanoid)",
    description:
      "In place of attacks, transform into any similarly-sized humanoid.",
    category: "thematic",
  },
  {
    name: "Charge",
    description:
      "In place of attacks, move up to double near in a straight line and make 1 attack. If hit, x2 damage.",
    category: "thematic",
  },
  {
    name: "Charge (x3)",
    description:
      "Move up to double near in straight line and make 1 attack. If hit, x3 damage.",
    category: "thematic",
  },
  {
    name: "Charm",
    description: "Near, one creature, DC 14 CHA or friendship for 1d8 days.",
    category: "thematic",
  },
  {
    name: "Charm (control)",
    description:
      "One humanoid in near DC 15 CHA or bewitched by monster for 1d6 hours.",
    category: "thematic",
  },
  {
    name: "Darkness",
    description: "Extinguish all light sources in near.",
    category: "thematic",
  },
  {
    name: "Enlarge",
    description:
      "1/day, +1d6 damage on melee attacks and ADV on STR checks for 3 rounds.",
    category: "thematic",
  },
  {
    name: "Invisibility",
    description: "1/day, turn invisible for 3 rounds. Ends if monster attacks.",
    category: "thematic",
  },
  {
    name: "Leap",
    description:
      "Jump up to near in height and double near in distance, then make 2 bite attacks.",
    category: "thematic",
  },
  {
    name: "Mind Blast",
    description:
      "Fills a near-sized cube extending from monster. DC 15 INT or 3d6 damage and paralyzed 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Mind Control",
    description:
      "One target in near DC 15 CHA or monster controls for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Petrify (gaze)",
    description:
      "Any creature (including monster) who looks directly at monster, DC 15 CON or petrified.",
    category: "thematic",
  },
  {
    name: "Possess",
    description:
      "One target, close range. Contested Charisma check. If monster wins, it inhabits the target's body and controls its actions for 2d4 rounds.",
    category: "thematic",
  },
  {
    name: "Rage",
    description: "1/day, immune to morale checks, +1d4 damage (3 rounds).",
    category: "thematic",
  },
  {
    name: "Regenerate (fire/acid)",
    description:
      "Regains 2d6 HP on its turn unless its wounds are cauterized with fire or acid.",
    category: "thematic",
  },
  {
    name: "Relentless",
    description:
      "If monster reduced to 0 HP by a non-magical source, DC 15 CON to go to 1 HP instead.",
    category: "thematic",
  },
  {
    name: "Roar (paralyze)",
    description:
      "In place of attacks, all creatures who can hear within far DC 18 CHA or paralyzed 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Screech",
    description:
      "All enemies in double near DC 12 WIS or DISADV on checks and attacks for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Shapechange (bat/wolf)",
    description:
      "In place of attacks, turn into a giant bat, dire wolf, or back into regular form.",
    category: "thematic",
  },
  {
    name: "Song (dazed)",
    description:
      "Enemies who can hear within double near DC 12 CHA or dazed and drawn to monster for 1d4 rounds. Immune for 1 day if passed check.",
    category: "thematic",
  },
  {
    name: "Song (paralyzed)",
    description:
      "Enemies who can hear within double near DC 15 CHA or paralyzed 1d4 rounds. Immune for 1 day if passed check.",
    category: "thematic",
  },
  {
    name: "Split",
    description:
      "If cut or chopped, split into two smaller monsters (divide remaining HP between both). Can split up to four times.",
    category: "thematic",
  },
  {
    name: "Teleport",
    description:
      "3/day. Monster and everything in its possession magically transport to a place it can see within double near.",
    category: "thematic",
  },
  {
    name: "Terrify",
    description:
      "A creature who first sees monster's true form DC 15 CHA or DISADV on attacks 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Web",
    description:
      "One target stuck in place and 1d4 damage/round. DC 12 DEX to escape on turn.",
    category: "thematic",
  },
  {
    name: "Whirlwind",
    description:
      "All within close DC 15 DEX or flung 2d20 feet in random direction.",
    category: "thematic",
  },
];

/**
 * Get talents filtered by category
 */
export function getTalentsByCategory(category: TalentTemplate["category"]) {
  return SHADOWDARK_TALENTS.filter((t) => t.category === category);
}

/**
 * Search talents by name
 */
export function searchTalents(query: string): TalentTemplate[] {
  const lowerQuery = query.toLowerCase();
  return SHADOWDARK_TALENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery),
  );
}
