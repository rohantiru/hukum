import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import gamesData from '../data/games.json';
import type { Game, FilterState } from '../types/game';
import GameCard from '../components/GameCard';
import FilterSidebar from '../components/FilterSidebar';

const games = gamesData.games as Game[];

const defaultFilters: FilterState = {
  search: '',
  types: [],
  categories: [],
  difficulty: [],
  playersMin: 1,
  playersMax: 10,
};

export default function HomePage() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return games.filter((game) => {
      if (
        filters.search &&
        !game.name.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;

      if (filters.types.length > 0 && !filters.types.includes(game.type))
        return false;

      if (
        filters.difficulty.length > 0 &&
        !filters.difficulty.includes(game.difficulty)
      )
        return false;

      if (
        filters.categories.length > 0 &&
        !game.categories.some((c) => filters.categories.includes(c))
      )
        return false;

      if (game.playersMax < filters.playersMin) return false;
      if (game.playersMin > filters.playersMax) return false;

      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 overflow-hidden">
        {/* Floating decorative card suits */}
        <span className="float absolute top-4 right-12 text-5xl text-white/15 select-none pointer-events-none" style={{ '--rot': '15deg' } as React.CSSProperties}>♠</span>
        <span className="float absolute top-8 right-36 text-3xl text-white/10 select-none pointer-events-none" style={{ '--rot': '-8deg', animationDelay: '0.8s' } as React.CSSProperties}>🎲</span>
        <span className="float absolute bottom-4 right-24 text-4xl text-white/10 select-none pointer-events-none" style={{ '--rot': '6deg', animationDelay: '1.5s' } as React.CSSProperties}>♥</span>
        <span className="float absolute top-6 left-4 text-4xl text-white/10 select-none pointer-events-none sm:block hidden" style={{ '--rot': '-12deg', animationDelay: '2s' } as React.CSSProperties}>🃏</span>
        <span className="float absolute bottom-6 left-16 text-3xl text-white/10 select-none pointer-events-none sm:block hidden" style={{ '--rot': '10deg', animationDelay: '0.4s' } as React.CSSProperties}>♦</span>

        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              🎮 Game Rules Reference
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-3 leading-tight drop-shadow-sm">
            Master the rules.<br className="hidden sm:block" />
            <span className="text-amber-200">Own the table.</span>
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl font-semibold">
            From bluffing in Teen Patti to rolling craps — every game explained, with interactive simulations so you can practice before you play.
          </p>

          {/* Search */}
          <div className="mt-6 flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                placeholder="Search games..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-2xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg font-semibold"
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-2xl text-white shadow-sm hover:bg-white/30 font-semibold"
            >
              <SlidersHorizontal size={16} />
              <span className="text-sm">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="flex gap-6">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            totalGames={games.length}
            filteredCount={filtered.length}
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          {/* Games grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500">
                Showing <span className="font-semibold text-stone-700">{filtered.length}</span>{' '}
                {filtered.length === 1 ? 'game' : 'games'}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
                <div className="text-4xl mb-3">🎲</div>
                <h3 className="font-semibold text-stone-700 mb-1">No games found</h3>
                <p className="text-stone-400 text-sm">Try adjusting your filters or search term.</p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}

            {/* CTA: add more games */}
            <div className="mt-8 text-center bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-6 shadow-md">
              <p className="text-white font-bold">🎉 More games coming soon!</p>
              <p className="text-white/80 text-sm mt-1 font-semibold">Beer pong, flip cup, and more drinking games on the way.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
