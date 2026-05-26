import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { Copy, Eye, EyeSlash, NotePencil, Star, Trash, CaretLeft } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Button, Card, SectionLabel } from "@/components/ui";
import { vaultItems } from "@/data/vault";
import { useLanguage } from "@/providers/language";
import { colors, spacing } from "@/theme/tokens";

export default function PasswordDetailScreen() {
  const { t } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [revealed, setRevealed] = useState(false);
  const item = useMemo(() => vaultItems.find((entry) => entry.id === id) ?? vaultItems[0], [id]);
  const categoryColor =
    item.category === "website"
      ? colors.primary
      : item.category === "app"
        ? colors.purple
        : item.category === "wifi"
          ? colors.green
          : colors.warning;
  const categorySoft =
    item.category === "website"
      ? colors.primarySoft
      : item.category === "app"
        ? colors.purpleSoft
        : item.category === "wifi"
          ? colors.greenSoft
          : colors.warningSoft;
  const categoryLabel = t(
    item.category === "website"
      ? "category.website"
      : item.category === "app"
        ? "category.app"
        : item.category === "wifi"
          ? "category.wifi"
          : "category.note",
  );

  const passwordText = revealed ? item.password ?? "" : "••••••••••••";
  const healthDate = item.updatedAt === "Today" ? t("common.today") : item.updatedAt === "Apr 10" ? t("detail.updatedApr10") : t("detail.updatedMar2");
  const healthSub = t("detail.healthSub").replace("{date}", healthDate);

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
          {item.username ? <DetailRow label={item.category === "wifi" ? t("detail.security") : t("common.username")} value={item.username} copy /> : null}
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
              <Pressable onPress={() => Clipboard.setStringAsync(item.password ?? "")} style={styles.iconButton}>
                <Copy size={18} color={colors.primary} weight="regular" />
              </Pressable>
            </View>
          </View>
          {item.note ? <DetailRow label={t("common.note")} value={item.note} /> : null}
        </Card>

        <View style={styles.quickActions}>
          <Action icon="copy" label={t("detail.copyUser")} />
          <Action icon="star" label={t("common.favorite")} active={item.favorite} />
          <Action icon="trash" label={t("common.delete")} danger />
        </View>

        <SectionLabel>{t("detail.passwordHealth")}</SectionLabel>
        <Card style={styles.health}>
          <View>
            <Text style={styles.healthTitle}>{t("detail.strongPassword")}</Text>
            <Text style={styles.healthSub}>{healthSub}</Text>
          </View>
          <View style={styles.healthDot} />
        </Card>

        <SectionLabel>{t("detail.passwordHistory")}</SectionLabel>
        <Card style={styles.history}>
          {[t("detail.currentPassword"), t("detail.previousPassword"), t("detail.olderPassword")].map((entry, index) => (
            <View key={entry} style={[styles.historyRow, index < 2 && styles.historyDivider]}>
              <Text style={styles.historyTitle}>{entry}</Text>
              <Text style={styles.historyDate}>{index === 0 ? t("common.today") : index === 1 ? t("detail.updatedApr10") : t("detail.updatedMar2")}</Text>
            </View>
          ))}
        </Card>

        <Button variant="secondary">{t("detail.moveToRecycleBin")}</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, copy = false }: { label: string; value: string; copy?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {copy ? (
        <Pressable onPress={() => Clipboard.setStringAsync(value)} style={styles.iconButton}>
          <Copy size={18} color={colors.primary} weight="regular" />
        </Pressable>
      ) : null}
    </View>
  );
}

function Action({ icon, label, active, danger }: { icon: "copy" | "star" | "trash"; label: string; active?: boolean; danger?: boolean }) {
  const color = danger ? colors.danger : active ? colors.favorite : colors.primary;
  return (
    <Pressable style={styles.action}>
      {icon === "copy" ? (
        <Copy size={20} color={color} weight="regular" />
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
  quickActions: { flexDirection: "row", gap: spacing.md },
  action: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: spacing.sm, padding: spacing.lg },
  actionText: { fontSize: 12, fontWeight: "800" },
  health: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", shadowOpacity: 0 },
  healthTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  healthSub: { color: colors.textSubtle, fontSize: 12, marginTop: spacing.xs },
  healthDot: { backgroundColor: colors.success, borderRadius: 8, height: 16, width: 16 },
  history: { padding: 0, shadowOpacity: 0 },
  historyRow: { flexDirection: "row", justifyContent: "space-between", padding: spacing.lg },
  historyDivider: { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
  historyTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
  historyDate: { color: colors.textSubtle, fontSize: 13 },
});
