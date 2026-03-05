import { useState, useCallback, useEffect } from 'react';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS_28 = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
type Suit = typeof SUITS[number];
type Rank28 = typeof RANKS_28[number];

const RANK_ORDER: Record<Rank28, number> = { '7': 0, '8': 1, '9': 2, '10': 3, 'J': 4, 'Q': 5, 'K': 6, 'A': 7 };
const CARD_POINTS: Record<Rank28, number> = { 'J': 3, '9': 2, 'A': 1, '10': 1, 'Q': 0, 'K': 0, '8': 0, '7': 0 };

interface Card28 { rank: Rank28; suit: Suit; }
const PLAYER_NAMES = ['You', 'Left', 'Partner', 'Right'];

function buildDeck(): Card28[] {
  const deck: Card28[] = [];
  for (const suit of SUITS) for (const rank of RANKS_28) deck.push({ rank, suit });
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

function sortHand(h: Card28[]): Card28[] {
  return [...h].sort((a, b) =>
    a.suit !== b.suit ? SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) : RANK_ORDER[a.rank] - RANK_ORDER[b.rank]
  );
}

function isRed(c: Card28) { return c.suit === '♥' || c.suit === '♦'; }

function sumPoints(cards: (Card28 | null)[]): number {
  return cards.reduce((s, c) => s + (c ? CARD_POINTS[c.rank] : 0), 0);
}

function trickWinner(tc: (Card28 | null)[], order: number[], ledSuit: Suit, trump: Suit): number {
  const played = order.map(p => tc[p]!);
  let winIdx = 0;
  for (let i = 1; i < played.length; i++) {
    const w = played[winIdx], c = played[i];
    const wT = w.suit === trump, cT = c.suit === trump;
    if (cT && !wT) winIdx = i;
    else if (cT && wT && RANK_ORDER[c.rank] > RANK_ORDER[w.rank]) winIdx = i;
    else if (!cT && !wT && c.suit === ledSuit) {
      if (w.suit !== ledSuit || RANK_ORDER[c.rank] > RANK_ORDER[w.rank]) winIdx = i;
    }
  }
  return order[winIdx];
}

function aiPickCard(hand: Card28[], ledSuit: Suit | null, trump: Suit, trumpRevealed: boolean): Card28 {
  if (ledSuit) {
    const followers = hand.filter(c => c.suit === ledSuit);
    if (followers.length > 0) return followers[Math.floor(Math.random() * followers.length)];
    if (trumpRevealed && Math.random() > 0.5) {
      const trumpCards = hand.filter(c => c.suit === trump);
      if (trumpCards.length > 0) return trumpCards[0];
    }
  }
  return hand[Math.floor(Math.random() * hand.length)];
}

function CardButton({ card, selected, onClick, disabled, small }: {
  card: Card28; selected?: boolean; onClick?: () => void; disabled?: boolean; small?: boolean;
}) {
  const red = isRed(card);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex flex-col items-center border-2 rounded-lg font-bold transition-all',
        small ? 'w-8 h-12 text-xs' : 'w-10 h-14 text-sm',
        selected ? 'border-teal-500 bg-teal-50 -translate-y-2 shadow-md' : 'border-stone-200 bg-white hover:border-stone-400',
        disabled ? 'opacity-60 cursor-default' : 'cursor-pointer',
        red ? 'text-red-600' : 'text-stone-800',
      ].join(' ')}
    >
      <span className="mt-1 leading-none">{card.rank}</span>
      <span className="leading-none">{card.suit}</span>
      {CARD_POINTS[card.rank] > 0 && (
        <span className="text-amber-500" style={{ fontSize: '0.55rem' }}>+{CARD_POINTS[card.rank]}</span>
      )}
    </button>
  );
}

type Phase = 'deal' | 'playing' | 'trick-result' | 'game-over';

