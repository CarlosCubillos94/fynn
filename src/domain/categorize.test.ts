import { CATEGORIES } from "@/domain/categories";
import { parsePhrase } from "@/domain/categorize";

describe("parsePhrase", () => {
  it("reads a Chilean transport phrase", () => {
    const draft = parsePhrase("uber 4500", "CLP", CATEGORIES);
    expect(draft).toMatchObject({
      amountMinor: 4500,
      currency: "CLP",
      categoryId: "transport",
      description: "Uber",
      direction: "expense",
    });
  });

  it("reads almuerzo as food", () => {
    const draft = parsePhrase("almuerzo 8000", "CLP", CATEGORIES);
    expect(draft).toMatchObject({
      amountMinor: 8000,
      categoryId: "food",
      description: "Almuerzo",
    });
  });

  it("treats dotted thousands as CLP pesos", () => {
    const draft = parsePhrase("4.500 jumbo", "CLP", CATEGORIES);
    expect(draft?.amountMinor).toBe(4500);
    expect(draft?.categoryId).toBe("food");
    expect(draft?.description).toBe("Jumbo");
  });

  it("honors a USD hint even when the default is CLP", () => {
    const draft = parsePhrase("usd lunch 12.50", "CLP", CATEGORIES);
    expect(draft).toMatchObject({
      amountMinor: 1250,
      currency: "USD",
      categoryId: "food",
      description: "Lunch",
    });
  });

  it("classifies salary as income", () => {
    const draft = parsePhrase("sueldo 1250000", "CLP", CATEGORIES);
    expect(draft).toMatchObject({
      amountMinor: 1250000,
      categoryId: "salary",
      direction: "income",
    });
  });

  it("reads an income keyword without forcing a direction", () => {
    const draft = parsePhrase("bono 200000", "CLP", CATEGORIES);
    expect(draft).toMatchObject({ categoryId: "other-income", direction: "income", amountMinor: 200000 });
  });

  it("forces income so an ordinary phrase never becomes an expense", () => {
    const draft = parsePhrase("venta bicicleta 90000", "CLP", CATEGORIES, "income");
    expect(draft).toMatchObject({ direction: "income", categoryId: "other-income", amountMinor: 90000 });
    const plain = parsePhrase("regalo 15000", "CLP", CATEGORIES, "income");
    expect(plain).toMatchObject({ direction: "income", categoryId: "other-income" });
  });

  it("forces expense when the phrase sounds like income", () => {
    const draft = parsePhrase("sueldo 1250000", "CLP", CATEGORIES, "expense");
    expect(draft).toMatchObject({ direction: "expense", categoryId: "other" });
  });

  it("rejects a phrase with no amount", () => {
    expect(parsePhrase("uber", "CLP", CATEGORIES)).toBeNull();
    expect(parsePhrase("   ", "CLP", CATEGORIES)).toBeNull();
  });
});
