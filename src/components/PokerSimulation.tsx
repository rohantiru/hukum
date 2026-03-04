import { useState } from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import PlayingCard from './PlayingCard';

type Street = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];

const DECK_54 = (() => {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const deck: string[] = [];
  for (const suit of suits) for (const rank of ranks) deck.push(rank + suit);
  return deck;
})();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getHandRank(cards: string[]): string {
  if (cards.length < 5) return '';
  const suits = cards.map((c) => c.slice(-1));
  const ranks = cards.map((c) => c.slice(0, -1));
  const rankOrder = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
  const vals = ranks.map((r) => rankOrder.indexOf(r)).sort((a, b) => b - a);
  const counts: Record<number, number> = {};
  for (const v of vals) counts[v] = (counts[v] ?? 0) + 1;
  const freq = Object.values(counts).sort((a, b) => b - a);
  const isFlush = new Set(suits).size === 1;
  const isSeq = vals[0] - vals[4] === 4 && new Set(vals).size === 5;
  const lowAce = JSON.stringify([...new Set(vals)].sort((a,b)=>a-b)) === JSON.stringify([0,1,2,3,12]);

  if (isFlush && (isSeq || lowAce)) {
    if (vals[0] === 12 && !lowAce) return '👑 Royal Flush';
    return '🌊 Straight Flush';
  }
  if (freq[0] === 4) return '🎯 Four of a Kind';
  if (freq[0] === 3 && freq[1] === 2) return '🏠 Full House';
  if (isFlush) return '♥ Flush';
  if (isSeq || lowAce) return '⬆️ Straight';
  if (freq[0] === 3) return '🎲 Three of a Kind';
  if (freq[0] === 2 && freq[1] === 2) return '👥 Two Pair';
  if (freq[0] === 2) return '🃏 One Pair';
  return '🔢 High Card';
}

interface HandScenario {
  label: string;
  holeCards: string[];
  community: string[];
  actions: { street: Street; pot: number; action: string }[];
}

function generateScenario(): HandScenario {
  const deck = shuffle(DECK_54);
  const hole = [deck[0], deck[1]];
  const community = [deck[2], deck[3], deck[4], deck[5], deck[6]];

  // Simple AI-based action generation
  const actions: { street: Street; pot: number; action: string }[] = [
    {
      street: 'preflop',
      pot: 15,
      action: `You're dealt ${hole[0]} ${hole[1]}. You raise to 6 BB. Opponent calls.`,
    },
    {
      street: 'flop',
      pot: 27,
      action: `Flop: ${community[0]} ${community[1]} ${community[2]}. You check. Opponent bets 12. You call.`,
    },
    {
      street: 'turn',
      pot: 51,
      action: `Turn: ${community[3]}. You bet 20. Opponent calls.`,
    },
    {
      street: 'river',
      pot: 91,
      action: `River: ${community[4]}. You bet 35. Opponent folds. You win the pot!`,
    },
    {
      street: 'showdown',
      pot: 91,
      action: '',
    },
  ];

  return { label: 'Random hand', holeCards: hole, community, actions };
}

const PRESET_SCENARIOS: HandScenario[] = [
  {
    label: 'Big Slick (A♠ K♠)',
    holeCards: ['A♠', 'K♠'],
    community: ['K♦', 'K♥', '7♣', '2♦', 'A♦'],
    actions: [
      { street: 'preflop', pot: 15, action: "You're dealt A♠ K♠ (Big Slick!). Raise to 3× BB. Opponent calls." },
      { street: 'flop', pot: 21, action: 'Flop: K♦ K♥ 7♣ — You hit three Kings! Bet half pot. Opponent calls.' },
      { street: 'turn', pot: 45, action: 'Turn: 2♦ — Blank card. You bet again. Opponent raises. You call.' },
      { street: 'river', pot: 115, action: 'River: A♦ — Full house! Kings full of Aces. You go all-in. Opponent calls.' },
      { street: 'showdown', pot: 115, action: '' },
    ],
  },
  {
    label: 'Bluff with 7-2 offsuit',
    holeCards: ['7♠', '2♦'],
    community: ['A♥', 'K♠', 'Q♣', '9♦', '3♥'],
    actions: [
      { street: 'preflop', pot: 9, action: "You're dealt 7♠ 2♦ (worst hand!). You call the big blind from the button." },
      { street: 'flop', pot: 9, action: 'Flop: A♥ K♠ Q♣ — Missed completely. Opponent checks. You bet as a bluff! Opponent calls.' },
      { street: 'turn', pot: 25, action: 'Turn: 9♦ — Still nothing. Opponent checks. You fire another barrel (bluff). Opponent folds!' },
      { street: 'river', pot: 25, action: "River never reached — opponent folded. You win with 7-high! Bluff successful." },
      { street: 'showdown', pot: 25, action: '' },
    ],
  },
  {
    label: 'Set Mining (5♣ 5♦)',
    holeCards: ['5♣', '5♦'],
    community: ['5♥', 'K♠', '2♦', 'J♣', '7♥'],
    actions: [
      { street: 'preflop', pot: 9, action: "Dealt 5♣ 5♦ — a small pair. Call pre-flop, hoping to flop a set." },
      { street: 'flop', pot: 9, action: 'Flop: 5♥ K♠ 2♦ — Set of Fives! Slow-play: check. Opponent bets. You raise. Opponent calls.' },
      { street: 'turn', pot: 55, action: 'Turn: J♣ — You lead out with a 2/3 pot bet. Opponent calls.' },
      { street: 'river', pot: 115, action: 'River: 7♥ — Board bricked. You move all-in for value. Opponent snap-calls with K-K!' },
      { street: 'showdown', pot: 230, action: '' },
    ],
  },
];

