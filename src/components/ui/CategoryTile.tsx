import { Text } from "@/components/ui/Text";
import { readableOn, seriesColor } from "@/theme/palette";
import { SymbolView } from "expo-symbols";
import { Platform, View } from "react-native";

const ICONS = {
  food: { ios: "fork.knife", android: "restaurant", web: "restaurant" },
  transport: { ios: "car.fill", android: "directions_car", web: "directions_car" },
  home: { ios: "house.fill", android: "home", web: "home" },
  health: { ios: "cross.case.fill", android: "medical_services", web: "medical_services" },
  subscriptions: { ios: "repeat", android: "repeat", web: "repeat" },
  fun: { ios: "ticket.fill", android: "confirmation_number", web: "confirmation_number" },
  shopping: { ios: "bag.fill", android: "shopping_bag", web: "shopping_bag" },
  other: { ios: "square.grid.2x2.fill", android: "grid_view", web: "grid_view" },
} as const;

// A saturated block per category: icon, name, share and amount. Text color is picked for contrast.
export function CategoryTile({
  categoryId,
  name,
  percent,
  amount,
}: {
  categoryId: string;
  name: string;
  percent: number;
  amount: string;
}) {
  const background = seriesColor[categoryId] ?? "#8A8478";
  const foreground = readableOn(background);
  const icon = ICONS[categoryId as keyof typeof ICONS] ?? ICONS.other;
  return (
    <View
      accessible
      accessibilityLabel={`${name}, ${percent}%, ${amount}`}
      style={{ flex: 1, backgroundColor: background, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 12, gap: 6 }}
    >
      <View
        {...(Platform.OS === "web"
          ? { "aria-hidden": true }
          : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const })}
      >
        <SymbolView name={icon} tintColor={foreground} size={20} />
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ color: foreground, fontSize: 13 }}>
        {name}
      </Text>
      <Text style={{ color: foreground, fontSize: 24, fontWeight: "600", fontVariant: ["tabular-nums"] }}>
        {percent}%
      </Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={{ color: foreground, fontSize: 13, fontVariant: ["tabular-nums"] }}
      >
        {amount}
      </Text>
    </View>
  );
}
