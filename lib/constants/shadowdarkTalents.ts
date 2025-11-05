/**
 * Shadowdark Monster Talents Library
 * Source: "Creating & Adapting Monsters for use in Shadowdark RPG" by Night Noon Games
 *
 * Complete talent bank organized by type:
 * - Innate: Passive abilities
 * - Ride-Along: Abilities that trigger on attacks
 * - Thematic: Special abilities that can be used in place of or in addition to attacks
 * - Spells: Monster spells
 */

export interface TalentTemplate {
  name: string;
  description: string;
  category: "innate" | "ride-along" | "thematic" | "spell";
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
    name: "Bound",
    description:
      "A secret, mundane contingency (such as the touch of a feather) ends the monster's magical servitude.",
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
    name: "Carrion Stench",
    description:
      "Living creatures DC 12 CON the first time within near or DISADV on attacks and spellcasting for 5 rounds.",
    category: "innate",
  },
  {
    name: "Carrion Tracker",
    description: "Can track dead flesh unerringly within a mile.",
    category: "innate",
  },
  {
    name: "Clever",
    description: "+1d4 damage when attacking with surprise.",
    category: "innate",
  },
  {
    name: "Corrosive (Metal)",
    description:
      "Metal that touches the monster is destroyed on a d6 roll of 1-3.",
    category: "innate",
  },
  {
    name: "Corrosive (Nonmagical metal)",
    description:
      "Nonmagical metal that touches the monster dissolves on a d6 roll of 1-3.",
    category: "innate",
  },
  {
    name: "Corrosive (Wood or metal)",
    description:
      "Wood or metal that touches the monster dissolves on a d6 roll of 1-3.",
    category: "innate",
  },
  {
    name: "Crown of Darkness",
    description:
      "All hostile spells are reflected at caster with a spellcasting check less than 20.",
    category: "innate",
  },
  {
    name: "Crown of Fire",
    description:
      "Hostile spells targeting the monster are extreme (DC 18) to cast.",
    category: "innate",
  },
  {
    name: "Crown of Gehemna",
    description: "3/day, cause a spell being cast within far to fail.",
    category: "innate",
  },
  {
    name: "Curse (Priest healing)",
    description: "Melee damage can only be healed by level 5+ priest.",
    category: "innate",
  },
  {
    name: "Deep Dweller",
    description: "Immune to harm from fire and cold. Amphibious.",
    category: "innate",
  },
  {
    name: "Desiccated",
    description: "Can be damaged by fire. Takes x2 damage from it.",
    category: "innate",
  },
  {
    name: "Execute",
    description: "Deals x3 damage against surprised targets.",
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
    name: "Gibbering",
    description:
      "Creatures within near DC 12 WIS on turn or take a random action (d8): 1-3. do nothing, 4-5. move in random direction, 6-7. attack nearest creature, 8. flee.",
    category: "innate",
  },
  {
    name: "Godborn",
    description: "Hostile spells targeting the monster are DC 15 to cast.",
    category: "innate",
  },
  {
    name: "Golem (Cold/nonmagical, healed by fire)",
    description:
      "Immune to damage from cold or non-magical sources. Healed by fire.",
    category: "innate",
  },
  {
    name: "Golem (Fire/cold/electricity/nonmagical)",
    description:
      "Immune to damage from fire, cold, electricity, or non-magical sources.",
    category: "innate",
  },
  {
    name: "Golem (Fire/cold/electricity/nonmagical, healed by acid)",
    description:
      "Immune to damage from fire, cold, electricity, or non-magical sources. Healed by acid.",
    category: "innate",
  },
  {
    name: "Golem (Fire/cold/nonmagical, healed by electricity)",
    description:
      "Immune to damage from fire, cold, or non-magical sources. Healed by electricity.",
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
    name: "Heads (Hydra)",
    description:
      "Choose how many heads the monster has. Each is LV 2, AC 15, and can make 1 attack. A killed head sprouts into two new heads at the start of the monster's turn unless cauterized beforehand. Treat the monster's LV as all the heads combined.",
    category: "innate",
  },
  {
    name: "Hear Thoughts",
    description:
      "Can hear the surface thoughts of all intelligent creatures within near.",
    category: "innate",
  },
  {
    name: "Heat Aura (1d8)",
    description: "Creatures in close DC 12 CON on turn or 1d8 damage.",
    category: "innate",
  },
  {
    name: "Heat Aura (2d6)",
    description:
      "Creatures within near of monster at start of turn DC 15 CON or 2d6 damage.",
    category: "innate",
  },
  {
    name: "Ice Aura",
    description: "Enemies within near of monster DC 12 CON or lose action.",
    category: "innate",
  },
  {
    name: "Impervious (Magic only)",
    description: "Can only be harmed by magical sources.",
    category: "innate",
  },
  {
    name: "Impervious (Cold)",
    description: "Cold immune.",
    category: "innate",
  },
  {
    name: "Impervious (Electricity)",
    description: "Electricity immune.",
    category: "innate",
  },
  {
    name: "Impervious (Fire)",
    description: "Fire immune.",
    category: "innate",
  },
  {
    name: "Impervious (Fire, healed by electricity)",
    description: "Fire immune. Healed by electricity.",
    category: "innate",
  },
  {
    name: "Impervious (Fire/magical only)",
    description: "Fire immune. Only damaged by magical sources.",
    category: "innate",
  },
  {
    name: "Impervious (Cold and fire)",
    description: "Immune to cold and fire.",
    category: "innate",
  },
  {
    name: "Impervious (Acid/cold/fire)",
    description: "Immune to damage from acid, cold, or fire.",
    category: "innate",
  },
  {
    name: "Impervious (Fire/magical only)",
    description: "Immune to fire. Only damaged by magical sources.",
    category: "innate",
  },
  {
    name: "Impervious (Silver or magic)",
    description: "Only damaged by silver or magic sources.",
    category: "innate",
  },
  {
    name: "Impervious (Fire only)",
    description: "Only harmed by fire.",
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
    name: "Legendary",
    description:
      "Only damaged by magical sources. Hostile spells targeting monster are DC 18 to cast.",
    category: "innate",
  },
  {
    name: "Legendary Undead",
    description:
      "Immune to morale checks. Only damaged by magical sources. Hostile spells targeting monster are DC 18 to cast.",
    category: "innate",
  },
  {
    name: "Melt",
    description:
      "Non-magical metal objects that touch the monster melt on a d6 roll of 1-3.",
    category: "innate",
  },
  {
    name: "Moonlight Aura",
    description: "Hostile spells targeting the monster are DC 15.",
    category: "innate",
  },
  {
    name: "Pack Hunter",
    description: "Deals +1 damage while an ally is close.",
    category: "innate",
  },
  {
    name: "Permanent Death",
    description:
      "Cannot be permanently killed unless a wish spell is cast on it while it is at 0 HP.",
    category: "innate",
  },
  {
    name: "Phalanx",
    description:
      "+1 to attacks and AC when in close range of an allied monster.",
    category: "innate",
  },
  {
    name: "Phylactery",
    description: "Can't be killed while spirit vessel (an object) is intact.",
    category: "innate",
  },
  {
    name: "Rebirth",
    description:
      "A red-hot egg remains after death. Monster hatches from it in 1d4 days.",
    category: "innate",
  },
  {
    name: "Reckoning",
    description:
      "Any creature who steals from monster develops a curse. Over the next 2d8 days, that creature turns into a cockatrice. This curse can only be lifted by a wish spell or by returning the stolen goods.",
    category: "innate",
  },
  {
    name: "Reflective Carapace",
    description:
      "Immune to rays, blasts, or bolts of energy. 1:6 chance these are reflected back at their originator.",
    category: "innate",
  },
  {
    name: "Regenerate (Acid)",
    description:
      "Regains 2d6 HP on its turn unless its wounds are cauterized with acid.",
    category: "innate",
  },
  {
    name: "Regenerate (Fire or acid)",
    description:
      "Regains 2d6 HP on its turn unless its wounds are cauterized with fire or acid.",
    category: "innate",
  },
  {
    name: "Regeneration (4d10)",
    description: "Regains 4d10 lost HP at the beginning of its turn.",
    category: "innate",
  },
  {
    name: "Relentless",
    description:
      "If monster reduced to 0 HP by a non-magical source, DC 15 CON to go to 1 HP instead.",
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
    name: "Slippery",
    description: "Hostile spells targeting monster are DC 15 to cast.",
    category: "innate",
  },
  {
    name: "Spikes",
    description: "Monster has 4d6 tail spikes. They regrow each day.",
    category: "innate",
  },
  {
    name: "Split",
    description:
      "If cut or chopped, split into two smaller monsters (divide remaining HP between both). Can split up to four times.",
    category: "innate",
  },
  {
    name: "Statue",
    description: "When standing still, looks exactly like a suit of armor.",
    category: "innate",
  },
  {
    name: "Stealthy (Sneak and hide)",
    description: "ADV on checks to sneak and hide.",
    category: "innate",
  },
  {
    name: "Stealthy (DEX)",
    description: "ADV on DEX checks to hide and sneak.",
    category: "innate",
  },
  {
    name: "Stone Hide",
    description: "Half damage from stabbing and cutting weapons.",
    category: "innate",
  },
  {
    name: "Stormblood",
    description: "Electricity immune.",
    category: "innate",
  },
  {
    name: "Strange Lands",
    description:
      "Monster does not suffer any ill effects from the natural environment it does not wish to suffer.",
    category: "innate",
  },
  {
    name: "Strangle",
    description: "Deals x2 damage against surprised creatures.",
    category: "innate",
  },
  {
    name: "Stumpy",
    description: "ADV on STR checks to grab or drag other creatures.",
    category: "innate",
  },
  {
    name: "Sunblind",
    description: "Blinded in bright light.",
    category: "innate",
  },
  {
    name: "Supreme Undead",
    description: "Immune to morale checks. Only damaged by magical sources.",
    category: "innate",
  },
  {
    name: "Telepathic (Read thoughts)",
    description: "Read the thoughts of all creatures within far.",
    category: "innate",
  },
  {
    name: "Telepathic (Speak)",
    description: "Speak mentally with creatures within double near.",
    category: "innate",
  },
  {
    name: "Telepathy (Hear thoughts)",
    description:
      "Can secretly hear the surface thoughts of all humanoids within near.",
    category: "innate",
  },
  {
    name: "Tendrils",
    description: "Four total. AC 18 each. 4+ damage to one severs it.",
    category: "innate",
  },
  {
    name: "Terrify",
    description:
      "A creature who first sees monster's true form DC 15 CHA or DISADV on attacks 1d4 rounds.",
    category: "innate",
  },
  {
    name: "Thick Fur",
    description: "Cold immune.",
    category: "innate",
  },
  {
    name: "Tracking",
    description: "Can always sense the direction of its chosen quarry.",
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
    name: "Ur-Vampire",
    description:
      "Must sleep in sarcophagus at least once per moon cycle or loses 2d8 HP per day that cannot heal until sleeping in sarcophagus. Takes 3d8 damage each round while in direct sunlight. Cannot be killed unless pierced through heart while at 0 HP with a wooden stake carved from a tree from the Tal-Yool jungle.",
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
    name: "Barb",
    description:
      "Each spine sticks, dealing 1d4 damage each round. DC 12 STR check on turn to remove.",
    category: "ride-along",
  },
  {
    name: "Berserk",
    description:
      "When at or below 20 HP, +1 attack and attacks deal double damage.",
    category: "ride-along",
  },
  {
    name: "Blind",
    description: "One target within near DC 15 CHA or blinded for 1d4 days.",
    category: "ride-along",
  },
  {
    name: "Blood Drain (Attach)",
    description:
      "Attach to bitten target; auto-hit the next round. DC 9 STR on turn to remove.",
    category: "ride-along",
  },
  {
    name: "Blood Drain (Vampire)",
    description:
      "Monster heals 2d8 HP, target loses 1d6 CON. At 0 CON, target dies and rises as a loyal vampire or vampire spawn (monster chooses).",
    category: "ride-along",
  },
  {
    name: "Blood Drain (Vampire spawn)",
    description:
      "Monster heals 2d6 HP and target loses 1d4 CON. At 0 CON, target dies and rises as an allied vampire spawn.",
    category: "ride-along",
  },
  {
    name: "Carrion Mist",
    description:
      "Each time monster is hit, 3:6 chance of carrion mist in near-sized cube centered on monster. All enemies DC 15 CON or violent vomiting 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Constrict",
    description: "Contested STR to hold target immobile for one round.",
    category: "ride-along",
  },
  {
    name: "Crush (DC 15, 1d8)",
    description: "DC 15 STR or target takes 1d8 damage.",
    category: "ride-along",
  },
  {
    name: "Crush (DC 15, 2d8)",
    description: "DC 15 STR or target takes 2d8 damage.",
    category: "ride-along",
  },
  {
    name: "Crush (Extra die)",
    description:
      "Deals an extra die of damage if it hits the same target with both attacks.",
    category: "ride-along",
  },
  {
    name: "Crush (Objects)",
    description: "Attacks deal double damage against objects.",
    category: "ride-along",
  },
  {
    name: "Curse (Deep one)",
    description:
      "DC 15 CON or target gains a magical curse, turning into a deep one over 2d10 days.",
    category: "ride-along",
  },
  {
    name: "Disease (DC 9)",
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
    name: "Disease (DC 15)",
    description:
      "DC 15 CON or infected. DC 15 CON each day or lose 1d6 HP (can't heal). Ends on success.",
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
    name: "Drain (WIS)",
    description:
      "The target takes 1d6 temporary WIS damage. A target reduced to 0 WIS this way swears its soul to monster.",
    category: "ride-along",
  },
  {
    name: "Engulf (DC 12)",
    description:
      "DC 12 STR or trapped inside monster. Attack auto-hits engulfed targets each round. DC 12 STR on turn to escape. Fail checks if paralyzed.",
    category: "ride-along",
  },
  {
    name: "Engulf (DC 15, suffocate)",
    description:
      "If a target is hit by both attacks in same round, it is pulled into monster's body and suffocates in 2d4 rounds. DC 15 STR on turn to escape.",
    category: "ride-along",
  },
  {
    name: "Explosion",
    description:
      "Upon death, creatures within double near of monster DC 18 DEX or 10d6 damage.",
    category: "ride-along",
  },
  {
    name: "Gore",
    description:
      "Deals an extra die of damage if it hits the same target with both attacks.",
    category: "ride-along",
  },
  {
    name: "Grab (DC 12)",
    description: "DC 12 STR or target held. DC 12 STR on turn to break free.",
    category: "ride-along",
  },
  {
    name: "Grab (DC 15)",
    description: "DC 15 STR or held in place. DC 15 STR to break free on turn.",
    category: "ride-along",
  },
  {
    name: "Grab (DC 15, immobilized)",
    description:
      "DC 15 STR or immobilized. Attack auto-hits each round. DC 15 STR on turn to break free.",
    category: "ride-along",
  },
  {
    name: "Grab (DC 15, trapped)",
    description:
      "DC 15 STR or target trapped in place. Attack auto-hits target next round. DC 15 STR on turn to break free.",
    category: "ride-along",
  },
  {
    name: "Grab (DC 18, whip)",
    description:
      "DC 18 STR or target bound in whip. 2d6 damage per round held, DC 18 STR to break free on turn. In place of attack, monster can fling a grabbed target double near on its turn.",
    category: "ride-along",
  },
  {
    name: "Grab (DC 18)",
    description: "DC 18 STR or target held. DC 18 STR on turn to break free.",
    category: "ride-along",
  },
  {
    name: "Grab (Tongue)",
    description:
      "One target in near DC 15 STR or wrapped in monster's tongue and pulled into its mouth. Attacks automatically hit the target. Can only grab 1 target at a time. DC 15 STR on turn to break free.",
    category: "ride-along",
  },
  {
    name: "Grab (Immobilized)",
    description:
      "Target is immobilized. DC 15 STR check on turn to break free.",
    category: "ride-along",
  },
  {
    name: "Hellfire",
    description: "DC 18 DEX or 2d8 damage per round until flames extinguished.",
    category: "ride-along",
  },
  {
    name: "Knock",
    description: "DC 9 STR or pushed a close distance and fall down.",
    category: "ride-along",
  },
  {
    name: "Latch",
    description:
      "Attach to bitten target; attacks auto-hit next round. DC 12 STR on turn to tear off.",
    category: "ride-along",
  },
  {
    name: "Latch (Tentacles)",
    description:
      "Tentacles attach to hit targets, automatically hitting the next round (DC 12 STR to remove 1d4 tentacles). If all four remain latched onto the same humanoid target for 1 round, the target's brain is ripped out and devoured.",
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
    name: "Necrosis",
    description:
      "DC 15 CON or drop to 0 HP. Healing spells are DC 15 to cast on target while affected by necrosis.",
    category: "ride-along",
  },
  {
    name: "Paralyze (DC 12)",
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
    name: "Poison (DC 9, 0 HP)",
    description: "DC 9 CON or go to 0 HP.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 9, 1d4 damage)",
    description: "DC 9 CON or take 1d4 damage.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 12, 0 HP in 1d4 rounds)",
    description: "DC 12 CON or drop to 0 HP in 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 12, deep sleep)",
    description: "DC 12 CON or fall into deep sleep for 1d4 hours.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 12, fitful sleep)",
    description: "DC 12 CON or fitful sleep for 1d4 hours.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 12, 0 HP)",
    description: "DC 12 CON or go to 0 HP.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 12, paralyzed)",
    description: "DC 12 CON or paralyzed 1d4 hours.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, 0 HP in 1d4 rounds)",
    description: "DC 15 CON or drop to 0 hit points in 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, deep sleep)",
    description: "DC 15 CON or fall into natural, deep sleep for 1d8 hours.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, 0 HP)",
    description: "DC 15 CON or go to 0 HP.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, paralyzed)",
    description: "DC 15 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, sleep)",
    description: "DC 15 CON or sleep.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, 2d10 damage)",
    description: "DC 15 CON or take 2d10 damage.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 15, turn on allies)",
    description:
      "DC 15 CON or target's eyes go jet black and it turns on its allies for 1d4 rounds. DC 15 WIS on turn to end effect.",
    category: "ride-along",
  },
  {
    name: "Poison (DC 18, 0 HP with death timer)",
    description: "DC 18 CON or go to 0 HP with a death timer of 1.",
    category: "ride-along",
  },
  {
    name: "Sever",
    description:
      "On a natural attack roll of 18+, the attack also severs a random limb. 1d6: 1. Head, 2-4. Arm, 5-6. Leg.",
    category: "ride-along",
  },
  {
    name: "Stick",
    description:
      "DC 15 STR or adhere to target; auto-hit with bite. DC 15 STR on turn to remove.",
    category: "ride-along",
  },
  {
    name: "Swallow (DC 18, 4d10)",
    description:
      "DC 18 STR or swallowed whole. Total darkness inside and 4d10 damage per round. Monster regurgitates all swallowed if dealt at least 30 damage in one round to the inside of its gullet.",
    category: "ride-along",
  },
  {
    name: "Swallow (Natural 18-20, 2d10)",
    description:
      "On a natural attack roll of 18-20, target is swallowed. Total darkness inside and 2d10 damage per round. Monster regurgitates all swallowed if dealt at least 20 damage in one round to the inside of its gullet.",
    category: "ride-along",
  },
  {
    name: "Tongue",
    description: "1 creature in near DC 12 DEX or pulled to close range.",
    category: "ride-along",
  },
  {
    name: "Toxin (DC 9, paralyzed)",
    description: "DC 9 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Toxin (DC 12, paralyzed)",
    description: "DC 12 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Toxin (DC 12, unconscious)",
    description: "DC 12 CON or unconscious for 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Toxin (DC 15, paralyzed)",
    description: "DC 15 CON or paralyzed 1d4 rounds.",
    category: "ride-along",
  },
  {
    name: "Venom",
    description: "DC 9 CON or go to 0 HP.",
    category: "ride-along",
  },

  // THEMATIC TALENTS
  {
    name: "Amulet of Rahm-Hotep",
    description:
      "In place of attacks, teleport to a random location in the multiverse.",
    category: "thematic",
  },
  {
    name: "Animate Plants",
    description:
      "1/day, in place of attacks. Vines grab at all enemies within double near of monster. DC 15 DEX or unable to move 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Animate Tree",
    description:
      "2/day. In place of attacks, one tree within near awakens as an ally without this ability. Reverts back in 1 day.",
    category: "thematic",
  },
  {
    name: "Avalanche",
    description:
      "All within close DC 15 STR or entombed for 1d4 rounds under mounds of earth.",
    category: "thematic",
  },
  {
    name: "Bewilder",
    description:
      "Creatures within near that see the monster's eyes, DC 12 CHA at start of their turn or dazed and no action.",
    category: "thematic",
  },
  {
    name: "Bless",
    description: "3/day, touch one target to give it a luck token.",
    category: "thematic",
  },
  {
    name: "Bottomless Bag",
    description:
      "Contains 200 gear slots in magical sub-pockets. Weighs as much as a normal backpack. Monster can summon it to themselves from anywhere by snapping their fingers.",
    category: "thematic",
  },
  {
    name: "Breath, Fire (double near, 6d10)",
    description:
      "Fills a double near-sized cube extending from monster. DC 15 DEX or 6d10 damage.",
    category: "thematic",
  },
  {
    name: "Breath, Fire (near, 4d6)",
    description:
      "Fills a near-sized cube extending from monster. DC 15 DEX or 4d6 damage.",
    category: "thematic",
  },
  {
    name: "Breath, Fire (near, 3d8)",
    description:
      "Fills a near-sized cube extending from monster. DC 15 DEX or 3d8 damage. Cannot use again for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Breath, Frost",
    description:
      "Fills a near-sized cube extending from monster. DC 15 DEX or 3d8 damage. Cannot use again for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Breath, Ice",
    description:
      "Fills a double near-sized cube extending from monster. DC 15 DEX or 4d8 damage and frozen for 1 round.",
    category: "thematic",
  },
  {
    name: "Breath, Lightning",
    description:
      "A straight line (5' wide) extending double near from monster. DC 15 DEX or 4d8 damage (DISADV on check if wearing metal armor).",
    category: "thematic",
  },
  {
    name: "Breath, Petrifying",
    description:
      "Fills a near-sized cube extending from monster. DC 15 CON or petrified (monsters immune).",
    category: "thematic",
  },
  {
    name: "Breath, Poison (8d6)",
    description: "All within near, DC 15 CON or 8d6 damage.",
    category: "thematic",
  },
  {
    name: "Breath, Poison (3d8)",
    description:
      "Fills a near-sized cube extending from monster. DC 15 CON or 3d8 damage.",
    category: "thematic",
  },
  {
    name: "Breath, Smog",
    description:
      "Fills a near-sized cube extending from monster. DC 15 CON or 2d10 damage and blinded for 1 round.",
    category: "thematic",
  },
  {
    name: "Breath, Steam",
    description:
      "Fills a double near-sized cube extending from monster. DC 15 DEX or 4d12 damage.",
    category: "thematic",
  },
  {
    name: "Change Shape (Any creature)",
    description:
      "In place of attacks, transform into any similarly-sized creature.",
    category: "thematic",
  },
  {
    name: "Change Shape (Humanoid)",
    description:
      "In place of attacks, transform into any similarly-sized humanoid.",
    category: "thematic",
  },
  {
    name: "Charge (x2)",
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
    name: "Charm (Friendship)",
    description: "Near, one creature, DC 14 CHA or friendship for 1d8 days.",
    category: "thematic",
  },
  {
    name: "Charm (Bewitched)",
    description:
      "One humanoid in near DC 15 CHA or bewitched by monster for 1d6 hours.",
    category: "thematic",
  },
  {
    name: "Charm (Control)",
    description:
      "One humanoid target who can see monster within near, DC 15 CHA or under monster's control for 1d4 days.",
    category: "thematic",
  },
  {
    name: "Command",
    description: "DC 18 CHA to resist an monster's command.",
    category: "thematic",
  },
  {
    name: "Contract",
    description:
      "Can grant mighty boons and patronage on behalf of an monster in exchange for a sworn soul. ADV on related Charisma checks.",
    category: "thematic",
  },
  {
    name: "Darkness",
    description: "Extinguish all light sources in near.",
    category: "thematic",
  },
  {
    name: "Dice of Truth",
    description:
      "A set of three six-sided dice whose rolls cannot be magically or mundanely altered in any way.",
    category: "thematic",
  },
  {
    name: "Dodge",
    description: "1/day, an attack that would hit misses instead.",
    category: "thematic",
  },
  {
    name: "Drink Pain",
    description:
      "Near range. DC 12 CHA to deal 2d4 damage to a creature; regain that many HP.",
    category: "thematic",
  },
  {
    name: "Enlarge",
    description:
      "1/day, +1d6 damage on melee attacks and ADV on STR checks for 3 rounds.",
    category: "thematic",
  },
  {
    name: "Enslave",
    description:
      "In place of attacks, one creature within far DC 15 WIS or monster controls for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Eyestalk Ray",
    description:
      "Each ray can shoot once per round and target one creature or an object up to 1,000 pounds (up to four on same target).",
    category: "thematic",
  },
  {
    name: "Gas",
    description: "All in near DC 12 CON or blinded for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Healing Horn",
    description: "A touch heals 2d6 HP or ends one curse or disease.",
    category: "thematic",
  },
  {
    name: "Horn (Paralyze)",
    description: "All enemies in near DC 15 CHA or paralyzed 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Inferno",
    description: "All within near DC 15 DEX or 3d8 damage.",
    category: "thematic",
  },
  {
    name: "Ink",
    description:
      "In place of attacks, ink cloud blinds all in near for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Invisibility (1/day)",
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
    name: "Lightning Bolt",
    description:
      "Straight line (5' wide) extending far from monster. DC 15 DEX or 6d6 damage.",
    category: "thematic",
  },
  {
    name: "Meld",
    description: "Step inside bonded tree.",
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
    name: "Mirage",
    description:
      "1/day, in place of attacks. Create 3 illusory duplicates that disappear when hit. Determine randomly if an attack hits monster or illusions.",
    category: "thematic",
  },
  {
    name: "Oath",
    description: "3/day, ADV on a roll made in service of monster's order.",
    category: "thematic",
  },
  {
    name: "Parry",
    description:
      "Trade 2 weapons attacks next round to deflect a melee attack that would hit.",
    category: "thematic",
  },
  {
    name: "Petrify (Gaze)",
    description:
      "Any creature (including monster) who looks directly at monster, DC 15 CON or petrified.",
    category: "thematic",
  },
  {
    name: "Phantoms",
    description:
      "1/day, in place of attacks. Create 3 illusory duplicates that disappear when hit. Determine randomly if an attack hits monster or illusions.",
    category: "thematic",
  },
  {
    name: "Phase",
    description: "Once per round, become corporeal or incorporeal.",
    category: "thematic",
  },
  {
    name: "Poison Web",
    description:
      "One target stuck in place and 1d4 damage/round. DC 12 DEX to escape on turn.",
    category: "thematic",
  },
  {
    name: "Possess",
    description:
      "One target, close range. Contested Charisma check. If monster wins, it inhabits the target's body and controls its actions for 2d4 rounds.",
    category: "thematic",
  },
  {
    name: "Pull",
    description:
      "In place of an attack, pull a grabbed target a near distance.",
    category: "thematic",
  },
  {
    name: "Rage",
    description: "1/day, immune to morale checks, +1d4 damage (3 rounds).",
    category: "thematic",
  },
  {
    name: "Rampage",
    description:
      "In place of attacks, move far in a straight line and make one bite attack. On a hit, triple damage.",
    category: "thematic",
  },
  {
    name: "Restore",
    description:
      "In place of attacks, touch one creature to remove a curse, affliction, or heal 3d8 HP.",
    category: "thematic",
  },
  {
    name: "Roar (Blind and speechless)",
    description:
      "In place of attacks, all creatures who can hear within far DC 18 CHA or be rendered blind and speechless for 1d4 days.",
    category: "thematic",
  },
  {
    name: "Roar (Paralyzed)",
    description:
      "In place of attacks, all creatures who can hear within far DC 18 CHA or paralyzed 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Scream",
    description:
      "Creatures who hear in double near DC 12 CHA or paralyzed for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Screech (DISADV)",
    description:
      "All enemies in double near DC 12 WIS or DISADV on checks and attacks for 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Screech (DISADV 2)",
    description:
      "Enemies within double near DC 15 WIS or DISADV on attacks and checks 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Shapechange (Bat/wolf)",
    description:
      "In place of attacks, turn into a giant bat, dire wolf, or back into regular form.",
    category: "thematic",
  },
  {
    name: "Shapechange (Any humanoid)",
    description: "Instantly change to look like any other humanoid.",
    category: "thematic",
  },
  {
    name: "Shapeshift (Humanoid)",
    description:
      "In place of attacks, turn into any humanoid or back into original form.",
    category: "thematic",
  },
  {
    name: "Slow",
    description: "Far range, one target. DC 15 CON or speed halved 1d4 rounds.",
    category: "thematic",
  },
  {
    name: "Song (Dazed)",
    description:
      "Enemies who can hear within double near DC 12 CHA or dazed and drawn to monster for 1d4 rounds. Immune for 1 day if passed check.",
    category: "thematic",
  },
  {
    name: "Song (Paralyzed)",
    description:
      "Enemies who can hear within double near DC 15 CHA or paralyzed 1d4 rounds. Immune for 1 day if passed check.",
    category: "thematic",
  },
  {
    name: "Soulbind",
    description:
      "All targets within near DC 20 CHA or fall under control of monster for 1d4 rounds. DC 20 CHA each turn to end the effect.",
    category: "thematic",
  },
  {
    name: "Stone Meld",
    description: "2/day, underground only. Turn invisible for 3 rounds.",
    category: "thematic",
  },
  {
    name: "Storm",
    description:
      "Seas become violently turbulent in 1 mile radius around monster. Lasts 2d4 rounds. Seaborne vessels have a 1:6 chance of capsizing each round.",
    category: "thematic",
  },
  {
    name: "Wall of Flame",
    description:
      "1/day, 20' high curtain of fire, double near length. Touching it deals 4d8 damage. Lasts 2d4 rounds.",
    category: "thematic",
  },
  {
    name: "Water Spout",
    description:
      "Fills a near-sized cube within far. DC 15 STR or creatures inside flung 2d100 feet in a random direction.",
    category: "thematic",
  },
  {
    name: "Whirlpool",
    description:
      "All within close DC 15 STR or immobilized inside monster (treat as underwater). DC 15 STR to escape on turn.",
    category: "thematic",
  },
  {
    name: "Whirlwind (2d20)",
    description:
      "All within close DC 15 DEX or flung 2d20 feet in random direction.",
    category: "thematic",
  },
  {
    name: "Whirlwind (Tornado, 2d100)",
    description:
      "Transform into a lashing tornado. All enemies within near DC 18 DEX or thrown 2d100 feet in a random direction.",
    category: "thematic",
  },
  {
    name: "Wish",
    description:
      "Cast wish once per week for a mortal without making a spellcasting check.",
    category: "thematic",
  },

  // MONSTER SPELLS
  {
    name: "Abjure (WIS Spell)",
    description:
      "DC 13. Self. End any hostile magical effects affecting monster.",
    category: "spell",
  },
  {
    name: "Abolish (WIS Spell)",
    description: "DC 13. One target in far takes 5d8 damage.",
    category: "spell",
  },
  {
    name: "Absorb (INT Spell)",
    description:
      "DC 13. Near, one target. Target loses the ability to cast one random spell until completing a rest, and monster regains a lost spell of the same tier or less.",
    category: "spell",
  },
  {
    name: "Agony (CHA Spell)",
    description: "DC 14. One target in near takes 3d8 damage.",
    category: "spell",
  },
  {
    name: "Anchor (WIS Spell)",
    description:
      "DC 14. One target in far DC 18 STR or bound and anchored by chains of golden runes for 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Anoint (WIS Spell)",
    description:
      "DC 12. Close. One weapon or armor becomes a magic +2 version for 10 rounds.",
    category: "spell",
  },
  {
    name: "Arcane Armor (INT Spell)",
    description: "Self. DC 12. AC 16 for 2d4 rounds.",
    category: "spell",
  },
  {
    name: "Banish (INT Spell)",
    description:
      "DC 14. All extradimensional creatures within near DC 15 CHA or sent back to their home planes.",
    category: "spell",
  },
  {
    name: "Barkskin (INT Spell)",
    description: "Self. DC 13. AC becomes 15 for 5 rounds.",
    category: "spell",
  },
  {
    name: "Beguile (INT Spell)",
    description:
      "DC 11. Focus. One target in near of LV 2 or less is stupefied for the duration.",
    category: "spell",
  },
  {
    name: "Bind (INT Spell)",
    description: "DC 12. One humanoid in far paralyzed 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Blast (INT Spell, 2d6)",
    description: "DC 12. Far, one target. 2d6 damage.",
    category: "spell",
  },
  {
    name: "Blast (INT Spell, 5d8)",
    description: "DC 14. One creature in near takes 5d8 damage.",
    category: "spell",
  },
  {
    name: "Bug Brain (WIS Spell)",
    description:
      "DC 13. Near range, one target. Target's INT drops to 1 for 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Cancel (INT Spell)",
    description: "DC 13. End one spell affecting a target within near.",
    category: "spell",
  },
  {
    name: "Conjure Flames (INT Spell)",
    description: "DC 12. One target in far takes 2d6 damage.",
    category: "spell",
  },
  {
    name: "Death Bolt (INT Spell)",
    description:
      "DC 15. One target of LV 9 or less within near DC 15 CON or go to 0 HP.",
    category: "spell",
  },
  {
    name: "Deathtouch (WIS Spell)",
    description: "DC 12. 2d4 damage to one creature within close.",
    category: "spell",
  },
  {
    name: "Enervate (INT Spell)",
    description:
      "DC 14. Focus. One target within near is stupefied for the duration.",
    category: "spell",
  },
  {
    name: "Fade (CHA Spell)",
    description: "DC 13. Self. Become invisible for 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Fireblast (INT Spell)",
    description:
      "DC 14. 4d6 damage to all within a near-sized cube within far.",
    category: "spell",
  },
  {
    name: "Flight (INT Spell)",
    description: "Self. DC 13. Fly double near for 5 rounds.",
    category: "spell",
  },
  {
    name: "Float (INT Spell)",
    description: "Self. DC 14. Fly double near for 5 rounds.",
    category: "spell",
  },
  {
    name: "Fool's Gold (CHA Spell)",
    description:
      "DC 12. Close. One small object or small group of similar objects. Turn objects into silver or gold pieces. Lasts 1 day.",
    category: "spell",
  },
  {
    name: "Gate (WIS Spell)",
    description:
      "DC 14. Open a portal at a point within near to another location on any plane. Lasts 1d6 rounds or until dismissed.",
    category: "spell",
  },
  {
    name: "Healing Touch (WIS Spell, 1d4)",
    description: "DC 11. Heal one creature within close for 1d4 HP.",
    category: "spell",
  },
  {
    name: "Healing Touch (WIS Spell, 2d4)",
    description: "DC 11. Heal one creature within close for 2d4 HP.",
    category: "spell",
  },
  {
    name: "Hellfrost (CHA Spell)",
    description:
      "DC 13. All within near-sized cube extending from monster 3d6 damage.",
    category: "spell",
  },
  {
    name: "Hiss (INT Spell)",
    description: "DC 12. End one spell within far.",
    category: "spell",
  },
  {
    name: "Holy Flame (WIS Spell)",
    description:
      "DC 13. Self. Weapons ignite in magic flames and deal an additional 1d6 damage for 5 rounds.",
    category: "spell",
  },
  {
    name: "Hypnotize (CHA Spell)",
    description:
      "DC 13. Focus. One target in near range who can see monster is helplessly stupefied for duration.",
    category: "spell",
  },
  {
    name: "Illusion (CHA Spell)",
    description:
      "DC 11. Create a convincing visual and/or auditory illusion within near. Lasts until dismissed.",
    category: "spell",
  },
  {
    name: "Imbue (INT Spell)",
    description: "Self. DC 13. Staff becomes a +3 magic weapon for 10 rounds.",
    category: "spell",
  },
  {
    name: "Invisibility (CHA Spell)",
    description: "DC 12. Self. Become invisible for 2d4 rounds.",
    category: "spell",
  },
  {
    name: "Levitate (INT Spell)",
    description:
      "DC 12. Close. Focus. Hover near for duration, vertical movement only.",
    category: "spell",
  },
  {
    name: "Magic Bolt (INT Spell)",
    description: "DC 11. 1d4 damage to one target within far.",
    category: "spell",
  },
  {
    name: "Mist (CHA Spell)",
    description:
      "DC 13. Self. Turn into mist that can fly double near. Lasts 2d4 rounds.",
    category: "spell",
  },
  {
    name: "Mithralskin (INT Spell)",
    description: "Self. DC 14. AC becomes 18 for 5 rounds.",
    category: "spell",
  },
  {
    name: "Null (INT Spell)",
    description:
      "Self. DC 14. Hostile spells targeting monster are DC 18 to cast. Lasts 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Omens (WIS Spell)",
    description: "DC 12. Self. ADV on all actions for 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Phase (INT Spell)",
    description: "DC 13. Self. Teleport up to one mile.",
    category: "spell",
  },
  {
    name: "Portent (WIS Spell)",
    description:
      "DC 14. Lasts 2d4 rounds. One target in near has advantage or disadvantage on all attack rolls and checks.",
    category: "spell",
  },
  {
    name: "Rebuke (WIS Spell)",
    description:
      "DC 13. Focus. Chaotic creatures cannot attack monster or come within near range for duration.",
    category: "spell",
  },
  {
    name: "Riddle (WIS Spell)",
    description: "DC 12. One target in far DC 15 INT or stupefied 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Shadow Leap (INT Spell)",
    description: "Self. DC 14. Teleport up to 100 miles.",
    category: "spell",
  },
  {
    name: "Sigil of Doom (INT Spell)",
    description:
      "DC 15. One target of LV 9 or less within near DC 15 CON or go to 0 HP.",
    category: "spell",
  },
  {
    name: "Skitter (WIS Spell)",
    description: "DC 12. Self. Climb like a spider for 5 rounds.",
    category: "spell",
  },
  {
    name: "Snare (INT Spell)",
    description:
      "DC 13. Focus. One humanoid target within near paralyzed for duration.",
    category: "spell",
  },
  {
    name: "Snuff (WIS Spell)",
    description:
      "DC 12. Extinguish all light sources (even magical) within near.",
    category: "spell",
  },
  {
    name: "Spider Swarm (CHA Spell)",
    description:
      "DC 12. A spider swarm appears within near. Stays 1d4 rounds. Follows monster's commands.",
    category: "spell",
  },
  {
    name: "Sting (CHA Spell)",
    description:
      "DC 11. Near range, one target. 1d6 damage and target has DISADV on next attack roll or check.",
    category: "spell",
  },
  {
    name: "Stink Bomb (WIS Spell)",
    description:
      "DC 12. One target within far range takes 2d4 damage and must make a DC 12 CON save or have DISADV on their next check/attack.",
    category: "spell",
  },
  {
    name: "Summon Bear (INT Spell)",
    description:
      "DC 14. Summon a loyal brown bear that appears within near. It stays for 5 rounds.",
    category: "spell",
  },
  {
    name: "Summon Cobra (INT Spell)",
    description:
      "DC 13. Summon 1d4 loyal cobras that appear within near. They leave in 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Summon Spiders (WIS Spell)",
    description:
      "DC 14. Summon 2d4 loyal giant spiders that appear within near. They stay for 5 rounds.",
    category: "spell",
  },
  {
    name: "Thunderclap (INT Spell)",
    description:
      "DC 13. Fills a near-sized cube extending from monster. Creatures within are thrown 2d20 feet in a random direction.",
    category: "spell",
  },
  {
    name: "Time Bend (WIS Spell)",
    description: "DC 14. One target in near frozen in time for 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Time Stop (WIS Spell)",
    description:
      "DC 15. Self. Time freezes for everyone except monster for 1d4 rounds. Everything that occurs during the time freeze happens simultaneously when the spell ends.",
    category: "spell",
  },
  {
    name: "True Name (INT Spell)",
    description: "DC 15. Near. Learn the True Name of target.",
    category: "spell",
  },
  {
    name: "Unmake (WIS Spell)",
    description: "DC 13. One target in far takes 3d8 damage.",
    category: "spell",
  },
  {
    name: "Venom (INT Spell)",
    description: "DC 12. One target in far takes 2d8 damage.",
    category: "spell",
  },
  {
    name: "Void Step (INT Spell)",
    description:
      "Self and up to 4 willing targets. DC 15. Teleport up to 100 miles.",
    category: "spell",
  },
  {
    name: "Web (WIS Spell)",
    description:
      "DC 13. A near-sized cube of webs within far immobilizes all inside it for 5 rounds. DC 15 STR on turn to break free.",
    category: "spell",
  },
  {
    name: "Whispers (CHA Spell)",
    description:
      "DC 12. Hostile spells cast on one target in near are DC 9 for 1d4 rounds.",
    category: "spell",
  },
  {
    name: "Whispers (INT Spell)",
    description:
      "DC 14. Focus. All enemies within near of monster have DISADV on spellcasting checks for the duration.",
    category: "spell",
  },
  {
    name: "Wither (INT Spell)",
    description:
      "DC 14. 4d8 damage to enemies within a near-sized cube centered on monster.",
    category: "spell",
  },
];

/**
 * Get talents filtered by category
 */
export function getTalentsByCategory(category: TalentTemplate["category"]) {
  return SHADOWDARK_TALENTS.filter((t) => t.category === category);
}

/**
 * Get all talent categories with counts
 */
export function getTalentCategories() {
  const categories = {
    innate: getTalentsByCategory("innate").length,
    "ride-along": getTalentsByCategory("ride-along").length,
    thematic: getTalentsByCategory("thematic").length,
    spell: getTalentsByCategory("spell").length,
  };
  return categories;
}

/**
 * Search talents by name or description
 */
export function searchTalents(query: string): TalentTemplate[] {
  const lowerQuery = query.toLowerCase();
  return SHADOWDARK_TALENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Get a random talent
 */
export function getRandomTalent(): TalentTemplate {
  return SHADOWDARK_TALENTS[
    Math.floor(Math.random() * SHADOWDARK_TALENTS.length)
  ];
}

/**
 * Get a random talent by category
 */
export function getRandomTalentByCategory(
  category: TalentTemplate["category"],
): TalentTemplate {
  const filtered = getTalentsByCategory(category);
  return filtered[Math.floor(Math.random() * filtered.length)];
}
