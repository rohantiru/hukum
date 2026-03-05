import { useState, useCallback, useEffect } from 'react';
import PlayingCard from './PlayingCard';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
type Rank = typeof RANKS[number];
type Suit = typeof SUITS[number];
type Card = `${Rank}${Suit}`;

function drawCard(): Card {
  const suit = SUITS[Math.floor(Math.random() * 4)];
  const rank = RANKS[Math.floor(Math.random() * 13)];
  return `${rank}${suit}` as Card;
}

function drawHand(): Card[] {
  const drawn: Card[] = [];
  while (drawn.length < 3) {
    const c = drawCard();
    if (!drawn.includes(c)) drawn.push(c);
  }
  return drawn;
}

const RANK_ORDER: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

function getRank(card: Card): Rank {
  const rank = card.slice(0, -1) as Rank;
  return rank;
}
function getSuit(card: Card): Suit {
  return card.slice(-1) as Suit;
}
function rankVal(card: Card) { return RANK_ORDER[getRank(card)]; }

function isTrail(hand: Card[]) {
  return getRank(hand[0]) === getRank(hand[1]) && getRank(hand[1]) === getRank(hand[2]);
}
function isStraight(hand: Card[]) {
  const sorted = [...hand].sort((a, b) => rankVal(a) - rankVal(b));
  const vals = sorted.map(rankVal);
  if (vals[2] - vals[0] === 2 && vals[1] - vals[0] === 1) return true;
  // A-2-3 (Ace low wraparound)
  if (vals[0] === 2 && vals[1] === 3 && vals[2] === 14) return true;
  return false;
}
function isFlush(hand: Card[]) {
  return getSuit(hand[0]) === getSuit(hand[1]) && getSuit(hand[1]) === getSuit(hand[2]);
}
function isPureSequence(hand: Card[]) { return isStraight(hand) && isFlush(hand); }
function isPair(hand: Card[]) {
  const r = hand.map(getRank);
  return r[0] === r[1] || r[1] === r[2] || r[0] === r[2];
}

function getHandName(hand: Card[]): string {
  if (hand.length < 3) return '';
  if (isTrail(hand)) return 'Trail (Three of a Kind)';
  if (isPureSequence(hand)) return 'Pure Sequence';
  if (isStraight(hand)) return 'Sequence (Straight)';
  if (isFlush(hand)) return 'Color (Flush)';
  if (isPair(hand)) return 'Pair';
  return 'High Card';
}

function getHandScore(hand: Card[]): number {
  if (hand.length < 3) return 0;
  if (isTrail(hand)) return 6;
  if (isPureSequence(hand)) return 5;
  if (isStraight(hand)) return 4;
  if (isFlush(hand)) return 3;
  if (isPair(hand)) return 2;
  return 1;
}

type Phase = 'deal' | 'choice' | 'result';

const handDescriptions: Record<string, string> = {
  'Trail (Three of a Kind)': 'Three cards of the same rank — the best hand in Teen Patti!',
  'Pure Sequence': 'Three consecutive cards of the same suit.',
  'Sequence (Straight)': 'Three consecutive cards of different suits.',
  'Color (Flush)': 'Three cards of the same suit, not in sequence.',
  'Pair': 'Two cards of the same rank.',
  'High Card': 'No combination — your highest card plays.',
};

const BOOT = 10;
const NUM_PLAYERS = 4;
const CHAAL = 20; // current stake
const STARTING_BANKROLL = 100;

