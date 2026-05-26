export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  primary: string;
  primarySoft: string;
  bg: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  purple: string;
  purpleSoft: string;
  green: string;
  greenSoft: string;
  favorite: string;
};

export const lightColors: ThemeColors = {
  primary: "#2563EB",
  primarySoft: "#E8F0FE",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceMuted: "#F1F5F9",
  text: "#0F172A",
  textMuted: "#64748B",
  textSubtle: "#94A3B8",
  border: "#E2E8F0",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#DC2626",
  purple: "#7C3AED",
  purpleSoft: "#F3E8FF",
  green: "#059669",
  greenSoft: "#DCFCE7",
  favorite: "#EAB308",
};

export const darkColors: ThemeColors = {
  primary: "#3B82F6",
  primarySoft: "#1D3E74",
  bg: "#0B1220",
  surface: "#111A2E",
  surfaceMuted: "#1C2942",
  text: "#F8FAFC",
  textMuted: "#A9B5CB",
  textSubtle: "#7E8DA8",
  border: "#2A3955",
  success: "#22C55E",
  successSoft: "#123222",
  warning: "#F59E0B",
  warningSoft: "#3C2A11",
  danger: "#F87171",
  purple: "#A78BFA",
  purpleSoft: "#2B1D52",
  green: "#34D399",
  greenSoft: "#123328",
  favorite: "#FACC15",
};

export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const shadow = {
  shadowColor: "#0F172A",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 18,
  elevation: 3,
};

