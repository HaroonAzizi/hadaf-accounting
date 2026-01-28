import { getDb } from "../config/database";
import { HttpError } from "../utils/httpErrors";

export type CategoryRow = {
  id: number;
  name: string;
  parent_id: number | null;
  type: string;
  created_at: string;
};

export type CategoryNode = CategoryRow & { children: CategoryNode[] };

export function getAllCategories(): CategoryNode[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, name, parent_id, type, created_at FROM categories ORDER BY name ASC",
    )
    .all() as CategoryRow[];

  const nodes = new Map<number, CategoryNode>();
  for (const row of rows) nodes.set(row.id, { ...row, children: [] });

  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function getCategoryById(id: number): CategoryRow | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT id, name, parent_id, type, created_at FROM categories WHERE id = ?",
    )
    .get(id) as CategoryRow | undefined;
  return row ?? null;
}

export function createCategory({
  name,
  parentId,
  type,
}: {
  name: string;
  parentId?: number | null;
  type?: string;
}) {
  const db = getDb();

  const existing = db
    .prepare("SELECT id FROM categories WHERE name = ?")
    .get(name) as { id: number } | undefined;
  if (existing) {
    throw new HttpError({
      status: 409,
      code: "DUPLICATE_CATEGORY",
      message: "Category name already exists",
    });
  }

  if (parentId) {
    const parent = getCategoryById(parentId);
    if (!parent) {
      throw new HttpError({
        status: 400,
        code: "INVALID_PARENT",
        message: "parentId not found",
      });
    }
  }

  const info = db
    .prepare(
      "INSERT INTO categories (name, parent_id, type) VALUES (@name, @parent_id, @type)",
    )
    .run({ name, parent_id: parentId ?? null, type: type ?? "custom" });

  return getCategoryById(Number(info.lastInsertRowid));
}

export function updateCategory({
  id,
  name,
  parentId,
}: {
  id: number;
  name?: string;
  parentId?: number | null;
}) {
  const db = getDb();
  const existing = getCategoryById(id);
  if (!existing) {
    throw new HttpError({
      status: 404,
      code: "NOT_FOUND",
      message: "Category not found",
    });
  }

  if (parentId === id) {
    throw new HttpError({
      status: 400,
      code: "INVALID_PARENT",
      message: "Category cannot be its own parent",
    });
  }

  if (parentId) {
    const parent = getCategoryById(parentId);
    if (!parent) {
      throw new HttpError({
        status: 400,
        code: "INVALID_PARENT",
        message: "parentId not found",
      });
    }
  }

  if (name && name !== existing.name) {
    const dup = db
      .prepare("SELECT id FROM categories WHERE name = ? AND id != ?")
      .get(name, id) as { id: number } | undefined;
    if (dup) {
      throw new HttpError({
        status: 409,
        code: "DUPLICATE_CATEGORY",
        message: "Category name already exists",
      });
    }
  }

  const nextName = name ?? existing.name;
  const nextParent = parentId === undefined ? existing.parent_id : parentId;

  db.prepare("UPDATE categories SET name = ?, parent_id = ? WHERE id = ?").run(
    nextName,
    nextParent ?? null,
    id,
  );

  return getCategoryById(id);
}

export function deleteCategory(id: number) {
  const db = getDb();
  const existing = getCategoryById(id);
  if (!existing) {
    throw new HttpError({
      status: 404,
      code: "NOT_FOUND",
      message: "Category not found",
    });
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return true;
}

export function getCategoryWithStats(id: number) {
  const db = getDb();
  const category = getCategoryById(id);
  if (!category) {
    throw new HttpError({
      status: 404,
      code: "NOT_FOUND",
      message: "Category not found",
    });
  }

  const rows = db
    .prepare(
      `SELECT type, currency, SUM(amount) as total
       FROM transactions
       WHERE category_id = ?
       GROUP BY type, currency`,
    )
    .all(id) as Array<{
    type: "in" | "out";
    currency: string;
    total: number | null;
  }>;

  const income: Record<string, number> = {};
  const expenses: Record<string, number> = {};

  for (const r of rows) {
    if (r.type === "in") income[r.currency] = Number(r.total ?? 0);
    else expenses[r.currency] = Number(r.total ?? 0);
  }

  const profit: Record<string, number> = {};
  const currencies = new Set([
    ...Object.keys(income),
    ...Object.keys(expenses),
  ]);
  for (const c of currencies) profit[c] = (income[c] ?? 0) - (expenses[c] ?? 0);

  return { category, income, expenses, profit };
}