export default function PokerSimulation() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [street, setStreet] = useState<Street>('preflop');
  const [scenario, setScenario] = useState<HandScenario>(PRESET_SCENARIOS[0]);

  const streetIdx = STREETS.indexOf(street);
  const currentAction = scenario.actions.find((a) => a.street === street);
  const visibleCommunity = [
    street === 'preflop' ? [] : scenario.community.slice(0, 3),
    street === 'turn' || street === 'river' || street === 'showdown' ? scenario.community.slice(3, 4) : [],
    street === 'river' || street === 'showdown' ? scenario.community.slice(4, 5) : [],
  ].flat();

  const allFive = scenario.community.slice(0, 5);
  const bestHand = street === 'showdown'
    ? getHandRank([...scenario.holeCards, ...allFive])
    : null;

  const advance = () => {
    const next = STREETS[streetIdx + 1];
    if (next) setStreet(next);
  };

  const reset = (idx?: number) => {
    const i = idx ?? scenarioIdx;
    const s = i === PRESET_SCENARIOS.length ? generateScenario() : PRESET_SCENARIOS[i];
    setScenario(s);
    setStreet('preflop');
    if (idx !== undefined) setScenarioIdx(idx);
  };

  const streetLabel: Record<Street, string> = {
    preflop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
  };

  return (
    <div className="space-y-5">
      {/* Scenario picker */}
      <div className="flex flex-wrap gap-2">
        {PRESET_SCENARIOS.map((s, i) => (
          <button
            key={i}
            onClick={() => reset(i)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              scenarioIdx === i && scenario.label === s.label
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-stone-600 border-stone-200 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => {
            setScenarioIdx(PRESET_SCENARIOS.length);
            reset(PRESET_SCENARIOS.length);
          }}
          className="text-sm px-3 py-1.5 rounded-lg border bg-white text-stone-600 border-stone-200 hover:border-purple-300 hover:text-purple-600 transition-colors"
        >
          🎲 Random hand
        </button>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-2xl p-5 shadow-xl border border-emerald-700">
        {/* Street progress */}
        <div className="flex items-center justify-center gap-1 mb-5">
          {STREETS.filter(s => s !== 'showdown').map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                STREETS.indexOf(street) >= i
                  ? 'bg-white text-emerald-800'
                  : 'bg-emerald-700/50 text-emerald-400'
              }`}>
                {streetLabel[s]}
              </div>
              {i < 3 && <ChevronRight size={12} className="text-emerald-600" />}
            </div>
          ))}
        </div>

        {/* Community cards */}
        <div className="mb-5">
          <p className="text-emerald-300 text-xs text-center mb-2 font-medium uppercase tracking-wider">Community Cards</p>
          <div className="flex justify-center gap-2 flex-wrap min-h-[90px] items-center">
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
                  <PlayingCard key={`hidden-${i}`} hidden />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Pot */}
        {currentAction && (
          <div className="text-center mb-4">
            <span className="bg-yellow-400/20 text-yellow-300 text-sm font-semibold px-3 py-1 rounded-full border border-yellow-400/30">
              💰 Pot: {currentAction.pot} BB
            </span>
          </div>
        )}

        {/* Hole cards */}
        <div>
          <p className="text-emerald-300 text-xs text-center mb-2 font-medium uppercase tracking-wider">Your Hand</p>
          <div className="flex justify-center gap-3">
            {scenario.holeCards.map((card, i) => (
              <div key={i} className="card-deal" style={{ animationDelay: `${i * 0.1}s` }}>
                <PlayingCard card={card} size="md" />
              </div>
            ))}
          </div>
          {bestHand && (
            <div className="text-center mt-3 fade-in">
              <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                {bestHand}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action narrative */}
      {currentAction && (
        <div className={`rounded-xl p-4 border fade-in ${
          street === 'showdown'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-stone-200'
        }`}>
          <div className="flex items-start gap-2">
            <span className="text-sm font-bold text-stone-500 shrink-0 mt-0.5">
              {streetLabel[street]}:
            </span>
            <p className="text-sm text-stone-700 leading-relaxed">
              {street === 'showdown'
                ? bestHand
                  ? `Showdown! Your best hand: ${bestHand} using ${scenario.holeCards.join(' ')} with community cards.`
                  : 'Hand complete.'
                : currentAction.action}
            </p>
          </div>
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
          onClick={() => reset()}
          className={`flex items-center gap-2 py-2.5 px-4 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 font-medium rounded-xl transition-colors ${street === 'showdown' ? 'flex-1 justify-center' : ''}`}
        >
          <RotateCcw size={14} />
          {street === 'showdown' ? 'Deal New Hand' : 'Restart'}
        </button>
      </div>

      {/* Hand rankings quick ref */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200">
          <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Hand Rankings (best to worst)</h4>
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
