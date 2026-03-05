import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [drunkMode, setDrunkMode] = useState(false);

  // Restore drunk mode from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('drunkMode') === 'true';
    setDrunkMode(saved);
    if (saved) document.documentElement.classList.add('drunk-mode');
  }, []);

  const toggleDrunkMode = () => {
    const next = !drunkMode;
    setDrunkMode(next);
    document.documentElement.classList.toggle('drunk-mode', next);
    localStorage.setItem('drunkMode', String(next));
  };

  return (
    <div className="sticky top-0 z-20">
      {/* Neon stripe — magenta → lime → gold */}
      <div
        className="h-0.5"
        style={{ background: 'linear-gradient(90deg, #FF00FF, #39FF14 50%, #E1B300)' }}
      />

      <nav
        className="backdrop-blur border-b"
        style={{
          background: 'rgba(5, 16, 10, 0.96)',
          borderColor: 'rgba(57, 255, 20, 0.12)',
          boxShadow: '0 2px 24px rgba(57, 255, 20, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: '#05160E',
                border: '1px solid rgba(225, 179, 0, 0.45)',
                boxShadow: '0 0 12px rgba(225, 179, 0, 0.28)',
              }}
            >
              <span
                className="text-xl leading-none select-none"
                style={{ color: '#E1B300', textShadow: '0 0 10px rgba(225, 179, 0, 0.8)' }}
              >
                ♠
              </span>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-lg font-extrabold tracking-tight"
                style={{ color: '#E1B300', textShadow: '0 0 10px rgba(225, 179, 0, 0.45)' }}
              >
                Hukum
              </span>
              <span className="text-xs font-semibold hidden sm:block" style={{ color: 'rgba(57, 255, 20, 0.45)' }}>
                Game Rules Reference
              </span>
            </div>
          </Link>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-semibold transition-colors"
              style={{ color: 'rgba(209, 250, 229, 0.55)' }}
            >
              All Games
            </Link>

            <span
              className="text-xs px-3 py-1 rounded-full font-bold"
              style={{
                color: '#39FF14',
                background: 'rgba(57, 255, 20, 0.08)',
                border: '1px solid rgba(57, 255, 20, 0.28)',
                textShadow: '0 0 8px rgba(57, 255, 20, 0.6)',
              }}
            >
              9 games
            </span>

            {/* Drunk Mode Toggle */}
            <button
              onClick={toggleDrunkMode}
              title={drunkMode ? 'Drunk Mode ON — click to sober up' : 'Drunk Mode OFF — click to party'}
              className="text-sm px-3 py-1 rounded-full font-bold transition-all jitter-drinking cursor-pointer"
              style={{
                color: drunkMode ? '#FF00FF' : 'rgba(209, 250, 229, 0.4)',
                background: drunkMode ? 'rgba(255, 0, 255, 0.1)' : 'transparent',
                border: `1px solid ${drunkMode ? 'rgba(255, 0, 255, 0.4)' : 'rgba(209, 250, 229, 0.12)'}`,
                boxShadow: drunkMode ? '0 0 10px rgba(255, 0, 255, 0.35)' : 'none',
                textShadow: drunkMode ? '0 0 8px rgba(255, 0, 255, 0.7)' : 'none',
              }}
            >
              {drunkMode ? '🍺 DRUNK' : '🍺'}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
