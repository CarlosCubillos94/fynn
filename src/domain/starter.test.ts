import { starterPlan, STARTER_KEPT_PERCENT, STARTER_SHARES } from "@/domain/starter";

describe("starter plan", () => {
  const now = new Date(2026, 9, 7);

  it("records the income and no expenses", () => {
    const { transactions, budgets } = starterPlan(1200000, "CLP", now, "Monthly income");
    expect(transactions).toHaveLength(1);
    expect(transactions[0]?.direction).toBe("income");
    expect(transactions[0]?.amountMinor).toBe(1200000);
    expect(transactions[0]?.occurredOn).toBe("2026-10-01");
    expect(transactions.some((item) => item.direction === "expense")).toBe(false);
    expect(budgets.reduce((sum, budget) => sum + budget.limitMinor, 0)).toBe(1020000);
    expect(STARTER_KEPT_PERCENT).toBe(15);
    expect(STARTER_SHARES.reduce((sum, share) => sum + share.percent, 0)).toBe(85);
  });
});