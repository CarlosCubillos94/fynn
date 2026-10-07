import type { CurrencyCode, Direction } from "@/domain/types";

export const EXPONENT: Record<CurrencyCode, number> = { CLP: 0, USD: 2 };

const LOCALE: Record<CurrencyCode, string> = { CLP: "es-CL", USD: "en-US" };

export function formatMoney(amountMinor: number, currency: CurrencyCode): string {
  const exponent = EXPONENT[currency];
  const major = amountMinor / 10 ** exponent;
  return new Intl.NumberFormat(LOCALE[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  }).format(major);
}

export function formatSigned(
  amountMinor: number,
  currency: CurrencyCode,
  direction?: Direction,
): string {
  const abs = formatMoney(Math.abs(amountMinor), currency);
  if (direction === "expense" || (direction === undefined && amountMinor < 0)) return `-${abs}`;
  if (direction === "income") return `+${abs}`;
  return abs;
}

export function toMinor(token: string, currency: CurrencyCode): number | null {
  if (currency === "CLP") {
    if (/^\d{1,3}(?:\.\d{3})+$/.test(token)) return Number(token.replaceAll(".", ""));
    if (/^\d+$/.test(token)) return Number(token);
    return null;
  }

  const decimal = token.match(/^(\d+)[.,](\d{1,2})$/);
  if (decimal) {
    const fraction = decimal[2].padEnd(2, "0");
    return Number(decimal[1]) * 100 + Number(fraction);
  }
  if (/^\d{1,3}(?:\.\d{3})+$/.test(token)) return Number(token.replaceAll(".", "")) * 100;
  if (/^\d+$/.test(token)) return Number(token) * 100;
  return null;
}

export function parseAmountInput(text: string, currency: CurrencyCode): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  return toMinor(trimmed, currency);
}
