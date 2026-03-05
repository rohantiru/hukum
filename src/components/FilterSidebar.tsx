import { X, SlidersHorizontal } from 'lucide-react';
import type { FilterState, GameType, Difficulty, Category } from '../types/game';

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  totalGames: number;
  filteredCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'casual', label: 'Casual' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'gambling', label: 'Gambling' },
  { value: 'betting', label: 'Betting' },
  { value: 'drinking', label: 'Drinking' },
  { value: 'party', label: 'Party' },
  { value: 'indian', label: 'Indian' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: 'text-emerald-600' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600' },
  { value: 'hard', label: 'Hard', color: 'text-red-600' },
];

function CheckItem({
  checked,
  onChange,
  label,
  colorClass,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  colorClass?: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
      <div
        className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-amber-500 border-amber-500' : 'border-stone-300 group-hover:border-amber-400'
        }`}
        onClick={onChange}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${colorClass ?? 'text-stone-600'} group-hover:text-stone-800`}>{label}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-5 border-b border-stone-100 last:border-0 last:pb-0">
      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export default function FilterSidebar({
  filters,
  onChange,
  totalGames,
  filteredCount,
  mobileOpen,
  onMobileClose,
}: Props) {
  const toggleType = (t: GameType) => {
    const next = filters.types.includes(t)
      ? filters.types.filter((x) => x !== t)
      : [...filters.types, t];
    onChange({ ...filters, types: next });
  };

  const toggleCategory = (c: Category) => {
    const next = filters.categories.includes(c)
      ? filters.categories.filter((x) => x !== c)
      : [...filters.categories, c];
    onChange({ ...filters, categories: next });
  };

  const toggleDifficulty = (d: Difficulty) => {
    const next = filters.difficulty.includes(d)
      ? filters.difficulty.filter((x) => x !== d)
      : [...filters.difficulty, d];
    onChange({ ...filters, difficulty: next });
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.categories.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.playersMin > 1 ||
    filters.playersMax < 10;

  const resetFilters = () =>
    onChange({
      search: filters.search,
      types: [],
      categories: [],
      difficulty: [],
      playersMin: 1,
      playersMax: 10,
    });

  const SidebarContent = () => (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-stone-500" />
          <span className="font-semibold text-stone-700">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">{filteredCount}/{totalGames}</span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Game Type */}
      <Section title="Game Type">
        <CheckItem
          checked={filters.types.includes('card')}
          onChange={() => toggleType('card')}
          label="🃏 Card games"
        />
        <CheckItem
          checked={filters.types.includes('dice')}
          onChange={() => toggleType('dice')}
          label="🎲 Dice games"
        />
        <CheckItem
          checked={filters.types.includes('other')}
          onChange={() => toggleType('other')}
          label="🎯 Other"
        />
      </Section>

      {/* Difficulty */}
      <Section title="Difficulty">
        {DIFFICULTIES.map(({ value, label, color }) => (
          <CheckItem
            key={value}
            checked={filters.difficulty.includes(value)}
            onChange={() => toggleDifficulty(value)}
            label={label}
            colorClass={color}
          />
        ))}
      </Section>

      {/* Categories */}
      <Section title="Categories">
        {CATEGORIES.map(({ value, label }) => (
          <CheckItem
            key={value}
            checked={filters.categories.includes(value)}
            onChange={() => toggleCategory(value)}
            label={label}
          />
        ))}
      </Section>

      {/* Player count */}
      <Section title="Number of Players">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-stone-500">
            <span>Min: {filters.playersMin}</span>
            <span>Max: {filters.playersMax === 10 ? '10+' : filters.playersMax}</span>
          </div>
          <div>
            <label className="text-xs text-stone-400 block mb-1">Minimum players</label>
            <input
              type="range"
              min={1}
              max={10}
              value={filters.playersMin}
              onChange={(e) =>
                onChange({
                  ...filters,
                  playersMin: Number(e.target.value),
                  playersMax: Math.max(filters.playersMax, Number(e.target.value)),
                })
              }
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 block mb-1">Maximum players</label>
            <input
              type="range"
              min={1}
              max={10}
              value={filters.playersMax}
              onChange={(e) =>
                onChange({
                  ...filters,
                  playersMax: Number(e.target.value),
                  playersMin: Math.min(filters.playersMin, Number(e.target.value)),
                })
              }
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </Section>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white rounded-2xl border border-stone-200 p-5 h-fit sticky top-24">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="relative ml-auto w-72 max-w-full bg-white h-full overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold text-stone-800">Filters</span>
              <button onClick={onMobileClose} className="p-1 rounded-lg hover:bg-stone-100">
                <X size={20} className="text-stone-500" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
