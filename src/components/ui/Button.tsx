import { usePalette } from "@/components/ui/usePalette";
import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { Text } from "@/components/ui/Text";
import { Pressable } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

function setScale(scale: { value: number }, to: number) {
  scale.value = withTiming(to, { duration: 160, easing: easeOut });
}

type Tone = "coin" | "pine" | "bone" | "ghost";

export function Button({
  label,
  onPress,
  tone = "pine",
  disabled = false,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  tone?: Tone;
  disabled?: boolean;
  compact?: boolean;
}) {
  const colors = usePalette();
  const reduce = useReduceMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const background =
    tone === "coin" ? colors.coin : tone === "bone" ? colors.onBand : tone === "pine" ? colors.pine : "transparent";
  const foreground =
    tone === "coin" ? colors.onCoin : tone === "bone" ? colors.band : tone === "pine" ? colors.onPine : colors.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{ alignSelf: tone === "ghost" || compact ? "flex-start" : "stretch" }}
      onPressIn={() => {
        if (!reduce) setScale(scale, 0.97);
      }}
      onPressOut={() => {
        setScale(scale, 1);
      }}
    >
      <Animated.View
        className={compact ? "min-h-11 items-center justify-center px-5" : "min-h-12 items-center justify-center px-4"}
        style={[
          { backgroundColor: background, opacity: disabled ? 0.45 : 1, borderRadius: compact ? 999 : 12 },
          animated,
        ]}
      >
        <Text style={{ color: foreground, fontSize: 17, fontWeight: "600" }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}
