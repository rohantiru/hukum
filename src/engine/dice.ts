/**
 * Shared dice engine utilities.
 */

/** Roll a single fair die with `sides` faces (default 6) */
export function rollDie(sides = 6): number {
  return Math.floor(Math.random() * sides) + 1;
}

/** Roll `count` dice, return array of results */
export function rollDice(count: number, sides = 6): number[] {
  return Array.from({ length: count }, () => rollDie(sides));
}

/**
 * Re-roll only the dice NOT marked as kept.
 * @param current - current values for all dice
 * @param kept    - boolean mask, true = keep this die
 */
export function reroll(current: number[], kept: boolean[]): number[] {
  return current.map((val, i) => (kept[i] ? val : rollDie()));
}

/** Count occurrences of each face value: { [face]: count } */
export function faceCounts(dice: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const d of dice) counts[d] = (counts[d] ?? 0) + 1;
  return counts;
}

/** True if the dice contain N or more of the same face */
export function hasNOfAKind(dice: number[], n: number): boolean {
  return Object.values(faceCounts(dice)).some((c) => c >= n);
}

/** True if the dice form a full house (three-of-a-kind + pair) */
export function isFullHouse(dice: number[]): boolean {
  const counts = Object.values(faceCounts(dice));
  return counts.includes(3) && counts.includes(2);
}

/** True if the dice contain a straight of `length` or more consecutive faces */
export function hasStraight(dice: number[], length: number): boolean {
  const unique = [...new Set(dice)].sort((a, b) => a - b);
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    run = unique[i] === unique[i - 1] + 1 ? run + 1 : 1;
    if (run >= length) return true;
  }
  return run >= length;
}

/** Sum all dice (useful for Chance, upper section, etc.) */
export function sumDice(dice: number[]): number {
  return dice.reduce((a, b) => a + b, 0);
}

/** Sum only dice matching a target face (Yahtzee upper section) */
export function sumOfFace(dice: number[], face: number): number {
  return dice.filter((d) => d === face).reduce((a, b) => a + b, 0);
}

/** Approximate probability table: chance of rolling exactly k dice showing `face` in n rolls */
export function rollProbabilities(faces = 6): Record<number, string> {
  const probs: Record<number, string> = {};
  for (let f = 1; f <= faces; f++) {
    const p = 1 / faces;
    probs[f] = `${(p * 100).toFixed(1)}%`;
  }
  return probs;
}
