import type { Category } from "@/domain/types";

export const CATEGORIES: Category[] = [
  { id: "food", name: "Food", direction: "expense", sortOrder: 0 },
  { id: "transport", name: "Transport", direction: "expense", sortOrder: 1 },
  { id: "home", name: "Home", direction: "expense", sortOrder: 2 },
  { id: "health", name: "Health", direction: "expense", sortOrder: 3 },
  { id: "subscriptions", name: "Subscriptions", direction: "expense", sortOrder: 4 },
  { id: "fun", name: "Fun", direction: "expense", sortOrder: 5 },
  { id: "shopping", name: "Shopping", direction: "expense", sortOrder: 6 },
  { id: "other", name: "Other", direction: "expense", sortOrder: 7 },
  { id: "salary", name: "Salary", direction: "income", sortOrder: 8 },
  { id: "freelance", name: "Freelance", direction: "income", sortOrder: 9 },
  { id: "other-income", name: "Other income", direction: "income", sortOrder: 10 },
];

export function categoryById(categories: Category[], id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
