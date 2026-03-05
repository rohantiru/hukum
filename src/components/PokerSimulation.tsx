import { useState } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import PlayingCard from './PlayingCard';

type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

const RANK_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

// Hand categories — higher = better
const CAT = { HIGH_CARD: 0, ONE_PAIR: 1, TWO_PAIR: 2, THREE_OF_A_KIND: 3, STRAIGHT: 4, FLUSH: 5, FULL_HOUSE: 6, FOUR_OF_A_KIND: 7, STRAIGHT_FLUSH: 8, ROYAL_FLUSH: 9 };

interface HandEval {
  cat: number;
  tb: number[];  // tiebreaker values ordered by importance (pair rank first, then kickers)
  label: string;
}

function buildDeck(): string[] {
  const suits = ['♠', '♥', '♦', '♣'];
  const deck: string[] = [];
  for (const suit of suits) for (const rank of RANK_ORDER) deck.push(rank + suit);
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Evaluate exactly 5 cards. Returns category + tiebreaker for proper comparison. */
function rankFive(cards: string[]): HandEval {
  const suits = cards.map(c => c.slice(-1));
  const vals = cards.map(c => RANK_ORDER.indexOf(c.slice(0, -1))).sort((a, b) => b - a);

  // Frequency map
  const freq: Record<number, number> = {};
  for (const v of vals) freq[v] = (freq[v] ?? 0) + 1;

  // Sort groups: by count descending, then rank descending
  // This naturally puts pairs before kickers, quads before kickers, etc.
  const groups = Object.entries(freq)
    .map(([v, c]) => [Number(v), c] as [number, number])
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const tb = groups.map(g => g[0]);
  const counts = groups.map(g => g[1]);

  const isFlush = new Set(suits).size === 1;
  const isSeq = vals[0] - vals[4] === 4 && new Set(vals).size === 5;
  const isWheel = new Set(vals).size === 5 && JSON.stringify([...vals].sort((a,b)=>a-b)) === JSON.stringify([0,1,2,3,12]);

  if (isFlush && isSeq) return { cat: vals[0] === 12 ? CAT.ROYAL_FLUSH : CAT.STRAIGHT_FLUSH, tb: [vals[0]], label: vals[0] === 12 ? '👑 Royal Flush' : '🌊 Straight Flush' };
  if (isFlush && isWheel) return { cat: CAT.STRAIGHT_FLUSH, tb: [3], label: '🌊 Straight Flush (Wheel)' };
  if (counts[0] === 4) return { cat: CAT.FOUR_OF_A_KIND, tb, label: '🎯 Four of a Kind' };
  if (counts[0] === 3 && counts[1] === 2) return { cat: CAT.FULL_HOUSE, tb, label: '🏠 Full House' };
  if (isFlush) return { cat: CAT.FLUSH, tb: vals, label: '♥ Flush' };
  if (isSeq) return { cat: CAT.STRAIGHT, tb: [vals[0]], label: '⬆️ Straight' };
  if (isWheel) return { cat: CAT.STRAIGHT, tb: [3], label: '⬆️ Straight (Wheel)' };
  if (counts[0] === 3) return { cat: CAT.THREE_OF_A_KIND, tb, label: '🎲 Three of a Kind' };
  if (counts[0] === 2 && counts[1] === 2) return { cat: CAT.TWO_PAIR, tb, label: '👥 Two Pair' };
  if (counts[0] === 2) return { cat: CAT.ONE_PAIR, tb, label: '🃏 One Pair' };
  return { cat: CAT.HIGH_CARD, tb: vals, label: '🔢 High Card' };
}

/** Pick the best 5-card hand from 7 cards (all C(7,5)=21 combos). */
function evaluateHand(cards: string[]): HandEval {
  let best: HandEval = { cat: -1, tb: [], label: '' };
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const five = cards.filter((_, k) => k !== i && k !== j);
      const r = rankFive(five);
      if (r.cat > best.cat) { best = r; continue; }
      if (r.cat === best.cat) {
        for (let k = 0; k < Math.max(r.tb.length, best.tb.length); k++) {
          const rv = r.tb[k] ?? -1, bv = best.tb[k] ?? -1;
          if (rv > bv) { best = r; break; }
          if (rv < bv) break;
        }
      }
    }
  }
  return best;
}

