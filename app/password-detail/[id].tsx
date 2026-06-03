import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { CaretLeft, Check, Copy, Eye, EyeSlash, NotePencil, Star, Trash } from "phosphor-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Button, Card, SectionLabel } from "@/components/ui";
import { categoryMeta, findVaultItem, getVisibleVaultItems, moveVaultItemToRecycleBin, toggleVaultFavorite } from "@/data/vault";
import { useLanguage } from "@/providers/language";
import { colors, spacing } from "@/theme/tokens";

const getPasswordScore = (password?: string) => {
  if (!password) return 0;

  let score = password.length >= 8 ? 1 : 0;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

// 密码详情页：展示单条记录、复制/显隐密码、健康状态和历史记录。
export default function PasswordDetailScreen() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [revealed, setRevealed] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [copiedKey, setCopiedKey] = useState<null | "account" | "password" | "quick-copy">(null);
  const resetCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 兜底到第一条演示数据，避免直接访问不存在的动态路由时报空白页。
  const item = useMemo(() => findVaultItem(id) ?? getVisibleVaultItems()[0], [id, refreshVersion]);
  const passwordScore = getPasswordScore(item.password);
  const healthColor = passwordScore >= 4 ? colors.success : passwordScore >= 2 ? colors.warning : colors.danger;
  const healthTitle = passwordScore >= 4 ? t("detail.strongPassword") : passwordScore >= 2 ? t("detail.mediumPassword") : t("detail.weakPassword");
  const meta = categoryMeta[item.category];
  const categoryColor = meta.color;
  const categorySoft = meta.soft;
  const categoryLabel = t(
    item.category === "website"
      ? "category.website"
      : item.category === "app"
        ? "category.app"
        : "category.wifi",
  );

  const passwordText = revealed ? item.password ?? "" : "••••••••••••";
  // 演示数据里 updatedAt 是英文短日期，这里统一转换为当前语言文案。
  const healthDate = formatDateLabel(item.updatedAt, t);
  const healthSub = t("detail.healthSub").replace("{date}", healthDate);
  const history = item.passwordHistory ?? [
    { label: "current" as const, date: item.updatedAt },
    { label: "previous" as const, date: "Apr 10" },
    { label: "older" as const, date: "Mar 2" },
  ];
  const accountValue = item.username ?? item.url ?? item.password ?? "";
  const accountCopied = copiedKey === "account";
  const passwordCopied = copiedKey === "password";
  const quickCopyDone = copiedKey === "quick-copy";

  useEffect(() => {
    return () => {
      if (resetCopyTimerRef.current) {
        clearTimeout(resetCopyTimerRef.current);
      }
    };
  }, []);

  const copyValue = async (value: string, key: "account" | "password" | "quick-copy") => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    setCopiedKey(key);
    if (resetCopyTimerRef.current) {
      clearTimeout(resetCopyTimerRef.current);
    }
    resetCopyTimerRef.current = setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 2000);
  };

  const toggleFavorite = () => {
    toggleVaultFavorite(item.id);
    setRefreshVersion((value) => value + 1);
  };

  const confirmMoveToRecycleBin = () => {
    Alert.alert(t("detail.recycleConfirmTitle"), t("detail.recycleConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("detail.moveToRecycleBin"),
        style: "destructive",
        onPress: () => {
          moveVaultItemToRecycleBin(item.id);
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <CaretLeft size={28} color={colors.text} weight="bold" />
        </Pressable>
        <Text style={styles.navTitle}>{t("detail.title")}</Text>
        <NotePencil size={20} color={colors.primary} weight="regular" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.icon, { backgroundColor: categorySoft }]}>
            <Text style={[styles.iconText, { color: categoryColor }]}>{item.title[0]}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Badge color={categoryColor} soft={categorySoft}>{categoryLabel}</Badge>
        </View>

        <Card style={styles.card}>
          {item.url ? <DetailRow label={t("common.website")} value={item.url} /> : null}
          {item.username ? (
            <DetailRow
              copied={accountCopied}
              label={item.category === "wifi" ? t("detail.security") : t("common.username")}
              onCopy={() => copyValue(item.username ?? "", "account")}
              value={item.username}
            />
          ) : null}
          <View style={styles.detailRow}>
            <View>
              <Text style={styles.label}>{t("common.password")}</Text>
              <Text style={styles.password}>{passwordText}</Text>
            </View>
            <View style={styles.rowActions}>
              <Pressable onPress={() => setRevealed((value) => !value)} style={styles.iconButton}>
                {revealed ? (
                  <EyeSlash size={18} color={colors.primary} weight="regular" />
                ) : (
                  <Eye size={18} color={colors.primary} weight="regular" />
                )}
              </Pressable>
              <Pressable onPress={() => copyValue(item.password ?? "", "password")} style={[styles.iconButton, passwordCopied && styles.iconButtonDone]}>
                {passwordCopied ? <Check size={18} color={colors.success} weight="bold" /> : <Copy size={18} color={colors.primary} weight="regular" />}
              </Pressable>
            </View>
          </View>
        </Card>

        <View style={styles.quickActions}>
          <Action copied={quickCopyDone} icon="copy" label={quickCopyDone ? t("common.copied") : t("detail.copyUser")} onPress={() => copyValue(accountValue, "quick-copy")} />
          <Action icon="star" label={t("common.favorite")} active={item.favorite} onPress={toggleFavorite} />
          <Action icon="trash" label={t("common.delete")} danger onPress={confirmMoveToRecycleBin} />
        </View>

        <SectionLabel>{t("detail.passwordHealth")}</SectionLabel>
        <Card style={styles.health}>
          <View>
            <Text style={styles.healthTitle}>{healthTitle}</Text>
            <Text style={styles.healthSub}>{healthSub}</Text>
          </View>
          <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
        </Card>

        <SectionLabel>{t("detail.passwordHistory")}</SectionLabel>
        <Card style={styles.history}>
          {history.map((entry, index) => (
            <View key={`${entry.label}-${entry.date}`} style={[styles.historyRow, index < history.length - 1 && styles.historyDivider]}>
              <Text style={styles.historyTitle}>{getHistoryLabel(entry.label, t)}</Text>
              <Text style={styles.historyDate}>{formatDateLabel(entry.date, t)}</Text>
            </View>
          ))}
        </Card>

        <Button variant="secondary" onPress={confirmMoveToRecycleBin}>{t("detail.moveToRecycleBin")}</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDateLabel(date: string, t: ReturnType<typeof useLanguage>["t"]) {
  if (date === "Today") return t("common.today");
  if (date === "Apr 10") return t("detail.updatedApr10");
  if (date === "Mar 2") return t("detail.updatedMar2");
  return date;
}

function getHistoryLabel(label: "current" | "previous" | "older", t: ReturnType<typeof useLanguage>["t"]) {
  if (label === "current") return t("detail.currentPassword");
  if (label === "previous") return t("detail.previousPassword");
  return t("detail.olderPassword");
}

function DetailRow({ label, value, copied = false, onCopy }: { label: string; value: string; copied?: boolean; onCopy?: () => void }) {
  // 可复制字段保持同一行样式，减少详情卡片里的重复 JSX。
  return (
    <View style={styles.detailRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {onCopy ? (
        <Pressable onPress={onCopy} style={[styles.iconButton, copied && styles.iconButtonDone]}>
          {copied ? <Check size={18} color={colors.success} weight="bold" /> : <Copy size={18} color={colors.primary} weight="regular" />}
        </Pressable>
      ) : null}
    </View>
  );
}

function Action({
  icon,
  label,
  active,
  copied,
  danger,
  onPress,
}: {
  icon: "copy" | "star" | "trash";
  label: string;
  active?: boolean;
  copied?: boolean;
  danger?: boolean;
  onPress: () => void;
}) {
  const color = copied ? colors.success : danger ? colors.danger : active ? colors.favorite : colors.primary;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, copied && styles.actionDone, pressed && styles.actionPressed]}>
      {icon === "copy" ? (
        copied ? <Check size={20} color={color} weight="bold" /> : <Copy size={20} color={color} weight="regular" />
      ) : icon === "star" ? (
        <Star size={20} color={color} weight={active ? "fill" : "regular"} />
      ) : (
        <Trash size={20} color={color} weight="regular" />
      )}
      <Text style={[styles.actionText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: spacing.lg },
  back: { marginLeft: -spacing.sm },
  navTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  content: { gap: spacing.xl, padding: spacing.xl, paddingBottom: spacing.xxxl },
  hero: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xl },
  icon: { alignItems: "center", borderRadius: 22, height: 72, justifyContent: "center", width: 72 },
  iconText: { fontSize: 30, fontWeight: "900" },
  title: { color: colors.text, fontSize: 24, fontWeight: "900" },
  card: { gap: spacing.lg },
  detailRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  label: { color: colors.textSubtle, fontSize: 12, fontWeight: "700", marginBottom: spacing.xs },
  value: { color: colors.text, fontSize: 15, fontWeight: "700" },
  password: { color: colors.text, fontFamily: "monospace", fontSize: 18, fontWeight: "800" },
  rowActions: { flexDirection: "row", gap: spacing.sm },
  iconButton: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  iconButtonDone: { backgroundColor: colors.successSoft },
  quickActions: { flexDirection: "row", gap: spacing.md },
  action: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: spacing.sm, padding: spacing.lg },
  actionDone: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  actionPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  actionText: { fontSize: 12, fontWeight: "800" },
  health: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", shadowOpacity: 0 },
  healthTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  healthSub: { color: colors.textSubtle, fontSize: 12, marginTop: spacing.xs },
  healthDot: { borderRadius: 8, height: 16, width: 16 },
  history: { padding: 0, shadowOpacity: 0 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", padding: spacing.lg },
  historyDivider: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  historyTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  historyDate: { color: colors.textSubtle, fontSize: 13 },
});
