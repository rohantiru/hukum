import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="sticky top-0 z-20">
      {/* Thin saffron accent stripe */}
      <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />

      <nav className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-stone-800 hover:text-amber-600 transition-colors group"
          >
            {/* Spade logo */}
            <div className="w-9 h-9 bg-gradient-to-br from-stone-800 to-stone-700 rounded-xl flex items-center justify-center shadow-sm group-hover:from-amber-600 group-hover:to-amber-700 transition-all">
              <span className="text-white text-xl leading-none select-none">♠</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight">Hukum</span>
              <span className="text-xs text-stone-400 font-normal hidden sm:block">Game Rules Reference</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              All Games
            </Link>
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
              6 games
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
}
