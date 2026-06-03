import { ReactNode, useState } from "react";
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { Eye, EyeSlash } from "phosphor-react-native";
import { useTheme } from "@/providers/theme";
import { radii, shadow, spacing } from "@/theme/tokens";

// 页面基础容器：统一背景和可选左右内边距，避免每个页面重复写底色。
export function Screen({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  const { colors } = useTheme();

  return <View style={[styles.screen, { backgroundColor: colors.bg }, padded && styles.screenPadding]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  const { colors, theme } = useTheme();

  return (
    // 深色模式下关闭投影，主要依赖边框和底色区分层级。
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
    // 三种按钮变体覆盖主要操作、次要操作和文字按钮，按压态保持一致反馈。
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

export function Field({ style, onBlur, onFocus, ...props }: TextInputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    // 透传 TextInputProps，页面可以继续控制键盘类型、secureTextEntry、多行等行为。
    <TextInput
      placeholderTextColor={colors.textSubtle}
      underlineColorAndroid="transparent"
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      style={[
        styles.input,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: focused ? colors.primary : colors.border,
          color: colors.text,
        },
        focused && { backgroundColor: colors.surface },
        style,
      ]}
      {...props}
    />
  );
}

export function PasswordField({
  defaultVisible = false,
  containerStyle,
  style,
  ...props
}: TextInputProps & {
  defaultVisible?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(defaultVisible);
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.passwordField,
        {
          backgroundColor: focused ? colors.surface : colors.surfaceMuted,
          borderColor: focused ? colors.primary : colors.border,
        },
        containerStyle,
      ]}
    >
      <TextInput
        {...props}
        autoComplete={props.autoComplete ?? "password"}
        placeholderTextColor={colors.textSubtle}
        secureTextEntry={!visible}
        textContentType="password"
        underlineColorAndroid="transparent"
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        style={[styles.passwordTextInput, { color: colors.text }, style]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? "隐藏密码" : "显示密码"}
        hitSlop={8}
        onPress={() => setVisible((current) => !current)}
        style={styles.passwordToggle}
      >
        {visible ? <EyeSlash size={20} color={colors.primary} weight="regular" /> : <Eye size={20} color={colors.primary} weight="regular" />}
      </Pressable>
    </View>
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

  // Badge 默认走主题主色，也允许页面按分类/状态传入业务色。
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
    borderWidth: 1,
    fontSize: 15,
    height: 50,
    paddingHorizontal: spacing.lg,
  },
  passwordField: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    height: 50,
    overflow: "hidden",
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 15,
    height: "100%",
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  passwordToggle: {
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
    width: 48,
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
