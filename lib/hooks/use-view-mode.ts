"use client";

import { useState, useEffect, useCallback } from "react";
import { ViewMode } from "@/lib/types/monsters";

const VIEW_MODE_KEY = "dungeon-exchange-view-mode";

/**
 * Global hook for managing view mode preference (cards vs table).
 * Persists selection to localStorage for use across all list pages.
 */
export function useViewMode(initialView?: ViewMode) {
  const [view, setViewState] = useState<ViewMode>(initialView ?? "cards");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(VIEW_MODE_KEY);
    if (stored === "table" || stored === "cards") {
      setViewState(stored);
    }
    setIsInitialized(true);
  }, []);

  const setView = useCallback((newView: ViewMode) => {
    setViewState(newView);
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_MODE_KEY, newView);
    }
  }, []);

  return { view, setView, isInitialized };
}

/**
 * Get the initial view mode from localStorage (for server-side rendering fallback).
 * Call this in useEffect to avoid hydration mismatch.
 */
export function getStoredViewMode(): ViewMode | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  return stored === "table" || stored === "cards" ? stored : null;
}
