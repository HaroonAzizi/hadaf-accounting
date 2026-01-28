import { addDays, addMonths, addYears, toISODateString } from "./dates";
import type { Frequency } from "../types";

export function nextDueDate(currentIso: string, frequency: Frequency) {
  const [y, m, d] = currentIso.split("-").map((v) => Number(v));
  const current = new Date(y, m - 1, d);

  const next =
    frequency === "daily"
      ? addDays(current, 1)
      : frequency === "weekly"
        ? addDays(current, 7)
        : frequency === "monthly"
          ? addMonths(current, 1)
          : addYears(current, 1);

  return toISODateString(next);
}
