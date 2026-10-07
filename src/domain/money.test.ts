import { formatMoney, formatSigned, parseAmountInput, toMinor } from "@/domain/money";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

describe("money", () => {
  it("formats CLP with no decimals", () => {
    expect(digits(formatMoney(4500, "CLP"))).toBe("4500");
  });

  it("formats USD in cents", () => {
    expect(digits(formatMoney(1250, "USD"))).toBe("1250");
  });

  it("signs income and expenses", () => {
    expect(formatSigned(4500, "CLP", "expense").startsWith("-")).toBe(true);
    expect(formatSigned(4500, "CLP", "income").startsWith("+")).toBe(true);
  });

  it("reads CLP thousands and USD decimals", () => {
    expect(toMinor("4.500", "CLP")).toBe(4500);
    expect(toMinor("4500", "CLP")).toBe(4500);
    expect(toMinor("12.50", "USD")).toBe(1250);
    expect(toMinor("12,5", "USD")).toBe(1250);
    expect(toMinor("12", "USD")).toBe(1200);
    expect(parseAmountInput("12.50", "USD")).toBe(1250);
    expect(parseAmountInput("", "CLP")).toBeNull();
  });
});
