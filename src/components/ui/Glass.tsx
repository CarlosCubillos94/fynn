import { usePalette } from "@/components/ui/usePalette";
import { BlurView } from "expo-blur";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { useEffect, useState, type ReactNode } from "react";
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

function useReduceTransparency(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.()
      .then((value) => {
        if (active) setReduce(value);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

function liquidGlass(): boolean {
  if (Platform.OS !== "ios") return false;
  try {
    return isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

// Real Liquid Glass on iOS 26, system blur elsewhere on iOS and web, a tinted solid when
// transparency is reduced or unavailable. Content sits on top and stays fully legible.
export function Glass({
  children,
  radius = 28,
  style,
  tint = "dark",
}: {
  children?: ReactNode;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  tint?: "dark" | "light";
}) {
  const colors = usePalette();
  const reduceTransparency = useReduceTransparency();
  const base: ViewStyle = { borderRadius: radius, overflow: "hidden" };
  const solid = tint === "dark" ? "rgba(6,20,15,0.72)" : colors.surface;

  if (reduceTransparency || Platform.OS === "android") {
    return (
      <View
        style={[
          base,
          { backgroundColor: solid, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassEdge },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (liquidGlass()) {
    return (
      <GlassView
        glassEffectStyle="regular"
        colorScheme={tint}
        tintColor={colors.glassTint}
        style={[base, { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassEdge }, style]}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      intensity={Platform.OS === "web" ? 40 : 55}
      tint={tint === "dark" ? "dark" : "light"}
      style={[
        base,
        { backgroundColor: colors.glassTint, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glassEdge },
        style,
      ]}
    >
      {children}
    </BlurView>
  );
}
