import { usePalette } from "@/components/ui/usePalette";
import { SettingsScreen } from "@/features/auth/SettingsScreen";
import { Stack } from "expo-router";

export default function SettingsRoute() {
  const colors = usePalette();
  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
          headerShown: true,
          headerStyle: { backgroundColor: colors.ground },
          headerTintColor: colors.ink,
          headerShadowVisible: false,
        }}
      />
      <SettingsScreen />
    </>
  );
}
