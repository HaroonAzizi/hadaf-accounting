import { useMemo, type Dispatch, type SetStateAction } from "react";
import { Filter } from "lucide-react";

import type {
  Category,
  TransactionStatus,
  TransactionType,
} from "../../services/api";
import { CURRENCIES } from "../../utils/constants";
import { flattenCategories } from "../../utils/flattenCategories";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Select } from "../common/Select";

export type TransactionFiltersState = {
  categoryId?: number;
  type?: TransactionType;
  status?: TransactionStatus | "all";
  startDate?: string;
  endDate?: string;
  currency?: string;
};

export function TransactionFilters({
  categories,
  filters,
  setFilters,
  onApply,
  onReset,
}: {
  categories: Category[];
  filters: TransactionFiltersState;
  setFilters: Dispatch<SetStateAction<TransactionFiltersState>>;
  onApply: () => void;
  onReset: () => void;
}) {
  const flat = useMemo(() => flattenCategories(categories), [categories]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-500" />
          <h3 className="font-semibold">Filters</h3>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset} type="button">
            Reset
          </Button>
          <Button icon={Filter} size="sm" onClick={onApply} type="button">
            Apply
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <Select
          label="Status"
          value={filters.status ?? "all"}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: (e.target.value || "all") as TransactionStatus | "all",
            }))
          }
        >
          <option value="all">All</option>
          <option value="done">Done</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </Select>

        <Select
          label="Type"
          value={filters.type ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              type: (e.target.value || undefined) as
                | TransactionType
                | undefined,
            }))
          }
        >
          <option value="">All</option>
          <option value="in">Income</option>
          <option value="out">Expense</option>
        </Select>

        <Select
          label="Category"
          value={filters.categoryId?.toString() ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              categoryId: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        >
          <option value="">All</option>
          {flat.map((c) => (
            <option key={c.id} value={c.id}>
              {`${"— ".repeat(c.depth)}${c.name}`}
            </option>
          ))}
        </Select>

        <Select
          label="Currency"
          value={filters.currency ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              currency: e.target.value || undefined,
            }))
          }
        >
          <option value="">All</option>
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>

        <Input
          label="Start"
          type="date"
          value={filters.startDate ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              startDate: e.target.value || undefined,
            }))
          }
        />

        <Input
          label="End"
          type="date"
          value={filters.endDate ?? ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              endDate: e.target.value || undefined,
            }))
          }
        />
      </div>
    </div>
  );
}
