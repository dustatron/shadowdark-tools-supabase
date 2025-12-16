"use client";

import { Button } from "@/components/primitives/button";
import { LayoutGrid, Table2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ViewMode } from "@/lib/types/monsters";

interface ViewModeToggleLinkProps {
  view: ViewMode;
  defaultView?: ViewMode;
}

export function ViewModeToggleLink({
  view,
  defaultView = "cards",
}: ViewModeToggleLinkProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (newView: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newView === defaultView) {
      params.delete("view");
    } else {
      params.set("view", newView);
    }
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
  };

  return (
    <div className="flex border rounded-md">
      <Button
        variant={view === "cards" ? "default" : "ghost"}
        size="icon"
        onClick={() => setView("cards")}
        title="Card view"
        aria-label="Switch to card view"
        className="rounded-r-none"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="icon"
        onClick={() => setView("table")}
        title="Table view"
        aria-label="Switch to table view"
        className="rounded-l-none"
      >
        <Table2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
