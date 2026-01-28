import { useState, type ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(14,165,233,0.18),rgba(14,165,233,0))]" />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
