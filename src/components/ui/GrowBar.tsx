import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);

// A horizontal comparison bar with no background track. Its length is the value; the draw-in
// shows which side is larger and runs once. Under Reduce Motion it is simply there.
export function GrowBar({
  ratio,
  color,
  height = 10,
  delay = 0,
}: {
  ratio: number;
  color: string;
  height?: number;
  delay?: number;
}) {
  const reduce = useReduceMotion();
  const progress = useSharedValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(delay, withTiming(1, { duration: 560, easing: easeOut }));
  }, [delay, progress, reduce]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  const clamped = ratio <= 0 ? 0 : Math.min(1, Math.max(ratio, 0.02));

  return (
    <View style={{ height, width: "100%" }}>
      <Animated.View
        style={[
          {
            height,
            width: `${clamped * 100}%`,
            borderRadius: height / 2,
            backgroundColor: color,
            transformOrigin: "left center",
          },
          animated,
        ]}
      />
    </View>
  );
}
