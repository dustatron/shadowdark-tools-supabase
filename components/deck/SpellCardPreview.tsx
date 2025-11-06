import { Card } from "@/components/ui/card";
import type { SpellForDeck } from "@/lib/validations/deck";

interface SpellCardPreviewProps {
  spell: SpellForDeck;
}

/**
 * Visual preview of spell card matching PDF export design
 * Mimics the 2.5" x 3.5" card layout
 */
export function SpellCardPreview({ spell }: SpellCardPreviewProps) {
  return (
    <Card
      className="relative overflow-hidden bg-white text-black"
      style={{
        width: "2.5in",
        height: "3.5in",
        aspectRatio: "2.5 / 3.5",
      }}
    >
      <div className="h-full flex flex-col p-3 border-2 border-gray-800 rounded-lg">
        {/* Header Section */}
        <div className="border-b-2 border-gray-800 pb-2 mb-3 text-center">
          <h3 className="text-base font-bold uppercase mb-1.5 text-gray-900">
            {spell.name}
          </h3>
          <div className="text-xs font-bold text-blue-600 mb-1">
            Tier {spell.tier}
          </div>
          {spell.classes && spell.classes.length > 0 && (
            <div className="text-[10px] text-gray-600">
              {spell.classes.join(", ")}
            </div>
          )}
        </div>

        {/* Metadata Section */}
        <div className="text-center space-y-1 mb-2">
          <p className="text-[10px] text-gray-600">
            Duration: {spell.duration}
          </p>
          <p className="text-[10px] text-gray-600">Range: {spell.range}</p>
        </div>

        {/* Description Section */}
        <div className="flex-1 overflow-auto">
          <p className="text-[11px] leading-relaxed text-justify text-gray-800">
            {spell.description}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-1.5 mt-2 text-center">
          <p className="text-[9px] text-gray-400">Shadowdark RPG</p>
        </div>
      </div>
    </Card>
  );
}
