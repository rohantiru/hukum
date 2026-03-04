import { Link } from 'react-router-dom';
import { Dices } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-stone-800 hover:text-amber-600 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Dices size={17} className="text-white" />
          </div>
          <span className="text-base">GameBoy</span>
          <span className="text-xs text-stone-400 font-normal hidden sm:inline">Rules Reference</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
            All Games
          </Link>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            2 games
          </span>
        </div>
      </div>
    </nav>
  );
}
