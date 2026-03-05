import { useState, useCallback, useEffect } from 'react';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
type Suit = typeof SUITS[number];
type Rank = typeof RANKS[number];

const RANK_ORDER: Record<Rank, number> = {
  '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7,
  '9': 8, '10': 9, 'J': 10, 'Q': 11, 'K': 12, 'A': 13,
};

interface CardKT { rank: Rank; suit: Suit; }

function isKaaliTeeri(c: CardKT) { return c.rank === '3' && c.suit === '♠'; }
function isRed(c: CardKT) { return c.suit === '♥' || c.suit === '♦'; }

function buildDeck(): CardKT[] {
  const deck: CardKT[] = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ rank, suit });
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

function cardLabel(c: CardKT) { return `${c.rank}${c.suit}`; }

function determineTrickWinner(cards: CardKT[], ledSuit: Suit, trump: Suit): number {
  // 3♠ always wins
  const ktIdx = cards.findIndex(isKaaliTeeri);
  if (ktIdx !== -1) return ktIdx;

  let winner = 0;
  let winCard = cards[0];
  for (let i = 1; i < cards.length; i++) {
    const c = cards[i];
    const wTrump = winCard.suit === trump;
    const cTrump = c.suit === trump;
    if (cTrump && !wTrump) { winner = i; winCard = c; }
    else if (cTrump && wTrump) {
      if (RANK_ORDER[c.rank] > RANK_ORDER[winCard.rank]) { winner = i; winCard = c; }
    } else if (!cTrump && !wTrump) {
      if (c.suit === ledSuit && (winCard.suit !== ledSuit || RANK_ORDER[c.rank] > RANK_ORDER[winCard.rank])) {
        winner = i; winCard = c;
      }
    }
  }
  return winner;
}

function CardButton({ card, selected, onClick, disabled, small }: {
  card: CardKT; selected?: boolean; onClick?: () => void; disabled?: boolean; small?: boolean;
}) {
  const kt = isKaaliTeeri(card);
  const red = isRed(card);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex flex-col items-center border-2 rounded-lg font-bold transition-all relative',
        small ? 'w-9 h-13 text-xs px-0.5 py-0.5' : 'w-10 h-14 text-sm',
        selected ? 'border-stone-700 bg-stone-50 -translate-y-2 shadow-md' : kt ? 'border-stone-800 bg-stone-800 text-white' : 'border-stone-200 bg-white hover:border-stone-400',
        disabled && !kt ? 'opacity-60 cursor-default' : kt ? 'cursor-pointer ring-2 ring-amber-400' : 'cursor-pointer',
        !kt && !selected ? (red ? 'text-red-600' : 'text-stone-800') : '',
      ].join(' ')}
      title={kt ? '3♠ Kaali Teeri — beats EVERYTHING!' : undefined}
    >
      {kt ? (
        <>
          <span className="text-xs text-amber-300 mt-1 leading-none font-black">3</span>
          <span className="text-sm leading-none">♠</span>
          <span className="text-amber-300" style={{ fontSize: '0.5rem' }}>👑</span>
        </>
      ) : (
        <>
          <span className="mt-1 leading-none">{card.rank}</span>
          <span className="leading-none">{card.suit}</span>
        </>
      )}
    </button>
  );
}

const PLAYERS = ['South', 'West', 'North', 'East']; // South = you (lead, idx 0 in trick)

type Phase = 'deal' | 'play' | 'result';

