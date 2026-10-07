import { usePalette } from "@/components/ui/usePalette";
import { useCopy } from "@/i18n/copy";
import { useSession } from "@/state/session";
import { SymbolView } from "expo-symbols";
import { Redirect, Tabs, useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Glass } from "@/components/ui/Glass";
import { darkPalette } from "@/theme/palette";
import { Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";

type SymbolName = React.ComponentProps<typeof SymbolView>["name"];

function TabIcon({ name, focused, wide }: { name: SymbolName; focused: boolean; wide: boolean }) {
  const colors = usePalette();
  return (
    <View
      style={{
        width: wide ? 44 : 62,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.pine : "transparent",
      }}
    >
      <SymbolView name={name} tintColor={focused ? colors.onPine : colors.muted} size={22} />
    </View>
  );
}

export default function TabLayout() {
  const colors = usePalette();
  const copy = useCopy();
  const router = useRouter();
  const ready = useSession((state) => state.ready);
  const onboardingCompleted = useSession((state) => state.onboardingCompleted);
  const biometricEnabled = useSession((state) => state.biometricEnabled);
  const unlocked = useSession((state) => state.unlocked);
  const wide = useWindowDimensions().width >= 768;

  if (!ready) return null;
  if (!onboardingCompleted) return <Redirect href="/onboarding" />;
  if (biometricEnabled && !unlocked) return <Redirect href="/lock" />;

  return (
    <Tabs
      screenOptions={{
        tabBarPosition: wide ? "left" : "bottom",
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarActiveBackgroundColor: "transparent",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: wide
          ? { backgroundColor: colors.surface, borderColor: colors.line }
          : {
              position: "absolute",
              marginHorizontal: 16,
              bottom: 14,
              height: 68,
              paddingBottom: 0,
              paddingTop: 0,
              borderRadius: 34,
              borderTopWidth: 0,
              backgroundColor: "transparent",
              elevation: 0,
              overflow: "hidden",
            },
        tabBarBackground: wide
          ? undefined
          : () => (
              <View style={StyleSheet.absoluteFill}>
                <Glass radius={34} tint={colors === darkPalette ? "dark" : "light"} style={StyleSheet.absoluteFill} />
              </View>
            ),
        headerStyle: { backgroundColor: colors.ground },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: copy.home,
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} wide={wide} name={{ ios: "house.fill", android: "home", web: "home" }} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: copy.activity,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} wide={wide} name={{ ios: "list.bullet", android: "list", web: "list" }} />
          ),
          headerRight: () =>
            Platform.OS === "android" ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.add}
                onPress={() => router.push("/add")}
                className="min-h-12 justify-center px-3"
              >
                <Text style={{ color: colors.pine, fontSize: 17, fontWeight: "600" }}>{copy.add}</Text>
              </Pressable>
            ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: copy.budgets,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} wide={wide} name={{ ios: "chart.pie.fill", android: "pie_chart", web: "pie_chart" }} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: copy.insights,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} wide={wide} name={{ ios: "text.bubble", android: "chat", web: "chat" }} />
          ),
        }}
      />
    </Tabs>
  );
}
