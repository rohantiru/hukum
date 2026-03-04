export type GameType = 'dice' | 'card';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'family' | 'strategy' | 'gambling' | 'casual' | 'drinking' | 'betting';

export interface SampleRoll {
  roll: number;
  dice: number[];
  kept?: number[];
  note?: string;
}

export interface YahtzeeSampleTurn {
  description: string;
  rolls: SampleRoll[];
  combination: string;
  points: number;
}

export interface PokerSampleHand {
  description: string;
  holeCards: string[];
  communityCards: string[];
  action: { street: string; description: string }[];
  result: string;
}

export interface GameStep {
  step: number;
  title: string;
  description: string;
}

export interface HandRanking {
  rank: number;
  name: string;
  description: string;
  example: string;
}

export interface BettingRound {
  name: string;
  cards: string;
  description: string;
}

export interface ScoringCategory {
  name: string;
  description: string;
  points: string;
  example?: string;
}

export interface Variation {
  name: string;
  description: string;
}

export interface YahtzeeGame {
  id: 'yahtzee';
  name: string;
  type: 'dice';
  players: string;
  playersMin: number;
  playersMax: number;
  categories: Category[];
  difficulty: Difficulty;
  timeMinutes: number;
  equipment: string;
  objective: string;
  setup: GameStep[];
  gameplay: GameStep[];
  scoring: ScoringCategory[];
  variations: Variation[];
  sampleTurn: YahtzeeSampleTurn;
}

export interface PokerGame {
  id: 'texas-holdem';
  name: string;
  type: 'card';
  deck: string;
  players: string;
  playersMin: number;
  playersMax: number;
  categories: Category[];
  difficulty: Difficulty;
  timeMinutes: number;
  objective: string;
  setup: GameStep[];
  gameplay: GameStep[];
  handRankings: HandRanking[];
  bettingRounds: BettingRound[];
  variations: Variation[];
  sampleHand: PokerSampleHand;
}

export type Game = YahtzeeGame | PokerGame;

export interface GamesData {
  games: Game[];
}

export interface FilterState {
  search: string;
  types: GameType[];
  categories: Category[];
  difficulty: Difficulty[];
  playersMin: number;
  playersMax: number;
}
