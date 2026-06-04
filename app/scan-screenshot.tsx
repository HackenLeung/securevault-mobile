import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { CaretLeft, Check, ImageSquare, SpinnerGap, WarningCircle } from "phosphor-react-native";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DetectedRecord, parseCredentialRecords } from "@/services/credential-parser";
import { useLanguage } from "@/providers/language";
import { useTheme } from "@/providers/theme";
import { radii, spacing } from "@/theme/tokens";

type ScanStatus = "idle" | "recognizing" | "done" | "error";

type MatchField = {
  key: "username" | "password" | "url" | "title";
  label: string;
  value: string;
  status: "source" | "manual" | "inferred";
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export default function ScanScreenshotScreen() {
  const { t } = useLanguage();
  const { colors, theme } = useTheme();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [rawText, setRawText] = useState("");
  const [records, setRecords] = useState<DetectedRecord[]>([]);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");
  const isDark = theme === "dark";

  const selectedRecord = records[0];
  const recognizedCount = useMemo(() => {
    if (!selectedRecord) return 0;
    return [selectedRecord.username, selectedRecord.password, selectedRecord.url, selectedRecord.title].filter(Boolean).length;
  }, [selectedRecord]);

  const fields = useMemo<MatchField[]>(
    () => [
      {
        key: "username",
        label: t("common.username"),
        value: selectedRecord?.username ?? "",
        status: selectedRecord?.username ? "source" : "manual",
      },
      {
        key: "password",
        label: t("common.password"),
        value: selectedRecord?.password ?? "",
        status: selectedRecord?.password ? "source" : "manual",
      },
      {
        key: "url",
        label: t("common.website"),
        value: selectedRecord?.url ?? "",
        status: selectedRecord?.url ? "source" : "manual",
      },
      {
        key: "title",
        label: t("addPassword.field.title"),
        value: selectedRecord?.title ?? "",
        status: selectedRecord?.title ? "inferred" : "manual",
      },
    ],
    [selectedRecord, t],
  );

  const parseText = useCallback((text: string) => {
    const parsed = parseCredentialRecords(text);
    setRecords(parsed);
    setStatus("done");
    setMessage(text.trim() && parsed.length === 0 ? t("quickEntry.emptyClipboard") : "");
  }, [t]);

  const pickAndRecognize = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t("quickEntry.scanPermissionDenied"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      mediaTypes: ["images"],
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const nextAsset = result.assets[0];
    setAsset(nextAsset);
    setRawText("");
    setRecords([]);
    setMessage("");
    setStatus("recognizing");

    try {
      if (Platform.OS === "web") {
        setStatus("error");
        setMessage(t("quickEntry.scanWebUnsupported"));
        return;
      }

      const { recognizeText } = require("@infinitered/react-native-mlkit-text-recognition") as typeof import("@infinitered/react-native-mlkit-text-recognition");
      const recognized = await recognizeText(nextAsset.uri);
      const text = recognized.text.trim();
      setRawText(text);
      if (!text) {
        setStatus("done");
        setMessage(t("quickEntry.emptyClipboard"));
        return;
      }
      parseText(text);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("quickEntry.scanError"));
      Alert.alert(t("quickEntry.scanError"));
    }
  }, [parseText, t]);

  const recognizeEditedText = useCallback(() => {
    parseText(rawText);
  }, [parseText, rawText]);

  const confirmSave = useCallback(() => {
    if (!selectedRecord) return;

    router.push({
      pathname: "/add-password",
      params: {
        category: "website",
        title: selectedRecord.title,
        username: selectedRecord.username,
        password: selectedRecord.password,
        url: selectedRecord.url,
      },
    });
  }, [selectedRecord]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.nav, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <CaretLeft size={18} color={colors.textMuted} weight="bold" />
          <Text style={[styles.backText, { color: colors.textMuted }]}>{t("common.back")}</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>{t("quickEntry.scanTitle")}</Text>
        <View style={styles.navSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.description, { color: colors.textMuted }]}>{t("quickEntry.scanUploadDescription")}</Text>

        <Pressable
          onPress={pickAndRecognize}
          style={({ pressed }) => [
            styles.uploadBox,
            {
              backgroundColor: isDark ? colors.surfaceMuted : colors.surface,
              borderColor: colors.border,
            },
            pressed && styles.pressed,
          ]}
        >
          <ImageSquare size={34} color={colors.textSubtle} weight="regular" />
          <Text style={[styles.uploadTitle, { color: colors.textMuted }]}>{t("quickEntry.scanUploadAction")}</Text>
          <Text style={[styles.uploadHint, { color: colors.textSubtle }]}>{t("quickEntry.scanUploadHint")}</Text>
        </Pressable>

        {asset ? (
          <View style={[styles.fileCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <View style={[styles.fileIcon, { backgroundColor: isDark ? colors.surface : colors.primarySoft }]}>
              <Text style={[styles.fileIconText, { color: colors.textMuted }]}>IMG</Text>
            </View>
            <View style={styles.fileText}>
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                {asset.fileName ?? "login-page-screenshot.png"}
              </Text>
              <Text style={[styles.fileMeta, { color: colors.textSubtle }]}>
                {[
                  formatFileSize(asset.fileSize),
                  status === "recognizing" ? t("quickEntry.recognizing") : status === "error" ? t("quickEntry.scanFailed") : t("quickEntry.scanDone"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
            <View style={[styles.spinnerRing, { borderColor: status === "error" ? colors.warningSoft : colors.primarySoft }]}>
              {status === "recognizing" ? (
                <SpinnerGap size={18} color={colors.primary} weight="bold" />
              ) : status === "error" ? (
                <WarningCircle size={17} color={colors.warning} weight="bold" />
              ) : (
                <Check size={16} color={colors.green} weight="bold" />
              )}
            </View>
          </View>
        ) : null}

        {asset || rawText ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("quickEntry.scanOcrResult")}</Text>
            <View style={[styles.ocrBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                multiline
                value={rawText}
                onChangeText={setRawText}
                placeholder={t("quickEntry.emptyClipboard")}
                placeholderTextColor={colors.textSubtle}
                textAlignVertical="top"
                underlineColorAndroid="transparent"
                style={[styles.ocrText, { color: colors.textMuted }]}
              />
            </View>
            {message ? (
              <View style={[styles.messageBox, { backgroundColor: status === "error" ? colors.warningSoft : colors.surfaceMuted }]}>
                <Text style={[styles.messageText, { color: status === "error" ? colors.warning : colors.textMuted }]}>{message}</Text>
              </View>
            ) : null}

            <View style={[styles.matchPanel, { backgroundColor: isDark ? "#071827" : "#EFF8FF", borderColor: colors.primary }]}>
              <View style={styles.matchHeader}>
                <Text style={[styles.matchTitle, { color: colors.primary }]}>{t("quickEntry.scanAutoMatch")}</Text>
                <View style={[styles.matchBadge, { backgroundColor: colors.greenSoft }]}>
                  <Text style={[styles.matchBadgeText, { color: colors.green }]}>
                    {t("quickEntry.scanRecognized").replace("{count}", String(recognizedCount))}
                  </Text>
                </View>
              </View>

              {fields.map((field, index) => (
                <View key={field.key} style={[styles.fieldRow, index > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{field.label}</Text>
                  <Text
                    style={[
                      styles.fieldValue,
                      field.key === "password" && styles.mono,
                      { color: field.value ? colors.text : colors.textSubtle },
                    ]}
                    numberOfLines={1}
                  >
                    {field.value || t("quickEntry.missingField")}
                  </Text>
                  <Text style={[styles.fieldStatus, { color: field.status === "manual" ? colors.warning : colors.green }]}>
                    {field.status === "manual"
                      ? t("quickEntry.scanManualNeeded")
                      : field.status === "source"
                        ? t("quickEntry.scanFromScreenshot")
                        : t("quickEntry.scanInferred")}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <Pressable onPress={recognizeEditedText} style={({ pressed }) => [styles.secondaryButton, { backgroundColor: colors.surfaceMuted }, pressed && styles.pressed]}>
                <Text style={[styles.secondaryText, { color: colors.primary }]}>{t("quickEntry.rerecognize")}</Text>
              </Pressable>
              {selectedRecord ? (
                <Pressable onPress={confirmSave} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.green }, pressed && styles.pressed]}>
                  <Text style={styles.saveText}>{t("quickEntry.confirmSave")}</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  nav: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  backButton: { alignItems: "center", flexDirection: "row", gap: spacing.xs, width: 74 },
  backText: { fontSize: 13, fontWeight: "700" },
  navTitle: { flex: 1, fontSize: 15, fontWeight: "900", textAlign: "center" },
  navSpace: { width: 74 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  description: { fontSize: 12, fontWeight: "600", lineHeight: 20, marginBottom: spacing.lg },
  uploadBox: {
    alignItems: "center",
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: StyleSheet.hairlineWidth,
    height: 130,
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  uploadTitle: { fontSize: 12, fontWeight: "700", marginTop: spacing.md },
  uploadHint: { fontSize: 11, fontWeight: "700", marginTop: spacing.sm },
  fileCard: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  fileIcon: { alignItems: "center", borderRadius: radii.sm, height: 38, justifyContent: "center", width: 44 },
  fileIconText: { fontSize: 12, fontWeight: "800" },
  fileText: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 13, fontWeight: "900" },
  fileMeta: { fontSize: 11, fontWeight: "600", marginTop: 3 },
  spinnerRing: { alignItems: "center", borderRadius: 10, borderWidth: 2, height: 20, justifyContent: "center", width: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "800", marginBottom: spacing.sm, marginTop: spacing.lg },
  ocrBox: { borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md },
  ocrText: { fontFamily: "monospace", fontSize: 11, fontWeight: "700", lineHeight: 18, minHeight: 72, padding: 0 },
  messageBox: { borderRadius: radii.sm, marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  messageText: { fontSize: 11, fontWeight: "800", lineHeight: 16 },
  matchPanel: { borderRadius: radii.md, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, overflow: "hidden" },
  matchHeader: { alignItems: "center", flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  matchTitle: { fontSize: 12, fontWeight: "900" },
  matchBadge: { borderRadius: radii.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  matchBadgeText: { fontSize: 11, fontWeight: "900" },
  fieldRow: { alignItems: "center", flexDirection: "row", minHeight: 40, paddingHorizontal: spacing.md },
  fieldLabel: { fontSize: 12, fontWeight: "700", width: 66 },
  fieldValue: { flex: 1, fontSize: 12, fontWeight: "900", minWidth: 0, textAlign: "center" },
  mono: { fontFamily: "monospace" },
  fieldStatus: { fontSize: 11, fontWeight: "900", textAlign: "right", width: 70 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  secondaryButton: { alignItems: "center", borderRadius: radii.md, flex: 1, height: 48, justifyContent: "center" },
  secondaryText: { fontSize: 15, fontWeight: "900" },
  saveButton: { alignItems: "center", borderRadius: radii.md, flex: 1, height: 48, justifyContent: "center" },
  saveText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.78 },
});
