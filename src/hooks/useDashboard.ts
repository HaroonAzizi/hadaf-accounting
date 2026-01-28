import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { dashboardAPI, type DashboardSummary } from "../services/api";
import type { DateRange } from "../context/AppContext";

export function useDashboard(dateRange?: DateRange) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getSummary({
        startDate: dateRange?.startDate ?? undefined,
        endDate: dateRange?.endDate ?? undefined,
      });
      setSummary(res.data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load dashboard",
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange?.startDate, dateRange?.endDate]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return useMemo(
    () => ({ summary, loading, refetch: fetchSummary }),
    [summary, loading, fetchSummary],
  );
}