export default function KaaliTeeriSimulation({ onViewRules }: { onViewRules?: () => void } = {}) {
  const [playerHand, setPlayerHand] = useState<CardKT[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [trump, setTrump] = useState<Suit>('♥');
  const [phase, setPhase] = useState<Phase>('deal');
  const [trickCards, setTrickCards] = useState<(CardKT | null)[]>([null, null, null, null]);
  const [ledSuit, setLedSuit] = useState<Suit | null>(null);
  const [trickWinner, setTrickWinner] = useState<string | null>(null);
  const [playerTricks, setPlayerTricks] = useState(0);
  const [oppTricks, setOppTricks] = useState(0);
  const [ktPlayed, setKtPlayed] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const init = useCallback(() => {
    const deck = shuffle(buildDeck());
    const hand = deck.slice(0, 13).sort((a, b) => {
      if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      return RANK_ORDER[a.rank] - RANK_ORDER[b.rank];
    });
    // Ensure 3♠ is not always in player hand — ~25% chance only
    setPlayerHand(hand);
    const randomTrump = SUITS[Math.floor(Math.random() * 4)];
    setTrump(randomTrump);
    setSelected(null);
    setPhase('deal');
    setTrickCards([null, null, null, null]);
    setLedSuit(null);
    setTrickWinner(null);
    setKtPlayed(false);
  }, []);

  useEffect(() => { init(); }, [init]);

  function startTrick() {
    // Others have already played (West, North, East are done) — player (South) plays last
    const deck = shuffle(buildDeck());
    const othersCards: CardKT[] = [
      deck.find(c => !playerHand.some(p => p.rank === c.rank && p.suit === c.suit)) ?? deck[39],
      deck.find((c, i) => i > 5 && !playerHand.some(p => p.rank === c.rank && p.suit === c.suit)) ?? deck[40],
      deck.find((c, i) => i > 10 && !playerHand.some(p => p.rank === c.rank && p.suit === c.suit)) ?? deck[41],
    ];
    const led = othersCards[0].suit;
    setLedSuit(led);
    setTrickCards([null, othersCards[0], othersCards[1], othersCards[2]]);
    setPhase('play');
  }

  function playCard() {
    if (selected === null || !ledSuit) return;
    const card = playerHand[selected];
    const newHand = playerHand.filter((_, i) => i !== selected);
    setPlayerHand(newHand);
    setSelected(null);

    const allCards = [card, ...(trickCards.slice(1) as CardKT[])];
    const playedKt = isKaaliTeeri(card) || allCards.some(isKaaliTeeri);
    setKtPlayed(playedKt);

    const winnerIdx = determineTrickWinner(allCards, ledSuit, trump);
    // In this sim: player = pos 0, West = pos 1, North = pos 2, East = pos 3
    // Your team: South (0) + North (2)
    const winnerName = PLAYERS[winnerIdx];
    setTrickWinner(winnerName);
    setTrickCards([card, ...(trickCards.slice(1) as CardKT[])]);

    if (winnerIdx === 0 || winnerIdx === 2) {
      setPlayerTricks(t => t + 1);
    } else {
      setOppTricks(t => t + 1);
    }
    setRoundsPlayed(r => r + 1);
    setPhase('result');
  }

  function canFollow(card: CardKT): boolean {
    if (!ledSuit) return true;
    if (isKaaliTeeri(card)) return true; // Always can play 3♠
    const hasLed = playerHand.some(c => c.suit === ledSuit && !isKaaliTeeri(c));
    if (hasLed) return card.suit === ledSuit;
    return true;
  }

  const hasKT = playerHand.some(isKaaliTeeri);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-700 to-stone-900 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-lg">Kaali Teeri Simulator</h3>
            <p className="text-stone-300 text-xs mt-0.5">Trick-taking · 3♠ beats everything</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-amber-300">3♠</span>
            <span className="text-stone-400 text-xs">Kaali Teeri</span>
          </div>
        </div>
      </div>

      {/* Nudge */}
      {roundsPlayed >= 2 && !nudgeDismissed && onViewRules && (
        <div className="mx-5 mt-4 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-stone-700 text-sm font-medium">Forgot the rules?</p>
          <div className="flex gap-2">
            <button onClick={onViewRules} className="text-stone-600 text-xs font-bold hover:text-stone-800 underline">
              View the rules →
            </button>
            <button onClick={() => setNudgeDismissed(true)} className="text-stone-400 text-xs hover:text-stone-600">✕</button>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Info row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-stone-800 rounded-xl p-3 text-center">
            <p className="text-xs text-stone-400 font-semibold">Trump</p>
            <p className="text-2xl font-extrabold text-white">{trump}</p>
            <p className="text-xs text-stone-400">suit</p>
          </div>
          <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
            <p className="text-xs text-emerald-500 font-semibold">Your team</p>
            <p className="text-2xl font-extrabold text-emerald-700">{playerTricks}</p>
            <p className="text-xs text-emerald-400">tricks</p>
          </div>
          <div className="flex-1 bg-red-50 rounded-xl p-3 text-center border border-red-100">
            <p className="text-xs text-red-400 font-semibold">Opponents</p>
            <p className="text-2xl font-extrabold text-red-600">{oppTricks}</p>
            <p className="text-xs text-red-300">tricks</p>
          </div>
        </div>

        {/* 3♠ indicator */}
        {hasKT && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-xl font-black text-stone-800">3♠</span>
            <p className="text-amber-700 text-sm font-semibold">You hold the Kaali Teeri! Play it at the right moment.</p>
          </div>
        )}

        {/* Current trick */}
        <div>
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide mb-2">
            {phase === 'deal' ? 'Trick (not started)' : 'Current Trick'}
          </p>
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <div className="grid grid-cols-4 gap-2 text-center">
              {PLAYERS.map((name, i) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <p className={`text-xs font-semibold ${i === 0 ? 'text-stone-800' : 'text-stone-400'}`}>
                    {name}{i === 0 ? ' (You)' : ''}
                  </p>
                  {trickCards[i] ? (
                    <CardButton card={trickCards[i]!} disabled small />
                  ) : (
                    <div className={`w-9 h-12 rounded-lg border-2 border-dashed flex items-center justify-center ${i === 0 && phase === 'play' ? 'border-amber-400' : 'border-stone-200'}`}>
                      {i === 0 && phase === 'play' && <span className="text-amber-400 text-xs font-bold">?</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {ledSuit && (
              <p className="text-xs text-stone-400 text-center mt-2">
                Led suit: <strong>{ledSuit}</strong> · Trump: <strong>{trump}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Player hand */}
        {(phase === 'play' || phase === 'result') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide">Your Hand</p>
              <p className="text-xs text-stone-400">{playerHand.length} cards</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {playerHand.map((card, idx) => {
                const followable = canFollow(card);
                return (
                  <div key={idx} className="relative">
                    <CardButton
                      card={card}
                      selected={selected === idx}
                      onClick={() => phase === 'play' && followable ? setSelected(selected === idx ? null : idx) : undefined}
                      disabled={phase !== 'play' || !followable}
                    />
                    {!followable && <div className="absolute inset-0 rounded-lg bg-stone-200/70 pointer-events-none" />}
                  </div>
                );
              })}
            </div>
            {ledSuit && !playerHand.filter(c => !isKaaliTeeri(c)).some(c => c.suit === ledSuit) && (
              <p className="text-xs text-amber-600 mt-1.5">
                Can't follow {ledSuit} — play any card. Trump ({trump}) would win!
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        {phase === 'deal' && (
          <button
            onClick={startTrick}
            className="w-full py-3 bg-gradient-to-r from-stone-700 to-stone-900 text-white font-bold rounded-xl hover:opacity-90 transition shadow"
          >
            Deal & Start Trick
          </button>
        )}

        {phase === 'play' && (
          <button
            onClick={playCard}
            disabled={selected === null}
            className="w-full py-2.5 bg-stone-800 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-stone-900 transition"
          >
            {selected !== null
              ? `Play ${cardLabel(playerHand[selected])}${isKaaliTeeri(playerHand[selected]) ? ' 👑' : ''}`
              : 'Select a card to play'}
          </button>
        )}

        {phase === 'result' && trickWinner && (
          <div className={`rounded-xl p-4 border-2 ${trickWinner === 'South' || trickWinner === 'North' ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-200'}`}>
            {ktPlayed && (
              <div className="text-center mb-2">
                <span className="inline-block bg-stone-800 text-amber-300 font-black text-sm px-3 py-1 rounded-full">
                  3♠ Kaali Teeri played! 👑
                </span>
              </div>
            )}
            <p className={`font-extrabold text-center text-lg ${trickWinner === 'South' || trickWinner === 'North' ? 'text-emerald-700' : 'text-red-600'}`}>
              {trickWinner === 'South' || trickWinner === 'North'
                ? '🏆 Your team wins the trick!'
                : `😤 ${trickWinner} wins the trick`}
            </p>
            <p className="text-xs text-stone-400 text-center mt-1">
              {trickWinner} played the highest card{ktPlayed ? ' (3♠ beats everything)' : ''}
            </p>
            <button
              onClick={init}
              className="mt-3 w-full py-2 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 transition text-sm"
            >
              New Hand
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
