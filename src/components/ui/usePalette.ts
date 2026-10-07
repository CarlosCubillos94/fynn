import { darkPalette, lightPalette, type Palette } from "@/theme/palette";
import { useSession } from "@/state/session";
import { colorScheme } from "nativewind";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

export function usePalette(): Palette {
  const theme = useSession((state) => state.theme);
  const system = useColorScheme();
  const scheme = theme === "system" ? (system === "dark" ? "dark" : "light") : theme;

  useEffect(() => {
    colorScheme.set(theme === "system" ? "system" : theme);
  }, [theme]);

  return scheme === "dark" ? darkPalette : lightPalette;
}
