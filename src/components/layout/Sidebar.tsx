import {
  LayoutDashboard,
  FolderOpen,
  Receipt,
  FileText,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Receipt, label: "Transactions", path: "/transactions" },
  { icon: FolderOpen, label: "Categories", path: "/categories" },
  { icon: FileText, label: "Reports", path: "/reports" },
] as const;

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/90 border-r border-slate-200/70 shadow-xl backdrop-blur-lg transform transition-transform duration-300 ease-in-out lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <button
            onClick={onClose}
            className="lg:hidden self-end mb-4 p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Close menu"
            type="button"
          >
            <X size={24} />
          </button>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                      : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Hadaf Accounting - By{" "}
              <a className="hover: text-black" href="https://code.af">
                code.af
              </a>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
