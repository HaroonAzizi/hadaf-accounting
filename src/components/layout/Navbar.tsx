import { DollarSign, Menu } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 border-b border-slate-200 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-sky-500 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <DollarSign className="text-white" size={28} />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight">
              Hadaf<span className="text-sky-500">.</span>
            </span>
          </Link>

          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Open menu"
            type="button"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}
