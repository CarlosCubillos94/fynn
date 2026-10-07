import { usePalette } from "@/components/ui/usePalette";
import { useCopy } from "@/i18n/copy";
import { Link, Stack } from "expo-router";
import { Text } from "@/components/ui/Text";
import { View } from "react-native";

export default function NotFound() {
  const colors = usePalette();
  const copy = useCopy();
  return (
    <>
      <Stack.Screen options={{ title: copy.notFoundTitle }} />
      <View className="flex-1 items-start justify-center px-5" style={{ backgroundColor: colors.ground }}>
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "600" }}>{copy.notFoundBody}</Text>
        <Link href="/home" style={{ color: colors.pine, fontSize: 17, marginTop: 16 }}>
          {copy.goHome}
        </Link>
      </View>
    </>
  );
}
