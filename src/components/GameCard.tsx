import { Link } from 'react-router-dom';
import { Dices, Clock, Users, ChevronRight } from 'lucide-react';
import type { Game } from '../types/game';

interface Props {
  game: Game;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

const categoryColors: Record<string, string> = {
  family: 'bg-blue-50 text-blue-600',
  casual: 'bg-purple-50 text-purple-600',
  strategy: 'bg-orange-50 text-orange-600',
  gambling: 'bg-rose-50 text-rose-600',
  betting: 'bg-pink-50 text-pink-600',
  drinking: 'bg-lime-50 text-lime-600',
  party: 'bg-violet-50 text-violet-600',
};

export default function GameCard({ game }: Props) {
  const isCard = game.type === 'card';

  return (
    <Link
      to={`/game/${game.id}`}
      className="group block bg-white rounded-2xl border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Header band */}
      <div className={`h-2 ${isCard ? 'bg-gradient-to-r from-rose-400 to-pink-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />

      <div className="p-5">
        {/* Icon + title row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isCard ? 'bg-rose-50' : 'bg-amber-50'}`}>
              {isCard
                ? <span className="text-2xl text-rose-500">♠</span>
                : <Dices size={22} className="text-amber-600" />
              }
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-lg leading-tight group-hover:text-stone-900">{game.name}</h3>
              <span className="text-xs text-stone-400 capitalize">{game.type} game</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all mt-1 flex-shrink-0" />
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {game.players} players
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            ~{game.timeMinutes} min
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${difficultyColors[game.difficulty]}`}>
            {game.difficulty}
          </span>
          {game.categories.slice(0, 2).map((cat) => (
            <span key={cat} className={`text-xs px-2 py-0.5 rounded-full capitalize ${categoryColors[cat] ?? 'bg-stone-100 text-stone-600'}`}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
