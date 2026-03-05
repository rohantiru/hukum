import { useState, useCallback, useEffect } from 'react';
import DiceFace from './DiceFace';

type Phase = 'idle' | 'comeOut' | 'pointPhase';
type Result = 'natural' | 'craps' | 'pointMade' | 'sevenOut' | null;

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

const POINT_NUMS = [4, 5, 6, 8, 9, 10];
const NATURALS = [7, 11];
const CRAPS_NUMS = [2, 3, 12];

function resultLabel(total: number, phase: Phase, point: number | null): string {
  if (phase === 'comeOut') {
    if (NATURALS.includes(total)) return `${total} — Natural! Pass Line wins instantly!`;
    if (CRAPS_NUMS.includes(total)) return total === 12 ? `${total} — Midnight! Push on Don't Pass.` : `${total} — Craps! Pass Line loses.`;
    return `${total} — Point is set! Roll ${total} again before a 7.`;
  }
  if (phase === 'pointPhase') {
    if (total === 7) return `7 — Seven Out! Pass Line loses. New shooter.`;
    if (total === point) return `${total} — Point made! Pass Line wins!`;
    return `${total} — Not the point (${point}). Keep rolling!`;
  }
  return '';
}

const diceOdds: Record<number, number> = {
  2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 5, 9: 4, 10: 3, 11: 2, 12: 1,
};

