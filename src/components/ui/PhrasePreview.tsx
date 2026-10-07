import { Ribbon } from "@/components/ui/Ribbon";
import { formatMoney } from "@/domain/money";
import type { PhraseDraft } from "@/domain/types";
import { seriesColor } from "@/theme/palette";
import { Text } from "@/components/ui/Text";
import { View } from "react-native";

export function PhrasePreview({
  draft,
  color = "#10211C",
  muted = "#3C564C",
  categoryLabel,
  incomeColor,
}: {
  draft: PhraseDraft;
  color?: string;
  muted?: string;
  categoryLabel?: string;
  incomeColor?: string;
}) {
  return (
    <View accessibilityRole="summary" className="flex-row items-center gap-3">
      <Ribbon color={seriesColor[draft.categoryId] ?? muted} />
      <View className="flex-1 flex-row flex-wrap items-baseline gap-2">
        <Text style={{ color, fontSize: 20, fontWeight: "600" }}>{draft.description}</Text>
        <Text style={{ color: muted, fontSize: 17 }}>{categoryLabel ?? draft.categoryName}</Text>
        <Text
          style={{
            color: draft.direction === "income" && incomeColor ? incomeColor : color,
            fontSize: 20,
            fontWeight: "600",
            fontVariant: ["tabular-nums"],
          }}
        >
          {draft.direction === "income" ? "+" : ""}
          {formatMoney(draft.amountMinor, draft.currency)}
        </Text>
      </View>
    </View>
  );
}
