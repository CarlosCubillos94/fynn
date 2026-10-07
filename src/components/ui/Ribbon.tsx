import { Platform, View } from "react-native";

export function Ribbon({ color }: { color: string }) {
  return (
    <View
      {...(Platform.OS === "web"
        ? { "aria-hidden": true }
        : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const })}
      style={{ width: 28, height: 8, borderRadius: 2, backgroundColor: color }}
    />
  );
}
