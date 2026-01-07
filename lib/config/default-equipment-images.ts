/**
 * Default equipment images from game-icons.net
 * Icons are CC BY 3.0 licensed - attribution required
 *
 * Categories: weapon, armor, gear, misc
 * Reuses icons from magic items config where applicable
 */

export interface DefaultEquipmentImage {
  id: string;
  name: string;
  publicId: string;
  category: "weapon" | "armor" | "gear" | "misc";
}

// Folder: shadowdark/default-magic-items/ (reusing existing icons)
export const DEFAULT_EQUIPMENT_IMAGES: DefaultEquipmentImage[] = [
  // Weapons
  {
    id: "sword",
    name: "Sword",
    publicId: "shadowdark/default-magic-items/sword",
    category: "weapon",
  },
  {
    id: "dagger",
    name: "Dagger",
    publicId: "shadowdark/default-magic-items/dagger",
    category: "weapon",
  },
  {
    id: "staff",
    name: "Staff",
    publicId: "shadowdark/default-magic-items/staff",
    category: "weapon",
  },
  {
    id: "bow",
    name: "Bow & Arrow",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/bow",
    category: "weapon",
  },
  {
    id: "battle-axe",
    name: "Battle Axe",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/battle-axe",
    category: "weapon",
  },
  {
    id: "hammer",
    name: "Hammer",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/hammer",
    category: "weapon",
  },
  {
    id: "halberd",
    name: "Halberd",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/halberd",
    category: "weapon",
  },
  {
    id: "trident",
    name: "Trident",
    publicId: "shadowdark/default-magic-items/trident",
    category: "weapon",
  },
  {
    id: "bowie-knife",
    name: "Bowie Knife",
    publicId: "shadowdark/default-magic-items/bowie-knife",
    category: "weapon",
  },
  {
    id: "crossbow",
    name: "Crossbow",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/crossbow",
    category: "weapon",
  },

  // Armor
  {
    id: "armor",
    name: "Armor",
    publicId: "shadowdark/default-magic-items/armor",
    category: "armor",
  },
  {
    id: "shield",
    name: "Shield",
    publicId: "shadowdark/default-magic-items/shield",
    category: "armor",
  },
  {
    id: "helmet",
    name: "Helmet",
    publicId: "shadowdark/default-magic-items/helmet",
    category: "armor",
  },
  {
    id: "boots",
    name: "Boots",
    publicId: "shadowdark/default-magic-items/boots",
    category: "armor",
  },
  {
    id: "cloak",
    name: "Cloak",
    publicId: "shadowdark/default-magic-items/cloak",
    category: "armor",
  },
  {
    id: "black-knight-helm",
    name: "Black Knight Helm",
    publicId: "shadowdark/default-magic-items/black-knight-helm",
    category: "armor",
  },
  {
    id: "barbute",
    name: "Barbute",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/barbute",
    category: "armor",
  },

  // Gear
  {
    id: "rope",
    name: "Rope",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/rope-coil",
    category: "gear",
  },
  {
    id: "light-backpack",
    name: "Backpack",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/light-backpack",
    category: "gear",
  },
  {
    id: "pickaxe",
    name: "Pickaxe",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/pickaxe",
    category: "gear",
  },
  {
    id: "compass",
    name: "Compass",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/compass",
    category: "gear",
  },
  {
    id: "quiver",
    name: "Quiver",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/quiver",
    category: "gear",
  },
  {
    id: "swap-bag",
    name: "Sack",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/swap-bag",
    category: "gear",
  },
  {
    id: "grapple",
    name: "Grappling Hook",
    publicId: "shadowdark/default-magic-items/grapple",
    category: "gear",
  },
  {
    id: "coiled-nail",
    name: "Iron Spikes",
    publicId: "shadowdark/default-magic-items/coiled-nail",
    category: "gear",
  },
  {
    id: "potion",
    name: "Flask/Vial",
    publicId: "shadowdark/default-magic-items/potion",
    category: "gear",
  },
  {
    id: "scroll",
    name: "Scroll/Map",
    publicId: "shadowdark/default-magic-items/scroll",
    category: "gear",
  },

  // Misc
  {
    id: "gem",
    name: "Gem",
    publicId: "shadowdark/default-magic-items/gem",
    category: "misc",
  },
  {
    id: "book",
    name: "Book",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/book",
    category: "misc",
  },
  {
    id: "ring",
    name: "Ring",
    publicId: "shadowdark/default-magic-items/ring",
    category: "misc",
  },
  {
    id: "amulet",
    name: "Amulet",
    publicId: "shadowdark/default-magic-items/amulet",
    category: "misc",
  },
  {
    id: "skull",
    name: "Skull",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/skull",
    category: "misc",
  },
  {
    id: "cube",
    name: "Cube",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/cube",
    category: "misc",
  },
];

/**
 * Get default image by ID
 */
export function getDefaultEquipmentImageById(
  id: string,
): DefaultEquipmentImage | undefined {
  return DEFAULT_EQUIPMENT_IMAGES.find((img) => img.id === id);
}

/**
 * Get default images by category
 */
export function getDefaultEquipmentImagesByCategory(
  category: DefaultEquipmentImage["category"],
): DefaultEquipmentImage[] {
  return DEFAULT_EQUIPMENT_IMAGES.filter((img) => img.category === category);
}

/**
 * Get all category names
 */
export function getEquipmentCategories(): DefaultEquipmentImage["category"][] {
  return ["weapon", "armor", "gear", "misc"];
}
