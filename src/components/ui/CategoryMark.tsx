import { seriesColor } from "@/theme/palette";
import { usePalette } from "@/components/ui/usePalette";
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
  salary: { ios: "banknote.fill", android: "payments", web: "payments" },
  freelance: { ios: "laptopcomputer", android: "laptop", web: "laptop" },
  "other-income": { ios: "plus.circle.fill", android: "add_circle", web: "add_circle" },
} as const;

export function CategoryMark({ categoryId, size = 36 }: { categoryId: string; size?: number }) {
  const colors = usePalette();
  const tint = seriesColor[categoryId] ?? colors.muted;
  const icon = ICONS[categoryId as keyof typeof ICONS] ?? ICONS.other;
  return (
    <View
      {...(Platform.OS === "web"
        ? { "aria-hidden": true }
        : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const })}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${tint}24`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SymbolView name={icon} tintColor={tint} size={Math.round(size * 0.46)} />
    </View>
  );
}
