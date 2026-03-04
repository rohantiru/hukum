import { useState, useCallback } from 'react';
import { RotateCcw, Dices } from 'lucide-react';
import DiceFace from './DiceFace';

type ScoringCategory = {
  name: string;
  key: string;
  fn: (dice: number[]) => number;
  upper?: boolean;
};

const CATEGORIES: ScoringCategory[] = [
  { name: 'Aces', key: 'aces', fn: (d) => d.filter((x) => x === 1).reduce((a, b) => a + b, 0), upper: true },
  { name: 'Twos', key: 'twos', fn: (d) => d.filter((x) => x === 2).reduce((a, b) => a + b, 0), upper: true },
  { name: 'Threes', key: 'threes', fn: (d) => d.filter((x) => x === 3).reduce((a, b) => a + b, 0), upper: true },
  { name: 'Fours', key: 'fours', fn: (d) => d.filter((x) => x === 4).reduce((a, b) => a + b, 0), upper: true },
  { name: 'Fives', key: 'fives', fn: (d) => d.filter((x) => x === 5).reduce((a, b) => a + b, 0), upper: true },
  { name: 'Sixes', key: 'sixes', fn: (d) => d.filter((x) => x === 6).reduce((a, b) => a + b, 0), upper: true },
  {
    name: '3 of a Kind', key: '3oak', fn: (d) => {
      const counts = d.reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {} as Record<number, number>);
      return Object.values(counts).some((c) => c >= 3) ? d.reduce((a, b) => a + b, 0) : 0;
    },
  },
  {
    name: '4 of a Kind', key: '4oak', fn: (d) => {
      const counts = d.reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {} as Record<number, number>);
      return Object.values(counts).some((c) => c >= 4) ? d.reduce((a, b) => a + b, 0) : 0;
    },
  },
  {
    name: 'Full House', key: 'fullhouse', fn: (d) => {
      const counts = Object.values(
        d.reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {} as Record<number, number>)
      ).sort();
      return JSON.stringify(counts) === '[2,3]' ? 25 : 0;
    },
  },
  {
    name: 'Sm. Straight', key: 'smstraight', fn: (d) => {
      const uniq = [...new Set(d)].sort((a, b) => a - b);
      const str = uniq.join('');
      return (
        str.includes('1234') || str.includes('2345') || str.includes('3456') ? 30 : 0
      );
    },
  },
  {
    name: 'Lg. Straight', key: 'lgstraight', fn: (d) => {
      const uniq = [...new Set(d)].sort((a, b) => a - b);
      return uniq.length === 5 && (uniq[4] - uniq[0] === 4) ? 40 : 0;
    },
  },
  {
    name: 'Yahtzee', key: 'yahtzee', fn: (d) => {
      const counts = d.reduce((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {} as Record<number, number>);
      return Object.values(counts).some((c) => c === 5) ? 50 : 0;
    },
  },
  { name: 'Chance', key: 'chance', fn: (d) => d.reduce((a, b) => a + b, 0) },
];

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function rollDice(current: number[], kept: boolean[]): number[] {
  return current.map((v, i) => (kept[i] ? v : rollDie()));
}

function detectBestCategory(dice: number[], scored: Set<string>): string {
  const unscored = CATEGORIES.filter((c) => !scored.has(c.key));
  let best = unscored[0];
  let bestScore = best ? best.fn(dice) : -1;
  for (const cat of unscored) {
    const s = cat.fn(dice);
    if (s > bestScore) {
      bestScore = s;
      best = cat;
    }
  }
  return best?.name ?? 'Chance';
}

