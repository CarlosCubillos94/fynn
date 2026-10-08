import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Mark } from "@/components/ui/Mark";
import { usePalette } from "@/components/ui/usePalette";
import { getDatabase, readSettings, saveBudget, saveTransaction, writeSettings } from "@/db/database";
import { formatMoney, parseAmountInput } from "@/domain/money";
import { STARTER_KEPT_PERCENT, STARTER_SHARES, starterPlan } from "@/domain/starter";
import type { CurrencyCode } from "@/domain/types";
import { useCopy } from "@/i18n/copy";
import { openShortcutAutomation } from "@/services/shortcuts";
import { useSession } from "@/state/session";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/Text";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CURRENCIES: CurrencyCode[] = ["CLP", "USD"];

export function OnboardingScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const patch = useSession((state) => state.patch);
  const setUnlocked = useSession((state) => state.setUnlocked);
  const [step, setStep] = useState(0);
  const [incomeText, setIncomeText] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("CLP");
  const [lock, setLock] = useState(false);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const steps = Platform.OS === "ios" ? copy.onboarding : copy.onboarding.filter((item) => item.id !== "wallet");
  const current = steps[step];
  const incomeMinor = parseAmountInput(incomeText, currency);

  useEffect(() => {
    void Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]).then(
      ([hardware, enrolled]) => setAvailable(hardware && enrolled),
    );
  }, []);

  function goNext() {
    if (current.id === "income" && incomeMinor == null) {
      setError(copy.incomeMissing);
      return;
    }
    setError(null);
    setStep((value) => value + 1);
  }

  async function finish() {
    if (incomeMinor == null) {
      setStep(0);
      setError(copy.incomeMissing);
      return;
    }
    setError(null);
    if (lock) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: copy.unlock,
        cancelLabel: copy.cancel,
      });
      if (!result.success) {
        setError(copy.onboardingLockError);
        return;
      }
    }
    const db = await getDatabase();
    const plan = starterPlan(incomeMinor, currency, new Date(), copy.monthlyIncome);
    for (const transaction of plan.transactions) await saveTransaction(db, transaction);
    for (const budget of plan.budgets) await saveBudget(db, budget);
    const settings = await readSettings(db);
    const next = {
      ...settings,
      onboardingCompleted: true,
      biometricEnabled: lock,
      defaultCurrency: currency,
      sampleLedger: false,
    };
    await writeSettings(db, next);
    patch(next);
    setUnlocked(true);
    router.replace("/home");
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ backgroundColor: colors.ground }}
    >
      <View
        className="flex-1 justify-between px-5"
        style={{
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <ScrollView className="flex-1" contentContainerClassName="gap-8 pb-6" showsVerticalScrollIndicator={false}>
          <View className="flex-row gap-2" accessibilityLabel={`${step + 1} / ${steps.length}`}>
            {steps.map((item, index) => (
              <View
                key={item.id}
                style={{
                  height: 4,
                  flex: 1,
                  borderRadius: 2,
                  backgroundColor: index <= step ? colors.pine : colors.line,
                }}
              />
            ))}
          </View>
          <View className="flex-row items-center gap-1" accessibilityRole="header">
            <Mark size={64} color={colors.ink} accent={colors.heroTop} />
            <Text style={{ color: colors.ink, fontSize: 30, fontWeight: "700", letterSpacing: -0.5 }}>Fynn</Text>
          </View>
          <View className="gap-3">
            {current.lines.map((line) => (
              <Text key={line} style={{ color: colors.ink, fontSize: 34, fontWeight: "600", lineHeight: 40 }}>
                {line}
              </Text>
            ))}
            <Text style={{ color: colors.muted, fontSize: 17, lineHeight: 24, marginTop: 4 }}>{current.body}</Text>
          </View>
          {current.id === "income" ? (
            <View className="gap-4">
              <View className="flex-row gap-2">
                {CURRENCIES.map((code) => {
                  const selected = code === currency;
                  return (
                    <Pressable
                      key={code}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setCurrency(code);
                        setError(null);
                      }}
                      className="min-h-11 items-center justify-center px-4"
                      style={{
                        borderRadius: 999,
                        backgroundColor: selected ? colors.pine : colors.surface,
                      }}
                    >
                      <Text style={{ color: selected ? colors.onPine : colors.ink, fontSize: 16, fontWeight: "600" }}>
                        {code}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Field
                label={copy.incomeField}
                value={incomeText}
                onChangeText={(value) => {
                  setIncomeText(value);
                  setError(null);
                }}
                placeholder={copy.incomeHint}
                keyboardType={currency === "CLP" ? "number-pad" : "decimal-pad"}
                autoCorrect={false}
                error={incomeText.trim().length > 0 && incomeMinor == null ? copy.incomeMissing : error}
              />
              {incomeMinor != null ? (
                <Text style={{ color: colors.ink, fontSize: 28, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
                  {formatMoney(incomeMinor, currency)}
                </Text>
              ) : null}
            </View>
          ) : null}
          {current.id === "spend" && incomeMinor != null ? (
            <View className="gap-3">
              <PhraseSpecimen />
              <PlanPreview incomeMinor={incomeMinor} currency={currency} />
            </View>
          ) : null}
          {current.id === "wallet" ? <WalletSteps /> : null}
          {current.id === "lock" ? (
            <View
              className="flex-row items-center justify-between gap-4 px-4"
              style={{ backgroundColor: colors.surface, borderRadius: 16, minHeight: 64 }}
            >
              <Text style={{ color: colors.ink, fontSize: 17, flex: 1 }}>
                {available ? copy.lockSwitchOn : copy.lockSwitchOff}
              </Text>
              <Switch
                accessibilityLabel={copy.lockSwitchOn}
                value={lock}
                disabled={!available}
                onValueChange={setLock}
                trackColor={{ true: colors.pine, false: colors.line }}
              />
            </View>
          ) : null}
          {current.id !== "income" && error ? <Text style={{ color: colors.expense, fontSize: 15 }}>{error}</Text> : null}
        </ScrollView>
        <View className="gap-2">
          {step > 0 ? (
            <Button
              label={copy.back}
              tone="ghost"
              onPress={() => {
                setError(null);
                setStep((value) => value - 1);
              }}
            />
          ) : null}
          {step < steps.length - 1 ? (
            <Button label={copy.continue} onPress={goNext} disabled={current.id === "income" && incomeMinor == null} />
          ) : (
            <Button label={copy.openLedger} onPress={() => void finish()} />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function WalletSteps() {
  const colors = usePalette();
  const copy = useCopy();
  const [failed, setFailed] = useState(false);
  return (
    <View className="gap-3">
      <Button
        label={copy.openShortcuts}
        onPress={() => {
          void openShortcutAutomation().then((opened) => setFailed(!opened));
        }}
      />
      {failed ? <Text style={{ color: colors.expense, fontSize: 15 }}>{copy.openShortcutsFailed}</Text> : null}
      <View style={{ backgroundColor: colors.surface, borderRadius: 18, overflow: "hidden" }}>
        {copy.walletSteps.map((instruction, index) => (
          <View
            key={instruction}
            className="flex-row gap-3 px-4 py-3"
            style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.line }}
          >
            <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "600" }}>{index + 1}</Text>
            <Text style={{ color: colors.ink, fontSize: 16, lineHeight: 22, flex: 1 }}>{instruction}</Text>
          </View>
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 21 }}>{copy.walletNote}</Text>
    </View>
  );
}

function PhraseSpecimen() {
  const colors = usePalette();
  const copy = useCopy();
  return (
    <View className="gap-2 px-4 py-4" style={{ backgroundColor: colors.surface, borderRadius: 18 }}>
      <Text style={{ color: colors.muted, fontSize: 15 }}>uber 4500</Text>
      <View className="flex-row flex-wrap items-baseline gap-2">
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "600" }}>Uber</Text>
        <Text style={{ color: colors.muted, fontSize: 17 }}>{copy.categoryName("transport")}</Text>
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
          $4.500
        </Text>
      </View>
    </View>
  );
}

function PlanPreview({ incomeMinor, currency }: { incomeMinor: number; currency: CurrencyCode }) {
  const colors = usePalette();
  const copy = useCopy();
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 18, overflow: "hidden" }}>
      {STARTER_SHARES.map((share, index) => (
        <View
          key={share.categoryId}
          className="flex-row items-center justify-between gap-3 px-4 py-3"
          style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.line }}
        >
          <Text style={{ color: colors.ink, fontSize: 16, flex: 1 }}>{copy.categoryName(share.categoryId)}</Text>
          <Text style={{ color: colors.muted, fontSize: 15 }}>{share.percent}%</Text>
          <Text style={{ color: colors.ink, fontSize: 16, fontVariant: ["tabular-nums"] }}>
            {formatMoney(Math.floor((incomeMinor * share.percent) / 100), currency)}
          </Text>
        </View>
      ))}
      <View className="px-4 py-3" style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
        <Text style={{ color: colors.muted, fontSize: 15 }}>{copy.keptAside(STARTER_KEPT_PERCENT)}</Text>
      </View>
    </View>
  );
}
