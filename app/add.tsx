import { usePalette } from "@/components/ui/usePalette";
import { AddScreen } from "@/features/transactions/AddScreen";
import { Stack } from "expo-router";

export default function AddRoute() {
  const colors = usePalette();
  return (
    <>
      <Stack.Screen
        options={{
          title: "Add",
          headerShown: true,
          headerStyle: { backgroundColor: colors.ground },
          headerTintColor: colors.ink,
          headerShadowVisible: false,
        }}
      />
      <AddScreen />
    </>
  );
}
