export type GameType = 'dice' | 'card' | 'other';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'family' | 'strategy' | 'gambling' | 'casual' | 'drinking' | 'betting' | 'party' | 'indian';

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

export interface RideBusSampleHand {
  description: string;
  holeCards: string[];
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
  tagline?: string;
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
  tagline?: string;
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

export interface RideBusGame {
  id: 'ride-the-bus';
  name: string;
  tagline?: string;
  type: 'card';
  deck: string;
  players: string;
  playersMin: number;
  playersMax: number;
  categories: Category[];
  difficulty: Difficulty;
  timeMinutes: number;
  equipment: string;
  ageWarning: string;
  objective: string;
  setup: GameStep[];
  gameplay: GameStep[];
  scoring: string[];
  strategyTips: string[];
  variations: Variation[];
  sampleHand: RideBusSampleHand;
}

// Teen Patti
export interface TeenPattiHandRanking {
  rank: number;
  name: string;
  description: string;
  example: string;
  note?: string;
}

export interface TeenPattiPhase {
  phase: string;
  description: string;
  rules?: string[];
  note?: string;
}

export interface TeenPattiSamplePlayer {
  name: string;
  cards: string[];
  hand: string;
  action: string;
}

export interface TeenPattiGame {
  id: 'teen-patti';
  name: string;
  tagline?: string;
  type: 'card';
  deck: string;
  players: string;
  playersMin: number;
  playersMax: number;
  categories: Category[];
  difficulty: Difficulty;
  timeMinutes: number;
  equipment: string;
  objective: string;
  setup: GameStep[];
  gameplay: TeenPattiPhase[];
  handRankings: TeenPattiHandRanking[];
  betting: string[];
  rules: string[];
  strategyTips: string[];
  culturalNotes: string[];
  variations: Variation[];
  sampleHand: {
    description: string;
    boot: number;
    players: TeenPattiSamplePlayer[];
    outcome: string;
    potSize: number;
  };
}

// Blackjack
export interface BlackjackAction {
  name: string;
  description: string;
}

export interface BlackjackPhase {
  phase: string;
  description: string;
  note?: string;
  actions?: BlackjackAction[];
  rules?: string[];
  outcomes?: string[];
}

export interface BlackjackStrategySection {
  situation: string;
  rules: string[];
}

export interface BlackjackSamplePlayer {
  name: string;
  initialCards: string[];
  total?: string | number;
  action: string;
  outcome: string;
}

export interface BlackjackGame {
  id: 'blackjack';
  name: string;
  tagline?: string;
  type: 'card';
  deck: string;
  players: string;
  playersMin: number;
  playersMax: number;
  categories: Category[];
  difficulty: Difficulty;
  timeMinutes: number;
  equipment: string;
  objective: string;
  cardValues: string[];
  setup: GameStep[];
  gameplay: BlackjackPhase[];
  basicStrategy: BlackjackStrategySection[];
  rules: string[];
  strategyTips: string[];
  casinoRules: string[];
  variations: Variation[];
  sampleHand: {
    description: string;
    players: BlackjackSamplePlayer[];
    dealer: { upCard: string; holeCard: string; total: number; action: string };
  };
}

// Craps
export interface CrapsBet {
  name: string;
  description: string;
  payout: string;
  houseEdge: string;
  strategy?: string;
  note?: string;
}

export interface CrapsOutcome {
  roll: string;
  result: string;
}

export interface CrapsPhase {
  phase: string;
  description: string;
  outcomes?: CrapsOutcome[];
}

export interface CrapsSampleRoll {
  rollNumber: number;
  dice: number[];
  total: number;
  phase: string;
  result: string;
  betStatus: string;
  shooterStatus?: string;
}

export interface CrapsGame {
  id: 'craps';
  name: string;
  tagline?: string;
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
  gameplay: CrapsPhase[];
  basicBets: CrapsBet[];
  advancedBets: CrapsBet[];
  diceRollProbabilities: string[];
  rules: string[];
  strategyTips: string[];
  etiquette: string[];
  terminology: string[];
  variations: Variation[];
  sampleRound: {
    description: string;
    shooter: string;
    bet: string;
    rolls: CrapsSampleRoll[];
  };
}

// Flip Cup
export interface FlipCupGame {
  id: 'flip-cup';
  name: string;
  tagline?: string;
  type: 'other';
  players: string;
  playersMin: number;
  playersMax: number;
  categories: Category[];
  difficulty: Difficulty;
  timeMinutes: number;
  equipment: string;
  ageWarning: string;
  objective: string;
  setup: GameStep[];
  gameplay: GameStep[];
  rules: string[];
  strategyTips: string[];
  variations: Variation[];
}

// Asshole
export interface AssholeRole {
  name: string;
  description: string;
  perks: string;
}

export interface AssholeGame {
  id: 'asshole';
  name: string;
  tagline?: string;
  type: 'card';
  deck: string;
  players: string;
  playersMin: number;
  playersMax: number;
  categories: Category[];
  difficulty: Difficulty;
  timeMinutes: number;
  objective: string;
  cardRanking: string;
  setup: GameStep[];
  gameplay: GameStep[];
  roles: AssholeRole[];
  rules: string[];
  strategyTips: string[];
  variations: Variation[];
}

// 28
export interface TwentyEightCardValue {
  rank: string;
  points: number;
}

export interface TwentyEightGame {
  id: 'twenty-eight';
  name: string;
  tagline?: string;
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
  cardValues: TwentyEightCardValue[];
  rules: string[];
  bidding: string[];
  strategyTips: string[];
  variations: Variation[];
}

// Kaali Teeri (250)
export interface KaaliTeeriGame {
  id: 'kaali-teeri';
  name: string;
  tagline?: string;
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
  rules: string[];
  specialCards: string[];
  bidding: string[];
  strategyTips: string[];
  variations: Variation[];
}

export type Game = YahtzeeGame | PokerGame | RideBusGame | TeenPattiGame | BlackjackGame | CrapsGame | FlipCupGame | AssholeGame | TwentyEightGame | KaaliTeeriGame;

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
