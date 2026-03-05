import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="sticky top-0 z-20">
      {/* Saffron accent stripe — slightly thicker */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <nav className="bg-white/95 backdrop-blur border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
          >
            {/* Spade logo */}
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white text-xl leading-none select-none">♠</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Hukum</span>
              <span className="text-xs text-stone-400 font-semibold hidden sm:block">Game Rules Reference</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
              All Games
            </Link>
            <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full font-bold shadow-sm">
              6 games
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
}
