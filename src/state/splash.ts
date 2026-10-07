import { create } from "zustand";

// `run` counts how many times the user asked to watch the launch animation again.
export const useSplashReplay = create<{ run: number; replay: () => void }>((set) => ({
  run: 0,
  replay: () => set((state) => ({ run: state.run + 1 })),
}));
