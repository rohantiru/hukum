import { useState, useEffect, useRef } from 'react';

type Phase = 'ready' | 'chugging' | 'flipping' | 'result';

interface Player {
  name: string;
  state: 'waiting' | 'chugging' | 'flipping' | 'done' | 'failed';
}

function Cup({ state }: { state: Player['state'] }) {
  const colorMap = {
    waiting: 'bg-stone-100 border-stone-300',
    chugging: 'bg-blue-100 border-blue-400',
    flipping: 'bg-amber-100 border-amber-400',
    done: 'bg-green-100 border-green-500',
    failed: 'bg-red-100 border-red-400',
  };
  return (
    <div
      className={`w-6 h-9 rounded-b-lg border-2 flex items-center justify-center transition-all ${colorMap[state]} ${state === 'done' ? 'rotate-180' : ''}`}
    >
      {state === 'done' && <span className="rotate-180 text-xs text-green-600 font-bold">✓</span>}
    </div>
  );
}

const YOUR_TEAM: Player[] = [
  { name: 'You', state: 'waiting' },
  { name: 'Alex', state: 'waiting' },
  { name: 'Sam', state: 'waiting' },
];
const OPP_TEAM: Player[] = [
  { name: 'Bot 1', state: 'waiting' },
  { name: 'Bot 2', state: 'waiting' },
  { name: 'Bot 3', state: 'waiting' },
];

