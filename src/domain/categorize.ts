import { categoryById } from "@/domain/categories";
import { toMinor } from "@/domain/money";
import type { Category, CurrencyCode, Direction, PhraseDraft } from "@/domain/types";

const NUMBER = /\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?/g;

const RULES: { test: RegExp; categoryId: string }[] = [
  { test: /\b(uber|cabify|didi|metro|bip|bencina|combustible|taxi|bus)\b/i, categoryId: "transport" },
  {
    test: /\b(almuerzo|comida|lunch|dinner|cena|cafe|café|restaurant|jumbo|lider|líder|super|mercado)\b/i,
    categoryId: "food",
  },
  { test: /\b(arriendo|rent|luz|agua|gas|utilities|hogar)\b/i, categoryId: "home" },
  { test: /\b(farmacia|doctor|salud|health|clinic|hospital)\b/i, categoryId: "health" },
  {
    test: /\b(netflix|spotify|suscripcion|suscripción|subscription|itunes)\b/i,
    categoryId: "subscriptions",
  },
  { test: /\b(cine|bar|ocio|juego|concert)\b/i, categoryId: "fun" },
  { test: /\b(ropa|zara|shopping)\b/i, categoryId: "shopping" },
  { test: /\b(sueldo|salary|nomina|nómina|paycheck)\b/i, categoryId: "salary" },
  { test: /\b(freelance|honorarios)\b/i, categoryId: "freelance" },
  {
    test: /\b(ingreso|income|bono|bonus|deposito|depósito|reembolso|refund|venta|vendi|vendí|cobre|cobré|me pagaron)\b/i,
    categoryId: "other-income",
  },
];

function detectCurrency(input: string, fallback: CurrencyCode): CurrencyCode {
  if (/\b(usd|dolar|dólar|dolares|dólares|dollar|dollars)\b/i.test(input) || /us\$/i.test(input)) {
    return "USD";
  }
  if (/\b(clp|peso|pesos)\b/i.test(input)) return "CLP";
  return fallback;
}

function cleanDescription(input: string, amountToken: string): string {
  const rest = input
    .replace(amountToken, " ")
    .replace(/\b(usd|us\$|clp|dolares|dólares|dolar|dólar|dollars|dollar|pesos|peso)\b/gi, " ")
    .replace(/\$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!rest) return "";
  const lower = rest.toLocaleLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function parsePhrase(
  input: string,
  defaultCurrency: CurrencyCode,
  categories: Category[],
  direction?: Direction,
): PhraseDraft | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const matches = trimmed.match(NUMBER);
  const token = matches?.at(-1);
  if (!token) return null;
  const currency = detectCurrency(trimmed, defaultCurrency);
  const amountMinor = toMinor(token, currency);
  if (amountMinor === null || amountMinor <= 0) return null;

  // With a forced direction, only rules that land on that side can match. The fallback is the
  // matching "other" category, so "ingreso 50000" never turns into an expense.
  const rule = RULES.find(
    (candidate) =>
      candidate.test.test(trimmed) &&
      (!direction || categoryById(categories, candidate.categoryId)?.direction === direction),
  );
  const fallbackId = direction === "income" ? "other-income" : "other";
  const category = categoryById(categories, rule?.categoryId ?? fallbackId) ?? categories[0];
  if (!category) return null;
  const description = cleanDescription(trimmed, token) || category.name;

  return {
    amountMinor,
    currency,
    categoryId: category.id,
    categoryName: category.name,
    direction: category.direction,
    description,
    rawInput: trimmed,
  };
}
