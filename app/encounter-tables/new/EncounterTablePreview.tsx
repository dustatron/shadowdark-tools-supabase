"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type MonsterSnapshot = {
  id: string;
  name: string;
  challenge_level: number;
  armor_class: number;
  hit_points: number;
};

type PreviewEntry = {
  roll_number: number;
  monster_id: string;
  monster_snapshot: MonsterSnapshot;
};

type PreviewData = {
  name: string;
  description: string | null;
  die_size: number;
  filters: any;
  entries: PreviewEntry[];
} | null;

interface EncounterTablePreviewProps {
  previewData: PreviewData;
  isGenerating: boolean;
  isSaving: boolean;
  onRegenerate: () => void;
  onSave: () => void;
}

export function EncounterTablePreview({
  previewData,
  isGenerating,
  isSaving,
  onRegenerate,
  onSave,
}: EncounterTablePreviewProps) {
  if (!previewData) {
    return (
      <Card className="lg:block hidden">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Generate a preview to see your encounter table</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview: {previewData.name}</CardTitle>
        {previewData.description && (
          <CardDescription>{previewData.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-background border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Roll</th>
                  <th className="text-left p-3 font-semibold">Monster</th>
                  <th className="text-left p-3 font-semibold">Level</th>
                  <th className="text-left p-3 font-semibold">AC</th>
                  <th className="text-left p-3 font-semibold">HP</th>
                </tr>
              </thead>
              <tbody>
                {previewData.entries.map((entry) => (
                  <tr
                    key={entry.roll_number}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="p-3 font-mono">{entry.roll_number}</td>
                    <td className="p-3">
                      <Link
                        href={`/monsters/${entry.monster_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {entry.monster_snapshot.name}
                      </Link>
                    </td>
                    <td className="p-3">
                      {entry.monster_snapshot.challenge_level}
                    </td>
                    <td className="p-3">
                      {entry.monster_snapshot.armor_class}
                    </td>
                    <td className="p-3">{entry.monster_snapshot.hit_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onRegenerate}
            disabled={isSaving || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              "Regenerate"
            )}
          </Button>
          <Button onClick={onSave} disabled={isSaving || isGenerating}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Table"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
