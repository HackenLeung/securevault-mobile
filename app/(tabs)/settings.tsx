import { CameraSlash, CaretRight, Clock, Download, Globe, Key, Moon, Sliders, Star, Trash, Upload, Fingerprint, ArrowsClockwise, ListBullets } from "phosphor-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, SectionLabel } from "@/components/ui";
import { colors, radii, spacing } from "@/theme/tokens";

const groups = [
  {
    title: "Appearance",
    items: [
      { icon: "globe", label: "Language / 语言", value: "跟随系统", color: colors.primary, soft: colors.primarySoft },
      { icon: "moon", label: "Theme / 主题", value: "跟随系统", color: colors.primary, soft: colors.primarySoft },
    ],
  },
  {
    title: "Security",
    items: [
      { icon: "key", label: "Change Master Password", color: colors.danger, soft: "#FCEBEB" },
      { icon: "fingerprint", label: "Biometric Unlock", toggle: true, active: true, color: colors.danger, soft: "#FCEBEB" },
      { icon: "clock", label: "Auto-Lock", value: "5 分钟", color: colors.danger, soft: "#FCEBEB" },
      { icon: "camera-off", label: "Screenshot Protection", toggle: true, active: false, color: colors.danger, soft: "#FCEBEB" },
    ],
  },
  {
    title: "Password",
    items: [{ icon: "sliders", label: "Password Generator Defaults", color: colors.purple, soft: colors.purpleSoft }],
  },
  {
    title: "Data",
    items: [
      { icon: "upload", label: "Export Data", color: colors.green, soft: "#E1F5EE" },
      { icon: "download", label: "Import Data", color: colors.green, soft: "#E1F5EE" },
      { icon: "trash-2", label: "Recycle Bin", color: colors.green, soft: "#E1F5EE" },
    ],
  },
  {
    title: "Other",
    items: [
      { icon: "refresh-cw", label: "Check for Updates", value: "v1.0.0", color: colors.warning, soft: "#FAEEDA" },
      { icon: "list", label: "Changelog", color: colors.warning, soft: "#FAEEDA" },
    ],
  },
];

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

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Text style={styles.navTitle}>设置</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {groups.map((group) => (
          <View key={group.title} style={styles.groupWrap}>
            <SectionLabel>{group.title}</SectionLabel>
            <Card style={styles.group}>
              {group.items.map((item, index) => (
                <View key={item.label} style={[styles.row, index < group.items.length - 1 && styles.divided]}>
                  <View style={[styles.rowIcon, { backgroundColor: item.soft }]}>
                    <SettingIcon name={item.icon as keyof typeof settingIcons} color={item.color} />
                  </View>
                  <Text style={styles.rowText}>{item.label}</Text>
                  {item.toggle ? (
                    <View style={[styles.toggle, item.active && styles.toggleActive]}>
                      <View style={[styles.knob, item.active && styles.knobActive]} />
                    </View>
                  ) : (
                    <>
                      {item.value ? <Text style={styles.value}>{item.value}</Text> : null}
                      <CaretRight size={18} color={colors.textSubtle} weight="bold" />
                    </>
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  nav: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  navTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  content: { backgroundColor: colors.bg, padding: spacing.lg, paddingBottom: 120 },
  groupWrap: { marginBottom: spacing.lg },
  group: { borderRadius: radii.md, padding: 0, shadowOpacity: 0 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  divided: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon: {
    alignItems: "center",
    borderRadius: 6,
    height: 28,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 28,
  },
  rowText: { color: colors.text, flex: 1, fontSize: 14, fontWeight: "600" },
  value: { color: colors.textSubtle, fontSize: 13, marginRight: spacing.xs },
  toggle: {
    backgroundColor: colors.border,
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    paddingHorizontal: 2,
    width: 44,
  },
  toggleActive: { backgroundColor: colors.primary },
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
  return <Icon size={16} color={color} weight={name === "fingerprint" ? "regular" : "regular"} />;
}
