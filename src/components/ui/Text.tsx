import { Text as NativeText, type TextProps } from "react-native";

export function Text({ style, display, ...props }: TextProps & { display?: boolean }) {
  return (
    <NativeText
      {...props}
      style={[
        style,
        display ? { fontFamily: "BarlowCondensed_800ExtraBold", fontWeight: "400" } : null,
      ]}
    />
  );
}
