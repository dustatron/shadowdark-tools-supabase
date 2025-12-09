"use client";

import { TooltipProvider } from "@/components/primitives/tooltip";
import { TraitBadge } from "./TraitBadge";

interface Trait {
  name: string;
  description: string;
}

interface GroupedTraits {
  Benefit: Trait[];
  Curse: Trait[];
  Bonus: Trait[];
  Personality: Trait[];
}

interface TraitsSectionProps {
  groupedTraits: GroupedTraits;
}

export function TraitsSection({ groupedTraits }: TraitsSectionProps) {
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Benefits */}
        {groupedTraits.Benefit.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TraitBadge trait={{ name: "Benefit", description: "" }} />
              Benefits
            </h3>
            <ul className="space-y-2">
              {groupedTraits.Benefit.map((trait, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-blue-500"
                >
                  {trait.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Curses */}
        {groupedTraits.Curse.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TraitBadge trait={{ name: "Curse", description: "" }} />
              Curses
            </h3>
            <ul className="space-y-2">
              {groupedTraits.Curse.map((trait, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-red-500"
                >
                  {trait.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bonuses */}
        {groupedTraits.Bonus.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TraitBadge trait={{ name: "Bonus", description: "" }} />
              Bonuses
            </h3>
            <ul className="space-y-2">
              {groupedTraits.Bonus.map((trait, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-purple-500"
                >
                  {trait.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Personality */}
        {groupedTraits.Personality.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TraitBadge trait={{ name: "Personality", description: "" }} />
              Personality
            </h3>
            <ul className="space-y-2">
              {groupedTraits.Personality.map((trait, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-gray-500"
                >
                  {trait.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
