/**
 * Shared card engine utilities.
 *
 * NOTE: Existing simulations use their own internal card representations
 * ({rank, suit} objects or "5♥" strings). These utilities are for NEW games
 * going forward and are opt-in — existing simulations don't need to migrate.
 */

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/** Standard rank order, 2 = lowest, Ace = highest (index = value) */
export const RANK_ORDER: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

/** Standard 52-card deck */
export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

/** Fisher-Yates shuffle — returns a new array, does not mutate */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deal `count` cards from the top of a deck, returns [dealt, remaining] */
export function deal(deck: Card[], count: number): [Card[], Card[]] {
  return [deck.slice(0, count), deck.slice(count)];
}

/** Deal hands for N players, round-robin style */
export function dealHands(deck: Card[], players: number, cardsEach: number): Card[][] {
  const hands: Card[][] = Array.from({ length: players }, () => []);
  for (let i = 0; i < cardsEach; i++) {
    for (let p = 0; p < players; p++) {
      const card = deck[i * players + p];
      if (card) hands[p].push(card);
    }
  }
  return hands;
}

/** Compare two cards by standard rank (higher = better). Returns positive if a > b */
export function compareByRank(a: Card, b: Card): number {
  return RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
}

/** Sort a hand by rank ascending */
export function sortHand(hand: Card[]): Card[] {
  return [...hand].sort(compareByRank);
}

/** True if suit is red (♥ or ♦) */
export function isRed(card: Card): boolean {
  return card.suit === '♥' || card.suit === '♦';
}

/** Display string, e.g. "A♠" */
export function cardLabel(card: Card): string {
  return `${card.rank}${card.suit}`;
}

/** Blackjack-style point value (A = 11, faces = 10) */
export function blackjackValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

/** Sum a blackjack hand, adjusting aces down to avoid bust */
export function blackjackTotal(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    const v = blackjackValue(c.rank);
    total += v;
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}
