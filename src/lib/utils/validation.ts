import { z } from 'zod';

// Common validation schemas

// Monster validation
export const MonsterAttackSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['melee', 'ranged']),
  damage: z.string().regex(/^\d+d\d+([+-]\d+)?$/, 'Invalid dice format (e.g., 1d6+2)'),
  range: z.string().min(1).max(20),
  description: z.string().max(200).optional()
});

export const MonsterAbilitySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(500)
});

export const MonsterTagsSchema = z.object({
  type: z.array(z.string().min(1).max(30)).min(1),
  location: z.array(z.string().min(1).max(30)).min(1)
});

export const MonsterSchema = z.object({
  name: z.string().min(1).max(100),
  challenge_level: z.number().int().min(1).max(20),
  hit_points: z.number().int().min(1).max(9999),
  armor_class: z.number().int().min(1).max(25),
  speed: z.string().min(1).max(50),
  attacks: z.array(MonsterAttackSchema).default([]),
  abilities: z.array(MonsterAbilitySchema).default([]),
  treasure: z.string().max(500).nullable().optional(),
  tags: MonsterTagsSchema,
  author_notes: z.string().max(1000).nullable().optional()
});

// List validation
export const ListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  is_public: z.boolean().default(false),
  category: z.string().max(50).optional()
});

// User validation
export const UserRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(100)
});

export const UserLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1)
});

export const UserProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).nullable().optional(),
  website: z.string().url().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      browser: z.boolean().optional()
    }).optional()
  }).optional()
});

// Encounter table validation
export const EncounterTableEntrySchema = z.object({
  roll_min: z.number().int().min(1).max(100),
  roll_max: z.number().int().min(1).max(100),
  encounter_description: z.string().min(1).max(500)
});

export const EncounterTableSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  environment: z.string().min(1).max(50),
  challenge_level_min: z.number().int().min(1).max(20).default(1),
  challenge_level_max: z.number().int().min(1).max(20).default(20),
  entries: z.array(EncounterTableEntrySchema).min(1).max(100)
}).refine(data => data.challenge_level_min <= data.challenge_level_max, {
  message: "Minimum challenge level must be less than or equal to maximum"
});

// Encounter generation validation
export const EncounterGenerationSchema = z.object({
  challengeLevel: z.number().int().min(1).max(20),
  partySize: z.number().int().min(1).max(12),
  monsterTypes: z.array(z.string()).optional(),
  location: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'deadly']).default('medium'),
  maxMonsters: z.number().int().min(1).max(20).default(8)
});

// Search validation
export const SearchParamsSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  minLevel: z.number().int().min(1).max(20).optional(),
  maxLevel: z.number().int().min(1).max(20).optional(),
  types: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
});

// Admin validation
export const FlagResolutionSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  admin_notes: z.string().min(1).max(1000)
});

export const UserUpdateSchema = z.object({
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  is_banned: z.boolean().optional(),
  ban_reason: z.string().max(500).nullable().optional()
}).refine(data => {
  if (data.is_banned === true && !data.ban_reason) {
    return false;
  }
  return true;
}, {
  message: "Ban reason is required when banning a user"
});

// Content flag validation
export const FlagSchema = z.object({
  flagged_item_type: z.enum(['monster', 'group']),
  flagged_item_id: z.string().uuid(),
  reason: z.enum(['inappropriate', 'copyright', 'spam', 'inaccurate', 'other']),
  comment: z.string().min(10).max(1000)
});

// Utility validation functions
export function validateEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

export function validateUuid(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
}

export function validateUrl(url: string): boolean {
  return z.string().url().safeParse(url).success;
}

export function validateDiceString(dice: string): boolean {
  return /^\d+d\d+([+-]\d+)?$/.test(dice);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 100) {
    errors.push('Password must be less than 100 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitization helpers
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}