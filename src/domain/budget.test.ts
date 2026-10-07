import { CATEGORIES } from "@/domain/categories";
import { budgetStatus, spentMinor } from "@/domain/budget";
import { monthKey } from "@/domain/dates";
import { biggestWeekMove, insightSentence } from "@/domain/insights";
import { buildDemo } from "@/domain/seed";
import type { Transaction } from "@/domain/types";

const now = new Date(2026, 9, 7);

describe("budgets", () => {
  it("warns at 80 percent and marks a full budget as over", () => {
    expect(budgetStatus(79999, 100000).state).toBe("ok");
    expect(budgetStatus(80000, 100000).state).toBe("warning");
    expect(budgetStatus(100000, 100000).state).toBe("over");
    expect(budgetStatus(10, 0)).toEqual({ ratio: 0, state: "ok" });
  });

  it("sums the sample food spend for the current month", () => {
    const { transactions, budgets } = buildDemo(now);
    const month = monthKey(now);
    const food = budgets.find((budget) => budget.categoryId === "food" && budget.currency === "CLP");
    const spent = spentMinor(transactions, "food", "CLP", month);
    expect(spent).toBe(86000);
    expect(food && budgetStatus(spent, food.limitMinor).state).toBe("warning");
  });
});

describe("insights", () => {
  it("writes a plain comparison from the two weeks", () => {
    const move = {
      categoryId: "food",
      categoryName: "Food",
      thisWeekMinor: 46000,
      lastWeekMinor: 40000,
      percent: 15,
      direction: "more" as const,
    };
    expect(insightSentence(move, "CLP")).toBe("You spent 15% more on food than last week.");
    expect(insightSentence(move, "CLP")).not.toContain("\u2014");
  });

  it("picks food as the largest move in the sample ledger", () => {
    const { transactions } = buildDemo(now);
    const move = biggestWeekMove(transactions, CATEGORIES, "CLP", "2026-10-07");
    expect(move?.categoryId).toBe("food");
    expect(move?.direction).toBe("more");
    expect(insightSentence(move, "CLP")).toContain("% more on food");
  });

  it("does not invent a percent when last week was empty", () => {
    const transactions: Transaction[] = [];
    expect(biggestWeekMove(transactions, CATEGORIES, "CLP", "2026-10-07")).toBeNull();
    expect(insightSentence(null, "CLP")).toBe("No spending to compare with last week.");
  });
});