export default function YahtzeeSimulation() {
  const [dice, setDice] = useState<number[]>([1, 2, 3, 4, 5]);
  const [kept, setKept] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [rolling, setRolling] = useState(false);
  const [scored, setScored] = useState<Map<string, number>>(new Map());
  const [scoredKeys, setScoredKeys] = useState<Set<string>>(new Set());
  const [lastScored, setLastScored] = useState<{ name: string; points: number } | null>(null);
  const [turnPhase, setTurnPhase] = useState<'idle' | 'rolling' | 'scored'>('idle');
  const [rollHistory, setRollHistory] = useState<number[][]>([]);

  const handleRoll = useCallback(() => {
    if (rollsLeft === 0 || rolling) return;

    setRolling(true);
    setTimeout(() => {
      const newDice = rollsLeft === 3 ? rollDice([0, 0, 0, 0, 0], [false, false, false, false, false]) : rollDice(dice, kept);
      setDice(newDice);
      setRollHistory((h) => [...h, newDice]);
      setRollsLeft((r) => r - 1);
      setTurnPhase('rolling');
      setRolling(false);
    }, 350);
  }, [rollsLeft, rolling, dice, kept]);

  const toggleKeep = (i: number) => {
    if (rollsLeft === 3 || rollsLeft === 0) return; // can only keep after first roll
    setKept((k) => k.map((v, idx) => (idx === i ? !v : v)));
  };

  const handleScore = (cat: ScoringCategory) => {
    if (scoredKeys.has(cat.key) || turnPhase !== 'rolling') return;
    const points = cat.fn(dice);
    setScored((m) => new Map(m).set(cat.key, points));
    setScoredKeys((s) => new Set(s).add(cat.key));
    setLastScored({ name: cat.name, points });
    setTurnPhase('scored');
  };

  const startNewTurn = () => {
    setKept([false, false, false, false, false]);
    setRollsLeft(3);
    setTurnPhase('idle');
    setLastScored(null);
    setRollHistory([]);
  };

  const resetGame = () => {
    setDice([1, 2, 3, 4, 5]);
    setKept([false, false, false, false, false]);
    setRollsLeft(3);
    setRolling(false);
    setScored(new Map());
    setScoredKeys(new Set());
    setLastScored(null);
    setTurnPhase('idle');
    setRollHistory([]);
  };

  const total = [...scored.values()].reduce((a, b) => a + b, 0);
  const upperScore = CATEGORIES.filter((c) => c.upper)
    .map((c) => scored.get(c.key) ?? 0)
    .reduce((a, b) => a + b, 0);
  const bonus = upperScore >= 63 ? 35 : 0;
  const grandTotal = total + bonus;

  const suggestedCategory = turnPhase === 'rolling' ? detectBestCategory(dice, scoredKeys) : null;

  return (
    <div className="space-y-5">
      {/* Dice area */}
      <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-2xl p-5 border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-700">Your Dice</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400">
              {rollsLeft === 3 ? 'Roll to start' : `${rollsLeft} roll${rollsLeft !== 1 ? 's' : ''} left`}
            </span>
            <button
              onClick={resetGame}
              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-600 transition-colors"
              title="Reset game"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Dice */}
        <div className="flex gap-3 justify-center mb-4 flex-wrap">
          {dice.map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <DiceFace
                value={v}
                rolling={rolling && !kept[i]}
                kept={kept[i]}
                onClick={turnPhase === 'rolling' && rollsLeft > 0 ? () => toggleKeep(i) : undefined}
              />
              {turnPhase === 'rolling' && rollsLeft > 0 && (
                <span className="text-xs text-stone-400">{kept[i] ? 'Keep' : 'Roll'}</span>
              )}
            </div>
          ))}
        </div>

        {/* Roll history */}
        {rollHistory.length > 0 && (
          <div className="mb-3 space-y-1">
            {rollHistory.map((roll, i) => (
              <div key={i} className="text-xs text-stone-400 text-center">
                Roll {i + 1}: {roll.map(v => ['⚀','⚁','⚂','⚃','⚄','⚅'][v-1]).join(' ')}
                {' '}→ sum: {roll.reduce((a,b)=>a+b,0)}
              </div>
            ))}
          </div>
        )}

        {/* Roll button */}
        {turnPhase !== 'scored' && (
          <div className="text-center">
            <button
              onClick={handleRoll}
              disabled={rollsLeft === 0 || rolling}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95"
            >
              <Dices size={18} />
              {rollsLeft === 3 ? 'Roll Dice' : rolling ? 'Rolling…' : `Re-roll (${rollsLeft} left)`}
            </button>
            {turnPhase === 'rolling' && rollsLeft > 0 && (
              <p className="text-xs text-stone-400 mt-2">Click dice to keep them, then roll again</p>
            )}
          </div>
        )}

        {/* Scored announcement */}
        {lastScored && (
          <div className="mt-3 text-center fade-in">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${lastScored.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
              {lastScored.points > 0 ? `✓ Scored ${lastScored.points} pts in ${lastScored.name}!` : `✗ 0 pts in ${lastScored.name}`}
            </div>
          </div>
        )}

        {/* Next turn */}
        {turnPhase === 'scored' && scoredKeys.size < 13 && (
          <div className="text-center mt-3">
            <button
              onClick={startNewTurn}
              className="px-5 py-2 bg-stone-700 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Next Turn →
            </button>
          </div>
        )}

        {turnPhase === 'scored' && scoredKeys.size === 13 && (
          <div className="text-center mt-3 fade-in">
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold">
              🎉 Game over! Final score: {grandTotal} pts
            </div>
            <button onClick={resetGame} className="mt-2 text-sm text-stone-500 hover:text-stone-700">
              Play again
            </button>
          </div>
        )}
      </div>

      {/* Suggested move */}
      {suggestedCategory && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
          <span className="font-semibold">Suggestion:</span> Best category for this roll is{' '}
          <span className="font-bold">{suggestedCategory}</span>
          {' '}({CATEGORIES.find(c => c.name === suggestedCategory)?.fn(dice) ?? 0} pts)
        </div>
      )}

      {/* Scorecard */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-semibold text-stone-700 text-sm">Scorecard</h3>
          <span className="text-xs font-bold text-amber-600">Total: {grandTotal}</span>
        </div>

        <div className="divide-y divide-stone-100">
          {/* Upper section */}
          <div className="px-4 pt-3 pb-1">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Upper Section</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              {CATEGORIES.filter((c) => c.upper).map((cat) => {
                const pts = scored.get(cat.key);
                const potential = turnPhase === 'rolling' ? cat.fn(dice) : null;
                const isActive = turnPhase === 'rolling' && !scoredKeys.has(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleScore(cat)}
                    disabled={!isActive || scoredKeys.has(cat.key)}
                    className={[
                      'flex items-center justify-between py-1.5 px-2 rounded-lg text-sm transition-colors w-full',
                      scoredKeys.has(cat.key)
                        ? pts && pts > 0 ? 'text-stone-600' : 'text-stone-300'
                        : isActive
                        ? 'hover:bg-amber-50 hover:text-amber-700 cursor-pointer font-medium text-stone-700'
                        : 'text-stone-400',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span>{cat.name}</span>
                    <span className={pts !== undefined ? (pts > 0 ? 'text-emerald-600 font-bold' : 'text-stone-300') : 'text-amber-400 text-xs'}>
                      {pts !== undefined ? pts : (potential !== null && potential > 0 ? `+${potential}` : '—')}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-xs mt-2 pb-2 text-stone-500">
              <span>Upper total: {upperScore} {upperScore >= 63 ? '✓ +35 bonus!' : `(need ${Math.max(0, 63 - upperScore)} more)`}</span>
              {bonus > 0 && <span className="text-emerald-600 font-semibold">+35 bonus</span>}
            </div>
          </div>

          {/* Lower section */}
          <div className="px-4 pt-3 pb-3">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Lower Section</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              {CATEGORIES.filter((c) => !c.upper).map((cat) => {
                const pts = scored.get(cat.key);
                const potential = turnPhase === 'rolling' ? cat.fn(dice) : null;
                const isActive = turnPhase === 'rolling' && !scoredKeys.has(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleScore(cat)}
                    disabled={!isActive || scoredKeys.has(cat.key)}
                    className={[
                      'flex items-center justify-between py-1.5 px-2 rounded-lg text-sm transition-colors w-full',
                      scoredKeys.has(cat.key)
                        ? pts && pts > 0 ? 'text-stone-600' : 'text-stone-300'
                        : isActive
                        ? 'hover:bg-amber-50 hover:text-amber-700 cursor-pointer font-medium text-stone-700'
                        : 'text-stone-400',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span>{cat.name}</span>
                    <span className={pts !== undefined ? (pts > 0 ? 'text-emerald-600 font-bold' : 'text-stone-300') : 'text-amber-400 text-xs'}>
                      {pts !== undefined ? pts : (potential !== null && potential > 0 ? `+${potential}` : '—')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
