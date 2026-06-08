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

const defaultThemeContext: ThemeContextValue = {
  themePreference: "system",
  theme: "light",
  colors: lightColors,
  setThemePreference: () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);

// 主题 Provider：记录用户偏好，并在 system 模式下实时跟随系统浅/深色。
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>("system");

  const value = useMemo<ThemeContextValue>(() => {
    // preference 是用户选择，theme 是最终生效主题，二者分开便于设置页展示“跟随系统”。
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
  return useContext(ThemeContext);
}
