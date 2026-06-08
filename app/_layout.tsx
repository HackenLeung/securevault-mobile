import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LanguageProvider } from "@/providers/language";
import { SecurityProvider } from "@/providers/security";
import { ThemeProvider, useTheme } from "@/providers/theme";

function RootStack() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="setup-master-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-password" />
        <Stack.Screen name="generator-defaults" />
        <Stack.Screen name="language" />
        <Stack.Screen name="theme" />
        <Stack.Screen name="quick-entry" />
        <Stack.Screen name="password-detail/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SecurityProvider>
          <RootStack />
        </SecurityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
