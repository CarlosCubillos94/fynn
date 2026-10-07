import { Button } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Mark";
import { usePalette } from "@/components/ui/usePalette";
import { writeSettings, getDatabase, readSettings } from "@/db/database";
import { useCopy } from "@/i18n/copy";
import { useSession } from "@/state/session";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/Text";
import { Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OnboardingScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const patch = useSession((state) => state.patch);
  const setUnlocked = useSession((state) => state.setUnlocked);
  const [step, setStep] = useState(0);
  const [lock, setLock] = useState(false);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const steps = copy.onboarding;
  const current = steps[step];

  useEffect(() => {
    void Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]).then(
      ([hardware, enrolled]) => setAvailable(hardware && enrolled),
    );
  }, []);

  async function finish() {
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
    const settings = await readSettings(db);
    const next = { ...settings, onboardingCompleted: true, biometricEnabled: lock };
    await writeSettings(db, next);
    patch(next);
    setUnlocked(true);
    router.replace("/home");
  }

  return (
    <View
      className="flex-1 justify-between px-5"
      style={{
        backgroundColor: colors.ground,
        paddingTop: insets.top + 20,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      <View className="gap-8">
        <View className="flex-row gap-2" accessibilityLabel={`${step + 1} of ${steps.length}`}>
          {steps.map((item, index) => (
            <View
              key={item.lines[0]}
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
        {step === 0 ? <PhraseSpecimen /> : null}
        {step === 1 ? <LedgerFacts /> : null}
        {step === 2 ? (
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
        {error ? <Text style={{ color: colors.expense, fontSize: 15 }}>{error}</Text> : null}
      </View>
      <View className="gap-2">
        {step > 0 ? <Button label={copy.back} tone="ghost" onPress={() => setStep((value) => value - 1)} /> : null}
        {step < steps.length - 1 ? (
          <Button label={copy.continue} onPress={() => setStep((value) => value + 1)} />
        ) : (
          <Button label={copy.openLedger} onPress={() => void finish()} />
        )}
      </View>
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

function LedgerFacts() {
  const colors = usePalette();
  const copy = useCopy();
  const facts = [
    [copy.factPhone, copy.factPhoneBody],
    [copy.factCurrency, copy.factCurrencyBody],
  ];
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 18, overflow: "hidden" }}>
      {facts.map(([title, body], index) => (
        <View
          key={title}
          className="gap-1 px-4 py-4"
          style={{ borderTopWidth: index === 0 ? 0 : 1, borderTopColor: colors.line }}
        >
          <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "600" }}>{title}</Text>
          <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 21 }}>{body}</Text>
        </View>
      ))}
    </View>
  );
}
