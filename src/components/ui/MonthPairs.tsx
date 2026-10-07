import { Text } from "@/components/ui/Text";
import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const WIDTH = 320;
const HEIGHT = 120;

export type MonthPair = { month: string; label: string; income: number; expense: number };

// Income and spending side by side for each month. Bars share one scale and have no track.
// Month labels sit under the plot so they never stretch with it.
export function MonthPairs({
  points,
  incomeColor,
  expenseColor,
  labelColor,
  summary,
}: {
  points: MonthPair[];
  incomeColor: string;
  expenseColor: string;
  labelColor: string;
  summary: string;
}) {
  const reduce = useReduceMotion();
  const grow = useSharedValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce) {
      grow.value = 1;
      return;
    }
    grow.value = withDelay(120, withTiming(1, { duration: 640, easing: easeOut }));
  }, [grow, reduce]);

  const animated = useAnimatedStyle(() => ({ transform: [{ scaleY: grow.value }] }));
  const max = Math.max(1, ...points.flatMap((point) => [point.income, point.expense]));
  const slot = WIDTH / Math.max(points.length, 1);
  const barWidth = 15;
  const gap = 4;

  const rect = (value: number, x: number, color: string, key: string) => {
    if (value <= 0) return null;
    const h = Math.max(3, (value / max) * (HEIGHT - 4));
    return <Rect key={key} x={x} y={HEIGHT - h} width={barWidth} height={h} rx={3} fill={color} />;
  };

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={summary}>
      <Animated.View style={[{ transformOrigin: "center bottom" }, animated]}>
        <Svg
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          {...(Platform.OS === "web" ? { "aria-hidden": true } : {})}
        >
          {points.map((point, index) => {
            const start = index * slot + (slot - (barWidth * 2 + gap)) / 2;
            return [
              rect(point.income, start, incomeColor, `${point.month}-in`),
              rect(point.expense, start + barWidth + gap, expenseColor, `${point.month}-out`),
            ];
          })}
        </Svg>
      </Animated.View>
      <View className="mt-2 flex-row">
        {points.map((point) => (
          <View key={point.month} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ color: labelColor, fontSize: 12 }}>{point.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
