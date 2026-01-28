import { Edit2, Trash2 } from "lucide-react";

import type { Category } from "../../services/api";

export function CategoryCard({
  category,
  depth,
  onEdit,
  onDelete,
}: {
  category: Category;
  depth: number;
  onEdit: (c: Category) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div
      className="group p-4 rounded-xl border-2 border-slate-100 hover:border-sky-500/20 hover:shadow-md transition-all"
      style={{ marginLeft: depth * 14 }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h4 className="font-semibold text-lg truncate">{category.name}</h4>
          <p className="text-sm text-slate-500">
            {category.type ? `Type: ${category.type}` : "Type: —"}
          </p>
        </div>

        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(category)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            type="button"
            aria-label="Edit"
          >
            <Edit2 size={18} className="text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            type="button"
            aria-label="Delete"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
