import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { createMonsterSchema } from "@/lib/validations/monster";

// Extended schema with customSpeed field for form state
export const monsterFormSchema = createMonsterSchema.extend({
  customSpeed: z.string().optional(),
});

export type MonsterFormData = z.infer<typeof monsterFormSchema>;

export interface MonsterFormProps {
  form: UseFormReturn<MonsterFormData>;
}

export interface MonsterCreateEditFormProps {
  initialData?: z.infer<typeof createMonsterSchema> & { id?: string };
  onSubmit?: (data: z.infer<typeof createMonsterSchema>) => Promise<void>;
  onCancel?: () => void;
  mode?: "create" | "edit";
}

// Shadowdark-specific constants
export const ATTACK_TYPES = [
  { value: "melee", label: "Melee" },
  { value: "ranged", label: "Ranged" },
  { value: "spell", label: "Spell" },
] as const;

export const COMMON_TAGS = {
  type: [
    "Aberration",
    "Beast",
    "Celestial",
    "Construct",
    "Dragon",
    "Elemental",
    "Fey",
    "Fiend",
    "Giant",
    "Humanoid",
    "Monstrosity",
    "Ooze",
    "Plant",
    "Undead",
  ],
  location: [
    "Dungeon",
    "Forest",
    "Mountain",
    "Swamp",
    "Desert",
    "Ocean",
    "City",
    "Underground",
    "Planar",
    "Arctic",
  ],
} as const;
