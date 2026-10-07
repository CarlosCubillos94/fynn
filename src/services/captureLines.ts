// The Shortcuts intent appends one JSON object per line. Skip anything that is not a usable phrase
// so a corrupt line can never block the import of the others.
export function parseCaptureLines(text: string): string[] {
  const phrases: string[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const value: unknown = JSON.parse(trimmed);
      if (value && typeof value === "object" && "phrase" in value) {
        const phrase = (value as { phrase: unknown }).phrase;
        if (typeof phrase === "string" && phrase.trim().length > 0) phrases.push(phrase.trim());
      }
    } catch {
      continue;
    }
  }
  return phrases;
}
