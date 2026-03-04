import { useState, useCallback } from 'react';
import PlayingCard from './PlayingCard';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;
type Rank = typeof RANKS[number];
type Suit = typeof SUITS[number];
type Card = `${Rank}${Suit}`;

function randomCard(): Card {
  const suit = SUITS[Math.floor(Math.random() * 4)];
  const rank = RANKS[Math.floor(Math.random() * 13)];
  return `${rank}${suit}` as Card;
}

function cardValue(card: Card): number {
  const rank = card.slice(0, -1) as Rank;
  if (rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

function handTotal(hand: Card[]): number {
  let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
  let aces = hand.filter(c => c.slice(0, -1) === 'A').length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isBust(hand: Card[]) { return handTotal(hand) > 21; }
function isBlackjack(hand: Card[]) { return hand.length === 2 && handTotal(hand) === 21; }
function isSoft(hand: Card[]) {
  const rawTotal = hand.reduce((sum, c) => sum + cardValue(c), 0);
  return rawTotal !== handTotal(hand); // Ace was reduced
}

type Phase = 'idle' | 'play' | 'dealer' | 'result';
type Result = 'blackjack' | 'win' | 'push' | 'lose' | 'bust';

function getStrategyHint(playerHand: Card[], dealerUp: Card): string {
  const total = handTotal(playerHand);
  const dealerVal = cardValue(dealerUp);
  const soft = isSoft(playerHand);

  if (soft) {
    if (total >= 19) return 'Stand — soft 19+ is strong';
    if (total === 18) {
      if (dealerVal >= 9) return 'Hit — dealer is strong, soft 18 is risky';
      return 'Stand — soft 18 vs weak dealer';
    }
    return 'Hit — soft totals below 18 should be improved';
  }
  if (total >= 17) return 'Stand — never hit hard 17+';
  if (total >= 13 && dealerVal <= 6) return 'Stand — dealer is weak, let them bust';
  if (total <= 11) return 'Hit — you can\'t bust on one card';
  return 'Hit — dealer is strong';
}

export default function BlackjackSimulation() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [chips, setChips] = useState(100);
  const [bet, setBet] = useState(10);

  const dealNew = useCallback(() => {
    const p: Card[] = [randomCard(), randomCard()];
    const d: Card[] = [randomCard(), randomCard()];
    setPlayerHand(p);
    setDealerHand(d);
    setDealerRevealed(false);
    setResult(null);
    setChips(prev => prev - bet);

    if (isBlackjack(p)) {
      setDealerRevealed(true);
      if (isBlackjack(d)) {
        setResult('push');
        setChips(prev => prev + bet);
      } else {
        setResult('blackjack');
        setChips(prev => prev + Math.floor(bet * 2.5));
      }
      setPhase('result');
    } else {
      setPhase('play');
    }
  }, [bet]);

  const hit = () => {
    const newCard = randomCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    if (isBust(newHand)) {
      setDealerRevealed(true);
      setResult('bust');
      setPhase('result');
    }
  };

  const stand = () => {
    setDealerRevealed(true);
    let dHand = [...dealerHand];
    // Dealer draws to 17
    while (handTotal(dHand) < 17) {
      dHand = [...dHand, randomCard()];
    }
    setDealerHand(dHand);

    const pTotal = handTotal(playerHand);
    const dTotal = handTotal(dHand);

    if (isBust(dHand)) {
      setResult('win');
      setChips(prev => prev + bet * 2);
    } else if (pTotal > dTotal) {
      setResult('win');
      setChips(prev => prev + bet * 2);
    } else if (pTotal === dTotal) {
      setResult('push');
      setChips(prev => prev + bet);
    } else {
      setResult('lose');
    }
    setPhase('result');
  };

  const reset = () => {
    setPhase('idle');
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
    setDealerRevealed(false);
    if (chips < 10) setChips(100);
  };

  const playerTotal = playerHand.length ? handTotal(playerHand) : 0;
  const dealerTotal = dealerHand.length ? handTotal(dealerHand) : 0;

  const resultConfig: Record<Result, { label: string; color: string; emoji: string; desc: string }> = {
    blackjack: { label: 'Blackjack!', color: 'text-amber-300 border-amber-500/50 bg-amber-500/20', emoji: '🃏', desc: `You win ₹${Math.floor(bet * 1.5)} bonus (3:2 payout)` },
    win: { label: 'You Win!', color: 'text-emerald-300 border-emerald-500/50 bg-emerald-500/20', emoji: '🎉', desc: `+$${bet} profit` },
    push: { label: 'Push — Tie!', color: 'text-stone-300 border-stone-500/50 bg-stone-500/20', emoji: '🤝', desc: 'Bet returned' },
    lose: { label: 'Dealer Wins', color: 'text-red-300 border-red-500/50 bg-red-500/20', emoji: '😬', desc: `-$${bet}` },
    bust: { label: 'Bust!', color: 'text-red-300 border-red-500/50 bg-red-500/20', emoji: '💥', desc: `Over 21 — lost $${bet}` },
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Blackjack</h3>
            <p className="text-white/50 text-xs mt-0.5">Hit or Stand — beat the dealer to 21</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
              <div className="text-white/50 text-xs">Chips</div>
              <div className="text-white font-bold">${chips}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {phase === 'idle' && (
          <div className="text-center space-y-5 py-4">
            <div className="text-5xl">🃏</div>
            <div>
              <p className="text-white font-semibold text-lg">Ready to deal?</p>
              <p className="text-white/50 text-sm mt-1">Try to get closer to 21 than the dealer — without going over.</p>
            </div>
            {/* Bet selector */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/60 text-sm mb-3">Bet amount</p>
              <div className="flex gap-2 justify-center">
                {[5, 10, 25, 50].map(b => (
                  <button
                    key={b}
                    onClick={() => setBet(b)}
                    disabled={b > chips}
                    className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                      bet === b ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                    } disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    ${b}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={dealNew}
              disabled={chips < bet}
              className="w-full py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
            >
              Deal (Bet ${bet})
            </button>
          </div>
        )}

        {(phase === 'play' || phase === 'result') && (
          <>
            {/* Result banner */}
            {result && (
              <div className={`rounded-xl p-3 text-center border ${resultConfig[result].color}`}>
                <span className="text-2xl mr-2">{resultConfig[result].emoji}</span>
                <span className="font-bold text-lg">{resultConfig[result].label}</span>
                <p className="text-sm opacity-75 mt-0.5">{resultConfig[result].desc}</p>
              </div>
            )}

            {/* Dealer's hand */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">
                  Dealer {dealerRevealed ? `— ${dealerTotal}${isBust(dealerHand) ? ' (Bust!)' : ''}` : ''}
                </p>
                {isBlackjack(dealerHand) && dealerRevealed && (
                  <span className="text-amber-400 text-xs font-bold">BLACKJACK</span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {dealerHand.map((c, i) => (
                  i === 1 && !dealerRevealed
                    ? <PlayingCard key={i} card="back" hidden />
                    : <PlayingCard key={i} card={c} />
                ))}
              </div>
            </div>

            {/* Player's hand */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">
                  You — {playerTotal}{isSoft(playerHand) && playerHand.length > 0 ? ' (soft)' : ''}
                  {isBust(playerHand) ? ' (Bust!)' : ''}
                </p>
                {isBlackjack(playerHand) && <span className="text-amber-400 text-xs font-bold">BLACKJACK</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {playerHand.map((c, i) => <PlayingCard key={i} card={c} />)}
              </div>
            </div>

            {/* Strategy hint (during play) */}
            {phase === 'play' && !isBust(playerHand) && (
              <div className="bg-white/5 rounded-xl px-4 py-3">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Basic Strategy Hint</p>
                <p className="text-white/80 text-sm">{getStrategyHint(playerHand, dealerHand[0])}</p>
              </div>
            )}

            {/* Action buttons */}
            {phase === 'play' && !isBust(playerHand) && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={hit}
                  className="py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95"
                >
                  Hit
                </button>
                <button
                  onClick={stand}
                  className="py-3 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-500 transition-all active:scale-95"
                >
                  Stand
                </button>
              </div>
            )}

            {phase === 'result' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={dealNew}
                  disabled={chips < bet}
                  className="py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  Deal Again (${bet})
                </button>
                <button
                  onClick={reset}
                  className="py-3 rounded-xl font-bold text-white/70 bg-white/10 hover:bg-white/20 transition-all"
                >
                  Change Bet
                </button>
              </div>
            )}
          </>
        )}

        {/* Quick rules reminder */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['J,Q,K', '= 10'], ['Ace', '= 1 or 11'], ['21', '= Win']].map(([label, val]) => (
            <div key={label} className="bg-white/5 rounded-lg py-2">
              <div className="text-white text-xs font-bold">{label}</div>
              <div className="text-white/50 text-xs">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
