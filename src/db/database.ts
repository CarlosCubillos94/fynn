import { CATEGORIES } from "@/domain/categories";
import { buildDemo } from "@/domain/seed";
import type { Budget, CurrencyCode, Direction, Settings, ThemeMode, Transaction } from "@/domain/types";
import * as SQLite from "expo-sqlite";

const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  direction TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  direction TEXT NOT NULL,
  amount_minor INTEGER NOT NULL,
  currency TEXT NOT NULL,
  category_id TEXT NOT NULL,
  note TEXT,
  description TEXT NOT NULL,
  raw_input TEXT,
  occurred_on TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY NOT NULL,
  category_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  limit_minor INTEGER NOT NULL,
  month TEXT NOT NULL,
  UNIQUE (category_id, currency, month)
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS transactions_occurred_on ON transactions (occurred_on);
`;

export type Database = SQLite.SQLiteDatabase;

let opening: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
  opening ??= openDatabase();
  return opening;
}

export function resetDatabase(): void {
  opening = null;
}

async function openDatabase(): Promise<Database> {
  const db = await SQLite.openDatabaseAsync("fynn.db");
  await db.execAsync(SCHEMA);
  await seedCategories(db);
  const existing = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    "onboardingCompleted",
  );
  if (!existing) {
    await writeSettings(db, {
      theme: "system",
      biometricEnabled: false,
      onboardingCompleted: false,
      defaultCurrency: "CLP",
      sampleLedger: true,
    });
    await replaceDemo(db, new Date());
  }
  return db;
}

async function seedCategories(db: Database): Promise<void> {
  for (const category of CATEGORIES) {
    await db.runAsync(
      `INSERT INTO categories (id, name, direction, sort_order)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET name = excluded.name, direction = excluded.direction, sort_order = excluded.sort_order`,
      category.id,
      category.name,
      category.direction,
      category.sortOrder,
    );
  }
}

export async function readSettings(db: Database): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map = new Map(rows.map((row) => [row.key, row.value]));
  return {
    theme: asTheme(map.get("theme")),
    biometricEnabled: map.get("biometricEnabled") === "1",
    onboardingCompleted: map.get("onboardingCompleted") === "1",
    defaultCurrency: asCurrency(map.get("defaultCurrency") ?? "CLP"),
    sampleLedger: map.get("sampleLedger") !== "0",
  };
}

export async function writeSettings(db: Database, settings: Settings): Promise<void> {
  const entries: [string, string][] = [
    ["theme", settings.theme],
    ["biometricEnabled", settings.biometricEnabled ? "1" : "0"],
    ["onboardingCompleted", settings.onboardingCompleted ? "1" : "0"],
    ["defaultCurrency", settings.defaultCurrency],
    ["sampleLedger", settings.sampleLedger ? "1" : "0"],
  ];
  for (const [key, value] of entries) {
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      key,
      value,
    );
  }
}

export async function listTransactions(db: Database): Promise<Transaction[]> {
  const rows = await db.getAllAsync<TransactionRow>(
    "SELECT * FROM transactions ORDER BY occurred_on DESC, created_at DESC",
  );
  return rows.map(mapTransaction);
}

export async function listBudgets(db: Database): Promise<Budget[]> {
  const rows = await db.getAllAsync<BudgetRow>("SELECT * FROM budgets");
  return rows.map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    currency: asCurrency(row.currency),
    limitMinor: row.limit_minor,
    month: row.month,
  }));
}

export async function saveTransaction(db: Database, transaction: Transaction): Promise<void> {
  await db.runAsync(
    `INSERT INTO transactions (
      id, direction, amount_minor, currency, category_id, note, description, raw_input, occurred_on, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      direction = excluded.direction,
      amount_minor = excluded.amount_minor,
      currency = excluded.currency,
      category_id = excluded.category_id,
      note = excluded.note,
      description = excluded.description,
      raw_input = excluded.raw_input,
      occurred_on = excluded.occurred_on,
      updated_at = excluded.updated_at`,
    transaction.id,
    transaction.direction,
    transaction.amountMinor,
    transaction.currency,
    transaction.categoryId,
    transaction.note,
    transaction.description,
    transaction.rawInput,
    transaction.occurredOn,
    transaction.createdAt,
    transaction.updatedAt,
  );
}

export async function deleteTransaction(db: Database, id: string): Promise<void> {
  await db.runAsync("DELETE FROM transactions WHERE id = ?", id);
}

export async function saveBudget(db: Database, budget: Budget): Promise<void> {
  await db.runAsync(
    `INSERT INTO budgets (id, category_id, currency, limit_minor, month)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(category_id, currency, month) DO UPDATE SET limit_minor = excluded.limit_minor`,
    budget.id,
    budget.categoryId,
    budget.currency,
    budget.limitMinor,
    budget.month,
  );
}

export async function clearSample(db: Database): Promise<void> {
  await db.execAsync(`
    DELETE FROM transactions WHERE id LIKE 'demo-%';
    DELETE FROM budgets WHERE id LIKE 'demo-%';
  `);
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES ('sampleLedger', '0') ON CONFLICT(key) DO UPDATE SET value = '0'",
  );
}

export async function restoreSample(db: Database): Promise<void> {
  await replaceDemo(db, new Date());
  await db.runAsync(
    "INSERT INTO settings (key, value) VALUES ('sampleLedger', '1') ON CONFLICT(key) DO UPDATE SET value = '1'",
  );
}

async function replaceDemo(db: Database, now: Date): Promise<void> {
  const demo = buildDemo(now);
  await db.execAsync(`
    DELETE FROM transactions WHERE id LIKE 'demo-%';
    DELETE FROM budgets WHERE id LIKE 'demo-%';
  `);
  for (const transaction of demo.transactions) await saveTransaction(db, transaction);
  for (const budget of demo.budgets) await saveBudget(db, budget);
}

type TransactionRow = {
  id: string;
  direction: string;
  amount_minor: number;
  currency: string;
  category_id: string;
  note: string | null;
  description: string;
  raw_input: string | null;
  occurred_on: string;
  created_at: string;
  updated_at: string;
};

type BudgetRow = {
  id: string;
  category_id: string;
  currency: string;
  limit_minor: number;
  month: string;
};

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    direction: asDirection(row.direction),
    amountMinor: row.amount_minor,
    currency: asCurrency(row.currency),
    categoryId: row.category_id,
    note: row.note,
    description: row.description,
    rawInput: row.raw_input,
    occurredOn: row.occurred_on,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function asCurrency(value: string): CurrencyCode {
  if (value === "CLP" || value === "USD") return value;
  throw new Error(`Unknown currency ${value}`);
}

function asDirection(value: string): Direction {
  if (value === "expense" || value === "income") return value;
  throw new Error(`Unknown direction ${value}`);
}

function asTheme(value: string | undefined): ThemeMode {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}
