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
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-b border-stone-200 overflow-hidden">
        {/* Subtle dot pattern — rangoli-inspired */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-xl leading-none">♠</span>
            </div>
            <span className="text-amber-700 font-semibold text-sm tracking-wide uppercase">Hukum · Game Reference</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-800 mb-2">
            Card & Dice Game Rules
          </h1>
          <p className="text-stone-500 text-lg max-w-xl">
            Learn rules, explore strategies, and simulate gameplay for classic card and dice games.
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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-600 shadow-sm hover:bg-stone-50"
            >
              <SlidersHorizontal size={16} />
              <span className="text-sm font-medium">Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
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
            <div className="mt-8 text-center bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
              <p className="text-stone-600 text-sm">
                More games coming soon! The app is built to easily expand with new entries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
