"use client";

import { Input } from "@/components/primitives/input";
import { Label } from "@/components/primitives/label";

// TODO: Migrate to Lucide icons with Dialog-based selector
// Temporarily stubbed out to remove Mantine dependency

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string | null) => void;
  label?: string;
  placeholder?: string;
  error?: string;
}

export function IconSelector({
  value,
  onChange,
  label = "Icon",
  placeholder = "Enter icon name",
  error,
}: IconSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={placeholder}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Icon selector temporarily simplified. Enter icon name manually (e.g.,
      </p>
    </div>
  );
}
