import type { Category, PhraseDraft } from "@/domain/types";
import type { WeekMove } from "@/domain/insights";

export function proxyBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_AI_PROXY_URL;
  if (!value) return null;
  return value.replace(/\/$/, "");
}

export async function refinePhrase(
  draft: PhraseDraft,
  categories: Category[],
): Promise<PhraseDraft> {
  const base = proxyBaseUrl();
  if (!base) return draft;
  const response = await fetch(`${base}/categorize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phrase: draft.rawInput,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        direction: category.direction,
      })),
    }),
  });
  if (!response.ok) throw new Error("The assistant could not be reached.");
  const body = (await response.json()) as { categoryId?: string; description?: string };
  const category = categories.find((item) => item.id === body.categoryId);
  if (!category) return draft;
  const description = body.description?.trim();
  return {
    ...draft,
    categoryId: category.id,
    categoryName: category.name,
    direction: category.direction,
    description: description && description.length > 0 ? description : draft.description,
  };
}

export async function rewriteInsight(move: WeekMove, sentence: string): Promise<string> {
  const base = proxyBaseUrl();
  if (!base) return sentence;
  const response = await fetch(`${base}/insight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sentence,
      category: move.categoryName,
      percent: move.percent,
      direction: move.direction,
      thisWeekMinor: move.thisWeekMinor,
      lastWeekMinor: move.lastWeekMinor,
    }),
  });
  if (!response.ok) throw new Error("The assistant could not be reached.");
  const body = (await response.json()) as { sentence?: string };
  const next = body.sentence?.trim();
  if (!next) return sentence;
  if (move.percent !== null && !next.includes(String(move.percent))) return sentence;
  return next;
}
