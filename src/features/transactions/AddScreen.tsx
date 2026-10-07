import { Button } from "@/components/ui/Button";
import { Choice } from "@/components/ui/Choice";
import { Field } from "@/components/ui/Field";
import { usePalette } from "@/components/ui/usePalette";
import { CATEGORIES } from "@/domain/categories";
import { isoDate } from "@/domain/dates";
import { createId } from "@/domain/id";
import { parseAmountInput } from "@/domain/money";
import type { CurrencyCode, Direction, Transaction } from "@/domain/types";
import { useDeleteTransaction, useSaveTransaction, useTransactions } from "@/db/hooks";
import { useCopy } from "@/i18n/copy";
import { DateField } from "@/features/transactions/DateField";
import { useSession } from "@/state/session";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/ui/Text";
import { Alert, ScrollView } from "react-native";

export function AddScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const existing = useTransactions().data?.find((item) => item.id === params.id);
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const defaultCurrency = useSession((state) => state.defaultCurrency);
  const [direction, setDirection] = useState<Direction>(existing?.direction ?? "expense");
  const [currency, setCurrency] = useState<CurrencyCode>(existing?.currency ?? defaultCurrency);
  const [amountText, setAmountText] = useState(existing ? amountToText(existing.amountMinor, existing.currency) : "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "food");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [note, setNote] = useState(existing?.note ?? "");
  const [occurredOn, setOccurredOn] = useState(existing?.occurredOn ?? isoDate(new Date()));
  const [error, setError] = useState<string | null>(null);
  const choices = CATEGORIES.filter((category) => category.direction === direction);
  const loadedId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!existing || loadedId.current === existing.id) return;
    loadedId.current = existing.id;
    setDirection(existing.direction);
    setCurrency(existing.currency);
    setAmountText(amountToText(existing.amountMinor, existing.currency));
    setCategoryId(existing.categoryId);
    setDescription(existing.description);
    setNote(existing.note ?? "");
    setOccurredOn(existing.occurredOn);
  }, [existing]);

  async function onSave() {
    const amountMinor = parseAmountInput(amountText, currency);
    const category = choices.find((item) => item.id === categoryId) ?? choices[0];
    if (amountMinor === null || amountMinor <= 0 || !category) {
      setError(copy.amountThenCategory);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) {
      setError(copy.dateExample);
      return;
    }
    const stamp = new Date().toISOString();
    const transaction: Transaction = {
      id: existing?.id ?? createId(),
      direction,
      amountMinor,
      currency,
      categoryId: category.id,
      note: note.trim() ? note.trim() : null,
      description: description.trim() || copy.categoryName(category.id),
      rawInput: existing?.rawInput ?? null,
      occurredOn,
      createdAt: existing?.createdAt ?? stamp,
      updatedAt: stamp,
    };
    try {
      await save.mutateAsync(transaction);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      router.back();
    } catch {
      setError(copy.couldNotSave);
    }
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.ground }} contentContainerClassName="gap-5 px-5 pb-16 pt-4">
      <Choice
        label={copy.type}
        value={direction}
        options={[
          { value: "expense", label: copy.expense },
          { value: "income", label: copy.income },
        ]}
        onChange={(value) => {
          const next = value as Direction;
          setDirection(next);
          const first = CATEGORIES.find((category) => category.direction === next);
          if (first) setCategoryId(first.id);
        }}
      />
      <Choice
        label={copy.currency}
        value={currency}
        options={[
          { value: "CLP", label: "CLP" },
          { value: "USD", label: "USD" },
        ]}
        onChange={(value) => setCurrency(value as CurrencyCode)}
      />
      <Field label={copy.amount} value={amountText} onChangeText={setAmountText} keyboardType="decimal-pad" autoFocus={!existing} />
      <Choice
        label={copy.category}
        value={categoryId}
        options={choices.map((category) => ({ value: category.id, label: copy.categoryName(category.id) }))}
        onChange={setCategoryId}
      />
      <Field label={copy.description} value={description} onChangeText={setDescription} placeholder={copy.optional} />
      <Field label={copy.note} value={note} onChangeText={setNote} placeholder={copy.optional} />
      <DateField value={occurredOn} onChange={setOccurredOn} />
      {error ? (
        <Text style={{ color: colors.expense }} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button label={copy.save} onPress={() => void onSave()} disabled={save.isPending} />
      {existing ? (
        <Button
          label={copy.delete}
          tone="ghost"
          onPress={() =>
            Alert.alert(copy.deleteTitle, copy.deleteBody(existing.description), [
              { text: copy.cancel, style: "cancel" },
              {
                text: copy.delete,
                style: "destructive",
                onPress: () => {
                  void remove.mutateAsync(existing.id).then(() => router.back());
                },
              },
            ])
          }
        />
      ) : null}
    </ScrollView>
  );
}

function amountToText(amountMinor: number, currency: CurrencyCode): string {
  if (currency === "USD") return (amountMinor / 100).toFixed(2);
  return String(amountMinor);
}
