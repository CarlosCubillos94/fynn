import { Button } from "@/components/ui/Button";
import { Trend } from "@/components/ui/Charts";
import { CategoryTile } from "@/components/ui/CategoryTile";
import { Glass } from "@/components/ui/Glass";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { Rise } from "@/components/ui/Rise";
import { Ribbon } from "@/components/ui/Ribbon";
import { MoneyText } from "@/components/ui/MoneyText";
import { PhrasePreview } from "@/components/ui/PhrasePreview";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePalette } from "@/components/ui/usePalette";
import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { CATEGORIES } from "@/domain/categories";
import { parsePhrase } from "@/domain/categorize";
import { expenseByCategory, monthTotals } from "@/domain/aggregate";
import { budgetStatus, spentMinor } from "@/domain/budget";
import { isoDate, monthKey, recentMonths } from "@/domain/dates";
import { createId } from "@/domain/id";
import { formatMoney } from "@/domain/money";
import type { Direction, Transaction } from "@/domain/types";
import { useBudgets, useDeleteTransaction, useSaveTransaction, useTransactions } from "@/db/hooks";
import { useCopy } from "@/i18n/copy";
import { proxyBaseUrl, refinePhrase } from "@/services/ai/client";
import { importCaptures } from "@/services/captures";
import { seriesColor } from "@/theme/palette";
import { useSession } from "@/state/session";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Text } from "@/components/ui/Text";
import { AppState, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SymbolView } from "expo-symbols";

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

