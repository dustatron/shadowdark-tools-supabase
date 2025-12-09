"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/primitives/input";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  debounceMs = 300,
}: SearchInputProps) {
  const [localSearch, setLocalSearch] = useState(value);
  const [debouncedSearch] = useDebounce(localSearch, debounceMs);

  // Update local state when external value changes
  useEffect(() => {
    if (value !== localSearch) {
      setLocalSearch(value);
    }
  }, [value]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== value) {
      onChange(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        className="pl-9"
        disabled={disabled}
      />
    </div>
  );
}
