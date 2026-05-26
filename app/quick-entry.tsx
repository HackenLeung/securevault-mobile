import { router } from "expo-router";
import { ArrowsLeftRight, Camera, CaretLeft, Check, ClipboardText, ListBullets } from "phosphor-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Button, Card } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { colors, radii, spacing } from "@/theme/tokens";

export default function QuickEntryScreen() {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <CaretLeft size={28} color={colors.text} weight="bold" />
        </Pressable>
        <Text style={styles.navTitle}>{t("quickEntry.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EntryCard
          icon="clipboard"
          title={t("quickEntry.pasteText")}
          description={t("quickEntry.pasteDescription")}
          detail={t("quickEntry.pasteDetail")}
          action={t("quickEntry.pasteAction")}
          color={colors.primary}
          soft={colors.primarySoft}
        />
        <EntryCard
          icon="camera"
          title={t("quickEntry.scanTitle")}
          description={t("quickEntry.scanDescription")}
          detail={t("quickEntry.scanDetail")}
          action={t("quickEntry.scanAction")}
          color={colors.green}
          soft={colors.greenSoft}
        />

        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.or}>{t("common.or")}</Text>
          <View style={styles.line} />
        </View>

        <Pressable style={styles.manual} onPress={() => router.push("/add-password")}>
          <ListBullets size={20} color={colors.textMuted} weight="regular" />
          <View>
            <Text style={styles.manualTitle}>{t("quickEntry.manualEntry")}</Text>
            <Text style={styles.manualSub}>{t("quickEntry.manualDescription")}</Text>
          </View>
        </Pressable>

        <Card style={styles.resultPanel}>
          <View style={styles.handle} />
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{t("quickEntry.resultTitle")}</Text>
            <Badge>{t("quickEntry.foundCount")}</Badge>
          </View>
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>{t("quickEntry.originalText")}</Text>
            <Text style={styles.previewText}>{t("common.website")}: taobao.com</Text>
          </View>
          <DetectedEntry index={1} title="Taobao" subtitle="13800138000 / Abc@123456" badge={t("category.website")} />
          <DetectedEntry index={2} title="Bilibili" subtitle="user@example.com / Xy#9kL2m" selected />
        </Card>

        <View style={styles.actions}>
          <Button variant="secondary" style={styles.actionButton}>{t("quickEntry.rerecognize")}</Button>
          <Button style={styles.actionButton}>{t("quickEntry.confirmSave")}</Button>
        </View>

        <Text style={styles.detailLabel}>{t("quickEntry.confirmDetailView")}</Text>
        <Card style={styles.detailPanel}>
          <View style={styles.handle} />
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Bilibili</Text>
            <Badge color={colors.warning} soft={colors.warningSoft}>{t("quickEntry.autoFilled")}</Badge>
          </View>
          <Text style={styles.fieldLabel}>{t("common.username")}</Text>
          <View style={styles.detectedField}>
            <Text style={styles.detectedText}>user@example.com</Text>
          </View>
          <View style={styles.swapRow}>
            <View style={styles.swapIcon}>
              <ArrowsLeftRight size={18} color={colors.primary} weight="regular" />
            </View>
            <Text style={styles.swapText}>{t("quickEntry.swapFields")}</Text>
          </View>
          <Text style={styles.fieldLabel}>{t("common.password")}</Text>
          <View style={styles.detectedField}>
            <Text style={[styles.detectedText, styles.mono]}>Xy#9kL2m</Text>
          </View>
          <Text style={styles.fieldLabel}>{t("quickEntry.detectedWebsite")}</Text>
          <Text style={styles.url}>https://bilibili.com</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function EntryCard({
  icon,
  title,
  description,
  detail,
  action,
  color,
  soft,
}: {
  icon: "clipboard" | "camera";
  title: string;
  description: string;
  detail: string;
  action: string;
  color: string;
  soft: string;
}) {
  return (
    <Card style={styles.entryCard}>
      <View style={[styles.entryIcon, { backgroundColor: soft }]}>
        {icon === "clipboard" ? (
          <ClipboardText size={26} color={color} weight="regular" />
        ) : (
          <Camera size={26} color={color} weight="regular" />
        )}
      </View>
      <View style={styles.entryText}>
        <Text style={styles.entryTitle}>{title}</Text>
        <Text style={styles.entryDesc}>{description}</Text>
        <Text style={styles.entryDetail}>{detail}</Text>
      </View>
      <Text style={[styles.entryAction, { color }]}>{action}</Text>
    </Card>
  );
}

