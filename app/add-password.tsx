import { router } from "expo-router";
import { ArrowClockwise, CaretLeft, CheckCircle, Copy, Eye, Star } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Field, SectionLabel } from "@/components/ui";
import { categoryMeta, VaultCategory } from "@/data/vault";
import { colors, radii, spacing } from "@/theme/tokens";

const categories: VaultCategory[] = ["website", "app", "wifi", "note"];

export default function AddPasswordScreen() {
  const [category, setCategory] = useState<VaultCategory>("website");
  const [password, setPassword] = useState("xK#9mP$2wLq&");
  const [favorite, setFavorite] = useState(false);
  const [expiry, setExpiry] = useState(false);

  const generated = "xK#9mP$2wLq&4Rn";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.navButton}>
          <CaretLeft size={28} color={colors.text} weight="bold" />
        </Pressable>
        <Text style={styles.navTitle}>Add Password</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.save}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionLabel>Category</SectionLabel>
        <View style={styles.chips}>
          {categories.map((item) => {
            const active = item === category;
            const meta = categoryMeta[item];
            return (
              <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, active && { backgroundColor: meta.soft, borderColor: meta.color }]}>
                <Text style={[styles.chipText, active && { color: meta.color }]}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.form}>
          <SectionLabel>{category === "wifi" ? "SSID" : "Title"}</SectionLabel>
          <Field defaultValue={category === "wifi" ? "Home WiFi 5G" : category === "note" ? "Office Safe Code" : "Taobao"} />

          {category === "website" ? (
            <>
              <SectionLabel>Website URL</SectionLabel>
              <Field defaultValue="https://taobao.com" />
            </>
          ) : null}

          {category !== "note" ? (
            <>
              <SectionLabel>{category === "wifi" ? "Security" : "Username / Email"}</SectionLabel>
              <Field defaultValue={category === "wifi" ? "WPA2" : "13800138000"} />
            </>
          ) : null}

          <SectionLabel>{category === "note" ? "Secret" : "Password"}</SectionLabel>
          <View>
            <Field value={password} onChangeText={setPassword} secureTextEntry={false} style={styles.monoInput} />
            <Eye size={20} color={colors.primary} weight="regular" style={styles.eye} />
          </View>
          <View style={styles.strengthTrack}>
            <View style={styles.strengthFill} />
          </View>
          <View style={styles.strengthRow}>
            <Text style={styles.strong}>Strong</Text>
            <Text style={styles.length}>{password.length} characters</Text>
          </View>

          <Button variant="secondary">Generate new password</Button>
        </View>

        <Card style={styles.generator}>
          <View style={styles.handle} />
          <View style={styles.generatedBox}>
            <Text style={styles.generated}>{generated}</Text>
            <View style={styles.generatedActions}>
              <ArrowClockwise size={18} color={colors.primary} weight="regular" />
              <Copy size={18} color={colors.textMuted} weight="regular" />
            </View>
          </View>
          <View style={styles.sliderHeader}>
            <Text style={styles.generatorLabel}>Length</Text>
            <Text style={styles.sliderValue}>16</Text>
          </View>
          <View style={styles.slider}>
            <View style={styles.sliderFill} />
            <View style={styles.sliderKnob} />
          </View>
          <Text style={styles.generatorLabel}>Characters</Text>
          <View style={styles.optionsGrid}>
            {["A-Z Uppercase", "a-z Lowercase", "0-9 Numbers", "!@#$ Symbols"].map((option) => (
              <View key={option} style={styles.option}>
                <Text style={styles.optionText}>{option}</Text>
                <CheckCircle size={18} color={colors.primary} weight="fill" />
              </View>
            ))}
          </View>
          <Button onPress={() => setPassword(generated)}>Use this password</Button>
        </Card>

        <SectionLabel>Advanced</SectionLabel>
        <SettingSwitch title="Password expiry reminder" subtitle="Get notified when password needs changing" value={expiry} onPress={() => setExpiry(!expiry)} />
        <SettingSwitch title="Add to favorites" subtitle="Pin to top for quick access" value={favorite} onPress={() => setFavorite(!favorite)} icon="star" />

        <SectionLabel>Notes (optional)</SectionLabel>
        <Field multiline defaultValue="" placeholder="Add any extra information here..." style={styles.notes} />
        <Button onPress={() => router.back()} style={styles.bottomSave}>Save Password</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingSwitch({ title, subtitle, value, onPress, icon }: { title: string; subtitle: string; value: boolean; onPress: () => void; icon?: "star" }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>{title}</Text>
          <Text style={styles.switchSub}>{subtitle}</Text>
        </View>
        {icon ? (
          <Star size={22} color={value ? colors.favorite : colors.border} weight={value ? "fill" : "regular"} />
        ) : (
          <View style={[styles.toggle, value && styles.toggleOn]}>
            <View style={[styles.knob, value && styles.knobOn]} />
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  nav: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navButton: { marginLeft: -spacing.sm },
  navTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  save: { color: colors.primary, fontSize: 15, fontWeight: "800" },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.xxl },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: "800" },
  form: { gap: spacing.md },
  monoInput: { fontFamily: "monospace" },
  eye: { position: "absolute", right: spacing.lg, top: 14 },
  strengthTrack: { backgroundColor: colors.surfaceMuted, borderRadius: 3, height: 6, overflow: "hidden" },
  strengthFill: { backgroundColor: colors.success, borderRadius: 3, height: 6, width: "80%" },
  strengthRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -spacing.xs },
  strong: { color: colors.success, fontSize: 12, fontWeight: "700" },
  length: { color: colors.textSubtle, fontSize: 12 },
  generator: { gap: spacing.lg, marginVertical: spacing.xxl },
  handle: { alignSelf: "center", backgroundColor: colors.border, borderRadius: 2, height: 4, width: 64 },
  generatedBox: {
    alignItems: "center",
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    height: 52,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  generated: { color: colors.text, fontFamily: "monospace", fontSize: 18, fontWeight: "800" },
  generatedActions: { flexDirection: "row", gap: spacing.lg },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between" },
  generatorLabel: { color: colors.text, fontSize: 13, fontWeight: "800" },
  sliderValue: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  slider: { backgroundColor: colors.border, borderRadius: 2, height: 4 },
  sliderFill: { backgroundColor: colors.primary, borderRadius: 2, height: 4, width: "78%" },
  sliderKnob: {
    backgroundColor: colors.primary,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    left: "76%",
    position: "absolute",
    top: -8,
    width: 20,
  },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    width: "48%",
  },
  optionText: { color: colors.primary, fontSize: 12, fontWeight: "800" },
  switchRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.md,
    minHeight: 56,
    shadowOpacity: 0,
  },
  switchTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  switchSub: { color: colors.textSubtle, fontSize: 12, marginTop: 3 },
  toggle: { backgroundColor: colors.border, borderRadius: 11, height: 22, justifyContent: "center", padding: 2, width: 40 },
  toggleOn: { backgroundColor: colors.primary },
  knob: { backgroundColor: "#FFFFFF", borderRadius: 9, height: 18, width: 18 },
  knobOn: { alignSelf: "flex-end" },
  notes: { height: 80, paddingTop: spacing.md, textAlignVertical: "top" },
  bottomSave: { marginTop: spacing.xl },
});
