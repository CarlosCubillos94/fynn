import { usePalette } from "@/components/ui/usePalette";
import { Text } from "@/components/ui/Text";
import { Pressable, View } from "react-native";

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const colors = usePalette();
  return (
    <View className="gap-2" accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              onPress={() => onChange(option.value)}
              className="min-h-12 items-center justify-center px-4"
              style={{
                borderRadius: 12,
                backgroundColor: selected ? colors.pine : colors.surface,
                borderWidth: 1,
                borderColor: selected ? colors.pine : colors.line,
              }}
            >
              <Text style={{ color: selected ? colors.onPine : colors.ink, fontSize: 16 }}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
