import { usePalette } from "@/components/ui/usePalette";
import { TransactionListScreen } from "@/features/transactions/TransactionListScreen";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Platform, Pressable, View } from "react-native";

export default function TransactionsRoute() {
  const colors = usePalette();
  const router = useRouter();
  return (
    <View className="flex-1">
      <TransactionListScreen />
      {Platform.OS === "android" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add"
          onPress={() => router.push("/add")}
          className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center"
          style={{ backgroundColor: colors.coin, borderRadius: 16 }}
        >
          <Text style={{ color: colors.onCoin, fontSize: 28, lineHeight: 32 }}>+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
