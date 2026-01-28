import type { Transaction } from "../../services/api";
import { EmptyState } from "../common/EmptyState";
import { TransactionRow } from "./TransactionRow";

export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onCreate,
}: {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Create your first income or expense to see analytics."
        action={
          <button
            type="button"
            onClick={onCreate}
            className="px-4 py-2.5 rounded-lg bg-primary text-white font-medium shadow-lg hover:bg-primary/90"
          >
            New Transaction
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((t) => (
        <TransactionRow
          key={t.id}
          transaction={t}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