export default function FlipCupSimulation({ onViewRules }: { onViewRules?: () => void } = {}) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [chugProgress, setChugProgress] = useState(0);
  const [flipAttempts, setFlipAttempts] = useState(0);
  const [flipShake, setFlipShake] = useState(false);
  const [yourTeam, setYourTeam] = useState<Player[]>(YOUR_TEAM.map(p => ({ ...p })));
  const [oppTeam, setOppTeam] = useState<Player[]>(OPP_TEAM.map(p => ({ ...p })));
  const [winner, setWinner] = useState<'you' | 'opp' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  useEffect(() => {
    if (phase === 'result') {
      setRoundsPlayed(r => r + 1);
    }
  }, [phase]);

  function startRace() {
    setPhase('chugging');
    setChugProgress(0);
    setYourTeam(YOUR_TEAM.map(p => ({ ...p, state: p.name === 'You' ? 'chugging' : 'waiting' })));
    setOppTeam(OPP_TEAM.map(p => ({ ...p })));

    // Auto-start opponents chugging with random delays
    OPP_TEAM.forEach((_, i) => {
      const delay = Math.random() * 500 + 1500 * i + 800;
      setTimeout(() => {
        setOppTeam(prev => {
          const next = [...prev];
          if (i === 0 || next[i - 1].state === 'done') {
            next[i] = { ...next[i], state: 'chugging' };
          }
          return next;
        });
        setTimeout(() => {
          setOppTeam(prev => {
            const next = [...prev];
            next[i] = { ...next[i], state: 'done' };
            if (i + 1 < next.length) {
              next[i + 1] = { ...next[i + 1], state: 'chugging' };
            }
            return next;
          });
        }, Math.random() * 800 + 700);
      }, delay);
    });

    // Progress bar
    intervalRef.current = setInterval(() => {
      setChugProgress(prev => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setYourTeam(t => t.map((p, i) => i === 0 ? { ...p, state: 'flipping' } : p));
          setPhase('flipping');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  }

  function attemptFlip() {
    const success = Math.random() < 0.72 - flipAttempts * 0.05;
    if (success) {
      setYourTeam(t => t.map((p, i) => i === 0 ? { ...p, state: 'done' } : p));
      // Teammates complete after a short delay
      setTimeout(() => {
        setYourTeam(t => t.map((p, i) => i === 1 ? { ...p, state: 'chugging' } : p));
        setTimeout(() => {
          setYourTeam(t => t.map((p, i) => i === 1 ? { ...p, state: 'done' } : (i === 2 ? { ...p, state: 'chugging' } : p)));
          setTimeout(() => {
            setYourTeam(t => t.map(p => ({ ...p, state: 'done' })));
            // Determine winner
            setOppTeam(prev => {
              const allOppDone = prev.every(p => p.state === 'done');
              setWinner(allOppDone ? 'opp' : 'you');
              return prev;
            });
            setPhase('result');
          }, Math.random() * 700 + 600);
        }, Math.random() * 600 + 500);
      }, Math.random() * 400 + 300);
    } else {
      setFlipAttempts(a => a + 1);
      setFlipShake(true);
      setTimeout(() => setFlipShake(false), 400);
    }
  }

  function reset() {
    setPhase('ready');
    setChugProgress(0);
    setFlipAttempts(0);
    setFlipShake(false);
    setWinner(null);
    setYourTeam(YOUR_TEAM.map(p => ({ ...p })));
    setOppTeam(OPP_TEAM.map(p => ({ ...p })));
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-lg">Flip Cup Simulator</h3>
            <p className="text-sky-100 text-xs mt-0.5">First team to fully flip wins!</p>
          </div>
          <span className="text-4xl">🍺</span>
        </div>
      </div>

      {/* Nudge */}
      {roundsPlayed >= 2 && !nudgeDismissed && onViewRules && (
        <div className="mx-5 mt-4 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sky-700 text-sm font-medium">Forgot the rules?</p>
          <div className="flex gap-2">
            <button onClick={onViewRules} className="text-sky-600 text-xs font-bold hover:text-sky-800 underline">
              View the rules →
            </button>
            <button onClick={() => setNudgeDismissed(true)} className="text-sky-400 text-xs hover:text-sky-600">✕</button>
          </div>
        </div>
      )}

      <div className="p-5 space-y-5">
        {/* Teams */}
        <div className="grid grid-cols-2 gap-4">
          {/* Your Team */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Your Team</p>
            <div className="space-y-2">
              {yourTeam.map((player) => (
                <div key={player.name} className="flex items-center gap-2">
                  <Cup state={player.state} />
                  <span className="text-sm font-semibold text-stone-700">{player.name}</span>
                  {player.state === 'chugging' && (
                    <span className="text-xs text-blue-500 animate-pulse">chugging...</span>
                  )}
                  {player.state === 'flipping' && (
                    <span className="text-xs text-amber-500 animate-pulse">flip it!</span>
                  )}
                  {player.state === 'done' && (
                    <span className="text-xs text-green-600 font-bold">✓ done</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Opponent Team */}
          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-3">Opponents</p>
            <div className="space-y-2">
              {oppTeam.map((player) => (
                <div key={player.name} className="flex items-center gap-2">
                  <Cup state={player.state} />
                  <span className="text-sm font-semibold text-stone-700">{player.name}</span>
                  {player.state === 'chugging' && (
                    <span className="text-xs text-red-400 animate-pulse">chugging...</span>
                  )}
                  {player.state === 'done' && (
                    <span className="text-xs text-green-600 font-bold">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Area */}
        {phase === 'ready' && (
          <button
            onClick={startRace}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition text-base shadow"
          >
            🎉 Start the Race!
          </button>
        )}

        {phase === 'chugging' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-blue-700">Chugging... 🍺</span>
              <span className="text-stone-400">{chugProgress}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-blue-400 to-sky-500 transition-all duration-100"
                style={{ width: `${chugProgress}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 text-center">Wait for your cup to empty...</p>
          </div>
        )}

        {phase === 'flipping' && (
          <div className="space-y-3">
            <p className="text-center text-sm text-amber-700 font-semibold">
              Cup is empty! Time to flip! 🥤
            </p>
            {flipAttempts > 0 && (
              <p className="text-center text-xs text-red-500">
                {flipAttempts} missed flip{flipAttempts > 1 ? 's' : ''} — keep trying!
              </p>
            )}
            <button
              onClick={attemptFlip}
              className={`w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold rounded-xl hover:opacity-90 transition text-lg shadow ${flipShake ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}
              style={flipShake ? { animation: 'shake 0.3s ease-in-out' } : {}}
            >
              Flip! 🥤
            </button>
            <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }`}</style>
          </div>
        )}

        {phase === 'result' && (
          <div className={`rounded-xl p-4 text-center border-2 ${winner === 'you' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <div className="text-3xl mb-2">{winner === 'you' ? '🏆' : '😅'}</div>
            <p className={`font-extrabold text-lg ${winner === 'you' ? 'text-green-700' : 'text-red-600'}`}>
              {winner === 'you' ? 'Your team wins!' : 'Opponents got you!'}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              {winner === 'you'
                ? `Nailed it in ${flipAttempts > 0 ? flipAttempts + 1 + ' flip attempts' : '1 flip'} 🎉`
                : `The opponent team finished first. ${flipAttempts > 0 ? `Missed ${flipAttempts} flip${flipAttempts > 1 ? 's' : ''}.` : ''}`}
            </p>
            <button
              onClick={reset}
              className="mt-3 px-6 py-2 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition text-sm"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
