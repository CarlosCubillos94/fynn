import { usePalette } from "@/components/ui/usePalette";
import { Text } from "@/components/ui/Text";
import { TextInput, View, type TextInputProps } from "react-native";

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string | null }) {
  const colors = usePalette();
  return (
    <View className="gap-2">
      <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.pine}
        accessibilityLabel={label}
        className="min-h-12 px-3"
        style={{
          color: colors.ink,
          backgroundColor: colors.surface,
          borderColor: error ? colors.expense : colors.line,
          borderWidth: 1,
          borderRadius: 12,
          fontSize: 17,
        }}
        {...props}
      />
      {error ? (
        <Text style={{ color: colors.expense, fontSize: 14 }} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
