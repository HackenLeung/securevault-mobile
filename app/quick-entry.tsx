import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { ArrowsLeftRight, Camera, CaretLeft, Check, ClipboardText, ListBullets } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Button, Card } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { useTheme } from "@/providers/theme";
import { DetectedRecord, parseCredentialRecords } from "@/services/credential-parser";
import { radii, spacing } from "@/theme/tokens";

type RecognitionSource = "clipboard" | "scan";

// 快速录入页：模拟剪贴板识别和截图 OCR，把识别结果带入新增密码表单确认。
export default function QuickEntryScreen() {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [source, setSource] = useState<RecognitionSource>("clipboard");
  const [rawText, setRawText] = useState("");
  const [records, setRecords] = useState<DetectedRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognized, setRecognized] = useState(false);

  const selectedRecord = useMemo(() => records.find((record) => record.id === selectedId) ?? records[0], [records, selectedId]);

  const runRecognition = useCallback(
    async (nextSource: RecognitionSource) => {
      setLoading(true);
      setSource(nextSource);

      const clipboardText = nextSource === "clipboard" ? await Clipboard.getStringAsync() : "";
      // 扫描入口当前使用固定样本文本；后续接 OCR 时只需替换这里的 text 来源。
      const text = nextSource === "clipboard" ? clipboardText : "";
      const parsed = parseCredentialRecords(text);

      setRawText(text);
      setRecords(parsed);
      setSelectedId(parsed[0]?.id ?? null);
      setRecognized(true);
      setLoading(false);
    },
    [],
  );

  const recognizeEditedText = useCallback(() => {
    const parsed = parseCredentialRecords(rawText);

    setRecords(parsed);
    setSelectedId(parsed[0]?.id ?? null);
    setRecognized(true);
  }, [rawText]);

  const swapFields = useCallback(() => {
    if (!selectedRecord) return;

    // 识别结果可能把账号和密码判断反了，提供一次性交换减少手动编辑。
    setRecords((current) =>
      current.map((record) => (record.id === selectedRecord.id ? { ...record, username: record.password, password: record.username } : record)),
    );
  }, [selectedRecord]);

  const confirmSave = useCallback(() => {
    if (!selectedRecord) return;

    // 先跳到新增页让用户确认，真正保存仍由新增页的校验和写入逻辑负责。
    router.push({
      pathname: "/add-password",
      params: {
        category: selectedRecord.category,
        title: selectedRecord.title,
        username: selectedRecord.username,
        password: selectedRecord.password,
        url: selectedRecord.url,
      },
    });
  }, [selectedRecord]);

  const hasResults = records.length > 0;
  const showResultPanel = recognized || hasResults;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <CaretLeft size={28} color={colors.text} weight="bold" />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>{t("quickEntry.title")}</Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EntryCard
          icon="clipboard"
          title={t("quickEntry.pasteText")}
          description={t("quickEntry.pasteDescription")}
          detail={t("quickEntry.pasteDetail")}
          action={loading && source === "clipboard" ? t("quickEntry.recognizing") : t("quickEntry.pasteAction")}
          color={colors.primary}
          soft={colors.primarySoft}
          disabled={loading}
          onPress={() => runRecognition("clipboard")}
        />
        <EntryCard
          icon="camera"
          title={t("quickEntry.scanTitle")}
          description={t("quickEntry.scanDescription")}
          detail={t("quickEntry.scanDetail")}
          action={loading && source === "scan" ? t("quickEntry.recognizing") : t("quickEntry.scanAction")}
          color={colors.green}
          soft={colors.greenSoft}
          disabled={loading}
          onPress={() => router.push("/scan-screenshot" as never)}
        />

        <View style={styles.orRow}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.or, { color: colors.textSubtle }]}>{t("common.or")}</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.manual,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/add-password")}
        >
          <ListBullets size={20} color={colors.textMuted} weight="regular" />
          <View style={styles.manualText}>
            <Text style={[styles.manualTitle, { color: colors.text }]}>{t("quickEntry.manualEntry")}</Text>
            <Text style={[styles.manualSub, { color: colors.textSubtle }]}>{t("quickEntry.manualDescription")}</Text>
          </View>
        </Pressable>

        {loading ? (
          <Card style={styles.loadingPanel}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>{t("quickEntry.recognizing")}</Text>
          </Card>
        ) : null}

        {showResultPanel ? (
          <>
            <Card style={[styles.resultPanel, { borderColor: colors.primary }]}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <View style={styles.panelHeader}>
                <Text style={[styles.panelTitle, { color: colors.text }]}>{t("quickEntry.resultTitle")}</Text>
                <Badge>{t("quickEntry.foundCount").replace("2", String(records.length))}</Badge>
              </View>
              <View style={[styles.preview, { backgroundColor: colors.bg }]}>
                <Text style={[styles.previewLabel, { color: colors.textSubtle }]}>{t("quickEntry.originalText")}</Text>
                <TextInput
                  multiline
                  value={rawText}
                  onChangeText={setRawText}
                  placeholder={t("quickEntry.emptyClipboard")}
                  placeholderTextColor={colors.textSubtle}
                  textAlignVertical="top"
                  underlineColorAndroid="transparent"
                  style={[styles.previewText, { color: colors.textMuted }]}
                />
              </View>
              {records.map((record, index) => (
                <DetectedEntry
                  key={record.id}
                  index={index + 1}
                  record={record}
                  selected={record.id === selectedRecord?.id}
                  onPress={() => setSelectedId(record.id)}
                />
              ))}
            </Card>

            <View style={styles.actions}>
              <Button variant="secondary" style={styles.actionButton} onPress={recognizeEditedText}>
                {t("quickEntry.rerecognize")}
              </Button>
              {hasResults ? (
                <Button style={styles.actionButton} onPress={confirmSave}>
                  {t("quickEntry.confirmSave")}
                </Button>
              ) : null}
            </View>

            {selectedRecord ? (
              <>
                <Text style={[styles.detailLabel, { color: colors.textSubtle }]}>{t("quickEntry.confirmDetailView")}</Text>
                <Card style={styles.detailPanel}>
                  <View style={[styles.handle, { backgroundColor: colors.border }]} />
                  <View style={styles.panelHeader}>
                    <Text style={[styles.panelTitle, { color: colors.text }]}>{selectedRecord.title}</Text>
                    <Badge color={colors.warning} soft={colors.warningSoft}>
                      {t("quickEntry.autoFilled")}
                    </Badge>
                  </View>
                  <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t("common.username")}</Text>
                  <View style={[styles.detectedField, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
                    <Text style={[styles.detectedText, { color: colors.text }]}>{selectedRecord.username || t("quickEntry.missingField")}</Text>
                  </View>
                  <Pressable onPress={swapFields} style={({ pressed }) => [styles.swapRow, pressed && styles.pressed]}>
                    <View style={[styles.swapIcon, { backgroundColor: colors.surfaceMuted }]}>
                      <ArrowsLeftRight size={18} color={colors.primary} weight="regular" />
                    </View>
                    <Text style={[styles.swapText, { color: colors.primary }]}>{t("quickEntry.swapFields")}</Text>
                  </Pressable>
                  <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t("common.password")}</Text>
                  <View style={[styles.detectedField, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
                    <Text style={[styles.detectedText, styles.mono, { color: colors.text }]}>
                      {selectedRecord.password || t("quickEntry.missingField")}
                    </Text>
                  </View>
                  <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>{t("quickEntry.detectedWebsite")}</Text>
                  <Text style={[styles.url, { color: colors.textMuted }]}>{selectedRecord.url || t("quickEntry.missingField")}</Text>
                </Card>
              </>
            ) : null}
          </>
        ) : null}
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
  disabled,
  onPress,
}: {
  icon: "clipboard" | "camera";
  title: string;
  description: string;
  detail: string;
  action: string;
  color: string;
  soft: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  // 剪贴板和扫描入口视觉一致，只根据 icon/color/action 展示不同来源。
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}>
      <Card style={styles.entryCard}>
        <View style={[styles.entryIcon, { backgroundColor: soft }]}>
          {icon === "clipboard" ? <ClipboardText size={26} color={color} weight="regular" /> : <Camera size={26} color={color} weight="regular" />}
        </View>
        <View style={styles.entryText}>
          <Text style={[styles.entryTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.entryDesc, { color: colors.textSubtle }]}>{description}</Text>
          <Text style={[styles.entryDetail, { color: colors.textMuted }]}>{detail}</Text>
        </View>
        <Text style={[styles.entryAction, { color }]}>{action}</Text>
      </Card>
    </Pressable>
  );
}

