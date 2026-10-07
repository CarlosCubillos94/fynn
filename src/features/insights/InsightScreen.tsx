import { Button } from "@/components/ui/Button";
import { GrowBar } from "@/components/ui/GrowBar";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { MonthPairs } from "@/components/ui/MonthPairs";
import { Ribbon } from "@/components/ui/Ribbon";
import { Rise } from "@/components/ui/Rise";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { usePalette } from "@/components/ui/usePalette";
import { monthTotals } from "@/domain/aggregate";
import { CATEGORIES } from "@/domain/categories";
import { isoDate, monthKey, recentMonths, weekBounds } from "@/domain/dates";
import { biggestWeekMove, insightSentence } from "@/domain/insights";
import { formatMoney } from "@/domain/money";
import type { CurrencyCode } from "@/domain/types";
import { useTransactions } from "@/db/hooks";
import { useCopy } from "@/i18n/copy";
import { proxyBaseUrl, rewriteInsight } from "@/services/ai/client";
import { useSession } from "@/state/session";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function InsightScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const router = useRouter();
  const viewCurrency = useSession((state) => state.viewCurrency);
  const setViewCurrency = useSession((state) => state.setViewCurrency);
  const transactions = useTransactions();
  const [remote, setRemote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (transactions.isLoading) {
    return (
      <View className="flex-1 gap-4 px-5 pt-4" style={{ backgroundColor: colors.ground }}>
        <Skeleton height={260} />
        <Skeleton height={140} />
        <Skeleton height={160} />
      </View>
    );
  }

  const rows = transactions.data ?? [];
  const now = new Date();
  const today = isoDate(now);
  const bounds = weekBounds(today);
  const lastDay = new Date(parseIso(bounds.end).getTime() - 24 * 60 * 60 * 1000);
  const dayFormat = new Intl.DateTimeFormat(copy.intl, { day: "numeric", month: "short" });
  const move = biggestWeekMove(rows, CATEGORIES, viewCurrency, today);
  const local = insightSentence(move, viewCurrency, copy.language);
  const sentence = remote ?? local;

  const totals = monthTotals(rows, viewCurrency, monthKey(now));
  const monthName = new Intl.DateTimeFormat(copy.intl, { month: "long" }).format(now);
  const months = recentMonths(now, 6).map((key) => {
    const sums = monthTotals(rows, viewCurrency, key);
    return {
      month: key,
      label: new Intl.DateTimeFormat(copy.intl, { month: "short" }).format(
        new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1),
      ),
      income: sums.income,
      expense: sums.expense,
    };
  });
  const hasAnyMoney = months.some((point) => point.income > 0 || point.expense > 0);
  const scale = Math.max(totals.income, totals.expense, 1);

  const bigNumber = !move
    ? null
    : move.direction === "new"
      ? formatMoney(move.thisWeekMinor, viewCurrency)
      : move.direction === "same"
        ? "0%"
        : `${move.direction === "more" ? "+" : "-"}${move.percent}%`;
  const weekScale = move ? Math.max(move.thisWeekMinor, move.lastWeekMinor, 1) : 1;

  const keptLine =
    totals.income <= 0
      ? copy.noIncomeLine
      : totals.expense > totals.income
        ? copy.overspentLine
        : copy.keptLine(Math.round(((totals.income - totals.expense) / totals.income) * 100));

  const summary = months
    .map((point) => `${point.label}: ${formatMoney(point.income, viewCurrency)} / ${formatMoney(point.expense, viewCurrency)}`)
    .join(", ");

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.ground }}
      contentContainerClassName="gap-7 px-5 pb-36 pt-3"
    >
      <View className="flex-row gap-1">
        {(["CLP", "USD"] as const).map((currency) => {
          const selected = currency === viewCurrency;
          return (
            <Pressable
              key={currency}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={copy.showCurrency(currency)}
              onPress={() => {
                setViewCurrency(currency as CurrencyCode);
                setRemote(null);
              }}
              className="min-h-11 items-center justify-center px-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text
                style={{
                  color: selected ? colors.ink : colors.muted,
                  fontSize: 15,
                  fontWeight: selected ? "600" : "400",
                  textDecorationLine: selected ? "underline" : "none",
                }}
              >
                {currency}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Rise>
        <View
          accessible
          accessibilityLabel={sentence}
          style={{ borderRadius: 32, overflow: "hidden", backgroundColor: colors.band, padding: 24 }}
        >
          <HeroBackdrop />
          <Text style={{ color: colors.bandSoft, fontSize: 15 }}>
            {copy.weekRange(dayFormat.format(parseIso(bounds.start)), dayFormat.format(lastDay))}
          </Text>
          {move && bigNumber ? (
            <View className="mt-2 gap-1">
              <Text
                display
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
                style={{ color: colors.onBand, fontSize: 104, lineHeight: 112, letterSpacing: -2 }}
              >
                {bigNumber}
              </Text>
              <Text style={{ color: colors.onBand, fontSize: 24, fontWeight: "600" }}>
                {copy.categoryName(move.categoryId)}
                <Text style={{ color: colors.bandSoft, fontSize: 18, fontWeight: "400" }}>
                  {" "}
                  {move.direction === "new" ? copy.newThisWeek : copy.vsLastWeek}
                </Text>
              </Text>
              <View className="mt-5 gap-4">
                <View className="gap-2">
                  <View className="flex-row items-baseline justify-between">
                    <Text style={{ color: colors.bandSoft, fontSize: 15 }}>{copy.thisWeek}</Text>
                    <Text style={{ color: colors.onBand, fontSize: 17, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                      {formatMoney(move.thisWeekMinor, viewCurrency)}
                    </Text>
                  </View>
                  <GrowBar ratio={move.thisWeekMinor / weekScale} color={colors.onBand} delay={200} />
                </View>
                <View className="gap-2">
                  <View className="flex-row items-baseline justify-between">
                    <Text style={{ color: colors.bandSoft, fontSize: 15 }}>{copy.lastWeek}</Text>
                    <Text style={{ color: colors.bandSoft, fontSize: 17, fontVariant: ["tabular-nums"] }}>
                      {formatMoney(move.lastWeekMinor, viewCurrency)}
                    </Text>
                  </View>
                  <GrowBar ratio={move.lastWeekMinor / weekScale} color={colors.bandSoft} delay={300} />
                </View>
              </View>
            </View>
          ) : (
            <Text style={{ color: colors.onBand, fontSize: 26, fontWeight: "600", lineHeight: 32, marginTop: 12 }}>
              {sentence}
            </Text>
          )}
          {remote ? (
            <Text style={{ color: colors.onBand, fontSize: 17, lineHeight: 24, marginTop: 20 }}>{remote}</Text>
          ) : null}
          {proxyBaseUrl() ? (
            <View className="mt-5">
              <Button
                label={pending ? copy.rewriting : copy.rewrite}
                tone="bone"
                compact
                disabled={pending || !move}
                onPress={() => {
                  if (!move) return;
                  setPending(true);
                  setError(null);
                  void rewriteInsight(move, local)
                    .then((next) => setRemote(next))
                    .catch(() => setError(copy.rewriteFailed))
                    .finally(() => setPending(false));
                }}
              />
            </View>
          ) : null}
          {error ? <Text style={{ color: colors.onBandAlert, fontSize: 15, marginTop: 12 }}>{error}</Text> : null}
        </View>
      </Rise>

      {hasAnyMoney ? (
        <>
          <Rise index={1} style={{ gap: 16 }}>
            <View className="gap-1">
              <Text style={{ color: colors.ink, fontSize: 24, fontWeight: "600" }}>{copy.incomeVsSpending}</Text>
              <Text style={{ color: colors.muted, fontSize: 15 }}>{monthName}</Text>
            </View>
            <View className="gap-4">
              <View className="gap-2">
                <View className="flex-row items-baseline justify-between">
                  <Text style={{ color: colors.muted, fontSize: 16 }}>{copy.incomeLabel}</Text>
                  <Text style={{ color: colors.income, fontSize: 20, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                    {formatMoney(totals.income, viewCurrency)}
                  </Text>
                </View>
                <GrowBar ratio={totals.income / scale} color={colors.income} height={14} delay={250} />
              </View>
              <View className="gap-2">
                <View className="flex-row items-baseline justify-between">
                  <Text style={{ color: colors.muted, fontSize: 16 }}>{copy.spending}</Text>
                  <Text style={{ color: colors.expense, fontSize: 20, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                    {formatMoney(totals.expense, viewCurrency)}
                  </Text>
                </View>
                <GrowBar ratio={totals.expense / scale} color={colors.expense} height={14} delay={350} />
              </View>
            </View>
            <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "600", lineHeight: 25 }}>{keptLine}</Text>
          </Rise>

          <Rise index={2} style={{ gap: 16 }}>
            <Text style={{ color: colors.ink, fontSize: 24, fontWeight: "600" }}>{copy.sixMonths}</Text>
            <MonthPairs
              points={months}
              incomeColor={colors.income}
              expenseColor={colors.expense}
              labelColor={colors.muted}
              summary={summary}
            />
            <View className="flex-row gap-5">
              <View className="flex-row items-center gap-2">
                <Ribbon color={colors.income} />
                <Text style={{ color: colors.muted, fontSize: 14 }}>{copy.incomeLabel}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ribbon color={colors.expense} />
                <Text style={{ color: colors.muted, fontSize: 14 }}>{copy.spending}</Text>
              </View>
            </View>
          </Rise>
        </>
      ) : (
        <Rise index={1} style={{ gap: 16 }}>
          <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "600", lineHeight: 27 }}>{copy.emptySummary}</Text>
          <Button label={copy.goHome} tone="pine" onPress={() => router.replace("/home")} />
        </Rise>
      )}

      <Text style={{ color: colors.muted, fontSize: 13 }}>{copy.computedHere}</Text>
      {transactions.isError ? <Text style={{ color: colors.expense }}>{copy.loadFailed}</Text> : null}
    </ScrollView>
  );
}
