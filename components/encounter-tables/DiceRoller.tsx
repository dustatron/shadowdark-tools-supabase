"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/primitives/button";
import { Dices } from "lucide-react";

interface DiceRollerProps {
  dieSize: number;
  onRoll: (result: number) => void;
  disabled?: boolean;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DiceRoller({
  dieSize,
  onRoll,
  disabled = false,
  variant = "default",
  size = "default",
  className,
}: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState<number | null>(null);

  // Animation interval in milliseconds
  const ANIMATION_DURATION = 1000;
  const ANIMATION_INTERVAL = 50;

  const rollDice = useCallback(() => {
    return Math.floor(Math.random() * dieSize) + 1;
  }, [dieSize]);

  const handleRoll = useCallback(() => {
    if (isRolling || disabled) return;

    setIsRolling(true);
    setDisplayValue(null);

    let elapsedTime = 0;
    const finalResult = rollDice();

    // Animate random numbers
    const interval = setInterval(() => {
      setDisplayValue(rollDice());
      elapsedTime += ANIMATION_INTERVAL;

      if (elapsedTime >= ANIMATION_DURATION) {
        clearInterval(interval);
        setDisplayValue(finalResult);
        setIsRolling(false);
        onRoll(finalResult);
      }
    }, ANIMATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isRolling, disabled, rollDice, onRoll]);

  // Format die size for display
  const getDieLabel = (size: number): string => {
    const standardSizes = [4, 6, 8, 10, 12, 20, 100];
    return standardSizes.includes(size) ? `d${size}` : `d${size}`;
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRoll}
      disabled={disabled || isRolling}
      className={className}
      aria-label={`Roll ${getDieLabel(dieSize)}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <Dices
        className={`w-4 h-4 mr-2 ${isRolling ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {isRolling ? (
        <span className="font-mono tabular-nums">
          Rolling {displayValue !== null ? displayValue : "..."}
        </span>
      ) : displayValue !== null ? (
        <span className="font-mono tabular-nums">Rolled {displayValue}!</span>
      ) : (
        <span>Roll {getDieLabel(dieSize)}</span>
      )}
    </Button>
  );
}

// Variant with just the result display (no button chrome)
interface DiceRollerResultProps {
  dieSize: number;
  onRoll: (result: number) => void;
  autoRoll?: boolean;
  className?: string;
}

export function DiceRollerResult({
  dieSize,
  onRoll,
  autoRoll = false,
  className,
}: DiceRollerResultProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState<number | null>(null);

  const ANIMATION_DURATION = 1000;
  const ANIMATION_INTERVAL = 50;

  const rollDice = useCallback(() => {
    return Math.floor(Math.random() * dieSize) + 1;
  }, [dieSize]);

  const performRoll = useCallback(() => {
    setIsRolling(true);
    setDisplayValue(null);

    let elapsedTime = 0;
    const finalResult = rollDice();

    const interval = setInterval(() => {
      setDisplayValue(rollDice());
      elapsedTime += ANIMATION_INTERVAL;

      if (elapsedTime >= ANIMATION_DURATION) {
        clearInterval(interval);
        setDisplayValue(finalResult);
        setIsRolling(false);
        onRoll(finalResult);
      }
    }, ANIMATION_INTERVAL);

    return () => clearInterval(interval);
  }, [rollDice, onRoll]);

  // Auto-roll on mount if enabled
  useEffect(() => {
    if (autoRoll) {
      performRoll();
    }
  }, [autoRoll, performRoll]);

  return (
    <div
      className={`flex items-center justify-center ${className || ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {isRolling ? (
        <div className="flex items-center gap-2">
          <Dices className="w-6 h-6 animate-spin" aria-hidden="true" />
          <span className="text-2xl font-mono font-bold tabular-nums">
            {displayValue !== null ? displayValue : "..."}
          </span>
        </div>
      ) : displayValue !== null ? (
        <span className="text-4xl font-mono font-bold tabular-nums">
          {displayValue}
        </span>
      ) : (
        <span className="text-muted-foreground">Ready to roll...</span>
      )}
    </div>
  );
}
