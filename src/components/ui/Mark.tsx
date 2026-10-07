import { Circle, Path, Rect, Svg } from "react-native-svg";

// The Fynn mark: an F built from two ribbons on a stem, ending in the accepted dot.
// Keep in sync with scripts/brand-assets.mjs, which renders the app icon from the same geometry.
export function Mark({
  size = 44,
  color,
  accent = "#F2E94E",
}: {
  size?: number;
  color: string;
  accent?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden>
      <Path d="M24 15H69A7 7 0 0 1 69 29H24Z" fill={color} />
      <Path d="M24 43H53A7 7 0 0 1 53 57H24Z" fill={color} />
      <Rect x={24} y={15} width={14} height={49} fill={color} />
      <Circle cx={31} cy={78} r={7} fill={accent} />
    </Svg>
  );
}
