import type { Category } from "../../services/api";
import { EmptyState } from "../common/EmptyState";
import { CategoryCard } from "./CategoryCard";

function renderTree(
  nodes: Category[],
  depth: number,
  onEdit: (c: Category) => void,
  onDelete: (id: number) => void,
): Array<React.ReactElement> {
  const out: Array<React.ReactElement> = [];
  for (const c of nodes) {
    out.push(
      <CategoryCard
        key={c.id}
        category={c}
        depth={depth}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    if (c.children?.length) {
      out.push(...renderTree(c.children, depth + 1, onEdit, onDelete));
    }
  }
  return out;
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  onCreate,
}: {
  categories: Category[];
  onEdit: (c: Category) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="No categories yet"
        description="Create categories to organize income and expenses."
        action={
          <button
            type="button"
            onClick={onCreate}
            className="px-4 py-2.5 rounded-lg bg-sky-500 text-white font-medium shadow-lg hover:bg-sky-600"
          >
            New Category
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {renderTree(categories, 0, onEdit, onDelete)}
    </div>
  );
}
