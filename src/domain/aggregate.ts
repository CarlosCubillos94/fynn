import { monthOf } from "@/domain/dates";
import type { CurrencyCode, Transaction } from "@/domain/types";

export function monthTotals(
  transactions: Transaction[],
  currency: CurrencyCode,
  month: string,
): { income: number; expense: number; net: number } {
  let income = 0;
  let expense = 0;
  for (const transaction of transactions) {
    if (transaction.currency !== currency || monthOf(transaction.occurredOn) !== month) continue;
    if (transaction.direction === "income") income += transaction.amountMinor;
    else expense += transaction.amountMinor;
  }
  return { income, expense, net: income - expense };
}

export function expenseByCategory(
  transactions: Transaction[],
  currency: CurrencyCode,
  month: string,
): { categoryId: string; amountMinor: number }[] {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (
      transaction.direction !== "expense" ||
      transaction.currency !== currency ||
      monthOf(transaction.occurredOn) !== month
    ) {
      continue;
    }
    totals.set(transaction.categoryId, (totals.get(transaction.categoryId) ?? 0) + transaction.amountMinor);
  }
  return [...totals.entries()]
    .map(([categoryId, amountMinor]) => ({ categoryId, amountMinor }))
    .sort((a, b) => b.amountMinor - a.amountMinor);
}
