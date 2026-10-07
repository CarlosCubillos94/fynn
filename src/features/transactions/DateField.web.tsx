import { Field } from "@/components/ui/Field";
import { useCopy } from "@/i18n/copy";

export function DateField({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const copy = useCopy();
  return (
    <Field
      label={copy.date}
      value={value}
      onChangeText={onChange}
      autoCapitalize="none"
      accessibilityHint={copy.dateHint}
    />
  );
}
