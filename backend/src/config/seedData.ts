import type Database from "better-sqlite3";

const sampleCategoryNames = [
  "German Class",
  "Turkish Class",
  "English Class",
  "Marketing/Ads",
  "General Costs",
  "Other Income",
] as const;

function getOrCreateCategoryId(database: Database.Database, name: string) {
  const existing = database
    .prepare("SELECT id FROM categories WHERE name = ?")
    .get(name) as { id: number } | undefined;
  if (existing) return existing.id;

  const info = database
    .prepare(
      "INSERT INTO categories (name, parent_id, type) VALUES (?, NULL, 'default')",
    )
    .run(name);

  return Number(info.lastInsertRowid);
}

export function seedSampleData(database: Database.Database) {
  const txCount = database
    .prepare("SELECT COUNT(*) as count FROM transactions")
    .get() as { count: number };
  if (txCount.count > 0) return;

  const categoryIds: Record<string, number> = {};
  for (const name of sampleCategoryNames) {
    categoryIds[name] = getOrCreateCategoryId(database, name);
  }

  const insertTx = database.prepare(`
    INSERT INTO transactions
      (category_id, amount, currency, type, date, name, description)
    VALUES
      (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = database.transaction(
    (
      rows: Array<
        [
          category: string,
          amount: number,
          currency: string,
          type: "in" | "out",
          date: string,
          name: string,
          description: string,
        ]
      >,
    ) => {
      for (const [
        category,
        amount,
        currency,
        type,
        date,
        name,
        description,
      ] of rows) {
        insertTx.run(
          categoryIds[category],
          amount,
          currency,
          type,
          date,
          name,
          description,
        );
      }
    },
  );

  insertMany([
    [
      "German Class",
      3000,
      "AFN",
      "in",
      "2026-01-15",
      "Ghulaam",
      "German class fee",
    ],
    [
      "German Class",
      1500,
      "AFN",
      "out",
      "2026-01-15",
      "Teacher Payment",
      "Ghulaam teacher cost 50%",
    ],
    [
      "Turkish Class",
      2500,
      "AFN",
      "in",
      "2026-01-20",
      "Aisha",
      "Turkish class fee",
    ],
    [
      "Turkish Class",
      1250,
      "AFN",
      "out",
      "2026-01-20",
      "Teacher Payment",
      "Aisha teacher cost",
    ],
    [
      "Marketing/Ads",
      500,
      "USD",
      "out",
      "2026-01-10",
      "Facebook Ads",
      "January marketing campaign",
    ],
    [
      "General Costs",
      200,
      "USD",
      "out",
      "2026-01-05",
      "Office Rent",
      "Monthly office expense",
    ],
  ]);
}
