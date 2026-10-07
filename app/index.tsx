import { useSession } from "@/state/session";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Gate() {
  const ready = useSession((state) => state.ready);
  const onboardingCompleted = useSession((state) => state.onboardingCompleted);
  const biometricEnabled = useSession((state) => state.biometricEnabled);
  const unlocked = useSession((state) => state.unlocked);

  if (!ready) return <View />;
  if (!onboardingCompleted) return <Redirect href="/onboarding" />;
  if (biometricEnabled && !unlocked) return <Redirect href="/lock" />;
  return <Redirect href="/home" />;
}
