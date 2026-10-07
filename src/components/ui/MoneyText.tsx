import { formatSigned } from "@/domain/money";
import type { CurrencyCode, Direction } from "@/domain/types";
import { Text } from "@/components/ui/Text";
import { usePalette } from "@/components/ui/usePalette";
import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { useEffect, useRef } from "react";
import { type TextStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export function MoneyText({
  amountMinor,
  currency,
  direction,
  tone = "ink",
  size = 17,
}: {
  amountMinor: number;
  currency: CurrencyCode;
  direction?: Direction;
  tone?: "ink" | "in" | "out" | "onPine" | "onBand";
  size?: number;
}) {
  const colors = usePalette();
  const reduce = useReduceMotion();
  const opacity = useSharedValue(1);
  const shift = useSharedValue(0);
  const seen = useRef(false);
  const color =
    tone === "in"
      ? colors.income
      : tone === "out"
        ? colors.expense
        : tone === "onBand"
          ? colors.onBand
          : tone === "onPine"
            ? colors.onPine
            : colors.ink;
  const display = size >= 64;
  const style: TextStyle = {
    color,
    fontSize: size,
    fontWeight: display ? "400" : size >= 28 ? "600" : "500",
    fontVariant: ["tabular-nums"],
    letterSpacing: display ? -1 : 0,
  };
  const label = formatSigned(amountMinor, currency, direction);
  useEffect(() => {
    if (!seen.current) {
      seen.current = true;
      return;
    }
    if (reduce || !display) return;
    opacity.value = 0.4;
    shift.value = 8;
    opacity.value = withTiming(1, { duration: 180, easing: Easing.bezier(0.23, 1, 0.32, 1) });
    shift.value = withTiming(0, { duration: 180, easing: Easing.bezier(0.23, 1, 0.32, 1) });
  }, [display, label, opacity, reduce, shift]);
  const motion = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: shift.value }],
  }));
  return (
    <Animated.View style={display ? motion : undefined}>
      <Text
        display={display}
        style={style}
        accessibilityLabel={label}
        numberOfLines={display ? 1 : undefined}
        adjustsFontSizeToFit={display}
        minimumFontScale={display ? 0.55 : undefined}
        maxFontSizeMultiplier={display ? 1.5 : 1.6}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