/** Compare two evaluated hands. Returns 1 (a wins), -1 (b wins), 0 (tie). */
function compareHands(a: HandEval, b: HandEval): 1 | -1 | 0 {
  if (a.cat !== b.cat) return a.cat > b.cat ? 1 : -1;
  for (let i = 0; i < Math.max(a.tb.length, b.tb.length); i++) {
    const av = a.tb[i] ?? -1, bv = b.tb[i] ?? -1;
    if (av !== bv) return av > bv ? 1 : -1;
  }
  return 0;
}

function dealNewHand() {
  const deck = shuffle(buildDeck());
  return {
    playerHole: [deck[0], deck[1]],
    opponentHole: [deck[2], deck[3]],
    community: [deck[4], deck[5], deck[6], deck[7], deck[8]],
    blinds: 10 + Math.floor(Math.random() * 3) * 5, // ₹10, ₹15 or ₹20 big blind
  };
}

const streetLabel: Record<Street, string> = {
  preflop: 'Pre-Flop', flop: 'Flop', turn: 'Turn', river: 'River', showdown: 'Showdown',
};

const streetNote: Record<Street, string> = {
  preflop: 'Blinds posted · players bet before seeing community cards',
  flop: '3 community cards dealt · first round of betting',
  turn: '4th community card · second round of betting',
  river: '5th (final) community card · last round of betting',
  showdown: 'All cards revealed · best 5-card hand wins',
};