function DetectedEntry({
  index,
  record,
  selected,
  onPress,
}: {
  index: number;
  record: DetectedRecord;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useLanguage();
  const { colors } = useTheme();

  // 单条识别结果负责展示摘要和选中态，详情编辑区读取 selectedRecord。
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.detected,
        { backgroundColor: colors.bg, borderColor: selected ? colors.primary : colors.border },
        selected && { backgroundColor: colors.surface, borderWidth: 1 },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.detectedIndex, { backgroundColor: selected ? colors.primary : colors.primarySoft }]}>
        <Text style={[styles.detectedIndexText, { color: selected ? "#FFFFFF" : colors.primary }]}>{index}</Text>
      </View>
      <View style={styles.detectedContent}>
        <View style={styles.detectedTitleRow}>
          <Text style={[styles.detectedTitle, { color: colors.text }]} numberOfLines={1}>
            {record.title}
          </Text>
          <Badge>{t("category.website")}</Badge>
        </View>
        <Text style={[styles.detectedSub, { color: colors.textSubtle }]} numberOfLines={1}>
          {record.username || "-"} / {record.password || "-"}
        </Text>
      </View>
      {selected ? (
        <View style={[styles.check, { backgroundColor: colors.primary }]}>
          <Check size={16} color="#FFFFFF" weight="bold" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  nav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: spacing.lg },
  back: { marginLeft: -spacing.sm },
  navTitle: { fontSize: 17, fontWeight: "800" },
  navSpacer: { width: 32 },
  content: { gap: spacing.xl, padding: spacing.xl, paddingBottom: spacing.xxxl },
  entryCard: { alignItems: "center", flexDirection: "row", gap: spacing.lg, minHeight: 116 },
  entryIcon: { alignItems: "center", borderRadius: 14, height: 56, justifyContent: "center", width: 56 },
  entryText: { flex: 1, minWidth: 0 },
  entryTitle: { fontSize: 16, fontWeight: "800" },
  entryDesc: { fontSize: 13, marginTop: spacing.xs },
  entryDetail: { fontSize: 12, marginTop: spacing.xs },
  entryAction: { fontSize: 13, fontWeight: "800" },
  orRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  or: { fontSize: 11 },
  manual: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
  },
  manualText: { flex: 1 },
  manualTitle: { fontSize: 15, fontWeight: "800" },
  manualSub: { fontSize: 12, marginTop: 3 },
  loadingPanel: { alignItems: "center", flexDirection: "row", gap: spacing.md, shadowOpacity: 0 },
  loadingText: { fontSize: 13, fontWeight: "700" },
  message: { alignItems: "center", borderRadius: radii.md, flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  messageText: { flex: 1, fontSize: 12, fontWeight: "700" },
  resultPanel: { borderWidth: 1, gap: spacing.md },
  handle: { alignSelf: "center", borderRadius: 2, height: 4, width: 64 },
  panelHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  panelTitle: { fontSize: 15, fontWeight: "800" },
  preview: { borderRadius: radii.md, padding: spacing.lg },
  previewLabel: { fontSize: 11, fontWeight: "800" },
  previewText: { fontFamily: "monospace", fontSize: 13, lineHeight: 18, marginTop: spacing.md, minHeight: 72, padding: 0 },
  detected: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 80,
    padding: spacing.lg,
  },
  detectedIndex: { alignItems: "center", borderRadius: radii.sm, height: 32, justifyContent: "center", width: 32 },
  detectedIndexText: { fontSize: 14, fontWeight: "800" },
  detectedContent: { flex: 1, minWidth: 0 },
  detectedTitleRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  detectedTitle: { flexShrink: 1, fontSize: 14, fontWeight: "800" },
  detectedSub: { fontSize: 12, marginTop: spacing.sm },
  check: { alignItems: "center", borderRadius: 12, height: 24, justifyContent: "center", width: 24 },
  actions: { flexDirection: "row", gap: spacing.md },
  actionButton: { flex: 1 },
  detailLabel: { alignSelf: "center", fontSize: 12, fontWeight: "800" },
  detailPanel: { gap: spacing.md },
  fieldLabel: { fontSize: 12, fontWeight: "700" },
  detectedField: { borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.lg },
  detectedText: { fontSize: 15, fontWeight: "600" },
  mono: { fontFamily: "monospace" },
  swapRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm, justifyContent: "center" },
  swapIcon: { alignItems: "center", borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  swapText: { fontSize: 11, fontWeight: "800" },
  url: { fontSize: 13 },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.64 },
});
