/**
 * Default magic item images from game-icons.net
 * Icons are CC BY 3.0 licensed - attribution required
 *
 * Categories: weapon, jewelry, equipment, consumable, misc
 */

export interface DefaultMagicItemImage {
  id: string;
  name: string;
  publicId: string;
  category: "weapon" | "jewelry" | "equipment" | "consumable" | "misc";
}

// Placeholder publicIds - to be replaced after uploading to Cloudinary in T015
// Folder: shadowdark/default-magic-items/
export const DEFAULT_MAGIC_ITEM_IMAGES: DefaultMagicItemImage[] = [
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
    id: "wand",
    name: "Wand",
    publicId: "shadowdark/default-magic-items/wand",
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
    id: "crossed-axes",
    name: "Crossed Axes",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/crossed-axes",
    category: "weapon",
  },
  {
    id: "fire-axe",
    name: "Fire Axe",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/fire-axe",
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
    id: "crossed-swords",
    name: "Crossed Swords",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/crossed-swords",
    category: "weapon",
  },
  {
    id: "hammer",
    name: "Hammer",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/hammer",
    category: "weapon",
  },

  // Jewelry
  {
    id: "ring",
    name: "Ring",
    publicId: "shadowdark/default-magic-items/ring",
    category: "jewelry",
  },
  {
    id: "amulet",
    name: "Amulet",
    publicId: "shadowdark/default-magic-items/amulet",
    category: "jewelry",
  },
  {
    id: "necklace",
    name: "Necklace",
    publicId: "shadowdark/default-magic-items/necklace",
    category: "jewelry",
  },

  // Equipment
  {
    id: "armor",
    name: "Armor",
    publicId: "shadowdark/default-magic-items/armor",
    category: "equipment",
  },
  {
    id: "shield",
    name: "Shield",
    publicId: "shadowdark/default-magic-items/shield",
    category: "equipment",
  },
  {
    id: "boots",
    name: "Boots",
    publicId: "shadowdark/default-magic-items/boots",
    category: "equipment",
  },
  {
    id: "cloak",
    name: "Cloak",
    publicId: "shadowdark/default-magic-items/cloak",
    category: "equipment",
  },
  {
    id: "helmet",
    name: "Helmet",
    publicId: "shadowdark/default-magic-items/helmet",
    category: "equipment",
  },
  {
    id: "pickaxe",
    name: "Pickaxe",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/pickaxe",
    category: "equipment",
  },
  {
    id: "rope",
    name: "Rope",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/rope-coil",
    category: "equipment",
  },
  {
    id: "compass",
    name: "Compass",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/compass",
    category: "equipment",
  },

  // Consumables
  {
    id: "potion",
    name: "Potion",
    publicId: "shadowdark/default-magic-items/potion",
    category: "consumable",
  },
  {
    id: "scroll",
    name: "Scroll",
    publicId: "shadowdark/default-magic-items/scroll",
    category: "consumable",
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
    id: "skull",
    name: "Skull",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/skull",
    category: "misc",
  },
  {
    id: "crystal-ball",
    name: "Crystal Ball",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/crystal-ball",
    category: "misc",
  },
  {
    id: "eye",
    name: "Eye Shield",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/eye",
    category: "misc",
  },

  // Elemental
  {
    id: "fireball",
    name: "Fireball",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/fireball",
    category: "misc",
  },
  {
    id: "ice-bolt",
    name: "Ice Bolt",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/ice-bolt",
    category: "misc",
  },
  {
    id: "lightning",
    name: "Lightning",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/lightning",
    category: "misc",
  },
  {
    id: "wind",
    name: "Wind",
    publicId:
      "shadowdark/default-magic-items/shadowdark/default-magic-items/wind",
    category: "misc",
  },
];

/**
 * Get default image by ID
 */
export function getDefaultImageById(
  id: string,
): DefaultMagicItemImage | undefined {
  return DEFAULT_MAGIC_ITEM_IMAGES.find((img) => img.id === id);
}

/**
 * Get default images by category
 */
export function getDefaultImagesByCategory(
  category: DefaultMagicItemImage["category"],
): DefaultMagicItemImage[] {
  return DEFAULT_MAGIC_ITEM_IMAGES.filter((img) => img.category === category);
}

/**
 * Get all category names
 */
export function getCategories(): DefaultMagicItemImage["category"][] {
  return ["weapon", "jewelry", "equipment", "consumable", "misc"];
}
