import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, ThemeColors, ThemeMode } from "@/theme/tokens";

export type ThemePreference = ThemeMode | "system";

type ThemeContextValue = {
  themePreference: ThemePreference;
  theme: ThemeMode;
  colors: ThemeColors;
  setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>("light");

  const value = useMemo<ThemeContextValue>(() => {
    const theme = themePreference === "system" ? (systemScheme === "dark" ? "dark" : "light") : themePreference;

    return {
      themePreference,
      theme,
      colors: theme === "dark" ? darkColors : lightColors,
      setThemePreference,
    };
  }, [systemScheme, themePreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
