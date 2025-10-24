/**
 * Dice rolling utility
 * Provides secure random number generation for encounter table rolls
 */

import { randomInt } from "crypto";

/**
 * Roll a die of the specified size
 * Uses crypto.randomInt for cryptographically secure randomness
 *
 * @param dieSize - Size of the die (e.g., 20 for d20)
 * @returns Random integer from 1 to dieSize (inclusive)
 * @throws Error if dieSize is invalid
 */
export function rollDice(dieSize: number): number {
  // Validate die size
  if (!Number.isInteger(dieSize) || dieSize < 2) {
    throw new Error("Die size must be an integer >= 2");
  }

  if (dieSize > 1000) {
    throw new Error("Die size cannot exceed 1000");
  }

  // Generate random number from 1 to dieSize (inclusive)
  // randomInt(min, max) generates [min, max) so we use max = dieSize + 1
  return randomInt(1, dieSize + 1);
}

/**
 * Roll multiple dice and return all results
 * Useful for testing or simulations
 *
 * @param dieSize - Size of each die
 * @param count - Number of dice to roll
 * @returns Array of roll results
 */
export function rollMultipleDice(dieSize: number, count: number): number[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("Count must be a positive integer");
  }

  if (count > 1000) {
    throw new Error("Cannot roll more than 1000 dice at once");
  }

  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(rollDice(dieSize));
  }

  return results;
}

/**
 * Simulate rolling a die many times to verify distribution
 * Useful for testing randomness
 *
 * @param dieSize - Size of the die
 * @param iterations - Number of rolls to simulate (default 10000)
 * @returns Object with frequency count for each roll value
 */
export function simulateRolls(
  dieSize: number,
  iterations: number = 10000,
): Record<number, number> {
  const frequencies: Record<number, number> = {};

  // Initialize frequencies
  for (let i = 1; i <= dieSize; i++) {
    frequencies[i] = 0;
  }

  // Roll the die many times
  for (let i = 0; i < iterations; i++) {
    const roll = rollDice(dieSize);
    frequencies[roll]++;
  }

  return frequencies;
}
