import { router } from "expo-router";
import {
  ArrowsClockwise,
  CameraSlash,
  CaretLeft,
  CaretRight,
  Clock,
  Download,
  Fingerprint,
  Globe,
  Key,
  ListBullets,
  Moon,
  Sliders,
  Trash,
  Upload,
} from "phosphor-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, SectionLabel } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { ThemePreference, useTheme } from "@/providers/theme";
import { radii, spacing } from "@/theme/tokens";

const settingIcons = {
  globe: Globe,
  moon: Moon,
  key: Key,
  fingerprint: Fingerprint,
  clock: Clock,
  "camera-off": CameraSlash,
  sliders: Sliders,
  upload: Upload,
  download: Download,
  "trash-2": Trash,
  "refresh-cw": ArrowsClockwise,
  list: ListBullets,
} as const;

type SettingItem = {
  icon: keyof typeof settingIcons;
  label: string;
  color: string;
  soft: string;
  value?: string;
  toggle?: boolean;
  active?: boolean;
  onPress?: () => void;
};

type SettingGroup = {
  title: string;
  items: SettingItem[];
};

const themeValueKey: Record<ThemePreference, "theme.currentValue.system" | "theme.currentValue.light" | "theme.currentValue.dark"> = {
  system: "theme.currentValue.system",
  light: "theme.currentValue.light",
  dark: "theme.currentValue.dark",
};

const getDangerSoft = (isDark: boolean) => (isDark ? "#3C1D24" : "#FCEBEB");

export default function SettingsScreen() {
  const { languagePreference, t } = useLanguage();
  const { colors, theme, themePreference } = useTheme();

  const groups: SettingGroup[] = [
    {
      title: t("settings.group.appearance"),
      items: [
        {
          icon: "globe",
          label: t("settings.language.label"),
          value: languagePreference === "system" ? t("settings.followSystem") : t("language.currentValue"),
          color: colors.primary,
          soft: colors.primarySoft,
          onPress: () => router.push("/language"),
        },
        {
          icon: "moon",
          label: t("settings.theme.label"),
          value: t(themeValueKey[themePreference]),
          color: colors.primary,
          soft: colors.primarySoft,
          onPress: () => router.push("/theme"),
        },
      ],
    },
    {
      title: t("settings.group.security"),
      items: [
        { icon: "key", label: t("settings.security.changeMasterPassword"), color: colors.danger, soft: getDangerSoft(theme === "dark") },
        { icon: "fingerprint", label: t("settings.security.biometricUnlock"), toggle: true, active: true, color: colors.danger, soft: getDangerSoft(theme === "dark") },
        { icon: "clock", label: t("settings.security.autoLock"), value: "5 分钟", color: colors.danger, soft: getDangerSoft(theme === "dark") },
        { icon: "camera-off", label: t("settings.security.screenshotProtection"), toggle: true, active: false, color: colors.danger, soft: getDangerSoft(theme === "dark") },
      ],
    },
    {
      title: t("settings.group.password"),
      items: [{ icon: "sliders", label: t("settings.password.generatorDefaults"), color: colors.purple, soft: colors.purpleSoft }],
    },
    {
      title: t("settings.group.data"),
      items: [
        { icon: "upload", label: t("settings.data.export"), color: colors.green, soft: colors.greenSoft },
        { icon: "download", label: t("settings.data.import"), color: colors.green, soft: colors.greenSoft },
        { icon: "trash-2", label: t("settings.data.recycleBin"), color: colors.green, soft: colors.greenSoft },
      ],
    },
    {
      title: t("settings.group.other"),
      items: [
        { icon: "refresh-cw", label: t("settings.other.checkUpdates"), value: "v1.0.0", color: colors.warning, soft: colors.warningSoft },
        { icon: "list", label: t("settings.other.changelog"), color: colors.warning, soft: colors.warningSoft },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <CaretLeft size={20} color={colors.text} weight="bold" />
          </Pressable>
          <Text style={[styles.navTitle, { color: colors.text }]}>{t("settings.title")}</Text>
          <View style={styles.navSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {groups.map((group) => (
            <View key={group.title} style={styles.groupWrap}>
              <SectionLabel>{group.title}</SectionLabel>
              <Card style={styles.group}>
                {group.items.map((item, index) => {
                  const content = (
                    <>
                      <View style={[styles.rowIcon, { backgroundColor: item.soft }]}>
                        <SettingIcon name={item.icon} color={item.color} />
                      </View>
                      <Text style={[styles.rowText, { color: colors.text }]}>{item.label}</Text>
                      {item.toggle ? (
                        <View style={[styles.toggle, { backgroundColor: item.active ? colors.primary : colors.border }]}>
                          <View style={[styles.knob, item.active && styles.knobActive]} />
                        </View>
                      ) : (
                        <>
                          {item.value ? <Text style={[styles.value, { color: colors.textSubtle }]}>{item.value}</Text> : null}
                          <CaretRight size={18} color={colors.textSubtle} weight="bold" />
                        </>
                      )}
                    </>
                  );

                  const rowStyle = [
                    styles.row,
                    index < group.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                  ];

                  if (item.onPress) {
                    return (
                      <Pressable key={item.label} onPress={item.onPress} style={rowStyle}>
                        {content}
                      </Pressable>
                    );
                  }

                  return (
                    <View key={item.label} style={rowStyle}>
                      {content}
                    </View>
                  );
                })}
              </Card>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  navTitle: { flex: 1, fontSize: 17, fontWeight: "800", marginLeft: spacing.md },
  navSpacer: {
    width: 36,
  },
  content: { paddingBottom: 120 },
  groupWrap: { marginBottom: spacing.lg },
  group: { borderRadius: radii.md, padding: 0, shadowOpacity: 0 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 6,
    height: 28,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 28,
  },
  rowText: { flex: 1, fontSize: 14, fontWeight: "600" },
  value: { fontSize: 13, marginRight: spacing.xs },
  toggle: {
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    paddingHorizontal: 2,
    width: 44,
  },
  knob: {
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    height: 22,
    width: 22,
  },
  knobActive: { alignSelf: "flex-end" },
});

function SettingIcon({ name, color }: { name: keyof typeof settingIcons; color: string }) {
  const Icon = settingIcons[name];
  return <Icon size={16} color={color} weight="regular" />;
}
