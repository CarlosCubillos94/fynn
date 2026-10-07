import { Button } from "@/components/ui/Button";
import { Choice } from "@/components/ui/Choice";
import { Field } from "@/components/ui/Field";
import { CategoryMark } from "@/components/ui/CategoryMark";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePalette } from "@/components/ui/usePalette";
import { CATEGORIES } from "@/domain/categories";
import { budgetStatus, spentMinor } from "@/domain/budget";
import { monthKey } from "@/domain/dates";
import { createId } from "@/domain/id";
import { formatMoney, parseAmountInput } from "@/domain/money";
import type { CurrencyCode } from "@/domain/types";
import { useBudgets, useSaveBudget, useTransactions } from "@/db/hooks";
import { useCopy } from "@/i18n/copy";
import { useSession } from "@/state/session";
import { useState } from "react";
import { Text } from "@/components/ui/Text";
import { ScrollView, View } from "react-native";

export function BudgetScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const viewCurrency = useSession((state) => state.viewCurrency);
  const setViewCurrency = useSession((state) => state.setViewCurrency);
  const transactions = useTransactions();
  const budgets = useBudgets();
  const save = useSaveBudget();
  const [editing, setEditing] = useState<string | null>(null);
  const [limitText, setLimitText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const month = monthKey(new Date());
  const rows = transactions.data ?? [];

  if (transactions.isLoading || budgets.isLoading) {
    return (
      <View className="flex-1 gap-4 pt-4" style={{ backgroundColor: colors.ground }}>
        <Skeleton />
        <Skeleton />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.ground }} contentContainerClassName="gap-5 px-5 pb-36 pt-4">
      <Choice
        label={copy.currency}
        value={viewCurrency}
        options={[
          { value: "CLP", label: "CLP" },
          { value: "USD", label: "USD" },
        ]}
        onChange={(value) => setViewCurrency(value as CurrencyCode)}
      />
      <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden" }}>
      {CATEGORIES.filter((category) => category.direction === "expense").map((category, index) => {
        const budget = (budgets.data ?? []).find(
          (item) => item.categoryId === category.id && item.currency === viewCurrency && item.month === month,
        );
        const spent = spentMinor(rows, category.id, viewCurrency, month);
        const status = budget ? budgetStatus(spent, budget.limitMinor) : null;
        const fill = status?.state === "over" ? colors.expense : status?.state === "warning" ? colors.warn : colors.income;
        const open = editing === category.id;
        return (
          <View
            key={category.id}
            className="gap-2 px-4 py-4"
            style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.line }}
          >
            <View className="flex-row items-center gap-3">
              <CategoryMark categoryId={category.id} size={28} />
              <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "600" }}>{copy.categoryName(category.id)}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 15 }}>
              {formatMoney(spent, viewCurrency)}
              {budget ? ` ${copy.of} ${formatMoney(budget.limitMinor, viewCurrency)}` : ` ${copy.spentNoLimit}`}
            </Text>
            {status ? (
              <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.line }}>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: `${Math.min(status.ratio, 1) * 100}%`,
                    backgroundColor: fill,
                  }}
                />
              </View>
            ) : null}
            {status?.state === "warning" ? (
              <Text style={{ color: colors.warn }}>{copy.past80}</Text>
            ) : null}
            {status?.state === "over" ? <Text style={{ color: colors.expense }}>{copy.overBudget}</Text> : null}
            {open ? (
              <View className="gap-3">
                <Field
                  label={copy.limit}
                  value={limitText}
                  onChangeText={setLimitText}
                  keyboardType="decimal-pad"
                  error={error}
                />
                <Button
                  label={copy.saveLimit}
                  onPress={() => {
                    const amount = parseAmountInput(limitText, viewCurrency);
                    if (amount === null || amount <= 0) {
                      setError(copy.limitError);
                      return;
                    }
                    setError(null);
                    void save
                      .mutateAsync({
                        id: budget?.id ?? createId(),
                        categoryId: category.id,
                        currency: viewCurrency,
                        limitMinor: amount,
                        month,
                      })
                      .then(() => setEditing(null));
                  }}
                />
              </View>
            ) : (
              <Button
                label={budget ? copy.changeLimit : copy.setLimit}
                tone="ghost"
                onPress={() => {
                  setEditing(category.id);
                  setLimitText(
                    budget
                      ? viewCurrency === "USD"
                        ? (budget.limitMinor / 100).toFixed(2)
                        : String(budget.limitMinor)
                      : "",
                  );
                  setError(null);
                }}
              />
            )}
          </View>
        );
      })}
      </View>
      {save.isError ? <Text style={{ color: colors.expense }}>{copy.limitSaveFailed}</Text> : null}
    </ScrollView>
  );
}
