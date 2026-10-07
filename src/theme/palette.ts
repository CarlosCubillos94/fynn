export type Scheme = "light" | "dark";

export type Palette = {
  ground: string;
  surface: string;
  ink: string;
  muted: string;
  pine: string;
  onPine: string;
  pineSoft: string;
  coin: string;
  onCoin: string;
  line: string;
  income: string;
  expense: string;
  warn: string;
  track: string;
  band: string;
  onBand: string;
  bandSoft: string;
  onBandAlert: string;
  shellIn: string;
  shellOut: string;
  heroTop: string;
  heroMid: string;
  heroBottom: string;
  bloom: string;
  glassTint: string;
  glassEdge: string;
};

// Emerald night: deep green hero with an amber bloom, sage ground, citrus only on Accept.
export const lightPalette: Palette = {
  ground: "#E8EEE9",
  surface: "#F5F8F5",
  ink: "#10241B",
  muted: "#4B5F55",
  pine: "#10241B",
  onPine: "#F2F6F2",
  pineSoft: "#C9D6CE",
  coin: "#F2E94E",
  onCoin: "#10241B",
  line: "#D2DCD5",
  income: "#1F6B3A",
  expense: "#B42318",
  warn: "#9A4B08",
  track: "#0A2A1E",
  band: "#06140F",
  onBand: "#F6F8F2",
  bandSoft: "#B4CCBF",
  onBandAlert: "#F6B3A6",
  shellIn: "#9AE3B0",
  shellOut: "#F7A898",
  heroTop: "#0E7A55",
  heroMid: "#0A4A37",
  heroBottom: "#06140F",
  bloom: "#F4A63C",
  glassTint: "rgba(255,255,255,0.10)",
  glassEdge: "rgba(255,255,255,0.22)",
};

export const darkPalette: Palette = {
  ground: "#0B1612",
  surface: "#13241C",
  ink: "#EAF3EC",
  muted: "#A9C4B6",
  pine: "#EAF3EC",
  onPine: "#06140F",
  pineSoft: "#7FA392",
  coin: "#F2E94E",
  onCoin: "#10241B",
  line: "#22382D",
  income: "#8FE0A8",
  expense: "#F5A596",
  warn: "#E6C07A",
  track: "#0A2A1E",
  band: "#06140F",
  onBand: "#F6F8F2",
  bandSoft: "#A9C4B6",
  onBandAlert: "#F6B3A6",
  shellIn: "#9AE3B0",
  shellOut: "#F7A898",
  heroTop: "#0A5A3F",
  heroMid: "#073526",
  heroBottom: "#050F0B",
  bloom: "#E8962E",
  glassTint: "rgba(255,255,255,0.08)",
  glassEdge: "rgba(255,255,255,0.18)",
};

export const seriesColor: Record<string, string> = {
  food: "#E07A2F",
  transport: "#2F8A74",
  home: "#C45C6A",
  health: "#6E7FD6",
  subscriptions: "#D6A03A",
  fun: "#C46B3A",
  shopping: "#4E8C6A",
  other: "#8A8478",
  salary: "#1F6B3A",
  freelance: "#2F8A74",
  "other-income": "#8A8478",
};

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

// Pick the label color with the higher contrast against a solid category color.
export function readableOn(hex: string, dark = "#10241B", light = "#FFFFFF"): string {
  const bg = luminance(hex) + 0.05;
  const contrastLight = 1.05 / bg;
  const contrastDark = bg / (luminance(dark) + 0.05);
  return contrastDark >= contrastLight ? dark : light;
}