export default function TwentyEightSimulation({ onViewRules }: { onViewRules?: () => void } = {}) {
  const [hands, setHands] = useState<Card28[][]>([[], [], [], []]);
  const [trickCards, setTrickCards] = useState<(Card28 | null)[]>([null, null, null, null]);
  const [trickOrder, setTrickOrder] = useState<number[]>([1, 2, 3, 0]);
  const [numPlayed, setNumPlayed] = useState(0);
  const [ledSuit, setLedSuit] = useState<Suit | null>(null);
  const [trump, setTrump] = useState<Suit>('♠');
  const [trumpRevealed, setTrumpRevealed] = useState(false);
  const [bid, setBid] = useState(16);
  const [phase, setPhase] = useState<Phase>('deal');
  const [selected, setSelected] = useState<number | null>(null);
  const [playerTeamScore, setPlayerTeamScore] = useState(0);
  const [oppTeamScore, setOppTeamScore] = useState(0);
  const [message, setMessage] = useState('');
  const [tricksLeft, setTricksLeft] = useState(8);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const init = useCallback(() => {
    const deck = shuffle(buildDeck());
    const rawHands = [deck.slice(0, 8), deck.slice(8, 16), deck.slice(16, 24), deck.slice(24, 32)];
    setHands(rawHands.map(h => sortHand(h)));
    setTrump(SUITS[Math.floor(Math.random() * 4)]);
    setBid(16 + Math.floor(Math.random() * 13)); // 16–28
    setTrumpRevealed(false);
    setTrickCards([null, null, null, null]);
    setTrickOrder([1, 2, 3, 0]); // Left leads first
    setNumPlayed(0);
    setLedSuit(null);
    setSelected(null);
    setPlayerTeamScore(0);
    setOppTeamScore(0);
    setMessage('');
    setTricksLeft(8);
    setPhase('deal');
  }, []);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (phase === 'game-over') setGamesPlayed(g => g + 1);
  }, [phase]);

  // ── Core advance function ─────────────────────────────────────────────────
  // All mutable state is passed as params to avoid stale closures in setTimeouts.
  // setState functions are stable React refs — safe to use from the closure.
  function advanceGame(
    h: Card28[][],
    tc: (Card28 | null)[],
    order: number[],
    np: number,
    ls: Suit | null,
    tr: Suit,
    trRev: boolean,
    pScore: number,
    oScore: number,
    tLeft: number,
  ) {
    if (np === 4) {
      // Trick complete — score it
      const pts = sumPoints(tc);
      const winner = trickWinner(tc, order, ls!, tr);
      const yourTeam = winner === 0 || winner === 2;
      const newPScore = pScore + (yourTeam ? pts : 0);
      const newOScore = oScore + (!yourTeam ? pts : 0);
      setPlayerTeamScore(newPScore);
      setOppTeamScore(newOScore);
      setMessage(`${PLAYER_NAMES[winner]} wins the trick${pts > 0 ? ` (+${pts} pts)` : ' (0 pts)'}`);
      const newTLeft = tLeft - 1;
      setTricksLeft(newTLeft);

      if (newTLeft === 0) {
        setPhase('game-over');
        return;
      }

      setPhase('trick-result');
      setTimeout(() => {
        const newOrder = [0, 1, 2, 3].map(i => (winner + i) % 4);
        const newTc: (Card28 | null)[] = [null, null, null, null];
        setTrickCards(newTc);
        setTrickOrder(newOrder);
        setNumPlayed(0);
        setLedSuit(null);
        setPhase('playing');
        if (newOrder[0] !== 0) {
          setTimeout(() => advanceGame(h, newTc, newOrder, 0, null, tr, trRev, newPScore, newOScore, newTLeft), 400);
        }
      }, 1500);
      return;
    }

    const playerIdx = order[np];
    if (playerIdx === 0) {
      setPhase('playing');
      return;
    }

    // AI plays after a short delay
    setTimeout(() => {
      const aiHand = h[playerIdx];
      if (!aiHand || aiHand.length === 0) return;
      const card = aiPickCard(aiHand, ls, tr, trRev);
      const newH = h.map((hand, i) => i === playerIdx ? hand.filter(c => c !== card) : hand);
      const newTc = tc.map((c, i) => i === playerIdx ? card : c) as (Card28 | null)[];
      const newLs: Suit = ls ?? card.suit;

      let newTrRev = trRev;
      if (!trRev && ls && !aiHand.some(c => c.suit === ls) && card.suit === tr) {
        newTrRev = true;
        setTrumpRevealed(true);
      }

      setHands(newH);
      setTrickCards(newTc);
      setLedSuit(newLs);
      setNumPlayed(np + 1);
      advanceGame(newH, newTc, order, np + 1, newLs, tr, newTrRev, pScore, oScore, tLeft);
    }, 600);
  }

  function startPlaying() {
    const order = [1, 2, 3, 0];
    const emptyTrick: (Card28 | null)[] = [null, null, null, null];
    setPhase('playing');
    advanceGame(hands, emptyTrick, order, 0, null, trump, false, 0, 0, 8);
  }

  function playCard() {
    if (selected === null || phase !== 'playing') return;
    const card = hands[0][selected];

    let newTrRev = trumpRevealed;
    if (!trumpRevealed && ledSuit && !hands[0].some(c => c.suit === ledSuit) && card.suit === trump) {
      newTrRev = true;
      setTrumpRevealed(true);
    }

    const newH = hands.map((hand, i) => i === 0 ? hand.filter(c => c !== card) : hand);
    const newTc = trickCards.map((c, i) => i === 0 ? card : c) as (Card28 | null)[];
    const newLs: Suit = ledSuit ?? card.suit;

    setHands(newH);
    setTrickCards(newTc);
    setLedSuit(newLs);
    setNumPlayed(numPlayed + 1);
    setSelected(null);
    advanceGame(newH, newTc, trickOrder, numPlayed + 1, newLs, trump, newTrRev, playerTeamScore, oppTeamScore, tricksLeft);
  }

  function canFollow(card: Card28): boolean {
    if (!ledSuit) return true;
    const hasLedSuit = hands[0].some(c => c.suit === ledSuit);
    return hasLedSuit ? card.suit === ledSuit : true;
  }

  const playerHand = hands[0];
  const isPlayerTurn = phase === 'playing' && trickOrder[numPlayed] === 0;
  const ptsInHand = playerHand.reduce((s, c) => s + CARD_POINTS[c.rank], 0);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-lg">28 Simulator</h3>
            <p className="text-teal-100 text-xs mt-0.5">Trick-taking · South Indian classic</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-sm">J=3 · 9=2 · A=1 · 10=1</p>
          </div>
        </div>
      </div>

      {/* Nudge */}
      {gamesPlayed >= 2 && !nudgeDismissed && onViewRules && (
        <div className="mx-5 mt-4 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-teal-700 text-sm font-medium">Forgot the rules?</p>
          <div className="flex gap-2">
            <button onClick={onViewRules} className="text-teal-600 text-xs font-bold hover:text-teal-800 underline">
              View the rules →
            </button>
            <button onClick={() => setNudgeDismissed(true)} className="text-teal-400 text-xs hover:text-teal-600">✕</button>
          </div>
        </div>
      )}

      <div className="p-5 space-y-4">

        {/* Score row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-teal-50 rounded-xl p-3 text-center border border-teal-100">
            <p className="text-xs text-teal-500 font-semibold">Your team</p>
            <p className="text-2xl font-extrabold text-teal-700">{playerTeamScore}</p>
            <p className="text-xs text-teal-400">bid: {bid}</p>
          </div>
          <div className="flex-1 bg-stone-50 rounded-xl p-3 text-center border border-stone-200">
            <p className="text-xs text-stone-400 font-semibold">Opponents</p>
            <p className="text-2xl font-extrabold text-stone-600">{oppTeamScore}</p>
            <p className="text-xs text-stone-400">pts</p>
          </div>
          <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
            <p className="text-xs text-amber-500 font-semibold">Trump</p>
            <p className="text-2xl font-extrabold text-amber-700">{trumpRevealed ? trump : '??'}</p>
            <p className="text-xs text-amber-400">{tricksLeft} left</p>
          </div>
        </div>

        {/* Trick result flash */}
        {phase === 'trick-result' && message && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-center">
            <p className="text-stone-700 text-sm font-semibold">{message}</p>
          </div>
        )}

        {/* Current trick */}
        {phase !== 'deal' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide">Current Trick</p>
              {ledSuit && (
                <p className="text-xs text-stone-400">
                  Led: <strong className={ledSuit === '♥' || ledSuit === '♦' ? 'text-red-600' : 'text-stone-800'}>{ledSuit}</strong>
                  {trumpRevealed
                    ? <span className="ml-2">· Trump: <strong>{trump}</strong></span>
                    : <span className="ml-2">· Trump: hidden</span>}
                </p>
              )}
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="grid grid-cols-4 gap-2 text-center">
                {PLAYER_NAMES.map((name, i) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <p className="text-xs text-stone-400 font-semibold">{name}</p>
                    {trickCards[i] ? (
                      <CardButton card={trickCards[i]!} disabled small />
                    ) : (
                      <div className="w-8 h-12 rounded-lg border-2 border-dashed border-stone-200 flex items-center justify-center">
                        {trickOrder[numPlayed] === i && phase === 'playing' && (
                          <span className="text-amber-400 text-xs font-bold">?</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Player hand */}
        {phase !== 'deal' && phase !== 'game-over' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide">
                Your Hand ({playerHand.length} cards)
              </p>
              <p className="text-xs text-amber-600">{ptsInHand} pts in hand</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {playerHand.map((card, idx) => {
                const followable = canFollow(card);
                const isSel = selected === idx;
                return (
                  <div key={idx} className="relative">
                    <CardButton
                      card={card}
                      selected={isSel}
                      onClick={() => isPlayerTurn ? setSelected(isSel ? null : idx) : undefined}
                      disabled={!isPlayerTurn || !followable}
                    />
                    {!followable && <div className="absolute inset-0 rounded-lg bg-stone-200/60" />}
                  </div>
                );
              })}
            </div>
            {ledSuit && !playerHand.some(c => c.suit === ledSuit) && isPlayerTurn && (
              <p className="text-xs text-amber-600 mt-1.5">
                No {ledSuit} — play trump or any card. Playing trump reveals it!
              </p>
            )}
          </div>
        )}

        {/* Deal button */}
        {phase === 'deal' && (
          <div className="space-y-2">
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
              <p className="text-xs text-stone-400">
                Your team bid <strong className="text-teal-700">{bid} pts</strong> · Trump is hidden until someone plays it
              </p>
            </div>
            <button
              onClick={startPlaying}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition shadow"
            >
              Deal Cards &amp; Start Hand
            </button>
          </div>
        )}

        {/* Play card button */}
        {isPlayerTurn && (
          <button
            onClick={playCard}
            disabled={selected === null}
            className="w-full py-2.5 bg-teal-600 text-white font-bold rounded-xl disabled:opacity-40 hover:bg-teal-700 transition"
          >
            {selected !== null
              ? `Play ${playerHand[selected].rank}${playerHand[selected].suit}`
              : 'Select a card to play'}
          </button>
        )}

        {/* AI thinking */}
        {phase === 'playing' && !isPlayerTurn && (
          <div className="text-center py-1.5">
            <p className="text-stone-400 text-sm animate-pulse">
              {PLAYER_NAMES[trickOrder[numPlayed]]} is playing...
            </p>
          </div>
        )}

        {/* Game over */}
        {phase === 'game-over' && (
          <div className={`rounded-xl p-4 border-2 ${playerTeamScore >= bid ? 'bg-teal-50 border-teal-300' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-extrabold text-center text-lg ${playerTeamScore >= bid ? 'text-teal-700' : 'text-red-600'}`}>
              {playerTeamScore >= bid
                ? `🏆 Your team wins! (${playerTeamScore}/${bid} pts)`
                : `😤 Fell short — needed ${bid}, got ${playerTeamScore}`}
            </p>
            <p className="text-xs text-stone-400 text-center mt-1">
              Your team: {playerTeamScore} pts · Opponents: {oppTeamScore} pts
              {trumpRevealed ? ` · Trump was ${trump}` : ' · Trump was never revealed'}
            </p>
            <button
              onClick={init}
              className="mt-3 w-full py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition text-sm"
            >
              New Hand
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
