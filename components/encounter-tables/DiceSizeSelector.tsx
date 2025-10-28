"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DiceSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

const STANDARD_DICE = [4, 6, 8, 10, 12, 20, 100];

export function DiceSizeSelector({
  value,
  onChange,
  error,
}: DiceSizeSelectorProps) {
  const [customValue, setCustomValue] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"standard" | "custom">(
    STANDARD_DICE.includes(value) ? "standard" : "custom",
  );

  // Initialize custom value if current value is custom
  useEffect(() => {
    if (!STANDARD_DICE.includes(value)) {
      setCustomValue(value.toString());
      setSelectedType("custom");
    }
  }, []);

  const handleStandardDieClick = (size: number) => {
    setSelectedType("standard");
    onChange(size);
  };

  const handleCustomClick = () => {
    setSelectedType("custom");
    const numValue = parseInt(customValue, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 1000) {
      onChange(numValue);
    }
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCustomValue(inputValue);

    // Auto-select custom when user types
    if (inputValue) {
      setSelectedType("custom");
      const numValue = parseInt(inputValue, 10);
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 1000) {
        onChange(numValue);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STANDARD_DICE.map((size) => (
          <Button
            key={size}
            type="button"
            variant={
              selectedType === "standard" && value === size
                ? "default"
                : "outline"
            }
            onClick={() => handleStandardDieClick(size)}
            className={cn(
              "min-w-[60px]",
              selectedType === "standard" &&
                value === size &&
                "ring-2 ring-primary",
            )}
          >
            d{size}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={1000}
          value={customValue}
          onChange={handleCustomInputChange}
          placeholder="Enter custom"
          className="w-32"
          aria-label="Custom die size"
          aria-invalid={!!error}
        />
        <Button
          type="button"
          variant={selectedType === "custom" ? "default" : "outline"}
          onClick={handleCustomClick}
          className={cn(selectedType === "custom" && "ring-2 ring-primary")}
        >
          Custom
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
