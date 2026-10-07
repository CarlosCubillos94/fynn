import { formatMoney } from "@/domain/money";
import type { CurrencyCode } from "@/domain/types";
import { useCopy } from "@/i18n/copy";
import { Ribbon } from "@/components/ui/Ribbon";
import { seriesColor } from "@/theme/palette";
import { usePalette } from "@/components/ui/usePalette";
import { Text } from "@/components/ui/Text";
import { Platform, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";

export function Donut({
  slices,
  currency,
}: {
  slices: { categoryId: string; amountMinor: number }[];
  currency: CurrencyCode;
}) {
  const colors = usePalette();
  const copy = useCopy();
  const total = slices.reduce((sum, slice) => sum + slice.amountMinor, 0);
  const size = 112;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  if (total <= 0) {
    return <Text style={{ color: colors.muted, fontSize: 16 }}>{copy.noExpenses(currency)}</Text>;
  }

  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1 gap-2" accessibilityRole="summary">
        {slices.map((slice) => {
          const name = copy.categoryName(slice.categoryId);
          const percent = Math.round((slice.amountMinor / total) * 100);
          return (
            <View key={slice.categoryId} className="flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                <Ribbon color={seriesColor[slice.categoryId] ?? colors.muted} />
                <Text style={{ color: colors.ink, fontSize: 16 }}>{name}</Text>
                <Text style={{ color: colors.muted, fontSize: 16, fontVariant: ["tabular-nums"] }}>{percent}%</Text>
              </View>
              <Text style={{ color: colors.ink, fontVariant: ["tabular-nums"], fontSize: 16 }}>
                {formatMoney(slice.amountMinor, currency)}
              </Text>
            </View>
          );
        })}
      </View>
      <View>
        <Svg
          width={size}
          height={size}
          {...(Platform.OS === "web" ? { "aria-hidden": true } : { accessibilityElementsHidden: true })}
        >
          {slices.map((slice, index) => {
            const before = slices
              .slice(0, index)
              .reduce((sum, item) => sum + item.amountMinor, 0);
            const length = (slice.amountMinor / total) * circumference;
            const dashOffset = (before / total) * circumference;
            return (
              <Circle
                key={slice.categoryId}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seriesColor[slice.categoryId] ?? colors.muted}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-dashOffset}
                rotation={-90}
                origin={`${size / 2}, ${size / 2}`}
              />
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

export function Trend({
  points,
  currency,
}: {
  points: { month: string; label: string; amountMinor: number }[];
  currency: CurrencyCode;
}) {
  const colors = usePalette();
  const copy = useCopy();
  const width = 320;
  const height = 88;
  const max = Math.max(...points.map((point) => point.amountMinor), 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const poly = points
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.amountMinor / max) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View className="gap-3">
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        {...(Platform.OS === "web" ? { "aria-hidden": true } : { accessibilityElementsHidden: true })}
      >
        <Polyline points={poly} fill="none" stroke={colors.ink} strokeWidth={3} strokeLinejoin="round" />
      </Svg>
      <View className="flex-row justify-between">
        {points.map((point) => (
          <Text key={point.month} style={{ color: colors.muted, fontSize: 12 }}>
            {point.label}
          </Text>
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 14 }}>
        {points.at(-1)
          ? copy.monthExpenses(points.at(-1)?.label ?? "", formatMoney(points.at(-1)?.amountMinor ?? 0, currency))
          : copy.noMonths}
      </Text>
    </View>
  );
}
