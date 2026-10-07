import { isoDate, monthKey } from "@/domain/dates";
import type { Budget, Transaction } from "@/domain/types";

function on(now: Date, monthOffset: number, day: number): string {
  return isoDate(new Date(now.getFullYear(), now.getMonth() + monthOffset, day));
}

function tx(
  id: string,
  occurredOn: string,
  categoryId: Transaction["categoryId"],
  amountMinor: number,
  description: string,
  direction: Transaction["direction"] = "expense",
  currency: Transaction["currency"] = "CLP",
): Transaction {
  const stamp = `${occurredOn}T12:00:00`;
  return {
    id,
    direction,
    amountMinor,
    currency,
    categoryId,
    note: null,
    description,
    rawInput: null,
    occurredOn,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function buildDemo(now: Date): { transactions: Transaction[]; budgets: Budget[] } {
  const month = monthKey(now);
  const transactions: Transaction[] = [
    tx("demo-salary-now", on(now, 0, 1), "salary", 1250000, "Salary", "income"),
    tx("demo-food-last", on(now, 0, 1), "food", 40000, "Almuerzo"),
    tx("demo-home-last", on(now, 0, 1), "home", 21000, "Utilities"),
    tx("demo-home-now", on(now, 0, 6), "home", 21000, "Utilities"),
    tx("demo-subs-last", on(now, 0, 2), "subscriptions", 8000, "Netflix"),
    tx("demo-transport-last", on(now, 0, 3), "transport", 18000, "Uber"),
    tx("demo-food-now", on(now, 0, 6), "food", 46000, "Jumbo"),
    tx("demo-subs-now", on(now, 0, 6), "subscriptions", 7000, "Spotify"),
    tx("demo-transport-now", on(now, 0, 6), "transport", 18000, "Metro"),
    tx("demo-usd-food", on(now, 0, 4), "food", 450, "Coffee", "expense", "USD"),
    tx("demo-usd-sub", on(now, 0, 5), "subscriptions", 1299, "Netflix", "expense", "USD"),
    tx("demo-usd-freelance", on(now, 0, 2), "freelance", 40000, "Freelance", "income", "USD"),
  ];

  for (let offset = -5; offset <= -1; offset += 1) {
    const label = `${offset}`;
    transactions.push(
      tx(`demo-salary-${label}`, on(now, offset, 1), "salary", 1250000, "Salary", "income"),
      tx(`demo-food-${label}`, on(now, offset, 8), "food", 52000 + offset * 1000, "Groceries"),
      tx(`demo-transport-${label}`, on(now, offset, 15), "transport", 24000, "Uber"),
      tx(`demo-fun-${label}`, on(now, offset, 18), "fun", 15000, "Cinema"),
    );
  }

  const budgets: Budget[] = [
    { id: "demo-budget-food", categoryId: "food", currency: "CLP", limitMinor: 100000, month },
    { id: "demo-budget-transport", categoryId: "transport", currency: "CLP", limitMinor: 80000, month },
    { id: "demo-budget-subs", categoryId: "subscriptions", currency: "CLP", limitMinor: 12000, month },
    { id: "demo-budget-home", categoryId: "home", currency: "CLP", limitMinor: 80000, month },
    { id: "demo-budget-food-usd", categoryId: "food", currency: "USD", limitMinor: 8000, month },
  ];

  return { transactions, budgets };
}
