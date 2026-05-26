import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { useTheme } from "@/providers/theme";
import { radii, shadow, spacing } from "@/theme/tokens";

export function Screen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  const { colors } = useTheme();

  return <View style={[styles.screen, { backgroundColor: colors.bg }, padded && styles.screenPadding]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  const { colors, theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowOpacity: theme === "dark" ? 0 : shadow.shadowOpacity,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  children,
  onPress,
  variant = "primary",
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  style?: object;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && { backgroundColor: colors.primary },
        variant === "secondary" && { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
        variant === "ghost" && styles.buttonGhost,
        pressed && { opacity: 0.78, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      <Text style={[styles.buttonText, variant === "primary" ? styles.buttonPrimaryText : { color: colors.primary }]}>{children}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textSubtle}
      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, props.style]}
      {...props}
    />
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  const { colors } = useTheme();

  return <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{children}</Text>;
}

export function Badge({ children, color, soft }: { children: ReactNode; color?: string; soft?: string }) {
  const { colors } = useTheme();
  const badgeColor = color ?? colors.primary;
  const badgeSoft = soft ?? colors.primarySoft;

  return (
    <View style={[styles.badge, { backgroundColor: badgeSoft }]}>
      <Text style={[styles.badgeText, { color: badgeColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenPadding: {
    paddingHorizontal: spacing.xl,
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    ...shadow,
  },
  button: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 48,
    justifyContent: "center",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    height: 40,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
  },
  input: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 15,
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
  },
  badge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
