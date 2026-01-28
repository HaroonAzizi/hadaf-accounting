import { DollarSign, Menu, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, toggleTheme } = useAppContext();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/60 border-b border-slate-200/70 dark:border-slate-800/70 backdrop-blur-lg">
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

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 transition-colors"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              type="button"
            >
              {theme === "dark" ? (
                <Sun size={20} className="text-slate-200" />
              ) : (
                <Moon size={20} className="text-slate-700" />
              )}
            </button>

            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
              aria-label="Open menu"
              type="button"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
