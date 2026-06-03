import { router } from "expo-router";
import { CaretLeft, Check, GearSix, GlobeHemisphereWest, Translate } from "phosphor-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { useTheme } from "@/providers/theme";
import { radii, spacing } from "@/theme/tokens";

const options: Array<{
  key: "system" | "zh" | "en";
  icon: "system" | "zh" | "en";
  titleKey: "language.followSystem" | "language.chinese" | "language.english";
  descKey: "language.followSystemDescription" | "language.chineseDescription" | "language.englishDescription";
}> = [
  {
    key: "system",
    icon: "system",
    titleKey: "language.followSystem",
    descKey: "language.followSystemDescription",
  },
  {
    key: "zh",
    icon: "zh",
    titleKey: "language.chinese",
    descKey: "language.chineseDescription",
  },
  {
    key: "en",
    icon: "en",
    titleKey: "language.english",
    descKey: "language.englishDescription",
  },
];

// 语言选择页：直接写入 LanguageProvider，切换后所有 t() 文案即时刷新。
export default function LanguageScreen() {
  const { colors } = useTheme();
  const { languagePreference, setLanguagePreference, t } = useLanguage();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <CaretLeft size={20} color={colors.text} weight="bold" />
          </Pressable>
          <Text style={[styles.navTitle, { color: colors.text }]}>{t("language.title")}</Text>
          <View style={styles.navSpacer} />
        </View>

        <Card style={styles.panel}>
          {options.map((option, index) => {
            const active = languagePreference === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => setLanguagePreference(option.key)}
                style={[styles.option, index < options.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
              >
                <View style={[styles.iconWrap, { backgroundColor: active ? colors.primarySoft : colors.surfaceMuted }]}>
                  <OptionIcon type={option.icon} active={active} />
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

        <Text style={[styles.tip, { color: colors.textSubtle }]}>{t("language.applyImmediately")}</Text>
      </View>
    </SafeAreaView>
  );
}

function OptionIcon({ type, active }: { type: "system" | "zh" | "en"; active: boolean }) {
  // 语言选项图标独立出来，保持 options 数据只描述业务，不直接携带组件。
  const { colors } = useTheme();

  if (type === "system") {
    return <GearSix size={16} color={active ? colors.primary : colors.textMuted} weight="regular" />;
  }

  if (type === "zh") {
    return <GlobeHemisphereWest size={16} color={active ? colors.primary : colors.textMuted} weight="regular" />;
  }

  return <Translate size={16} color={active ? colors.primary : colors.textMuted} weight="regular" />;
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
    flexDirection: "row",
    marginBottom: spacing.lg,
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
  },
  navSpacer: {
    width: 36,
  },
  panel: {
    borderRadius: radii.lg,
    overflow: "hidden",
    padding: 0,
    shadowOpacity: 0,
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 84,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 40,
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
