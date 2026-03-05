import { useState, useCallback, useEffect } from 'react';

// Card ranks: 2=lowest, 3, 4...K, A=14 (highest)
const RANK_NAMES: Record<number, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8',
  9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};
const SUITS = ['♠', '♥', '♦', '♣'];

interface Card { rank: number; suit: string; }

function mkCard(rank: number): Card {
  return { rank, suit: SUITS[Math.floor(Math.random() * 4)] };
}

function dealHand(count: number): Card[] {
  const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14];
  const shuffled = [...ranks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(r => mkCard(r));
}


function CardChip({ card, selected, onClick, disabled }: {
  card: Card; selected: boolean; onClick: () => void; disabled: boolean;
}) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex flex-col items-center w-10 h-14 rounded-lg border-2 text-sm font-bold transition-all shrink-0',
        selected
          ? 'border-amber-500 bg-amber-50 -translate-y-2 shadow-md'
          : 'border-stone-200 bg-white hover:border-stone-400',
        disabled ? 'opacity-50 cursor-default' : 'cursor-pointer',
        isRed ? 'text-red-600' : 'text-stone-800',
      ].join(' ')}
    >
      <span className="mt-1 text-xs leading-none">{RANK_NAMES[card.rank]}</span>
      <span className="text-base leading-none">{card.suit}</span>
    </button>
  );
}

function PileDisplay({ pile }: { pile: Card[] | null }) {
  if (!pile || pile.length === 0) {
    return (
      <div className="w-full py-4 border-2 border-dashed border-stone-200 rounded-xl text-center">
        <p className="text-stone-400 text-sm">Table is empty — lead anything</p>
      </div>
    );
  }
  const topCard = pile[0];
  const isRed = topCard.suit === '♥' || topCard.suit === '♦';
  return (
    <div className="w-full py-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-center gap-3">
      <div className="flex -space-x-2">
        {pile.map((_, i) => (
          <div key={i} className="w-9 h-12 rounded-lg border border-stone-300 bg-white shadow-sm" style={{ zIndex: i }} />
        ))}
      </div>
      <div className={`flex flex-col items-center font-extrabold text-lg leading-none ${isRed ? 'text-red-600' : 'text-stone-800'}`}>
        <span>{RANK_NAMES[topCard.rank]}</span>
        <span>{topCard.suit}</span>
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-stone-600">{pile.length === 1 ? 'Single' : pile.length === 2 ? 'Pair' : `${pile.length}x`}</p>
        <p className="text-xs text-stone-400">Beat with higher</p>
      </div>
    </div>
  );
}

type Phase = 'player' | 'cpu-thinking' | 'result';

