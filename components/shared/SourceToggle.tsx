"use client";

import { Button } from "@/components/primitives/button";

interface SourceToggleProps {
  value: "all" | "official" | "custom";
  onChange: (value: "all" | "official" | "custom") => void;
  labels?: {
    all?: string;
    official?: string;
    custom?: string;
  };
  disabled?: boolean;
}

export function SourceToggle({
  value,
  onChange,
  labels,
  disabled = false,
}: SourceToggleProps) {
  const defaultLabels = {
    all: "All",
    official: "Core",
    custom: "Custom",
  };

  const finalLabels = {
    all: labels?.all ?? defaultLabels.all,
    official: labels?.official ?? defaultLabels.official,
    custom: labels?.custom ?? defaultLabels.custom,
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        variant={value === "all" ? "default" : "outline"}
        onClick={() => onChange("all")}
        disabled={disabled}
        className="text-xs sm:text-sm"
      >
        {finalLabels.all}
      </Button>
      <Button
        variant={value === "official" ? "default" : "outline"}
        onClick={() => onChange("official")}
        disabled={disabled}
        className="text-xs sm:text-sm"
      >
        {finalLabels.official}
      </Button>
      <Button
        variant={value === "custom" ? "default" : "outline"}
        onClick={() => onChange("custom")}
        disabled={disabled}
        className="text-xs sm:text-sm"
      >
        {finalLabels.custom}
      </Button>
    </div>
  );
}
