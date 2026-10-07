export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthKey(date: Date): string {
  return isoDate(date).slice(0, 7);
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function weekBounds(iso: string): { start: string; end: string } {
  const date = parseIsoDate(iso);
  const mondayOffset = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start: isoDate(start), end: isoDate(end) };
}

export function recentMonths(now: Date, count: number): string[] {
  const months: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    months.push(monthKey(new Date(now.getFullYear(), now.getMonth() - offset, 1)));
  }
  return months;
}

export function formatMonth(month: string, locale = "en-US"): string {
  const date = parseIsoDate(`${month}-01`);
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

export function formatDay(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(parseIsoDate(iso));
}

export function inRange(iso: string, start: string, end: string): boolean {
  return iso >= start && iso < end;
}
