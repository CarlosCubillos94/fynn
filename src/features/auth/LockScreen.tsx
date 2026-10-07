import { Button } from "@/components/ui/Button";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { Mark } from "@/components/ui/Mark";
import { usePalette } from "@/components/ui/usePalette";
import { useCopy } from "@/i18n/copy";
import { useSession } from "@/state/session";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "@/components/ui/Text";
import { View } from "react-native";

export function LockScreen() {
  const colors = usePalette();
  const copy = useCopy();
  const router = useRouter();
  const setUnlocked = useSession((state) => state.setUnlocked);
  const [error, setError] = useState<string | null>(null);

  async function unlock() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: copy.unlock,
      cancelLabel: copy.cancel,
    });
    if (!result.success) {
      setError(copy.unlockFailed);
      return;
    }
    setUnlocked(true);
    router.replace("/home");
  }

  return (
    <View className="flex-1 justify-between px-5 pb-12 pt-24" style={{ backgroundColor: colors.band, overflow: "hidden" }}>
      <HeroBackdrop />
      <View className="gap-4">
        <Mark size={96} color={colors.onBand} />
        <Text style={{ color: colors.onBand, fontSize: 40, fontWeight: "600" }}>{copy.lockedTitle}</Text>
        <Text style={{ color: colors.bandSoft, fontSize: 18 }}>{copy.lockedBody}</Text>
        {error ? <Text style={{ color: colors.bandSoft }}>{error}</Text> : null}
      </View>
      <Button label={copy.unlock} tone="bone" onPress={() => void unlock()} />
    </View>
  );
}
