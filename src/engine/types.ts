import type { LazyExoticComponent, FC } from 'react';

/**
 * Props shared by all simulation components.
 * Most simulations accept an optional callback to jump to the rules tab.
 */
export interface SimProps {
  onViewRules?: () => void;
}

/**
 * Per-game simulation protocol. Each game defines its own S (state) and A (action)
 * types — no forced universal schema. Implement this if you want typed reducers,
 * undo history, or bot moves. Optional: simpler games can keep using useState.
 */
export interface SimulationProtocol<S, A> {
  /** Return the initial game state */
  initialState: () => S;
  /** Pure reducer: (state, action) → next state (never mutate state) */
  reducer: (state: S, action: A) => S;
  /** Optional: return an action for the bot to play */
  botMove?: (state: S) => A;
}

/**
 * An entry in the simulation registry. `component` is lazy-loaded so it's
 * only bundled when the user visits that game. `footnote` is optional
 * explanatory text rendered beneath the simulation.
 */
export interface SimulationEntry {
  component: LazyExoticComponent<FC<SimProps>>;
  footnote?: string;
}
