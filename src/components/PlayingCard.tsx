interface Props {
  card?: string; // e.g. "A♠", "K♦", "10♥"
  hidden?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const RED_SUITS = new Set(['♥', '♦']);

function getSuit(card: string): string {
  return card.slice(-1);
}

function getRank(card: string): string {
  return card.slice(0, -1);
}

const SIZE_STYLES = {
  sm: 'w-12 h-16 text-sm',
  md: 'w-16 h-22 text-base',
};

export default function PlayingCard({ card, hidden, size = 'md', className = '' }: Props) {
  if (hidden || !card) {
    return (
      <div
        className={`${SIZE_STYLES[size]} ${className} rounded-lg border-2 border-blue-600 shadow-md flex items-center justify-center`}
        style={{
          background: 'repeating-linear-gradient(45deg, #1e40af, #1e40af 4px, #1d4ed8 4px, #1d4ed8 8px)',
          width: size === 'sm' ? 48 : 60,
          height: size === 'sm' ? 68 : 84,
        }}
        aria-label="Hidden card"
      />
    );
  }

  const suit = getSuit(card);
  const rank = getRank(card);
  const isRed = RED_SUITS.has(suit);
  const colorClass = isRed ? 'text-red-600' : 'text-stone-900';

  const w = size === 'sm' ? 48 : 60;
  const h = size === 'sm' ? 68 : 84;
  const fontSize = size === 'sm' ? '0.75rem' : '0.9rem';
  const suitSize = size === 'sm' ? '1rem' : '1.25rem';

  return (
    <div
      className={`${className} bg-white rounded-lg border border-stone-200 shadow-md select-none inline-flex flex-col justify-between p-1 ${colorClass}`}
      style={{ width: w, height: h, fontSize, fontWeight: 700 }}
      aria-label={`${rank}${suit}`}
    >
      <div className="flex flex-col items-center leading-none">
        <span>{rank}</span>
        <span style={{ fontSize: suitSize }}>{suit}</span>
      </div>
      <div className="flex flex-col items-center leading-none rotate-180">
        <span>{rank}</span>
        <span style={{ fontSize: suitSize }}>{suit}</span>
      </div>
    </div>
  );
}
