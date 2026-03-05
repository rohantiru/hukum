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
  { value: 'family',   label: 'Family' },
  { value: 'casual',   label: 'Casual' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'gambling', label: 'Gambling' },
  { value: 'betting',  label: 'Betting' },
  { value: 'drinking', label: 'Drinking' },
  { value: 'party',    label: 'Party' },
  { value: 'indian',   label: 'Indian' },
];

const DIFFICULTIES: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy',   label: 'Easy',   color: '#39FF14' },
  { value: 'medium', label: 'Medium', color: '#E1B300' },
  { value: 'hard',   label: 'Hard',   color: '#FF1493' },
];

function CheckItem({
  checked,
  onChange,
  label,
  neonColor,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  neonColor?: string;
}) {
  const color = neonColor ?? 'rgba(209, 250, 229, 0.65)';
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
      <div
        className="w-4 h-4 rounded flex items-center justify-center transition-all shrink-0"
        style={{
          background: checked ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
          border: `1.5px solid ${checked ? '#39FF14' : 'rgba(57, 255, 20, 0.25)'}`,
          boxShadow: checked ? '0 0 6px rgba(57, 255, 20, 0.5)' : 'none',
        }}
        onClick={onChange}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#39FF14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        className="text-sm transition-colors"
        style={{ color: checked ? color : 'rgba(209, 250, 229, 0.55)' }}
      >
        {label}
      </span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="pb-5 last:pb-0"
      style={{ borderBottom: '1px solid rgba(57, 255, 20, 0.08)' }}
    >
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: '#E1B300', textShadow: '0 0 8px rgba(225, 179, 0, 0.4)' }}
      >
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

const sidebarStyle = {
  background: 'rgba(5, 22, 14, 0.85)',
  border: '1px solid rgba(57, 255, 20, 0.15)',
  backdropFilter: 'blur(14px)',
} as React.CSSProperties;

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
          <SlidersHorizontal size={16} style={{ color: '#39FF14' }} />
          <span className="font-semibold" style={{ color: '#E1B300' }}>Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'rgba(209, 250, 229, 0.35)' }}>
            {filteredCount}/{totalGames}
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-medium transition-colors"
              style={{ color: '#FF1493' }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Game Type */}
      <Section title="Game Type">
        <CheckItem checked={filters.types.includes('card')}  onChange={() => toggleType('card')}  label="🃏 Card games" />
        <CheckItem checked={filters.types.includes('dice')}  onChange={() => toggleType('dice')}  label="🎲 Dice games" />
        <CheckItem checked={filters.types.includes('other')} onChange={() => toggleType('other')} label="🎯 Other" />
      </Section>

      {/* Difficulty */}
      <Section title="Difficulty">
        {DIFFICULTIES.map(({ value, label, color }) => (
          <CheckItem
            key={value}
            checked={filters.difficulty.includes(value)}
            onChange={() => toggleDifficulty(value)}
            label={label}
            neonColor={color}
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
          <div className="flex justify-between text-xs" style={{ color: 'rgba(209, 250, 229, 0.45)' }}>
            <span>Min: {filters.playersMin}</span>
            <span>Max: {filters.playersMax === 10 ? '10+' : filters.playersMax}</span>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'rgba(209, 250, 229, 0.35)' }}>Minimum players</label>
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
              className="w-full accent-[#39FF14]"
              style={{ accentColor: '#39FF14' }}
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'rgba(209, 250, 229, 0.35)' }}>Maximum players</label>
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
              className="w-full"
              style={{ accentColor: '#39FF14' }}
            />
          </div>
        </div>
      </Section>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-64 shrink-0 rounded-2xl p-5 h-fit sticky top-24"
        style={sidebarStyle}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={onMobileClose} />
          <aside
            className="relative ml-auto w-72 max-w-full h-full overflow-y-auto p-5 shadow-2xl"
            style={{ ...sidebarStyle, borderRadius: 0 }}
          >
            <div className="flex items-center justify-between mb-5">
              <span className="font-bold" style={{ color: '#E1B300' }}>Filters</span>
              <button onClick={onMobileClose} className="p-1 rounded-lg" style={{ color: 'rgba(209, 250, 229, 0.5)' }}>
                <X size={20} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
