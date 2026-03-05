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
      if (filters.types.length > 0 && !filters.types.includes(game.type)) return false;
      if (filters.difficulty.length > 0 && !filters.difficulty.includes(game.difficulty)) return false;
      if (filters.categories.length > 0 && !game.categories.some((c) => filters.categories.includes(c))) return false;
      if (game.playersMax < filters.playersMin) return false;
      if (game.playersMin > filters.playersMax) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: '#05160E' }}
      >
        {/* Corner "spilled liquid" neon blobs */}
        <div
          className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top left, rgba(255, 0, 255, 0.12) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at bottom right, rgba(57, 255, 20, 0.09) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(225, 179, 0, 0.06) 0%, transparent 60%)',
          }}
        />

        {/* Subtle CRT scanline texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(57, 255, 20, 0.012) 3px, rgba(57, 255, 20, 0.012) 4px)',
          }}
        />

        {/* Floating decorative card suits */}
        <span className="float absolute top-4 right-12 text-5xl select-none pointer-events-none"
          style={{ color: 'rgba(225, 179, 0, 0.12)', '--rot': '15deg' } as React.CSSProperties}>♠</span>
        <span className="float absolute top-8 right-36 text-3xl select-none pointer-events-none"
          style={{ color: 'rgba(57, 255, 20, 0.1)', '--rot': '-8deg', animationDelay: '0.8s' } as React.CSSProperties}>🎲</span>
        <span className="float absolute bottom-4 right-24 text-4xl select-none pointer-events-none"
          style={{ color: 'rgba(255, 0, 255, 0.1)', '--rot': '6deg', animationDelay: '1.5s' } as React.CSSProperties}>♥</span>
        <span className="float absolute top-6 left-4 text-4xl select-none pointer-events-none sm:block hidden"
          style={{ color: 'rgba(57, 255, 20, 0.08)', '--rot': '-12deg', animationDelay: '2s' } as React.CSSProperties}>🃏</span>
        <span className="float absolute bottom-6 left-16 text-3xl select-none pointer-events-none sm:block hidden"
          style={{ color: 'rgba(225, 179, 0, 0.1)', '--rot': '10deg', animationDelay: '0.4s' } as React.CSSProperties}>♦</span>

        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 leading-tight">
            <span style={{ color: '#d1fae5' }}>Master the rules.</span>
            <br className="hidden sm:block" />
            <span style={{ color: '#39FF14', textShadow: '0 0 20px rgba(57, 255, 20, 0.45)' }}>
              Own the table.
            </span>
          </h1>

          {/* Search bar */}
          <div className="mt-6 flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(57, 255, 20, 0.5)' }}
              />
              <input
                type="text"
                placeholder="Search games..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-2xl font-semibold focus:outline-none transition-all"
                style={{
                  background: 'rgba(5, 22, 14, 0.8)',
                  border: '1px solid rgba(57, 255, 20, 0.25)',
                  color: '#d1fae5',
                  boxShadow: '0 0 0 0 rgba(57, 255, 20, 0)',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid rgba(57, 255, 20, 0.55)';
                  e.target.style.boxShadow = '0 0 16px rgba(57, 255, 20, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid rgba(57, 255, 20, 0.25)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold transition-all"
              style={{
                background: 'rgba(57, 255, 20, 0.08)',
                border: '1px solid rgba(57, 255, 20, 0.25)',
                color: '#39FF14',
              }}
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
            {filtered.length === 0 ? (
              <div
                className="text-center py-20 rounded-2xl"
                style={{
                  background: 'rgba(5, 22, 14, 0.7)',
                  border: '1px solid rgba(57, 255, 20, 0.12)',
                }}
              >
                <div className="text-4xl mb-3">🎲</div>
                <h3 className="font-semibold mb-1" style={{ color: '#d1fae5' }}>No games found</h3>
                <p className="text-sm" style={{ color: 'rgba(209, 250, 229, 0.45)' }}>
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="mt-4 text-sm font-medium transition-colors"
                  style={{ color: '#39FF14' }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Extra padding so rotated cards don't clip */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 py-3 px-2">
                {filtered.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}

            {/* CTA */}
            <div
              className="mt-10 text-center rounded-2xl p-6"
              style={{
                background: 'rgba(5, 22, 14, 0.7)',
                border: '1px solid rgba(225, 179, 0, 0.2)',
                boxShadow: '0 0 20px rgba(225, 179, 0, 0.06)',
              }}
            >
              <p className="font-bold" style={{ color: '#E1B300', textShadow: '0 0 10px rgba(225, 179, 0, 0.4)' }}>
                🎉 More games coming soon!
              </p>
              <p className="text-sm mt-1" style={{ color: 'rgba(209, 250, 229, 0.5)' }}>
                Beer pong, flip cup, and more drinking games on the way.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
