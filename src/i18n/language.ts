import { getLocales } from "expo-localization";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

export type Language = "es" | "en";

export function languageFromCode(code: string | null | undefined): Language {
  return code?.toLowerCase().startsWith("es") ? "es" : "en";
}

export function readLanguage(): Language {
  return languageFromCode(getLocales()[0]?.languageCode);
}

export function intlLocale(language: Language): string {
  return language === "es" ? "es-CL" : "en-US";
}

export function useLanguage(): Language {
  const [language, setLanguage] = useState(readLanguage);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", () => setLanguage(readLanguage()));
    return () => subscription.remove();
  }, []);
  return language;
}
