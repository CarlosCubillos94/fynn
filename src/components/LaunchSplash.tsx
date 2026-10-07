import { Text } from "@/components/ui/Text";
import { useReduceMotion } from "@/components/ui/useReduceMotion";
import { lightPalette } from "@/theme/palette";
import { useEffect } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

// These must match scripts/brand-assets.mjs, which draws the native launch image this continues.
const IMAGE_W = 1290;
const IMAGE_H = 2796;
const MARK_SCALE = 5.6;
// The dot of the mark, in the mark's own 100 unit grid, and the bottom edge of the F.
const DOT = { x: 31, y: 78, r: 7 };
const MARK_BOTTOM = 85;

const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
const launchImage = require("../../assets/images/splash-ios.png");

// Picks up exactly where the native launch image stops: same picture, same crop. Once the app is
// ready the citrus dot drops into place (the "accepted" moment of the product), a single ring
// pulses out from it, the name fades in, and the whole layer lifts away. About a second in total.
// Under Reduce Motion it never appears at launch, but it does when the user asks to replay it.
export function LaunchSplash({
  start,
  onReady,
  onDone,
  replay = false,
}: {
  start: boolean;
  replay?: boolean;
  onReady: () => void;
  onDone: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const reduce = useReduceMotion();
  const drop = useSharedValue(0);
  const ring = useSharedValue(0);
  const name = useSharedValue(0);
  const layer = useSharedValue(1);

  useEffect(() => {
    if (!start) return;
    if (reduce && !replay) {
      onDone();
      return;
    }
    drop.value = withTiming(1, { duration: 360, easing: easeOut });
    ring.value = withDelay(320, withTiming(1, { duration: 560, easing: easeOut }));
    name.value = withDelay(260, withTiming(1, { duration: 320, easing: easeOut }));
    layer.value = withDelay(
      1050,
      withTiming(0, { duration: 320, easing: easeOut }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [start, reduce, replay, drop, ring, name, layer, onDone]);

  const k = Math.max(width / IMAGE_W, height / IMAGE_H);
  const unit = MARK_SCALE * k;
  const diameter = DOT.r * 2 * unit;
  const centerX = width / 2 + (DOT.x - 50) * unit;
  const centerY = height / 2 + (DOT.y - 50) * unit;
  const nameTop = height / 2 + (MARK_BOTTOM - 50) * unit + 28;

  const layerStyle = useAnimatedStyle(() => ({ opacity: layer.value }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: drop.value,
    transform: [{ translateY: (1 - drop.value) * -unit * 9 }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - ring.value) * 0.7,
    transform: [{ scale: 1 + ring.value * 1.8 }],
  }));
  const nameStyle = useAnimatedStyle(() => ({
    opacity: name.value,
    transform: [{ translateY: (1 - name.value) * 8 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: lightPalette.band }, layerStyle]}
    >
      <Image
        source={launchImage}
        resizeMode="cover"
        onLoad={onReady}
        onError={onReady}
        style={{ position: "absolute", left: 0, top: 0, width, height }}
      />
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={StyleSheet.absoluteFill}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: centerX - diameter / 2,
              top: centerY - diameter / 2,
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              borderWidth: 2,
              borderColor: lightPalette.coin,
            },
            ringStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: "absolute",
              left: centerX - diameter / 2,
              top: centerY - diameter / 2,
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: lightPalette.coin,
            },
            dotStyle,
          ]}
        />
        <Animated.View style={[{ position: "absolute", left: 0, right: 0, top: nameTop, alignItems: "center" }, nameStyle]}>
          <Text style={{ color: lightPalette.onBand, fontSize: 38, fontWeight: "700", letterSpacing: -0.8 }}>Fynn</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
