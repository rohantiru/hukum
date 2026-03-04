import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import PlayingCard from './PlayingCard';

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

function drawCard(): string {
  const suit = SUITS[Math.floor(Math.random() * 4)];
  const rank = RANKS[Math.floor(Math.random() * 13)];
  return rank + suit;
}

function generate10Cards(): string[] {
  return Array.from({ length: 10 }, () => drawCard());
}

function isRed(card: string): boolean {
  return card.endsWith('♥') || card.endsWith('♦');
}

function cardValue(card: string): number {
  return RANKS.indexOf(card.slice(0, -1) as (typeof RANKS)[number]);
}

type Phase = 'round1' | 'round2' | 'round3' | 'round4' | 'result' | 'bus';
const ROUND_ORDER: Phase[] = ['round1', 'round2', 'round3', 'round4', 'result'];
const ROUND_DRINKS = [1, 2, 3, 4];
const ROUND_NAMES = ['Red or Black?', 'Higher or Lower?', 'Inside or Outside?', 'Guess the Suit'];

export default function RideBusSimulation() {
  const [phase, setPhase] = useState<Phase>('round1');
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [currentFlip, setCurrentFlip] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<'correct' | 'wrong' | null>(null);
  const [totalDrinks, setTotalDrinks] = useState(0);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [awaitingGuess, setAwaitingGuess] = useState(true);

  // Bus state
  const [busCards, setBusCards] = useState<string[]>([]);
  const [busPosition, setBusPosition] = useState(0);
  const [busRestarts, setBusRestarts] = useState(0);
  const [busDrinks, setBusDrinks] = useState(0);
  const [busRevealed, setBusRevealed] = useState<boolean[]>([]);
  const [busFlipResult, setBusFlipResult] = useState<'correct' | 'wrong' | null>(null);

  const roundIndex = ROUND_ORDER.indexOf(phase);

  const makeGuess = (guess: string) => {
    if (!awaitingGuess) return;
    const card = drawCard();
    setCurrentFlip(card);
    setAwaitingGuess(false);

    let correct = false;
    switch (phase) {
      case 'round1':
        correct = (guess === 'red') === isRed(card);
        break;
      case 'round2': {
        const v0 = cardValue(playerCards[0]);
        const v1 = cardValue(card);
        correct = guess === 'higher' ? v1 > v0 : v1 < v0;
        break;
      }
      case 'round3': {
        const lo = Math.min(cardValue(playerCards[0]), cardValue(playerCards[1]));
        const hi = Math.max(cardValue(playerCards[0]), cardValue(playerCards[1]));
        const v2 = cardValue(card);
        correct = guess === 'inside' ? v2 > lo && v2 < hi : v2 < lo || v2 > hi;
        break;
      }
      case 'round4':
        correct = card.endsWith(guess);
        break;
    }

    if (!correct) {
      setTotalDrinks((d) => d + ROUND_DRINKS[roundIndex]);
      setWrongGuesses((w) => w + 1);
    }
    setRoundResult(correct ? 'correct' : 'wrong');
  };

  const nextRound = () => {
    setPlayerCards((cards) => [...cards, currentFlip!]);
    setCurrentFlip(null);
    setRoundResult(null);
    setAwaitingGuess(true);
    setPhase(ROUND_ORDER[roundIndex + 1]);
  };

  const startBus = () => {
    const cards = generate10Cards();
    setBusCards(cards);
    setBusPosition(0);
    setBusRestarts(0);
    setBusDrinks(0);
    setBusRevealed(new Array(10).fill(false));
    setBusFlipResult(null);
    setPhase('bus');
  };

  const makeBusGuess = (guess: 'red' | 'black') => {
    if (busFlipResult !== null) return;
    const card = busCards[busPosition];
    const correct = (guess === 'red') === isRed(card);
    const newRevealed = [...busRevealed];
    newRevealed[busPosition] = true;
    setBusRevealed(newRevealed);
    setBusFlipResult(correct ? 'correct' : 'wrong');
    if (!correct) setBusDrinks((d) => d + 1);
  };

  const advanceBus = () => {
    if (busFlipResult === 'correct') {
      setBusPosition((p) => p + 1);
    } else {
      setBusCards(generate10Cards());
      setBusPosition(0);
      setBusRestarts((r) => r + 1);
      setBusRevealed(new Array(10).fill(false));
    }
    setBusFlipResult(null);
  };

  const reset = () => {
    setPhase('round1');
    setPlayerCards([]);
    setCurrentFlip(null);
    setRoundResult(null);
    setTotalDrinks(0);
    setWrongGuesses(0);
    setAwaitingGuess(true);
    setBusCards([]);
    setBusPosition(0);
    setBusRestarts(0);
    setBusDrinks(0);
    setBusRevealed([]);
    setBusFlipResult(null);
  };

  // ─── 4 Guessing rounds ────────────────────────────────────────────────────
  if (phase !== 'result' && phase !== 'bus') {
    const ri = roundIndex;
    const drinkCount = ROUND_DRINKS[ri];

    return (
      <div className="space-y-4">
        {/* Progress */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i < ri ? 'bg-amber-500' : i === ri ? 'bg-amber-400' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-1">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              Round {ri + 1} of 4
            </span>
            <button
              onClick={reset}
              className="p-1 rounded hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          </div>
          <h3 className="text-lg font-bold mb-4">{ROUND_NAMES[ri]}</h3>

          {/* Hand so far */}
          {playerCards.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-stone-400 mb-2">Your hand so far:</p>
              <div className="flex gap-2 flex-wrap">
                {playerCards.map((c, i) => (
                  <PlayingCard key={i} card={c} size="sm" />
                ))}
              </div>
            </div>
          )}

          {/* Context hint */}
          {ri === 1 && playerCards[0] && (
            <div className="mb-3 text-xs text-stone-400 bg-white/5 rounded-lg px-3 py-2">
              Your card:{' '}
              <span className={`font-bold ${isRed(playerCards[0]) ? 'text-red-400' : 'text-white'}`}>
                {playerCards[0]}
              </span>
              . Is the next card higher or lower?
            </div>
          )}
          {ri === 2 && playerCards.length >= 2 && (
            <div className="mb-3 text-xs text-stone-400 bg-white/5 rounded-lg px-3 py-2">
              Your range:{' '}
              <span className={`font-bold ${isRed(playerCards[0]) ? 'text-red-400' : 'text-white'}`}>
                {playerCards[0]}
              </span>{' '}
              and{' '}
              <span className={`font-bold ${isRed(playerCards[1]) ? 'text-red-400' : 'text-white'}`}>
                {playerCards[1]}
              </span>
              . Inside (between) or outside the range?
            </div>
          )}

          {/* Card flip area */}
          <div className="flex justify-center mb-4 min-h-[90px] items-center">
            {currentFlip ? (
              <div className="card-deal">
                <PlayingCard card={currentFlip} />
              </div>
            ) : (
              <PlayingCard hidden />
            )}
          </div>

          {/* Result */}
          {roundResult && (
            <div className="text-center mb-3 fade-in">
              <span
                className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                  roundResult === 'correct'
                    ? 'bg-emerald-500/25 text-emerald-300'
                    : 'bg-red-500/25 text-red-300'
                }`}
              >
                {roundResult === 'correct'
                  ? '✓ Correct — no drinks!'
                  : `✗ Wrong — drink ${drinkCount}!`}
              </span>
            </div>
          )}

          {/* Guess buttons */}
          {awaitingGuess && !currentFlip && (
            <div className="space-y-2">
              {ri === 0 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => makeGuess('red')}
                    className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl font-semibold text-sm transition-colors"
                  >
                    ♥ Red
                  </button>
                  <button
                    onClick={() => makeGuess('black')}
                    className="flex-1 py-2.5 bg-stone-700 hover:bg-stone-600 rounded-xl font-semibold text-sm transition-colors"
                  >
                    ♠ Black
                  </button>
                </div>
              )}
              {ri === 1 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => makeGuess('higher')}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Higher ↑
                  </button>
                  <button
                    onClick={() => makeGuess('lower')}
                    className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-600 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Lower ↓
                  </button>
                </div>
              )}
              {ri === 2 && (
                <div className="flex gap-3">
                  <button
                    onClick={() => makeGuess('inside')}
                    className="flex-1 py-2.5 bg-violet-700 hover:bg-violet-600 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Inside ↔
                  </button>
                  <button
                    onClick={() => makeGuess('outside')}
                    className="flex-1 py-2.5 bg-orange-700 hover:bg-orange-600 rounded-xl font-semibold text-sm transition-colors"
                  >
                    Outside ↕
                  </button>
                </div>
              )}
              {ri === 3 && (
                <div className="grid grid-cols-4 gap-2">
                  {(['♠', '♥', '♦', '♣'] as const).map((suit) => (
                    <button
                      key={suit}
                      onClick={() => makeGuess(suit)}
                      className={`py-2.5 rounded-xl font-bold text-xl transition-colors ${
                        suit === '♥' || suit === '♦'
                          ? 'bg-red-700 hover:bg-red-600'
                          : 'bg-stone-700 hover:bg-stone-600'
                      }`}
                    >
                      {suit}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Advance button */}
          {currentFlip && roundResult !== null && (
            <button
              onClick={nextRound}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-xl font-semibold text-sm transition-colors"
            >
              {ri < 3 ? 'Next Round →' : 'See Results →'}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-stone-500">Drinks so far</span>
          <span className="font-bold text-stone-800">{totalDrinks} 🍺</span>
        </div>
      </div>
    );
  }

  // ─── Result screen ────────────────────────────────────────────────────────
  if (phase === 'result') {
    const ridesTheBus = wrongGuesses >= 2;
    return (
      <div className="space-y-4 fade-in">
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h3 className="font-bold text-lg text-stone-800 mb-1">Your Final Hand</h3>
          <p className="text-sm text-stone-500 mb-4">Cards collected across all 4 rounds:</p>
          <div className="flex gap-2 flex-wrap mb-5">
            {playerCards.map((c, i) => (
              <PlayingCard key={i} card={c} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-extrabold text-stone-800">{wrongGuesses}</div>
              <div className="text-xs text-stone-500 mt-0.5">Wrong guesses</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
              <div className="text-2xl font-extrabold text-amber-700">{totalDrinks}</div>
              <div className="text-xs text-amber-600 mt-0.5">Total drinks</div>
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl p-4 text-center border ${
            ridesTheBus ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <div className="text-2xl mb-1">{ridesTheBus ? '🚌' : '🎉'}</div>
          <p className="font-semibold text-sm text-stone-700">
            {ridesTheBus
              ? `With ${wrongGuesses} wrong guesses, you'd likely ride the bus!`
              : wrongGuesses === 0
              ? 'Perfect round — zero wrong guesses! Safe from the bus.'
              : `Only ${wrongGuesses} wrong guess — you might escape the bus.`}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={startBus}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            🚌 Simulate the Bus
          </button>
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-white border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Strategy tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">💡 Tips</h4>
          <ul className="space-y-1 text-xs text-blue-700">
            <li>Round 2: If your card is very high (Q–A) guess Lower; very low (2–3) guess Higher.</li>
            <li>Round 3: Wide gap between your cards = better 'Inside' odds.</li>
            <li>Round 4: Pure luck — 25% chance. Trust your gut.</li>
          </ul>
        </div>
      </div>
    );
  }

  // ─── Bus phase ────────────────────────────────────────────────────────────
  const busWon = busPosition >= 10;

  return (
    <div className="space-y-4 fade-in">
      <div className="bg-gradient-to-br from-red-950 to-stone-900 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">🚌 Riding the Bus</h3>
            <p className="text-xs text-stone-400">Guess Red or Black — all 10 in a row without a mistake.</p>
          </div>
          <div className="text-right text-xs text-stone-400">
            <div>Restarts: {busRestarts}</div>
            <div>Bus drinks: {busDrinks}</div>
          </div>
        </div>

        {/* 10-card bus route */}
        <div className="mb-4">
          <div className="flex gap-1.5 flex-wrap justify-center">
            {busCards.map((card, i) => (
              <div
                key={i}
                className={`relative ${
                  i === busPosition && !busWon
                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-900 rounded-lg'
                    : ''
                }`}
              >
                {busRevealed[i] ? (
                  <PlayingCard card={card} size="sm" />
                ) : (
                  <PlayingCard hidden size="sm" />
                )}
                {i < busPosition && (
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-lg flex items-center justify-center pointer-events-none">
                    <span className="text-emerald-400 text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
          <div
            className="h-2 bg-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${(busPosition / 10) * 100}%` }}
          />
        </div>

        {busWon ? (
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-bold text-amber-400 text-lg">You got off the bus!</p>
            <p className="text-stone-400 text-sm mt-1">
              {busRestarts === 0
                ? 'First try — incredible!'
                : `After ${busRestarts} restart${busRestarts !== 1 ? 's' : ''} and ${busDrinks} bus drink${busDrinks !== 1 ? 's' : ''}.`}
            </p>
            <button
              onClick={reset}
              className="mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-xl transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-center text-stone-300 mb-3">
              Card {busPosition + 1} of 10 — Red or Black?
            </p>
            {busFlipResult ? (
              <div className="space-y-3">
                <div className="text-center fade-in">
                  <span
                    className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                      busFlipResult === 'correct'
                        ? 'bg-emerald-500/25 text-emerald-300'
                        : 'bg-red-500/25 text-red-300'
                    }`}
                  >
                    {busFlipResult === 'correct'
                      ? `✓ Correct! Card ${busPosition + 1} cleared.`
                      : '✗ Wrong! Back to card 1...'}
                  </span>
                </div>
                <button
                  onClick={advanceBus}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    busFlipResult === 'correct'
                      ? 'bg-emerald-700 hover:bg-emerald-600'
                      : 'bg-red-800 hover:bg-red-700'
                  }`}
                >
                  {busFlipResult === 'correct'
                    ? busPosition < 9
                      ? 'Next Card →'
                      : 'Last card done! →'
                    : 'Restart from Card 1'}
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => makeBusGuess('red')}
                  className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl font-semibold transition-colors"
                >
                  ♥ Red
                </button>
                <button
                  onClick={() => makeBusGuess('black')}
                  className="flex-1 py-2.5 bg-stone-700 hover:bg-stone-600 rounded-xl font-semibold transition-colors"
                >
                  ♠ Black
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