function DetectedEntry({ index, title, subtitle, selected = false, badge }: { index: number; title: string; subtitle: string; selected?: boolean; badge?: string }) {
  const { t } = useLanguage();

  return (
    <View style={[styles.detected, selected && styles.detectedSelected]}>
      <View style={[styles.detectedIndex, selected && { backgroundColor: colors.primary }]}>
        <Text style={[styles.detectedIndexText, selected && { color: "#FFFFFF" }]}>{index}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.detectedTitleRow}>
          <Text style={styles.detectedTitle}>{title}</Text>
          <Badge>{badge ?? t("category.website")}</Badge>
        </View>
        <Text style={styles.detectedSub}>{subtitle}</Text>
      </View>
      {selected ? (
        <View style={styles.check}>
          <Check size={16} color="#FFFFFF" weight="bold" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: spacing.lg },
  back: { marginLeft: -spacing.sm },
  navTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  content: { gap: spacing.xl, padding: spacing.xl, paddingBottom: spacing.xxxl },
  entryCard: { alignItems: "center", flexDirection: "row", gap: spacing.lg, minHeight: 120 },
  entryIcon: { alignItems: "center", borderRadius: 14, height: 56, justifyContent: "center", width: 56 },
  entryText: { flex: 1 },
  entryTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  entryDesc: { color: colors.textSubtle, fontSize: 13, marginTop: spacing.xs },
  entryDetail: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  entryAction: { fontSize: 13, fontWeight: "800" },
  orRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  line: { backgroundColor: colors.border, flex: 1, height: StyleSheet.hairlineWidth },
  or: { color: colors.textSubtle, fontSize: 11 },
  manual: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
  },
  manualTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  manualSub: { color: colors.textSubtle, fontSize: 12, marginTop: 3 },
  resultPanel: { borderColor: colors.primary, borderWidth: 1, gap: spacing.md },
  handle: { alignSelf: "center", backgroundColor: colors.border, borderRadius: 2, height: 4, width: 64 },
  panelHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  panelTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  preview: { backgroundColor: colors.bg, borderRadius: radii.md, padding: spacing.lg },
  previewLabel: { color: colors.textSubtle, fontSize: 11, fontWeight: "800" },
  previewText: { color: colors.textMuted, fontFamily: "monospace", fontSize: 13, marginTop: spacing.md },
  detected: {
    alignItems: "center",
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 80,
    padding: spacing.lg,
  },
  detectedSelected: { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
  detectedIndex: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radii.sm, height: 32, justifyContent: "center", width: 32 },
  detectedIndexText: { color: colors.primary, fontSize: 14, fontWeight: "800" },
  detectedTitleRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  detectedTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  detectedSub: { color: colors.textSubtle, fontSize: 12, marginTop: spacing.sm },
  check: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, height: 24, justifyContent: "center", width: 24 },
  actions: { flexDirection: "row", gap: spacing.md },
  actionButton: { flex: 1 },
  detailLabel: { alignSelf: "center", color: colors.textSubtle, fontSize: 12, fontWeight: "800" },
  detailPanel: { gap: spacing.md },
  fieldLabel: { color: colors.textSubtle, fontSize: 12, fontWeight: "700" },
  detectedField: { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg },
  detectedText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  mono: { fontFamily: "monospace" },
  swapRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  swapIcon: { alignItems: "center", backgroundColor: colors.surfaceMuted, borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  swapText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  url: { color: colors.textMuted, fontSize: 13 },
});