export default function TeenPattiSimulation({ onViewRules }: { onViewRules?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>('deal');
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [seenChoice, setSeenChoice] = useState<'seen' | 'blind' | null>(null);
  const [pot, setPot] = useState(BOOT * NUM_PLAYERS);
  const [bankroll, setBankroll] = useState(STARTING_BANKROLL);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const deal = useCallback(() => {
    setPlayerCards(drawHand());
    setDealerCards(drawHand());
    setSeenChoice(null);
    setPot(BOOT * NUM_PLAYERS);
    setPhase('choice');
  }, []);

  const choose = (choice: 'seen' | 'blind') => {
    setSeenChoice(choice);
    const playerBet = choice === 'seen' ? CHAAL : CHAAL / 2;
    const dealerBet = CHAAL;
    const newPot = BOOT * NUM_PLAYERS + playerBet + dealerBet;
    const playerCost = BOOT + playerBet;
    setPot(newPot);

    const pScore = getHandScore(playerCards);
    const dScore = getHandScore(dealerCards);
    setBankroll(prev => {
      if (pScore > dScore) return prev - playerCost + newPot; // win: collect pot
      if (pScore === dScore) return prev; // tie: stake returned
      return prev - playerCost; // lose
    });

    setPhase('result');
  };

  const reset = () => {
    setPhase('deal');
    setPlayerCards([]);
    setDealerCards([]);
    setSeenChoice(null);
    setPot(BOOT * NUM_PLAYERS);
    if (bankroll <= 0) setBankroll(STARTING_BANKROLL);
  };

  useEffect(() => {
    if (phase === 'result') setRoundsPlayed(prev => prev + 1);
  }, [phase]);

  const playerName = getHandName(playerCards);
  const dealerName = getHandName(dealerCards);
  const playerScore = getHandScore(playerCards);
  const dealerScore = getHandScore(dealerCards);
  const playerWins = playerScore > dealerScore;
  const tie = playerScore === dealerScore;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Teen Patti</h3>
            <p className="text-white/50 text-xs mt-0.5">Seen or Blind — your call</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
              <div className="text-white/50 text-xs">Bankroll</div>
              <div className="text-white font-bold">₹{bankroll}</div>
            </div>
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

      <div className="p-5 space-y-5">
        {phase === 'deal' && (
          <div className="text-center space-y-6 py-6">
            <div className="text-5xl">🃏</div>
            <div>
              <p className="text-white font-semibold text-lg">Ready to play?</p>
              <p className="text-white/50 text-sm mt-1">You'll get 3 cards. Then decide: peek at them (Seen) or play blind.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-left text-sm text-white/70 space-y-1">
              <p>🔵 <strong className="text-white">Seen</strong> — look at your cards, bet full stake</p>
              <p>🟡 <strong className="text-white">Blind</strong> — don't look, bet half stake (cost advantage!)</p>
            </div>
            <button
              onClick={deal}
              disabled={bankroll < BOOT}
              className="w-full py-3 rounded-xl font-bold text-stone-900 transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              Deal Cards (Boot ₹{BOOT})
            </button>
          </div>
        )}

        {phase === 'choice' && (
          <div className="space-y-5">
            {/* Dealer hand - face down */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-3">Dealer's Cards (face down)</p>
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <PlayingCard key={i} card="back" hidden />
                ))}
              </div>
            </div>

            {/* Player hand - face down waiting for choice */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-3">Your Cards (decide first)</p>
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <PlayingCard key={i} card="back" hidden />
                ))}
              </div>
            </div>

            <p className="text-white text-center font-semibold">Before looking — how do you want to play?</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => choose('seen')}
                className="py-4 rounded-xl font-bold text-white border-2 border-blue-500/50 bg-blue-500/20 hover:bg-blue-500/30 transition-all"
              >
                <div className="text-2xl mb-1">👁</div>
                <div>Play Seen</div>
                <div className="text-xs text-blue-300 font-normal mt-0.5">Look at cards, bet full</div>
              </button>
              <button
                onClick={() => choose('blind')}
                className="py-4 rounded-xl font-bold text-white border-2 border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 transition-all"
              >
                <div className="text-2xl mb-1">🙈</div>
                <div>Play Blind</div>
                <div className="text-xs text-amber-300 font-normal mt-0.5">Stay hidden, bet half</div>
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="space-y-4">
            {/* Result banner */}
            <div className={`rounded-xl p-4 text-center font-bold ${
              tie ? 'bg-stone-600/40 border border-stone-500/40 text-stone-200' :
              playerWins ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' :
              'bg-red-500/20 border border-red-500/40 text-red-300'
            }`}>
              <div className="text-3xl mb-1">{tie ? '🤝' : playerWins ? '🎉' : '😔'}</div>
              <div className="text-xl">{tie ? 'It\'s a Tie!' : playerWins ? 'You Win!' : 'Dealer Wins'}</div>
              <div className="text-sm font-normal mt-1 opacity-80">
                {tie
                  ? 'Stake returned'
                  : playerWins
                    ? `+₹${pot - BOOT - (seenChoice === 'seen' ? CHAAL : CHAAL / 2)} net gain`
                    : `-₹${BOOT + (seenChoice === 'seen' ? CHAAL : CHAAL / 2)} lost`}
              </div>
            </div>

            {/* Hands comparison */}
            <div className="grid grid-cols-2 gap-3">
              {/* Your hand */}
              <div className={`bg-white/5 rounded-xl p-3 border ${playerWins ? 'border-emerald-500/40' : tie ? 'border-stone-500/30' : 'border-red-500/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-xs uppercase tracking-wide">
                    You ({seenChoice === 'seen' ? 'Seen' : 'Blind'})
                  </p>
                  {playerWins && <span className="text-emerald-400 text-xs font-bold">WINNER</span>}
                </div>
                <div className="flex gap-1 mb-2">
                  {playerCards.map((c, i) => <PlayingCard key={i} card={c} size="sm" />)}
                </div>
                <div className="text-xs text-amber-400 font-semibold">{playerName}</div>
                <div className="text-xs text-white/40 mt-0.5">{handDescriptions[playerName]}</div>
              </div>

              {/* Dealer hand */}
              <div className={`bg-white/5 rounded-xl p-3 border ${!playerWins && !tie ? 'border-emerald-500/40' : tie ? 'border-stone-500/30' : 'border-red-500/30'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/60 text-xs uppercase tracking-wide">Dealer (Seen)</p>
                  {!playerWins && !tie && <span className="text-emerald-400 text-xs font-bold">WINNER</span>}
                </div>
                <div className="flex gap-1 mb-2">
                  {dealerCards.map((c, i) => <PlayingCard key={i} card={c} size="sm" />)}
                </div>
                <div className="text-xs text-amber-400 font-semibold">{dealerName}</div>
                <div className="text-xs text-white/40 mt-0.5">{handDescriptions[dealerName]}</div>
              </div>
            </div>

            {/* Hand rankings reference */}
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-2">Hand Rankings (best → worst)</p>
              <div className="flex flex-wrap gap-1.5">
                {['Trail', 'Pure Seq.', 'Sequence', 'Color', 'Pair', 'High Card'].map((h, i) => (
                  <span key={h} className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    {i + 1}. {h}
                  </span>
                ))}
              </div>
            </div>

            {bankroll <= 0 && (
              <p className="text-center text-white/50 text-xs">You're out of chips — bankroll resets to ₹{STARTING_BANKROLL}</p>
            )}
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl font-bold text-stone-900 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              {bankroll <= 0 ? 'Reload & Play Again' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
