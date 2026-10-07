import { usePalette } from "@/components/ui/usePalette";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from "react-native-svg";

// Emerald to night gradient, an amber bloom top right, and faint contour rings. Decorative only.
export function HeroBackdrop() {
  const colors = usePalette();
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      {...(Platform.OS === "web"
        ? { "aria-hidden": true }
        : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const })}
    >
      <LinearGradient
        colors={[colors.heroTop, colors.heroMid, colors.heroBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} viewBox="0 0 400 400" preserveAspectRatio="xMidYMin slice">
        <Defs>
          <RadialGradient id="bloom" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
            <Stop offset="0" stopColor={colors.bloom} stopOpacity={0.9} />
            <Stop offset="0.55" stopColor={colors.bloom} stopOpacity={0.28} />
            <Stop offset="1" stopColor={colors.bloom} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={170} y={-150} width={400} height={400} fill="url(#bloom)" />
        {[70, 120, 175, 235, 300].map((radius) => (
          <Circle
            key={radius}
            cx={30}
            cy={330}
            r={radius}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity={0.07}
            strokeWidth={1}
          />
        ))}
      </Svg>
    </View>
  );
}
