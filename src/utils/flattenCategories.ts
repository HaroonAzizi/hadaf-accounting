import type { Category } from "../services/api";

export type FlatCategory = {
  id: number;
  name: string;
  parent_id: number | null;
  type: string;
  depth: number;
};

export function flattenCategories(
  categories: Category[],
  depth = 0,
): FlatCategory[] {
  const out: FlatCategory[] = [];
  for (const c of categories) {
    out.push({
      id: c.id,
      name: c.name,
      parent_id: c.parent_id,
      type: c.type,
      depth,
    });
    if (c.children?.length) {
      out.push(...flattenCategories(c.children, depth + 1));
    }
  }
  return out;
}