export default function PokerSimulation() {
  const [hand, setHand] = useState(() => dealNewHand());
  const [street, setStreet] = useState<Street>('preflop');

  const streetIdx = STREETS.indexOf(street);

  const visibleCommunity = [
    ...(street === 'preflop' ? [] : hand.community.slice(0, 3)),
    ...(street === 'turn' || street === 'river' || street === 'showdown' ? hand.community.slice(3, 4) : []),
    ...(street === 'river' || street === 'showdown' ? hand.community.slice(4, 5) : []),
  ];

  const bb = hand.blinds;
  const pot = street === 'preflop' ? bb * 3
    : street === 'flop' ? bb * 3 + bb * 4
    : street === 'turn' ? bb * 3 + bb * 4 + bb * 9
    : bb * 3 + bb * 4 + bb * 9 + bb * 16;

  const playerEval = street === 'showdown' ? evaluateHand([...hand.playerHole, ...hand.community]) : null;
  const oppEval = street === 'showdown' ? evaluateHand([...hand.opponentHole, ...hand.community]) : null;
  const result = (playerEval && oppEval) ? compareHands(playerEval, oppEval) : null;

  const reset = () => { setHand(dealNewHand()); setStreet('preflop'); };
  const advance = () => { const next = STREETS[streetIdx + 1]; if (next) setStreet(next); };

  return (
    <div className="space-y-5">
      {/* Table */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-5 shadow-xl border border-emerald-700">
        {/* Street progress */}
        <div className="flex items-center justify-center gap-1 mb-4">
          {STREETS.filter(s => s !== 'showdown').map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                STREETS.indexOf(street) >= i ? 'bg-white text-emerald-800' : 'bg-emerald-700/50 text-emerald-400'
              }`}>{streetLabel[s]}</div>
              {i < 3 && <ChevronRight size={12} className="text-emerald-600" />}
            </div>
          ))}
        </div>

        {/* Street note */}
        <p className="text-emerald-400 text-xs text-center mb-4 italic">{streetNote[street]}</p>

        {/* Opponent hand */}
        <div className="mb-4">
          <p className="text-emerald-300 text-xs text-center mb-2 font-medium uppercase tracking-wider">Opponent's Hand</p>
          <div className="flex justify-center gap-3">
            {street === 'showdown' ? (
              hand.opponentHole.map((card, i) => (
                <div key={i} className="card-deal" style={{ animationDelay: `${i * 0.1}s` }}>
                  <PlayingCard card={card} size="md" />
                </div>
              ))
            ) : (
              <><PlayingCard hidden size="md" /><PlayingCard hidden size="md" /></>
            )}
          </div>
          {street === 'showdown' && oppEval && (
            <div className="text-center mt-2 fade-in">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                result === -1 ? 'bg-yellow-400 text-yellow-900' : 'bg-emerald-700 text-emerald-200'
              }`}>{oppEval.label}</span>
            </div>
          )}
        </div>

        {/* Community cards */}
        <div className="mb-4">
          <p className="text-emerald-300 text-xs text-center mb-2 font-medium uppercase tracking-wider">Community Cards</p>
          <div className="flex justify-center gap-2 flex-wrap min-h-[80px] items-center">
            {street === 'preflop' ? (
              <span className="text-emerald-400 text-sm italic">Waiting for flop…</span>
            ) : (
              <>
                {visibleCommunity.map((card, i) => (
                  <div key={i} className="card-deal" style={{ animationDelay: `${i * 0.08}s` }}>
                    <PlayingCard card={card} />
                  </div>
                ))}
                {Array.from({ length: 5 - visibleCommunity.length }).map((_, i) => (
                  <PlayingCard key={`h-${i}`} hidden />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Pot + explanation */}
        <div className="text-center mb-4">
          <span className="bg-yellow-400/20 text-yellow-300 text-sm font-semibold px-3 py-1 rounded-full border border-yellow-400/30">
            💰 Pot: ₹{pot}
          </span>
          <p className="text-emerald-500 text-xs mt-1.5">
            Big blind ₹{bb} · {
              street === 'preflop' ? `3 BB in blinds (₹${bb * 3})`
              : street === 'flop' ? `+4 BB flop bets (₹${bb*4})`
              : street === 'turn' ? `+9 BB turn bets (₹${bb*9})`
              : street === 'river' ? `+16 BB river bets (₹${bb*16})`
              : 'final pot'
            }
          </p>
        </div>

        {/* Player hand */}
        <div>
          <p className="text-emerald-300 text-xs text-center mb-2 font-medium uppercase tracking-wider">Your Hand</p>
          <div className="flex justify-center gap-3">
            {hand.playerHole.map((card, i) => (
              <div key={i} className="card-deal" style={{ animationDelay: `${i * 0.1}s` }}>
                <PlayingCard card={card} size="md" />
              </div>
            ))}
          </div>
          {street === 'showdown' && playerEval && (
            <div className="text-center mt-2 fade-in">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                result === 1 ? 'bg-yellow-400 text-yellow-900' : 'bg-emerald-700 text-emerald-200'
              }`}>{playerEval.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* Winner banner */}
      {street === 'showdown' && result !== null && (
        <div className={`rounded-xl p-4 border-2 text-center fade-in ${
          result === 1 ? 'bg-yellow-50 border-yellow-300'
          : result === -1 ? 'bg-red-50 border-red-200'
          : 'bg-stone-50 border-stone-200'
        }`}>
          <p className={`font-extrabold text-lg ${
            result === 1 ? 'text-yellow-700' : result === -1 ? 'text-red-600' : 'text-stone-600'
          }`}>
            {result === 1 ? `🏆 You win! +₹${pot}`
            : result === -1 ? `😤 Opponent wins (${oppEval!.label})`
            : '🤝 Split pot — identical hands!'}
          </p>
          {result === 1 && playerEval && oppEval && (
            <p className="text-xs text-stone-500 mt-1">{playerEval.label} beats {oppEval.label}</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {street !== 'showdown' && (
          <button
            onClick={advance}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {street === 'river' ? 'Go to Showdown' : `Deal ${streetLabel[STREETS[streetIdx + 1]]}`}
            <ChevronRight size={16} />
          </button>
        )}
        <button
          onClick={reset}
          className={`flex items-center gap-2 py-2.5 px-4 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium rounded-xl transition-colors ${street === 'showdown' ? 'flex-1 justify-center' : ''}`}
        >
          <RotateCcw size={14} />
          {street === 'showdown' ? 'Deal New Hand' : 'Restart'}
        </button>
      </div>

      {/* Hand rankings quick ref */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
          <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Hand Rankings (best → worst)</h4>
        </div>
        <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-0.5">
          {[
            ['👑 Royal Flush', 'A K Q J 10 same suit'],
            ['🌊 Straight Flush', '5 in a row, same suit'],
            ['🎯 Four of a Kind', '4 same rank'],
            ['🏠 Full House', '3+2 same rank'],
            ['♥ Flush', '5 same suit'],
            ['⬆️ Straight', '5 in a row'],
            ['🎲 Three of a Kind', '3 same rank'],
            ['👥 Two Pair', 'Two different pairs'],
            ['🃏 One Pair', 'Two same rank'],
            ['🔢 High Card', 'Highest card wins'],
          ].map(([name, desc]) => (
            <div key={name} className="flex flex-col py-1 text-xs border-b border-stone-50 last:border-0">
              <span className="font-semibold text-stone-700">{name}</span>
              <span className="text-stone-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
