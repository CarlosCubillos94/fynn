import { monthOf } from "@/domain/dates";
import type { CurrencyCode, Transaction } from "@/domain/types";

export type BudgetState = "ok" | "warning" | "over";

export function budgetStatus(spentMinor: number, limitMinor: number): {
  ratio: number;
  state: BudgetState;
} {
  if (limitMinor <= 0) return { ratio: 0, state: "ok" };
  const ratio = spentMinor / limitMinor;
  if (ratio >= 1) return { ratio, state: "over" };
  if (ratio >= 0.8) return { ratio, state: "warning" };
  return { ratio, state: "ok" };
}

export function spentMinor(
  transactions: Transaction[],
  categoryId: string,
  currency: CurrencyCode,
  month: string,
): number {
  return transactions.reduce((sum, transaction) => {
    if (
      transaction.direction === "expense" &&
      transaction.categoryId === categoryId &&
      transaction.currency === currency &&
      monthOf(transaction.occurredOn) === month
    ) {
      return sum + transaction.amountMinor;
    }
    return sum;
  }, 0);
}
