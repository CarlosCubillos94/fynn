import { isoDate, monthKey } from "@/domain/dates";
import { createId } from "@/domain/id";
import type { Budget, CurrencyCode, Transaction } from "@/domain/types";

// Shares of monthly income. The rest stays unbudgeted, so the month is not fully assigned
// before a single real expense exists.
export const STARTER_SHARES: { categoryId: string; percent: number }[] = [
  { categoryId: "food", percent: 30 },
  { categoryId: "home", percent: 25 },
  { categoryId: "transport", percent: 12 },
  { categoryId: "fun", percent: 8 },
  { categoryId: "health", percent: 5 },
  { categoryId: "subscriptions", percent: 5 },
];

export const STARTER_KEPT_PERCENT = 100 - STARTER_SHARES.reduce((sum, share) => sum + share.percent, 0);

export function starterPlan(
  incomeMinor: number,
  currency: CurrencyCode,
  now: Date,
  description: string,
): { transactions: Transaction[]; budgets: Budget[] } {
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const occurredOn = isoDate(first);
  const stamp = `${occurredOn}T12:00:00`;
  const month = monthKey(now);
  const transactions: Transaction[] = [
    {
      id: createId(),
      direction: "income",
      amountMinor: incomeMinor,
      currency,
      categoryId: "salary",
      note: null,
      description,
      rawInput: null,
      occurredOn,
      createdAt: stamp,
      updatedAt: stamp,
    },
  ];
  const budgets: Budget[] = STARTER_SHARES.flatMap((share) => {
    const limitMinor = Math.floor((incomeMinor * share.percent) / 100);
    if (limitMinor <= 0) return [];
    return [
      {
        id: createId(),
        categoryId: share.categoryId,
        currency,
        limitMinor,
        month,
      },
    ];
  });
  return { transactions, budgets };
}
