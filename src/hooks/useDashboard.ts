import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  dashboardAPI,
  type DashboardSummary,
  type Transaction,
} from "../services/api";
import type { DateRange } from "../context/AppContext";

export function useDashboard(dateRange?: DateRange) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [followUps, setFollowUps] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        startDate: dateRange?.startDate ?? undefined,
        endDate: dateRange?.endDate ?? undefined,
      };

      const [summaryRes, followRes] = await Promise.all([
        dashboardAPI.getSummary(params),
        dashboardAPI.getFollowUps(params),
      ]);

      setSummary(summaryRes.data);
      setFollowUps(followRes.data);
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
    () => ({ summary, followUps, loading, refetch: fetchSummary }),
    [summary, followUps, loading, fetchSummary],
  );
}
