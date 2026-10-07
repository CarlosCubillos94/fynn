import { CategoryMark } from "@/components/ui/CategoryMark";
import { Field } from "@/components/ui/Field";
import { MoneyText } from "@/components/ui/MoneyText";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePalette } from "@/components/ui/usePalette";
import { formatDay } from "@/domain/dates";
import type { CurrencyCode, Direction } from "@/domain/types";
import { useDeleteTransaction, useTransactions } from "@/db/hooks";
import { useCopy } from "@/i18n/copy";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text } from "@/components/ui/Text";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

export function TransactionListScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const router = useRouter();
  const transactions = useTransactions();
  const remove = useDeleteTransaction();
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<Direction | "all">("all");
  const [currency, setCurrency] = useState<CurrencyCode | "all">("all");

  const rows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return (transactions.data ?? []).filter((transaction) => {
      if (direction !== "all" && transaction.direction !== direction) return false;
      if (currency !== "all" && transaction.currency !== currency) return false;
      if (!needle) return true;
      const category = copy.categoryName(transaction.categoryId);
      const haystack = `${transaction.description} ${transaction.note ?? ""} ${transaction.rawInput ?? ""} ${category}`.toLocaleLowerCase();
      return haystack.includes(needle);
    });
  }, [transactions.data, query, direction, currency, copy]);

  function confirmDelete(id: string, description: string) {
    Alert.alert(copy.deleteTitle, copy.deleteBody(description), [
      { text: copy.cancel, style: "cancel" },
      { text: copy.delete, style: "destructive", onPress: () => void remove.mutateAsync(id) },
    ]);
  }

  if (transactions.isLoading) {
    return (
      <View className="flex-1 gap-4 pt-4" style={{ backgroundColor: colors.ground }}>
        <Skeleton />
        <Skeleton />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.ground }} contentContainerClassName="gap-4 px-5 pb-36 pt-4">
      <Field label={copy.search} value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} autoCapitalize="none" />
      <View className="flex-row flex-wrap gap-2">
        {(
          [
            ["all", copy.all],
            ["expense", copy.expenses],
            ["income", copy.income],
          ] as const
        ).map(([value, label]) => (
          <FilterChip key={value} label={label} selected={direction === value} onPress={() => setDirection(value)} />
        ))}
        {(
          [
            ["all", copy.anyCurrency],
            ["CLP", "CLP"],
            ["USD", "USD"],
          ] as const
        ).map(([value, label]) => (
          <FilterChip key={value} label={label} selected={currency === value} onPress={() => setCurrency(value)} />
        ))}
      </View>
      {transactions.isError ? (
        <Text style={{ color: colors.expense }}>{copy.loadFailed}</Text>
      ) : null}
      {rows.length === 0 ? (
        <View className="gap-3 pt-2">
          <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "600" }}>
            {transactions.data?.length ? copy.nothingMatches : copy.noTransactions}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 16 }}>{copy.emptyHint}</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/add")} className="min-h-12 justify-center">
            <Text style={{ color: colors.pine, fontSize: 16, fontWeight: "600" }}>{copy.add}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden" }}>
        {rows.map((transaction, index) => {
          const category = copy.categoryName(transaction.categoryId);
          const row = (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${transaction.description}, ${category}, ${formatDay(transaction.occurredOn, copy.intl)}`}
              onPress={() => router.push({ pathname: "/add", params: { id: transaction.id } })}
              className="min-h-16 flex-row items-center justify-between px-4 py-3"
              style={{
                backgroundColor: colors.surface,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.line,
              }}
            >
              <View className="mr-3">
                <CategoryMark categoryId={transaction.categoryId} />
              </View>
              <View className="flex-1 pr-3">
                <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "600" }}>{transaction.description}</Text>
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                  {category}, {formatDay(transaction.occurredOn, copy.intl)}
                </Text>
              </View>
              <MoneyText
                amountMinor={transaction.amountMinor}
                currency={transaction.currency}
                direction={transaction.direction}
                tone={transaction.direction === "income" ? "in" : "out"}
              />
            </Pressable>
          );
          if (Platform.OS === "web") {
            return (
              <View key={transaction.id}>
                {row}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${copy.delete} ${transaction.description}`}
                  onPress={() => confirmDelete(transaction.id, transaction.description)}
                  className="min-h-12 justify-center"
                >
                  <Text style={{ color: colors.expense }}>{copy.delete}</Text>
                </Pressable>
              </View>
            );
          }
          return (
            <Swipeable
              key={transaction.id}
              renderRightActions={() => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${copy.delete} ${transaction.description}`}
                  onPress={() => confirmDelete(transaction.id, transaction.description)}
                  className="min-h-16 items-center justify-center px-5"
                  style={{ backgroundColor: colors.expense }}
                >
                  <Text style={{ color: "#F8FBFA", fontWeight: "600" }}>{copy.delete}</Text>
                </Pressable>
              )}
            >
              {row}
            </Swipeable>
          );
        })}
        </View>
      )}
    </ScrollView>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="min-h-12 items-center justify-center px-3"
      style={{
        borderRadius: 12,
        backgroundColor: selected ? colors.pine : colors.surface,
        borderWidth: 1,
        borderColor: selected ? colors.pine : colors.line,
      }}
    >
      <Text style={{ color: selected ? colors.onPine : colors.ink }}>{label}</Text>
    </Pressable>
  );
}
