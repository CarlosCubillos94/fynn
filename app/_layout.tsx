import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { LaunchSplash } from "@/components/LaunchSplash";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { usePalette } from "@/components/ui/usePalette";
import { getDatabase, readSettings, resetDatabase } from "@/db/database";
import { useCopy } from "@/i18n/copy";
import { queryClient } from "@/state/queryClient";
import { useSplashReplay } from "@/state/splash";
import { useSession } from "@/state/session";
import { BarlowCondensed_800ExtraBold } from "@expo-google-fonts/barlow-condensed";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { AppState, Platform, Pressable, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_800ExtraBold,
  });
  const typeReady = fontsLoaded || fontError != null;
  const [bootError, setBootError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [booted, setBooted] = useState(false);
  const [dismissedRun, setDismissedRun] = useState(-1);
  const [splashReady, setSplashReady] = useState(Platform.OS === "web");
  const markSplashReady = useCallback(() => setSplashReady(true), []);
  const replayRun = useSplashReplay((state) => state.run);
  const showSplash = Platform.OS !== "web" && dismissedRun !== replayRun;
  const endSplash = useCallback(() => setDismissedRun(replayRun), [replayRun]);

  // The native launch image stays up until the JS copy of it has loaded, so there is no blank frame.
  useEffect(() => {
    if (booted && splashReady) void SplashScreen.hideAsync();
  }, [booted, splashReady]);
  const copy = useCopy();
  const ready = useSession((state) => state.ready);
  const biometricEnabled = useSession((state) => state.biometricEnabled);
  const onboardingCompleted = useSession((state) => state.onboardingCompleted);

  useEffect(() => {
    let live = true;
    getDatabase()
      .then((db) => readSettings(db))
      .then((settings) => {
        if (live) useSession.getState().hydrate(settings);
      })
      .catch(() => {
        if (live) setBootError(copy.bootError);
      })
      .finally(() => {
        setBooted(true);
      });
    return () => {
      live = false;
    };
  }, [attempt, copy.bootError]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "background" && biometricEnabled && onboardingCompleted) {
        useSession.getState().setUnlocked(false);
      }
    });
    return () => subscription.remove();
  }, [biometricEnabled, onboardingCompleted]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }}>
            {bootError ? (
              <BootError
                message={bootError}
                onRetry={() => {
              resetDatabase();
              setBootError(null);
              setAttempt((value) => value + 1);
                }}
              />
            ) : (
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="lock" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="add" options={{ presentation: "modal", headerShown: true, title: copy.add }} />
                <Stack.Screen name="settings" options={{ headerShown: true, title: copy.settings }} />
              </Stack>
            )}
            {(!ready || !typeReady) && !bootError ? <BootCover /> : null}
            {showSplash ? <LaunchSplash
                key={replayRun}
                replay={replayRun > 0}
                start={booted && typeReady && splashReady}
                onReady={markSplashReady}
                onDone={endSplash}
              /> : null}
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function BootCover() {
  const colors = usePalette();
  return (
    <View
      className="gap-4 pt-16"
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.ground }}
    >
      <Skeleton height={160} />
      <Skeleton height={96} />
    </View>
  );
}

function BootError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const colors = usePalette();
  return (
    <View className="flex-1 justify-center gap-4 px-5" style={{ backgroundColor: colors.ground }}>
      <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "600" }}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry} className="min-h-12 justify-center">
        <Text style={{ color: colors.pine, fontSize: 17, fontWeight: "600" }}>{useCopy().tryAgain}</Text>
      </Pressable>
    </View>
  );
}
