import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type AppContextValue = {
  dateRange: DateRange;
  setDateRange: (next: DateRange) => void;
  selectedCategory: number | null;
  setSelectedCategory: (id: number | null) => void;
  theme: "light" | "dark";
  setTheme: (next: "light" | "dark") => void;
  toggleTheme: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function getInitialTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }

  // Manual-only default: if the user hasn't chosen, start in light mode.
  return "light";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    document.body?.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const value = useMemo<AppContextValue>(
    () => ({
      dateRange,
      setDateRange,
      selectedCategory,
      setSelectedCategory,
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [dateRange, selectedCategory, theme],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return ctx;
}
