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