export function HomeScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const copyRef = useRef(copy);
  useEffect(() => {
    copyRef.current = copy;
  }, [copy]);
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const router = useRouter();
  const viewCurrency = useSession((state) => state.viewCurrency);
  const setViewCurrency = useSession((state) => state.setViewCurrency);
  const sampleLedger = useSession((state) => state.sampleLedger);
  const transactions = useTransactions();
  const budgets = useBudgets();
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const [text, setText] = useState("");
  const [receipt, setReceipt] = useState<{ ids: string[]; description: string } | null>(null);
  const [captureNote, setCaptureNote] = useState<string | null>(null);
  const [undoError, setUndoError] = useState(false);
  const phraseRef = useRef<TextInput>(null);
  const [mode, setMode] = useState<Direction>("expense");
  const [manual, setManual] = useState(false);
  const forced = manual ? mode : undefined;
  const local = useMemo(() => parsePhrase(text, viewCurrency, CATEGORIES, forced), [text, viewCurrency, forced]);
  const direction: Direction = forced ?? local?.direction ?? "expense";
  const remote = useQuery({
    queryKey: ["categorize", text, viewCurrency, forced ?? "auto"],
    queryFn: () => refinePhrase(local!, CATEGORIES),
    enabled: Boolean(proxyBaseUrl()) && local !== null,
    staleTime: 60_000,
  });
  const draft = remote.data ?? local;
  const lock = useSharedValue(0);
  const lockedKey = useRef("");
  const lockKey = draft ? `${draft.rawInput}|${draft.currency}` : "";

  useEffect(() => {
    if (!lockKey) {
      lockedKey.current = "";
      lock.value = 0;
      return;
    }
    if (lockedKey.current === lockKey) return;
    lockedKey.current = lockKey;
    if (reduce) {
      lock.value = 1;
      return;
    }
    lock.value = 0;
    lock.value = withTiming(1, { duration: 200, easing: easeOut });
  }, [lock, lockKey, reduce]);

  const locked = useAnimatedStyle(() => ({
    opacity: lock.value,
    transform: [{ translateY: reduce ? 0 : (1 - lock.value) * 6 }],
  }));

  // Payments the Shortcuts app queued while Fynn was closed. Saved here with the same rules as a
  // typed phrase, then offered for undo. A phrase with no amount is handed back for editing.
  const saveMutate = save.mutateAsync;
  useEffect(() => {
    async function handle(phrases: string[]) {
      const saved: { id: string; description: string }[] = [];
      let review: string | null = null;
      for (const phrase of phrases) {
        const parsed = parsePhrase(phrase, useSession.getState().viewCurrency, CATEGORIES);
        if (!parsed) {
          review ??= phrase;
          continue;
        }
        const stamp = new Date().toISOString();
        const id = createId();
        await saveMutate({
          id,
          direction: parsed.direction,
          amountMinor: parsed.amountMinor,
          currency: parsed.currency,
          categoryId: parsed.categoryId,
          note: null,
          description: parsed.description,
          rawInput: parsed.rawInput,
          occurredOn: isoDate(new Date()),
          createdAt: stamp,
          updatedAt: stamp,
        });
        saved.push({ id, description: parsed.description });
      }
      if (saved.length > 0) {
        setUndoError(false);
        setReceipt({
          ids: saved.map((item) => item.id),
          description: saved.length === 1 ? (saved[0]?.description ?? "") : copyRef.current.capturedMany(saved.length),
        });
      }
      if (review) {
        setText(review);
        setCaptureNote(copyRef.current.captureNeedsReview);
      }
    }
    void importCaptures(handle);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void importCaptures(handle);
    });
    return () => sub.remove();
  }, [saveMutate]);

  const now = new Date();
  const month = monthKey(now);
  const rows = transactions.data ?? [];
  const totals = monthTotals(rows, viewCurrency, month);
  const slices = expenseByCategory(rows, viewCurrency, month);
  const warnings = (budgets.data ?? [])
    .filter((budget) => budget.currency === viewCurrency && budget.month === month)
    .map((budget) => ({
      budget,
      status: budgetStatus(spentMinor(rows, budget.categoryId, viewCurrency, month), budget.limitMinor),
    }))
    .filter((item) => item.status.state !== "ok");
  const trend = recentMonths(now, 6).map((key) => ({
    month: key,
    label: new Intl.DateTimeFormat(copy.intl, { month: "short" }).format(new Date(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, 1)),
    amountMinor: monthTotals(rows, viewCurrency, key).expense,
  }));

  async function onSave() {
    if (!draft) return;
    const stamp = new Date().toISOString();
    const id = createId();
    const transaction: Transaction = {
      id,
      direction: draft.direction,
      amountMinor: draft.amountMinor,
      currency: draft.currency,
      categoryId: draft.categoryId,
      note: null,
      description: draft.description,
      rawInput: draft.rawInput,
      occurredOn: isoDate(new Date()),
      createdAt: stamp,
      updatedAt: stamp,
    };
    try {
      await save.mutateAsync(transaction);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      setUndoError(false);
      setReceipt({ ids: [id], description: draft.description });
      setText("");
      setManual(false);
    } catch {
      setReceipt(null);
    }
  }

  async function onUndo() {
    if (!receipt) return;
    try {
      for (const id of receipt.ids) await remove.mutateAsync(id);
      setReceipt(null);
      setUndoError(false);
    } catch {
      setUndoError(true);
    }
  }

  if (transactions.isLoading || budgets.isLoading) {
    return (
      <View className="flex-1 gap-4 pt-4" style={{ backgroundColor: colors.ground }}>
        <Skeleton height={160} />
        <Skeleton height={120} />
        <Skeleton height={180} />
      </View>
    );
  }

  const monthName = new Intl.DateTimeFormat(copy.intl, { month: "long" }).format(now);
  const spendTotal = slices.reduce((sum, slice) => sum + slice.amountMinor, 0);
  const tiles = slices.slice(0, 4);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.ground }}
      contentContainerClassName="pb-36"
      keyboardShouldPersistTaps="handled"
    >
      <View
        className="px-5 pb-6"
        style={{
          paddingTop: insets.top + 8,
          overflow: "hidden",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          backgroundColor: colors.band,
        }}
      >
        <HeroBackdrop />
        <View className="flex-row items-center gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.settings}
            onPress={() => router.push("/settings")}
            hitSlop={4}
          >
            <Glass radius={22} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                <SymbolView
                  name={{ ios: "gearshape.fill", android: "settings", web: "settings" }}
                  tintColor={colors.onBand}
                  size={20}
                />
              </View>
            </Glass>
          </Pressable>
          <View className="flex-row gap-1">
            {(["CLP", "USD"] as const).map((currency) => {
              const selected = currency === viewCurrency;
              return (
                <Pressable
                  key={currency}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={copy.showCurrency(currency)}
                  onPress={() => setViewCurrency(currency)}
                  className="min-h-11 items-center justify-center px-2"
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text
                    style={{
                      color: selected ? colors.onBand : colors.bandSoft,
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
        </View>

        <Rise style={{ marginTop: 20 }} distance={14} duration={420}>
          <Text style={{ color: colors.bandSoft, fontSize: 16 }}>{copy.netOf(monthName)}</Text>
          <MoneyText amountMinor={totals.net} currency={viewCurrency} tone="onBand" size={76} />
          <Text style={{ fontSize: 15, marginTop: 2 }}>
            <Text style={{ color: colors.shellIn, fontSize: 15 }}>
              {copy.inWord} {formatMoney(totals.income, viewCurrency)}
            </Text>
            <Text style={{ color: colors.bandSoft, fontSize: 15 }}> {"\u00B7"} </Text>
            <Text style={{ color: colors.shellOut, fontSize: 15 }}>
              {copy.outWord} {formatMoney(totals.expense, viewCurrency)}
            </Text>
          </Text>
        </Rise>

        <Rise index={1} style={{ marginTop: 24 }}>
          <Glass radius={28} style={{ paddingHorizontal: 18, paddingVertical: 8 }}>
            <View className="flex-row gap-1 pt-1" accessibilityRole="radiogroup">
              {(["expense", "income"] as const).map((value) => {
                const selected = direction === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      setMode(value);
                      setManual(true);
                    }}
                    hitSlop={6}
                    style={({ pressed }) => ({
                      minHeight: 34,
                      justifyContent: "center",
                      paddingHorizontal: 14,
                      borderRadius: 17,
                      backgroundColor: selected ? "rgba(255,255,255,0.26)" : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <Text
                      style={{
                        color: selected ? colors.onBand : colors.bandSoft,
                        fontSize: 15,
                        fontWeight: selected ? "600" : "400",
                      }}
                    >
                      {value === "income" ? copy.incomeMode : copy.expenseMode}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="flex-row items-center gap-3">
              <TextInput
                ref={phraseRef}
                value={text}
                onChangeText={(value) => {
                  setText(value);
                  if (value.trim().length > 0) setReceipt(null);
                  setCaptureNote(null);
                }}
                onSubmitEditing={() => {
                  if (draft) void onSave();
                }}
                returnKeyType="done"
                placeholder={direction === "income" ? copy.incomePlaceholder : copy.phrasePlaceholder}
                placeholderTextColor={colors.bandSoft}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel={copy.addPhrase}
                style={{ color: colors.onBand, fontSize: 21, minHeight: 52, flex: 1 }}
              />
              {draft ? (
                <Animated.View style={locked}>
                  <Button label={copy.accept} tone="coin" compact onPress={() => void onSave()} disabled={save.isPending} />
                </Animated.View>
              ) : null}
            </View>
            {draft ? (
              <Animated.View style={locked} className="gap-2 pb-3 pt-1">
                <PhrasePreview
                  draft={draft}
                  color={colors.onBand}
                  muted={colors.bandSoft}
                  incomeColor={colors.shellIn}
                  categoryLabel={copy.categoryName(draft.categoryId)}
                />
                <Text style={{ color: colors.bandSoft, fontSize: 14 }}>
                  {remote.isFetching ? copy.checkingAssistant : remote.data ? copy.assistantAdjusted : copy.suggestedHere}
                </Text>
                {remote.isError ? (
                  <Text style={{ color: colors.bandSoft, fontSize: 14 }}>{copy.assistantUnreachable}</Text>
                ) : null}
              </Animated.View>
            ) : null}
            {text.trim().length > 0 && !draft ? (
              <Text style={{ color: colors.onBandAlert, fontSize: 15, paddingBottom: 10 }} accessibilityRole="alert">
                {copy.phraseAmount}
              </Text>
            ) : null}
            {save.isError ? (
              <Text style={{ color: colors.onBandAlert, fontSize: 15, paddingBottom: 10 }}>{copy.couldNotSave}</Text>
            ) : null}
          </Glass>
        </Rise>
      </View>

      <View className="gap-1 px-5 pt-3">
        {sampleLedger ? <Text style={{ color: colors.muted, fontSize: 13 }}>{copy.sampleQuiet}</Text> : null}
      </View>

      {receipt ? (
        <View className="flex-row items-center justify-between gap-3 px-5 pt-1">
          <Text style={{ color: colors.ink, fontSize: 16, flex: 1 }} accessibilityLiveRegion="polite">
            {copy.accepted(receipt.description)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.undo}
            onPress={() => void onUndo()}
            className="min-h-11 items-center justify-center px-1"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600" }}>{copy.undo}</Text>
          </Pressable>
        </View>
      ) : null}
      {captureNote ? (
        <Text style={{ color: colors.warn, fontSize: 15, paddingHorizontal: 20, paddingTop: 4 }}>{captureNote}</Text>
      ) : null}
      {undoError ? (
        <Text style={{ color: colors.expense, fontSize: 15, paddingHorizontal: 20 }}>{copy.undoFailed}</Text>
      ) : null}

      <View className="gap-3 px-5 pt-5">
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "600" }}>{copy.spendingIn(monthName)}</Text>
        {tiles.length > 0 ? (
          <View className="flex-row gap-2">
            {tiles.map((slice, index) => (
              <Rise key={slice.categoryId} index={index + 2} style={{ flex: 1, flexDirection: "row" }}>
                <CategoryTile
                  categoryId={slice.categoryId}
                  name={copy.categoryName(slice.categoryId)}
                  percent={Math.round((slice.amountMinor / spendTotal) * 100)}
                  amount={formatMoney(slice.amountMinor, viewCurrency)}
                />
              </Rise>
            ))}
          </View>
        ) : (
          <Text style={{ color: colors.muted, fontSize: 16 }}>{copy.noExpenses(viewCurrency)}</Text>
        )}
      </View>

      {warnings.length > 0 ? (
        <View className="px-5 pt-3">
          {warnings.map((item, index) => (
            <View
              key={item.budget.id}
              className="flex-row items-center gap-3"
              style={{
                paddingVertical: 14,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.line,
              }}
            >
              <Ribbon color={seriesColor[item.budget.categoryId] ?? colors.muted} />
              <Text style={{ color: item.status.state === "over" ? colors.expense : colors.warn, fontSize: 16, flex: 1 }}>
                {copy.limitLine(copy.categoryName(item.budget.categoryId), item.status.state)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="gap-2 px-5 pt-6">
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "600" }}>{copy.sixMonths}</Text>
        <Trend points={trend} currency={viewCurrency} />
      </View>

      <View className="px-5 pt-2">
        <Pressable accessibilityRole="button" onPress={() => router.push("/add")} className="min-h-11 justify-center">
          <Text style={{ color: colors.muted, fontSize: 15 }}>{copy.enterManually}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
