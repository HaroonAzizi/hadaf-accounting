import path from "path";
import Database from "better-sqlite3";

import { HttpError } from "../utils/httpErrors";
import { seedSampleData } from "./seedData";

let db: Database.Database | null = null;
let resolvedDatabasePath: string | null = null;

const defaultCategories = [
  "Turkish Class",
  "German Class",
  "English Class",
  "Marketing/Ads",
  "General Costs",
  "Other Income",
] as const;

function resolveDatabasePath() {
  const configured = process.env.DATABASE_PATH || "./hadaf.db";
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(process.cwd(), configured);
}

export function getDatabasePath() {
  if (!resolvedDatabasePath) resolvedDatabasePath = resolveDatabasePath();
  return resolvedDatabasePath;
}

export function getDb() {
  if (!db) {
    throw new HttpError({
      status: 500,
      code: "DB_NOT_INITIALIZED",
      message: "Database not initialized. Call initDatabase() first.",
    });
  }
  return db;
}

function createSchema(database: Database.Database) {
  database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      type TEXT DEFAULT 'custom',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'AFN',
      type TEXT NOT NULL CHECK(type IN ('in', 'out')),
      date DATE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'AFN',
      type TEXT NOT NULL CHECK(type IN ('in', 'out')),
      name TEXT NOT NULL,
      description TEXT,
      frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      next_due_date DATE NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);

    CREATE INDEX IF NOT EXISTS idx_recurring_next_due_date ON recurring_transactions(next_due_date);
    CREATE INDEX IF NOT EXISTS idx_recurring_is_active ON recurring_transactions(is_active);
  `);
}

function seedDefaults(database: Database.Database) {
  const row = database
    .prepare("SELECT COUNT(*) as count FROM categories")
    .get() as { count: number };
  if (row.count > 0) return;

  const insert = database.prepare(
    "INSERT INTO categories (name, parent_id, type) VALUES (@name, NULL, @type)",
  );
  const insertMany = database.transaction((names: readonly string[]) => {
    for (const name of names) insert.run({ name, type: "default" });
  });

  insertMany(defaultCategories);
}

export function initDatabase() {
  if (db) return db;

  resolvedDatabasePath = resolveDatabasePath();
  db = new Database(resolvedDatabasePath);

  createSchema(db);
  seedDefaults(db);

  if (process.env.SEED_SAMPLE_DATA === "true") {
    seedSampleData(db);
  }

  return db;
}
