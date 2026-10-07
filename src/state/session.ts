import type { CurrencyCode, Settings, ThemeMode } from "@/domain/types";
import { create } from "zustand";

type SessionState = Settings & {
  ready: boolean;
  unlocked: boolean;
  viewCurrency: CurrencyCode;
  hydrate: (settings: Settings) => void;
  patch: (partial: Partial<Settings>) => void;
  setUnlocked: (unlocked: boolean) => void;
  setViewCurrency: (currency: CurrencyCode) => void;
  setTheme: (theme: ThemeMode) => void;
};

const initial: Settings = {
  theme: "system",
  biometricEnabled: false,
  onboardingCompleted: false,
  defaultCurrency: "CLP",
  sampleLedger: true,
};

export const useSession = create<SessionState>((set) => ({
  ...initial,
  ready: false,
  unlocked: true,
  viewCurrency: "CLP",
  hydrate: (settings) =>
    set({
      ...settings,
      ready: true,
      unlocked: !settings.biometricEnabled,
      viewCurrency: settings.defaultCurrency,
    }),
  patch: (partial) => set(partial),
  setUnlocked: (unlocked) => set({ unlocked }),
  setViewCurrency: (viewCurrency) => set({ viewCurrency }),
  setTheme: (theme) => set({ theme }),
}));
