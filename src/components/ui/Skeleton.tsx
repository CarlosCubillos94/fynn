import { usePalette } from "@/components/ui/usePalette";
import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

export function Skeleton({ height = 72 }: { height?: number }) {
  const colors = usePalette();
  const reduce = useReduceMotion();
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    if (reduce) return;
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity, reduce]);

  const animated = useAnimatedStyle(() => ({ opacity: reduce ? 0.7 : opacity.value }));

  return (
    <View className="px-5">
      <Animated.View style={[{ height, borderRadius: 12, backgroundColor: colors.line }, animated]} />
    </View>
  );
}
