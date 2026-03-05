import { Link } from 'react-router-dom';
import { Dices, Clock, Users } from 'lucide-react';
import type { Game } from '../types/game';

interface Props {
  game: Game;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-400/20 text-emerald-700 border border-emerald-300/50',
  medium: 'bg-amber-400/20 text-amber-700 border border-amber-300/50',
  hard: 'bg-red-400/20 text-red-700 border border-red-300/50',
};

const gameGradients: Record<string, string> = {
  'yahtzee': 'from-amber-400 via-orange-400 to-orange-500',
  'texas-holdem': 'from-slate-600 via-indigo-600 to-indigo-700',
  'ride-the-bus': 'from-rose-400 via-red-500 to-rose-600',
  'teen-patti': 'from-yellow-400 via-amber-400 to-amber-500',
  'blackjack': 'from-emerald-500 via-teal-500 to-teal-600',
  'craps': 'from-violet-500 via-purple-500 to-purple-600',
};

const gameIcons: Record<string, React.ReactNode> = {
  'yahtzee': <Dices size={36} className="text-white drop-shadow" />,
  'texas-holdem': <span className="text-5xl drop-shadow">♠</span>,
  'ride-the-bus': <span className="text-4xl drop-shadow">🚌</span>,
  'teen-patti': <span className="text-4xl drop-shadow">🃏</span>,
  'blackjack': <span className="text-4xl font-black text-white drop-shadow" style={{ fontFamily: 'Nunito, sans-serif' }}>21</span>,
  'craps': <Dices size={36} className="text-white drop-shadow" />,
};

// Decorative background symbols for each card
const gameDecor: Record<string, string[]> = {
  'yahtzee': ['⚄', '⚂'],
  'texas-holdem': ['♦', '♣'],
  'ride-the-bus': ['🍺', '🎴'],
  'teen-patti': ['♥', '♦'],
  'blackjack': ['♠', '♥'],
  'craps': ['🎲', '🎲'],
};

export default function GameCard({ game }: Props) {
  const gradient = gameGradients[game.id] ?? 'from-stone-500 to-stone-600';
  const icon = gameIcons[game.id] ?? <Dices size={36} className="text-white" />;
  const decor = gameDecor[game.id] ?? [];
  const tagline = 'tagline' in game ? (game as Game & { tagline?: string }).tagline : undefined;

  return (
    <Link
      to={`/game/${game.id}`}
      className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 border border-white/60"
    >
      {/* Colorful header panel */}
      <div className={`relative bg-gradient-to-br ${gradient} px-5 pt-6 pb-5 overflow-hidden`}>
        {/* Decorative large background symbols */}
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

        {/* Icon + name */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-white text-xl leading-tight drop-shadow-sm">{game.name}</h3>
            {tagline && (
              <p className="text-white/75 text-xs mt-0.5 truncate font-medium">{tagline}</p>
            )}
          </div>
        </div>
      </div>

      {/* White info strip */}
      <div className="bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold">
          <span className="flex items-center gap-1">
            <Users size={12} className="text-stone-400" />
            {game.players}
          </span>
          <span className="text-stone-200">|</span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-stone-400" />
            ~{game.timeMinutes} min
          </span>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold capitalize ${difficultyColors[game.difficulty]}`}>
          {game.difficulty}
        </span>
      </div>
    </Link>
  );
}
