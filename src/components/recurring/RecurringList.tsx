import type { RecurringTransaction } from "../../services/api";
import { EmptyState } from "../common/EmptyState";
import { RecurringRow } from "./RecurringRow";

export function RecurringList({
  items,
  dueIds,
  categoryNameById,
  onCreate,
  onEdit,
  onDelete,
  onExecute,
}: {
  items: RecurringTransaction[];
  dueIds: Set<number>;
  categoryNameById: Map<number, string>;
  onCreate: () => void;
  onEdit: (t: RecurringTransaction) => void;
  onDelete: (id: number) => void;
  onExecute: (id: number) => void;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No recurring transactions"
        description="Create recurring items like salaries, rent, or monthly fees."
        action={
          <button
            type="button"
            onClick={onCreate}
            className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium shadow-lg hover:bg-primary/90"
          >
            New Recurring
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <RecurringRow
          key={item.id}
          item={item}
          categoryName={
            categoryNameById.get(item.category_id) || "Uncategorized"
          }
          isDue={dueIds.has(item.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onExecute={onExecute}
        />
      ))}
    </div>
  );
}
