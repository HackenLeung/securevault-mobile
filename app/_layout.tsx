import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-password" />
        <Stack.Screen name="quick-entry" />
        <Stack.Screen name="password-detail/[id]" />
      </Stack>
    </>
  );
}
