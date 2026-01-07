"use client";

import { SpellForm } from "@/components/spells/SpellForm";

interface EditSpellClientProps {
  spell: Record<string, unknown>;
  isOfficial?: boolean;
}

export function EditSpellClient({
  spell,
  isOfficial = false,
}: EditSpellClientProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isOfficial ? "Edit Official Spell" : "Edit Spell"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isOfficial
            ? "You are editing official Shadowdark content"
            : `Update ${spell.name} for your Shadowdark campaign`}
        </p>
      </div>
      <SpellForm mode="edit" initialData={spell} isOfficial={isOfficial} />
    </div>
  );
}
