interface Props {
  value: number;
  rolling?: boolean;
  kept?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

// dot positions for each face value
const DOT_CONFIGS: Record<number, string[]> = {
  1: ['g'],
  2: ['a', 'b'],
  3: ['a', 'g', 'b'],
  4: ['a', 'c', 'd', 'b'],
  5: ['a', 'c', 'g', 'd', 'b'],
  6: ['a', 'c', 'e', 'f', 'd', 'b'],
};

const AREA_MAP: Record<string, string> = {
  a: '[grid-area:a]',
  b: '[grid-area:b]',
  c: '[grid-area:c]',
  d: '[grid-area:d]',
  e: '[grid-area:e]',
  f: '[grid-area:f]',
  g: '[grid-area:g]',
};

const SIZE_MAP = {
  sm: { outer: 'w-10 h-10', dot: 'w-2 h-2', padding: 'p-1.5' },
  md: { outer: 'w-14 h-14', dot: 'w-2.5 h-2.5', padding: 'p-2' },
  lg: { outer: 'w-16 h-16', dot: 'w-3 h-3', padding: 'p-2.5' },
};

export default function DiceFace({ value, rolling, kept, onClick, size = 'md' }: Props) {
  const dots = DOT_CONFIGS[value] ?? [];
  const sz = SIZE_MAP[size];
  const allAreas = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  return (
    <button
      onClick={onClick}
      className={[
        'dice-face',
        sz.outer,
        sz.padding,
        rolling ? 'rolling' : '',
        onClick ? 'cursor-pointer' : 'cursor-default',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        display: 'grid',
        gridTemplateAreas: `"a . c" "e g f" "d . b"`,
        borderRadius: '10px',
        background: kept ? 'rgba(57,255,20,0.12)' : 'rgba(5,22,14,0.85)',
        border: kept ? '2px solid #39FF14' : '2px solid rgba(57,255,20,0.4)',
        boxShadow: kept
          ? '0 0 12px rgba(57,255,20,0.45)'
          : '0 2px 8px rgba(0,0,0,0.4)',
      }}
      disabled={!onClick}
      aria-label={`Die showing ${value}`}
    >
      {allAreas.map((area) => (
        <div
          key={area}
          className={`${AREA_MAP[area]} self-center justify-self-center`}
        >
          {dots.includes(area) && (
            <div
              className={`${sz.dot} rounded-full`}
              style={{
                background: '#39FF14',
                boxShadow: '0 0 4px rgba(57,255,20,0.8)',
              }}
            />
          )}
        </div>
      ))}
    </button>
  );
}
