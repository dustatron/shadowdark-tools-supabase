"use client";

import { Button } from "@/components/primitives/button";
import { LayoutGrid, Table2 } from "lucide-react";
import { ViewMode } from "@/lib/types/monsters";

interface ViewModeToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewModeToggle({ view, onViewChange }: ViewModeToggleProps) {
  return (
    <div className="flex border rounded-md">
      <Button
        variant={view === "cards" ? "default" : "ghost"}
        size="icon"
        onClick={() => onViewChange("cards")}
        title="Card view"
        aria-label="Switch to card view"
        className="rounded-r-none"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="icon"
        onClick={() => onViewChange("table")}
        title="Table view"
        aria-label="Switch to table view"
        className="rounded-l-none"
      >
        <Table2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
