import { Link } from 'react-router-dom';
import { Dices, Clock, Users } from 'lucide-react';
import type { Game } from '../types/game';

interface Props {
  game: Game;
}

const DRINKING_GAMES = new Set(['ride-the-bus', 'flip-cup', 'asshole']);

const difficultyColors: Record<string, string> = {
  easy:   'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30',
  medium: 'bg-[#E1B300]/10 text-[#E1B300] border border-[#E1B300]/30',
  hard:   'bg-[#FF1493]/10 text-[#FF1493] border border-[#FF1493]/30',
};

const gameGradients: Record<string, string> = {
  'yahtzee':     'from-amber-500 via-orange-500 to-orange-600',
  'texas-holdem':'from-slate-700 via-indigo-700 to-indigo-800',
  'ride-the-bus':'from-rose-500 via-red-600 to-rose-700',
  'teen-patti':  'from-yellow-500 via-amber-500 to-amber-600',
  'blackjack':   'from-emerald-600 via-teal-600 to-teal-700',
  'craps':       'from-violet-600 via-purple-600 to-purple-700',
  'flip-cup':    'from-sky-500 via-blue-600 to-blue-700',
  'asshole':     'from-purple-600 via-pink-600 to-pink-700',
  'twenty-eight':'from-teal-600 via-cyan-600 to-cyan-700',
  'kaali-teeri': 'from-stone-700 via-stone-800 to-stone-900',
};

const gameIcons: Record<string, React.ReactNode> = {
  'yahtzee':     <Dices size={36} className="text-white drop-shadow" />,
  'texas-holdem':<span className="text-5xl drop-shadow">♠</span>,
  'ride-the-bus':<span className="text-4xl drop-shadow">🚌</span>,
  'teen-patti':  <span className="text-4xl drop-shadow">🃏</span>,
  'blackjack':   <span className="text-4xl font-black text-white drop-shadow" style={{ fontFamily: 'Nunito, sans-serif' }}>21</span>,
  'craps':       <Dices size={36} className="text-white drop-shadow" />,
  'flip-cup':    <span className="text-4xl drop-shadow">🍺</span>,
  'asshole':     <span className="text-5xl drop-shadow text-white">♠</span>,
  'twenty-eight':<span className="text-4xl font-black text-white drop-shadow" style={{ fontFamily: 'Nunito, sans-serif' }}>28</span>,
  'kaali-teeri': <span className="text-3xl font-black text-amber-300 drop-shadow">3♠</span>,
};

const gameDecor: Record<string, string[]> = {
  'yahtzee':     ['⚄', '⚂'],
  'texas-holdem':['♦', '♣'],
  'ride-the-bus':['🍺', '🎴'],
  'teen-patti':  ['♥', '♦'],
  'blackjack':   ['♠', '♥'],
  'craps':       ['🎲', '🎲'],
  'flip-cup':    ['🥤', '🍺'],
  'asshole':     ['♣', '♦'],
  'twenty-eight':['♦', '♥'],
  'kaali-teeri': ['♠', '3'],
};

// Each card is uniquely "hand-dropped" with a stable asymmetric rotation
const cardRotations: Record<string, string> = {
  'yahtzee':     '-2deg',
  'texas-holdem': '1.2deg',
  'ride-the-bus':'-1.8deg',
  'teen-patti':   '2.1deg',
  'blackjack':   '-0.7deg',
  'craps':        '1.5deg',
  'flip-cup':    '-2.3deg',
  'asshole':      '0.9deg',
  'twenty-eight':'-1.4deg',
  'kaali-teeri':  '2.5deg',
};

export default function GameCard({ game }: Props) {
  const gradient   = gameGradients[game.id] ?? 'from-stone-600 to-stone-700';
  const icon       = gameIcons[game.id]     ?? <Dices size={36} className="text-white" />;
  const decor      = gameDecor[game.id]     ?? [];
  const rotation   = cardRotations[game.id] ?? '0deg';
  const isDrinking = DRINKING_GAMES.has(game.id);

  const tagline = 'tagline' in game
    ? (game as Game & { tagline?: string }).tagline
    : undefined;

  return (
    <div
      className="game-card-wrapper"
      style={{ '--card-rot': rotation } as React.CSSProperties}
    >
      <Link
        to={`/game/${game.id}`}
        className={[
          'group block rounded-2xl overflow-hidden transition-all duration-200 glass-card',
          isDrinking ? 'neon-magenta jitter-drinking' : 'neon-lime',
        ].join(' ')}
      >
        {/* Colorful header panel */}
        <div className={`relative bg-gradient-to-br ${gradient} px-5 pt-6 pb-5 overflow-hidden`}>
          {/* Decorative background symbols */}
          {decor[0] && (
            <span className="absolute -bottom-2 -right-1 text-6xl opacity-15 select-none pointer-events-none rotate-12">
              {decor[0]}
            </span>
          )}
          {decor[1] && (
            <span className="absolute top-1 right-8 text-3xl opacity-10 select-none pointer-events-none -rotate-6">
              {decor[1]}
            </span>
          )}

          {/* Drinking game inner glow */}
          {isDrinking && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 24px rgba(255, 0, 255, 0.18)' }}
            />
          )}

          {/* Icon + name */}
          <div className="flex items-center gap-3 relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-white text-xl leading-tight drop-shadow-sm">{game.name}</h3>
              {tagline && (
                <p className="text-white/75 text-xs mt-0.5 truncate font-medium">{tagline}</p>
              )}
              {isDrinking && (
                <span
                  className="inline-block text-xs font-bold mt-1 px-2 py-0.5 rounded-full"
                  style={{
                    color: '#FF00FF',
                    background: 'rgba(255, 0, 255, 0.18)',
                    border: '1px solid rgba(255, 0, 255, 0.4)',
                    textShadow: '0 0 6px rgba(255, 0, 255, 0.8)',
                  }}
                >
                  🍺 DRINKING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dark info strip */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{
            background: 'rgba(5, 22, 14, 0.9)',
            borderTop: '1px solid rgba(57, 255, 20, 0.1)',
          }}
        >
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1" style={{ color: 'rgba(209, 250, 229, 0.65)' }}>
              <Users size={12} style={{ color: 'rgba(57, 255, 20, 0.5)' }} />
              {game.players}
            </span>
            <span style={{ color: 'rgba(57, 255, 20, 0.2)' }}>|</span>
            <span className="flex items-center gap-1" style={{ color: 'rgba(209, 250, 229, 0.65)' }}>
              <Clock size={12} style={{ color: 'rgba(57, 255, 20, 0.5)' }} />
              ~{game.timeMinutes} min
            </span>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold capitalize ${difficultyColors[game.difficulty]}`}>
            {game.difficulty}
          </span>
        </div>
      </Link>
    </div>
  );
}
