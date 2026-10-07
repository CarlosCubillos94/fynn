import { usePalette } from "@/components/ui/usePalette";
import { useCopy } from "@/i18n/copy";
import { isoDate, parseIsoDate } from "@/domain/dates";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Text } from "@/components/ui/Text";
import { Platform, Pressable, View } from "react-native";

export function DateField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const colors = usePalette();
  const copy = useCopy();
  const [open, setOpen] = useState(Platform.OS === "ios");
  const date = parseIsoDate(value);

  return (
    <View className="gap-2">
      <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "600" }}>{copy.date}</Text>
      {Platform.OS === "android" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.changeDate}
          onPress={() => setOpen(true)}
          className="min-h-12 justify-center px-3"
          style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}
        >
          <Text style={{ color: colors.ink, fontSize: 17 }}>{value}</Text>
        </Pressable>
      ) : null}
      {open ? (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_event, next) => {
            if (Platform.OS === "android") setOpen(false);
            if (next) onChange(isoDate(next));
          }}
        />
      ) : null}
    </View>
  );
}
