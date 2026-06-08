import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LockKey } from "phosphor-react-native";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, PasswordField } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { useTheme } from "@/providers/theme";
import { createMasterPassword } from "@/services/security";
import { radii, spacing } from "@/theme/tokens";

export default function SetupMasterPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { t } = useLanguage();
  const { colors } = useTheme();

  const runSuccessHaptic = async () => {
    if (Platform.OS === "web") return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCreatePassword = async () => {
    if (saving) return;

    if (password.trim().length < 4) {
      Alert.alert(t("setupMasterPassword.passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("setupMasterPassword.passwordMismatch"));
      return;
    }

    setSaving(true);
    const ok = await createMasterPassword(password);
    setSaving(false);

    if (!ok) {
      Alert.alert(t("setupMasterPassword.createFailed"));
      return;
    }

    await runSuccessHaptic();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
            <LockKey size={34} color={colors.primary} weight="regular" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t("setupMasterPassword.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSubtle }]}>{t("setupMasterPassword.subtitle")}</Text>
        </View>

        <View style={styles.form}>
          <PasswordField
            containerStyle={styles.field}
            value={password}
            onChangeText={setPassword}
            placeholder={t("setupMasterPassword.passwordPlaceholder")}
            onSubmitEditing={handleCreatePassword}
          />
          <PasswordField
            containerStyle={styles.field}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("setupMasterPassword.confirmPlaceholder")}
            onSubmitEditing={handleCreatePassword}
          />
          <Text style={[styles.tip, { color: colors.textMuted }]}>{t("setupMasterPassword.tip")}</Text>
        </View>

        <Button onPress={handleCreatePassword} style={styles.action}>
          {saving ? t("settings.security.saving") : t("setupMasterPassword.action")}
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: radii.lg,
    height: 68,
    justifyContent: "center",
    marginBottom: spacing.xl,
    width: 68,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  form: {
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.md,
  },
  tip: {
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  action: {
    marginTop: spacing.sm,
  },
});