export default function AssholeSimulation({ onViewRules }: { onViewRules?: () => void } = {}) {
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [cpuCount, setCpuCount] = useState(7);
  const [pile, setPile] = useState<Card[] | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('player');
  const [message, setMessage] = useState('');
  const [roundLog, setRoundLog] = useState<string[]>([]);
  const [exchangesLeft, setExchangesLeft] = useState(3);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const init = useCallback(() => {
    const hand = dealHand(7).sort((a, b) => a.rank - b.rank);
    setPlayerHand(hand);
    setCpuCount(7);
    setPile(null);
    setSelected([]);
    setPhase('player');
    setMessage('');
    setRoundLog([]);
    setExchangesLeft(3);
  }, []);

  useEffect(() => { init(); }, [init]);

  function toggleSelect(idx: number) {
    if (phase !== 'player') return;
    const card = playerHand[idx];
    const firstSel = selected.length > 0 ? playerHand[selected[0]].rank : null;
    // Must select same rank
    if (firstSel !== null && card.rank !== firstSel) return;
    setSelected(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }

  function canPlay(): boolean {
    if (selected.length === 0) return false;
    if (!pile || pile.length === 0) return true; // Empty table: anything goes
    const selRank = playerHand[selected[0]].rank;
    const selCount = selected.length;
    const pileCount = pile.length;
    if (selCount > pileCount) return true; // More cards beats fewer (pairs beat singles)
    if (selCount < pileCount) return false; // Fewer cards can't beat more
    return selRank > pile[0].rank; // Same count: higher rank wins
  }

  function play() {
    if (!canPlay()) return;
    const played = selected.map(i => playerHand[i]);
    const newHand = playerHand.filter((_, i) => !selected.includes(i));
    // Pile only clears when all players pass — playing never auto-clears
    const clears = false;
    const newPile = played;
    setPile(newPile);
    setPlayerHand(newHand);
    setSelected([]);

    const rankName = RANK_NAMES[played[0].rank];
    const log = clears
      ? `You played ${played.length > 1 ? `${played.length}x ` : ''}${rankName} — pile cleared! You lead next.`
      : `You played ${played.length > 1 ? `${played.length}x ` : ''}${rankName}.`;
    setRoundLog(prev => [...prev, log]);

    if (newHand.length === 0) {
      setMessage('🎉 You played all your cards — you win this round!');
      setPhase('result');
      setRoundsPlayed(r => r + 1);
      return;
    }

    setPhase('cpu-thinking');
    setMessage('CPU is thinking...');

    setTimeout(() => {
      // CPU logic: find smallest valid play (can play pairs on singles), or pass
      const pileQty = clears ? 0 : (newPile?.length ?? 0);
      const minRank = clears ? 0 : (newPile?.[0]?.rank ?? 0);
      // CPU may upgrade to pair on single (pairs beat singles)
      const qty = pileQty === 0 ? 1 : (Math.random() > 0.6 && pileQty === 1 ? 2 : pileQty);
      // If upgrading count (pair on single), any rank is valid; else need higher rank
      const effectiveMinRank = qty > pileQty ? 0 : minRank;
      // Group CPU's simulated hand by rank
      const cpuRanks = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        .filter(r => r > effectiveMinRank)
        .filter(() => Math.random() > 0.3); // CPU doesn't always have cards

      const validPlay = cpuRanks.find(r => r > effectiveMinRank);
      if (validPlay && Math.random() > 0.3) {
        const cpuPlayed = Array(qty).fill(null).map(() => mkCard(validPlay));
        setPile(cpuPlayed);
        const cpuLog = `CPU played ${qty > 1 ? `${qty}x ` : ''}${RANK_NAMES[validPlay]}.`;
        setRoundLog(prev => [...prev, cpuLog]);
        setCpuCount(c => Math.max(0, c - qty));

        if (Math.random() > 0.7) {
          setMessage('CPU played — now you go');
          setPhase('player');
          setExchangesLeft(e => e - 1);
          if (exchangesLeft <= 1) {
            setMessage(`Round over! You have ${newHand.length} cards, CPU has ~${Math.max(0, cpuCount - qty)} cards.`);
            setPhase('result');
            setRoundsPlayed(r => r + 1);
          }
        } else {
          setMessage('CPU played — your turn');
          setPhase('player');
          setExchangesLeft(e => e - 1);
        }
      } else {
        setRoundLog(prev => [...prev, 'CPU passes.']);
        setMessage('CPU passed — you lead the next pile!');
        setPile(null);
        setPhase('player');
        setExchangesLeft(e => e - 1);
        if (exchangesLeft <= 1) {
          setMessage(`Round over! You have ${newHand.length} cards, CPU has ~${cpuCount} cards.`);
          setPhase('result');
          setRoundsPlayed(r => r + 1);
        }
      }
    }, 900);
  }

  function pass() {
    setRoundLog(prev => [...prev, 'You pass.']);
    setPhase('cpu-thinking');
    setMessage('CPU is thinking...');
    setTimeout(() => {
      const pileQty = pile?.length ?? 0;
      const minRank = pile?.[0]?.rank ?? 0;
      // CPU may play a pair to beat a single
      const qty = pileQty <= 1 && Math.random() > 0.5 ? 2 : (pileQty || 1);
      const effectiveMinRank = qty > pileQty ? 0 : minRank;
      const validPlay = [11, 12, 13, 14].find(r => r > effectiveMinRank && Math.random() > 0.4);
      if (validPlay) {
        const cpuPlayed = Array(qty).fill(null).map(() => mkCard(validPlay));
        setPile(cpuPlayed);
        setRoundLog(prev => [...prev, `CPU played ${qty > 1 ? `${qty}x ` : ''}${RANK_NAMES[validPlay]}.`]);
        setCpuCount(c => Math.max(0, c - qty));
      } else {
        setRoundLog(prev => [...prev, 'CPU passes — pile cleared!']);
        setPile(null);
      }
      setExchangesLeft(e => e - 1);
      if (exchangesLeft <= 1) {
        setMessage(`Round over! You have ${playerHand.length} cards, CPU has ~${cpuCount} cards.`);
        setPhase('result');
        setRoundsPlayed(r => r + 1);
      } else {
        setMessage('Your turn — lead anything!');
        setPhase('player');
      }
    }, 700);
  }

  const playerIsWinning = playerHand.length < cpuCount;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-lg">Asshole Simulator</h3>
            <p className="text-purple-100 text-xs mt-0.5">Get rid of your cards first!</p>
          </div>
          <span className="text-3xl">♠</span>
        </div>
      </div>

      {/* Nudge */}
      {roundsPlayed >= 2 && !nudgeDismissed && onViewRules && (
        <div className="mx-5 mt-4 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-purple-700 text-sm font-medium">Forgot the rules?</p>
          <div className="flex gap-2">
            <button onClick={onViewRules} className="text-purple-600 text-xs font-bold hover:text-purple-800 underline">
              View the rules →
            </button>
            <button onClick={() => setNudgeDismissed(true)} className="text-purple-400 text-xs hover:text-purple-600">✕</button>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Scores */}
        <div className="flex gap-3">
          <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
            <p className="text-xs text-purple-500 font-semibold">You</p>
            <p className="text-2xl font-extrabold text-purple-700">{playerHand.length}</p>
            <p className="text-xs text-purple-400">cards left</p>
          </div>
          <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center border border-stone-200">
            <p className="text-xs text-stone-400 font-semibold">CPU</p>
            <p className="text-2xl font-extrabold text-stone-600">~{cpuCount}</p>
            <p className="text-xs text-stone-400">cards left</p>
          </div>
        </div>

        {/* Pile */}
        <div>
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-1.5">Table</p>
          <PileDisplay pile={pile} />
        </div>

        {/* Player hand */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide">Your Hand</p>
            {selected.length > 0 && (
              <p className="text-xs text-amber-600 font-semibold">
                {selected.length} selected — {canPlay() ? 'ready to play' : 'too low to beat pile'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-16 items-start">
            {playerHand.map((card, idx) => (
              <CardChip
                key={idx}
                card={card}
                selected={selected.includes(idx)}
                onClick={() => toggleSelect(idx)}
                disabled={phase !== 'player'}
              />
            ))}
            {playerHand.length === 0 && (
              <p className="text-stone-400 text-sm">No cards left!</p>
            )}
          </div>
          {pile && pile.length > 0 && (
            <p className="text-xs text-stone-400 mt-1">
              Pairs beat singles · pile clears when all pass
            </p>
          )}
        </div>

        {/* Action buttons */}
        {phase === 'player' && (
          <div className="flex gap-2">
            <button
              onClick={play}
              disabled={!canPlay()}
              className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-purple-700 transition text-sm"
            >
              Play Selected
            </button>
            <button
              onClick={pass}
              disabled={!pile || pile.length === 0}
              className="px-4 py-2.5 bg-stone-100 text-stone-600 font-semibold rounded-xl disabled:opacity-40 hover:bg-stone-200 transition text-sm"
            >
              Pass
            </button>
          </div>
        )}

        {phase === 'cpu-thinking' && (
          <div className="text-center py-2">
            <p className="text-stone-400 text-sm animate-pulse">CPU is thinking...</p>
          </div>
        )}

        {/* Round log */}
        {roundLog.length > 0 && (
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1 max-h-24 overflow-y-auto">
            {roundLog.map((log, i) => (
              <p key={i} className="text-xs text-stone-500">{log}</p>
            ))}
          </div>
        )}

        {/* Message */}
        {message && (
          <p className={`text-sm font-semibold text-center ${playerIsWinning ? 'text-purple-700' : 'text-stone-600'}`}>
            {message}
          </p>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className={`rounded-xl p-4 text-center border-2 ${playerHand.length === 0 ? 'bg-green-50 border-green-300' : playerIsWinning ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-extrabold text-lg ${playerHand.length === 0 ? 'text-green-700' : playerIsWinning ? 'text-amber-700' : 'text-red-600'}`}>
              {playerHand.length === 0 ? '🏆 You emptied your hand first!' : playerIsWinning ? '👑 You had fewer cards — well played!' : '😤 CPU had fewer cards this round'}
            </p>
            <p className="text-xs text-stone-400 mt-1">
              {playerHand.length === 0 ? 'President! Best seat next round 🎉' : playerIsWinning ? 'Strong finish — keep the pressure on!' : 'Save your Aces and face cards — use them to clear stubborn piles!'}
            </p>
            <button
              onClick={init}
              className="mt-3 px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition text-sm"
            >
              New Round
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
