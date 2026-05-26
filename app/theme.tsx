import { router } from "expo-router";
import { CaretLeft, Check, GearSix, Moon, SunDim } from "phosphor-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { ThemePreference, useTheme } from "@/providers/theme";
import { radii, spacing } from "@/theme/tokens";

const options: Array<{
  key: ThemePreference;
  icon: "light" | "dark" | "system";
  titleKey: "theme.light" | "theme.dark" | "theme.system";
  descKey: "theme.lightDescription" | "theme.darkDescription" | "theme.systemDescription";
}> = [
  {
    key: "light",
    icon: "light",
    titleKey: "theme.light",
    descKey: "theme.lightDescription",
  },
  {
    key: "dark",
    icon: "dark",
    titleKey: "theme.dark",
    descKey: "theme.darkDescription",
  },
  {
    key: "system",
    icon: "system",
    titleKey: "theme.system",
    descKey: "theme.systemDescription",
  },
];

export default function ThemeScreen() {
  const { t } = useLanguage();
  const { colors, theme, themePreference, setThemePreference } = useTheme();
  const isDark = theme === "dark";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <View style={[styles.nav, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <CaretLeft size={20} color={colors.text} weight="bold" />
          </Pressable>
          <Text style={[styles.navTitle, { color: colors.text }]}>{t("theme.title")}</Text>
          <View style={styles.navSpacer} />
        </View>

        <Card style={styles.panel}>
          {options.map((option, index) => {
            const active = themePreference === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => setThemePreference(option.key)}
                style={[
                  styles.option,
                  { backgroundColor: colors.surface },
                  active && { borderColor: colors.primary, borderWidth: 2 },
                  !active && { borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
                  index < options.length - 1 && styles.optionSpacing,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: active ? colors.primarySoft : colors.surfaceMuted }]}>
                  <OptionIcon type={option.icon} active={active} isDark={isDark} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{t(option.titleKey)}</Text>
                  <Text style={[styles.optionDesc, { color: colors.textSubtle }]}>{t(option.descKey)}</Text>
                </View>
                <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : "transparent" }]}>
                  {active ? <Check size={14} color="#FFFFFF" weight="bold" /> : null}
                </View>
              </Pressable>
            );
          })}
        </Card>

        <Text style={[styles.tip, { color: colors.textSubtle }]}>{t("theme.applyImmediately")}</Text>
      </View>
    </SafeAreaView>
  );
}

function OptionIcon({ type, active, isDark }: { type: "light" | "dark" | "system"; active: boolean; isDark: boolean }) {
  const baseColor = active ? "#FFFFFF" : isDark ? "#A9B5CB" : "#64748B";

  if (type === "light") {
    return <SunDim size={18} color={active ? "#3B82F6" : baseColor} weight="regular" />;
  }

  if (type === "dark") {
    return <Moon size={18} color={active ? "#60A5FA" : baseColor} weight="regular" />;
  }

  return <GearSix size={18} color={active ? "#60A5FA" : baseColor} weight="regular" />;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  nav: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    marginLeft: spacing.md,
    textAlign: "center",
  },
  navSpacer: {
    width: 36,
  },
  panel: {
    borderRadius: radii.lg,
    gap: spacing.md,
    padding: 0,
    shadowOpacity: 0,
  },
  option: {
    alignItems: "center",
    borderRadius: radii.lg,
    flexDirection: "row",
    minHeight: 96,
    paddingHorizontal: spacing.lg,
  },
  optionSpacing: {
    marginBottom: spacing.md,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 44,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  radio: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  tip: {
    fontSize: 13,
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
