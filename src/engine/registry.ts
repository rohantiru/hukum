import { lazy } from 'react';
import type { SimulationEntry } from './types';

/**
 * Central registry mapping game IDs to their simulation components.
 *
 * Each simulation is lazy-loaded (React.lazy) so its bundle chunk is only
 * fetched when the user visits that game's page — keeps the initial load fast.
 *
 * To add a new game simulation:
 *   1. Create src/components/YourGameSimulation.tsx
 *   2. Add an entry here — GameDetailPage picks it up automatically.
 *
 * `footnote` is optional text rendered beneath the simulation (e.g. assumptions).
 */
export const simulationRegistry: Record<string, SimulationEntry> = {
  'yahtzee': {
    component: lazy(() => import('../components/YahtzeeSimulation')),
  },
  'texas-holdem': {
    component: lazy(() => import('../components/PokerSimulation')),
  },
  'ride-the-bus': {
    component: lazy(() => import('../components/RideBusSimulation')),
  },
  'teen-patti': {
    component: lazy(() => import('../components/TeenPattiSimulation')),
    footnote:
      'Simulation assumes: 4-player table · Boot ₹10/player (₹40 starting pot) · Chaal (current stake) ₹20 · Seen costs ₹30 total (boot + chaal), Blind costs ₹20 (boot + half chaal) · Dealer always plays seen and calls at ₹20. Win = collect the full pot.',
  },
  'blackjack': {
    component: lazy(() => import('../components/BlackjackSimulation')),
  },
  'craps': {
    component: lazy(() => import('../components/CrapsSimulation')),
  },
  'flip-cup': {
    component: lazy(() => import('../components/FlipCupSimulation')),
  },
  'asshole': {
    component: lazy(() => import('../components/AssholeSimulation')),
  },
  'twenty-eight': {
    component: lazy(() => import('../components/TwentyEightSimulation')),
  },
  'kaali-teeri': {
    component: lazy(() => import('../components/KaaliTeeriSimulation')),
  },
};

/** IDs of all games that have a simulation — replaces the old GAMES_WITH_SIMULATION Set */
export const SIMULATED_GAMES = new Set(Object.keys(simulationRegistry));
