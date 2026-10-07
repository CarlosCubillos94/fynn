import { categoryById } from "@/domain/categories";
import { categoryLabel } from "@/i18n/copy";
import type { Language } from "@/i18n/language";
import { inRange, weekBounds } from "@/domain/dates";
import { formatMoney } from "@/domain/money";
import type { Category, CurrencyCode, Transaction } from "@/domain/types";

export type WeekMove = {
  categoryId: string;
  categoryName: string;
  thisWeekMinor: number;
  lastWeekMinor: number;
  percent: number | null;
  direction: "more" | "less" | "same" | "new";
};

function weekSpend(
  transactions: Transaction[],
  categoryId: string,
  currency: CurrencyCode,
  start: string,
  end: string,
): number {
  return transactions.reduce((sum, transaction) => {
    if (
      transaction.direction === "expense" &&
      transaction.categoryId === categoryId &&
      transaction.currency === currency &&
      inRange(transaction.occurredOn, start, end)
    ) {
      return sum + transaction.amountMinor;
    }
    return sum;
  }, 0);
}

export function biggestWeekMove(
  transactions: Transaction[],
  categories: Category[],
  currency: CurrencyCode,
  todayIso: string,
): WeekMove | null {
  const current = weekBounds(todayIso);
  const previous = weekBounds(shiftDay(current.start, -1));
  const expenseCategories = categories.filter((category) => category.direction === "expense");
  let winner: WeekMove | null = null;

  for (const category of expenseCategories) {
    const thisWeekMinor = weekSpend(transactions, category.id, currency, current.start, current.end);
    const lastWeekMinor = weekSpend(transactions, category.id, currency, previous.start, previous.end);
    const delta = Math.abs(thisWeekMinor - lastWeekMinor);
    if (thisWeekMinor === 0 && lastWeekMinor === 0) continue;
    const direction =
      lastWeekMinor === 0 ? "new" : thisWeekMinor === lastWeekMinor ? "same" : thisWeekMinor > lastWeekMinor ? "more" : "less";
    const percent =
      lastWeekMinor === 0 ? null : Math.round((Math.abs(thisWeekMinor - lastWeekMinor) / lastWeekMinor) * 100);
    const move: WeekMove = {
      categoryId: category.id,
      categoryName: category.name,
      thisWeekMinor,
      lastWeekMinor,
      percent,
      direction,
    };
    const winnerDelta = winner ? Math.abs(winner.thisWeekMinor - winner.lastWeekMinor) : -1;
    if (delta > winnerDelta) winner = move;
  }

  return winner;
}

function shiftDay(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function insightSentence(move: WeekMove | null, currency: CurrencyCode, language: Language = "en"): string {
  if (!move) {
    return language === "es"
      ? "No hay gastos para comparar con la semana pasada."
      : "No spending to compare with last week.";
  }
  const category = categoryLabel(move.categoryId, language).toLocaleLowerCase();
  const amount = formatMoney(move.thisWeekMinor, currency);
  if (language === "es") {
    if (move.direction === "new") {
      return `Gastaste ${amount} en ${category} esta semana. Nada en esa categoría la semana pasada.`;
    }
    if (move.direction === "same") {
      return `${categoryLabel(move.categoryId, language)} coincide con la semana pasada, ${amount}.`;
    }
    const word = move.direction === "more" ? "más" : "menos";
    return `Gastaste un ${move.percent}% ${word} en ${category} que la semana pasada.`;
  }
  if (move.direction === "new") {
    return `You spent ${amount} on ${category} this week. Nothing in that category last week.`;
  }
  if (move.direction === "same") {
    return `${move.categoryName} spending matches last week, ${amount}.`;
  }
  const word = move.direction === "more" ? "more" : "less";
  return `You spent ${move.percent}% ${word} on ${category} than last week.`;
}

export function categoryName(categories: Category[], id: string): string {
  return categoryById(categories, id)?.name ?? "Other";
}
