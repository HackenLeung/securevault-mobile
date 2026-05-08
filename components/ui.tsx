import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors, radii, shadow, spacing } from "@/theme/tokens";

export function Screen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return <View style={[styles.screen, padded && styles.screenPadding]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.buttonPrimary,
        variant === "secondary" && styles.buttonSecondary,
        variant === "ghost" && styles.buttonGhost,
        pressed && { opacity: 0.78, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant === "primary" && styles.buttonPrimaryText,
          variant !== "primary" && styles.buttonSecondaryText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textSubtle} style={styles.input} {...props} />;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Badge({ children, color = colors.primary, soft = colors.primarySoft }: { children: ReactNode; color?: string; soft?: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: soft }]}>
      <Text style={[styles.badgeText, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screenPadding: {
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
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
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
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
  buttonSecondaryText: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontSize: 15,
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    color: colors.textMuted,
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
