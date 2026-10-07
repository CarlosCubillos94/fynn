import { CATEGORIES } from "@/domain/categories";
import { parsePhrase } from "@/domain/categorize";
import { formatMoney } from "@/domain/money";
import { PhrasePreview } from "@/components/ui/PhrasePreview";
import { render, screen } from "@testing-library/react-native";

describe("PhrasePreview", () => {
  it("shows the resolved phrase", () => {
    const draft = parsePhrase("uber 4500", "CLP", CATEGORIES);
    if (!draft) throw new Error("expected a draft");
    render(<PhrasePreview draft={draft} />);
    expect(screen.getByText("Uber")).toBeTruthy();
    expect(screen.getByText("Transport")).toBeTruthy();
    expect(screen.getByText(formatMoney(4500, "CLP"))).toBeTruthy();
  });
});