export default function CrapsSimulation({ onViewRules }: { onViewRules?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [point, setPoint] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollResult, setRollResult] = useState<string>('');
  const [result, setResult] = useState<Result>(null);
  const [rollHistory, setRollHistory] = useState<{ dice: [number, number]; total: number; note: string }[]>([]);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    setTimeout(() => {
      const d1 = rollDie();
      const d2 = rollDie();
      const total = d1 + d2;
      setDice([d1, d2]);
      setRolling(false);

      let note = '';
      let newResult: Result = null;

      if (phase === 'idle' || phase === 'comeOut') {
        setPhase('comeOut');
        if (NATURALS.includes(total)) {
          note = '✅ Natural — Pass Line wins!';
          newResult = 'natural';
          setPhase('idle');
          setPoint(null);
        } else if (CRAPS_NUMS.includes(total)) {
          note = total === 12 ? '🤝 Midnight — Push' : '❌ Craps — Pass Line loses';
          newResult = 'craps';
          setPhase('idle');
          setPoint(null);
        } else if (POINT_NUMS.includes(total)) {
          note = `📍 Point set: ${total}`;
          setPoint(total);
          setPhase('pointPhase');
        }
      } else if (phase === 'pointPhase') {
        if (total === 7) {
          note = '❌ Seven Out — Pass Line loses!';
          newResult = 'sevenOut';
          setPhase('idle');
          setPoint(null);
        } else if (total === point) {
          note = `✅ Point made (${total}) — Pass Line wins!`;
          newResult = 'pointMade';
          setPhase('idle');
          setPoint(null);
        } else {
          note = `Not the point. Keep rolling!`;
        }
      }

      setResult(newResult);
      setRollResult(resultLabel(total, phase === 'idle' ? 'comeOut' : phase, point));
      setRollHistory(prev => [{ dice: [d1, d2] as [number, number], total, note }, ...prev].slice(0, 6));
    }, 400);
  }, [rolling, phase, point]);

  const reset = () => {
    setPhase('idle');
    setDice([1, 1]);
    setPoint(null);
    setRolling(false);
    setRollResult('');
    setResult(null);
    setRollHistory([]);
  };

  const resultColors: Record<string, string> = {
    natural: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
    craps: 'text-red-300 bg-red-500/20 border-red-500/40',
    pointMade: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
    sevenOut: 'text-red-300 bg-red-500/20 border-red-500/40',
  };

  useEffect(() => {
    if (result !== null) setRoundsPlayed(prev => prev + 1);
  }, [result]);

  const isStarted = phase !== 'idle' || rollHistory.length > 0;
  const currentTotal = dice[0] + dice[1];

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-stone-900 to-stone-800">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Craps — Pass Line Bet</h3>
            <p className="text-white/50 text-xs mt-0.5">Roll 7/11 to win, 2/3/12 to lose, anything else sets the point</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
            phase === 'idle' ? 'bg-stone-600/50 border-stone-500/40 text-stone-400' :
            phase === 'comeOut' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' :
            'bg-amber-500/20 border-amber-500/40 text-amber-400'
          }`}>
            {phase === 'idle' ? 'Come Out' : phase === 'comeOut' ? 'Come Out' : `Point: ${point}`}
          </div>
        </div>
      </div>

      {roundsPlayed >= 2 && !nudgeDismissed && onViewRules && (
        <div className="mx-5 mt-3 flex items-center justify-between gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
          <p className="text-white/70 text-sm">
            Need a refresher?{' '}
            <button onClick={onViewRules} className="text-white font-semibold underline underline-offset-2 hover:text-white/90 transition-colors">
              View the rules →
            </button>
          </p>
          <button onClick={() => setNudgeDismissed(true)} className="text-white/40 hover:text-white/70 transition-colors text-xl leading-none shrink-0" aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Dice display */}
        <div className="bg-white/5 rounded-xl p-6 flex items-center justify-center gap-6">
          <DiceFace value={dice[0]} rolling={rolling} />
          <div className="text-white/30 text-2xl font-light">+</div>
          <DiceFace value={dice[1]} rolling={rolling} />
          <div className="text-white/30 text-2xl font-light">=</div>
          <div className={`text-4xl font-black ${rolling ? 'text-white/30' : 'text-white'} transition-colors`}>
            {rolling ? '?' : currentTotal}
          </div>
        </div>

        {/* Point indicator */}
        {phase === 'pointPhase' && point && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center font-black text-stone-900 text-lg">
              {point}
            </div>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Point is {point}</p>
              <p className="text-amber-400/60 text-xs">Roll {point} before a 7 to win. Roll 7 = seven out.</p>
            </div>
          </div>
        )}

        {/* Roll result */}
        {rollResult && !rolling && (
          <div className={`rounded-xl p-3 border text-sm font-semibold ${
            result ? resultColors[result] : 'bg-white/5 border-white/10 text-white/70'
          }`}>
            {result === 'natural' || result === 'pointMade' ? '🎉 ' : result === 'craps' || result === 'sevenOut' ? '💥 ' : '🎲 '}
            {rollResult}
          </div>
        )}

        {/* Roll button */}
        <button
          onClick={roll}
          disabled={rolling}
          className="w-full py-3.5 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: rolling ? '#374151' : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
        >
          {rolling ? 'Rolling...' : phase === 'idle' && rollHistory.length === 0 ? 'Roll Dice (Come Out)' :
           phase === 'pointPhase' ? `Roll Again (Point: ${point})` : 'New Come Out Roll'}
        </button>

        {/* Roll history */}
        {rollHistory.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Roll History</p>
            <div className="space-y-2">
              {rollHistory.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex gap-1 shrink-0">
                    <span className="text-xs bg-white/10 text-white px-1.5 py-0.5 rounded font-mono">{r.dice[0]}</span>
                    <span className="text-xs bg-white/10 text-white px-1.5 py-0.5 rounded font-mono">{r.dice[1]}</span>
                    <span className="text-xs text-white/40">={r.total}</span>
                  </div>
                  <p className="text-xs text-white/60 truncate">{r.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dice odds reference */}
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Odds of rolling each total</p>
          <div className="grid grid-cols-11 gap-0.5">
            {Array.from({ length: 11 }, (_, i) => i + 2).map(n => (
              <div key={n} className="text-center">
                <div className={`text-xs font-bold ${n === 7 ? 'text-red-400' : n === point ? 'text-amber-400' : 'text-white/70'}`}>
                  {n}
                </div>
                <div className="mt-1 flex flex-col items-center gap-0.5">
                  {Array.from({ length: diceOdds[n] }, (_, j) => (
                    <div key={j} className={`w-1.5 h-1.5 rounded-full ${
                      n === 7 ? 'bg-red-500' : n === point ? 'bg-amber-400' : 'bg-white/20'
                    }`} />
                  ))}
                </div>
                <div className="text-white/30 text-xs mt-1">{diceOdds[n]}/36</div>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-2 text-center">7 is the most likely roll (6/36 = 16.7%)</p>
        </div>

        {isStarted && (
          <button
            onClick={reset}
            className="w-full py-2 rounded-xl text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
