import { Button } from "@/components/ui/Button";
import { Choice } from "@/components/ui/Choice";
import { usePalette } from "@/components/ui/usePalette";
import type { CurrencyCode, ThemeMode } from "@/domain/types";
import { getDatabase, readSettings, resetLedger, writeSettings } from "@/db/database";
import { useClearSample, useRestoreSample } from "@/db/hooks";
import { useCopy } from "@/i18n/copy";
import { openShortcutAutomation } from "@/services/shortcuts";
import { queryClient } from "@/state/queryClient";
import { useSession } from "@/state/session";
import { useSplashReplay } from "@/state/splash";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "@/components/ui/Text";
import { Alert, Platform, ScrollView, Switch, View } from "react-native";

export function SettingsScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const theme = useSession((state) => state.theme);
  const biometricEnabled = useSession((state) => state.biometricEnabled);
  const defaultCurrency = useSession((state) => state.defaultCurrency);
  const sampleLedger = useSession((state) => state.sampleLedger);
  const patch = useSession((state) => state.patch);
  const setUnlocked = useSession((state) => state.setUnlocked);
  const setViewCurrency = useSession((state) => state.setViewCurrency);
  const router = useRouter();
  const replaySplash = useSplashReplay((state) => state.replay);
  const clear = useClearSample();
  const restore = useRestoreSample();
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]).then(
      ([hardware, enrolled]) => setAvailable(hardware && enrolled),
    );
  }, []);

  async function update(partial: Partial<{ theme: ThemeMode; biometricEnabled: boolean; defaultCurrency: CurrencyCode; sampleLedger: boolean }>) {
    const db = await getDatabase();
    const current = await readSettings(db);
    const next = { ...current, ...partial };
    await writeSettings(db, next);
    patch(next);
    if (partial.defaultCurrency) setViewCurrency(partial.defaultCurrency);
  }

  function confirmReset() {
    Alert.alert(copy.resetConfirmTitle, copy.resetConfirmBody, [
      { text: copy.cancel, style: "cancel" },
      {
        text: copy.resetConfirm,
        style: "destructive",
        onPress: () => {
          void resetApp();
        },
      },
    ]);
  }

  async function resetApp() {
    setError(null);
    try {
      const db = await getDatabase();
      await resetLedger(db);
      await queryClient.invalidateQueries();
      patch({
        onboardingCompleted: false,
        biometricEnabled: false,
        sampleLedger: false,
        defaultCurrency: "CLP",
      });
      setViewCurrency("CLP");
      setUnlocked(true);
      router.replace("/onboarding");
    } catch {
      setError(copy.resetFailed);
    }
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.ground }} contentContainerClassName="gap-8 px-5 pb-16 pt-6">
      <Choice
        label={copy.appearance}
        value={theme}
        options={[
          { value: "system", label: copy.system },
          { value: "light", label: copy.light },
          { value: "dark", label: copy.dark },
        ]}
        onChange={(value) => void update({ theme: value as ThemeMode })}
      />
      <Choice
        label={copy.defaultCurrency}
        value={defaultCurrency}
        options={[
          { value: "CLP", label: "CLP" },
          { value: "USD", label: "USD" },
        ]}
        onChange={(value) => void update({ defaultCurrency: value as CurrencyCode })}
      />
      <View className="flex-row items-center justify-between gap-4">
        <Text style={{ color: colors.ink, fontSize: 17, flex: 1 }}>
          {available ? copy.biometrics : copy.biometricsMissing}
        </Text>
        <Switch
          accessibilityLabel={copy.biometrics}
          value={biometricEnabled}
          disabled={!available}
          trackColor={{ true: colors.pine, false: colors.line }}
          onValueChange={(enabled) => {
            setError(null);
            if (!enabled) {
              void update({ biometricEnabled: false });
              return;
            }
            void LocalAuthentication.authenticateAsync({ promptMessage: copy.unlock, cancelLabel: copy.cancel }).then(
              (result) => {
                if (!result.success) {
                  setError(copy.lockStaysOff);
                  return;
                }
                void update({ biometricEnabled: true });
              },
            );
          }}
        />
      </View>
      <View className="gap-3">
        <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "600" }}>{copy.sampleTitle}</Text>
        <Text style={{ color: colors.muted, fontSize: 16 }}>{sampleLedger ? copy.sampleOn : copy.sampleOff}</Text>
        {sampleLedger ? (
          <Button
            label={copy.removeSample}
            tone="ghost"
            onPress={() => {
              void clear.mutateAsync().then(() => patch({ sampleLedger: false }));
            }}
          />
        ) : (
          <Button
            label={copy.restoreSample}
            tone="pine"
            onPress={() => {
              void restore.mutateAsync().then(() => patch({ sampleLedger: true }));
            }}
          />
        )}
      </View>
      {Platform.OS === "ios" ? (
        <View className="gap-3">
          <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "600" }}>{copy.walletTitle}</Text>
          <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>{copy.walletIntro}</Text>
          <Button
            label={copy.openShortcuts}
            onPress={() => {
              void openShortcutAutomation().then((opened) => {
                setError(opened ? null : copy.openShortcutsFailed);
              });
            }}
          />
          {copy.walletSteps.map((step, index) => (
            <Text key={step} style={{ color: colors.ink, fontSize: 16, lineHeight: 23 }}>
              {index + 1}. {step}
            </Text>
          ))}
          <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{copy.walletNote}</Text>
        </View>
      ) : null}
      {Platform.OS !== "web" ? <Button label={copy.replaySplash} tone="ghost" onPress={replaySplash} /> : null}
      <View className="gap-3">
        <Text style={{ color: colors.ink, fontSize: 18, fontWeight: "600" }}>{copy.resetApp}</Text>
        <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 23 }}>{copy.resetAppBody}</Text>
        <Button label={copy.resetApp} tone="ghost" onPress={confirmReset} />
      </View>
      {error ? <Text style={{ color: colors.expense }}>{error}</Text> : null}
    </ScrollView>
  );
}
