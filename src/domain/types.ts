export type CurrencyCode = "CLP" | "USD";
export type Direction = "expense" | "income";
export type ThemeMode = "light" | "dark" | "system";

export type Category = {
  id: string;
  name: string;
  direction: Direction;
  sortOrder: number;
};

export type Transaction = {
  id: string;
  direction: Direction;
  amountMinor: number;
  currency: CurrencyCode;
  categoryId: string;
  note: string | null;
  description: string;
  rawInput: string | null;
  occurredOn: string;
  createdAt: string;
  updatedAt: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  currency: CurrencyCode;
  limitMinor: number;
  month: string;
};

export type Settings = {
  theme: ThemeMode;
  biometricEnabled: boolean;
  onboardingCompleted: boolean;
  defaultCurrency: CurrencyCode;
  sampleLedger: boolean;
};

export type PhraseDraft = {
  amountMinor: number;
  currency: CurrencyCode;
  categoryId: string;
  categoryName: string;
  direction: Direction;
  description: string;
  rawInput: string;
};
