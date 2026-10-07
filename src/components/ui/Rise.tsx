import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { useEffect, type ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

// One-time entrance on mount: opacity and a short rise, staggered by index. No scale, no loop.
export function Rise({
  children,
  index = 0,
  distance = 10,
  duration = 320,
  style,
}: {
  children: ReactNode;
  index?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReduceMotion();
  const progress = useSharedValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(index * 50, withTiming(1, { duration, easing: easeOut }));
  }, [duration, index, progress, reduce]);

  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }));

  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}
