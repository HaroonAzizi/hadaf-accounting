/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
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
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const value = useMemo<AppContextValue>(
    () => ({
      dateRange,
      setDateRange,
      selectedCategory,
      setSelectedCategory,
    }),
    [dateRange, selectedCategory],
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
