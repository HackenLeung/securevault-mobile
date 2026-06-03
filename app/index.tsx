import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Fingerprint, ShieldChevron } from "phosphor-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, PasswordField } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { useSecurity } from "@/providers/security";
import { useTheme } from "@/providers/theme";
import { spacing } from "@/theme/tokens";

export default function LockScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { authenticateWithBiometrics, biometricAvailable, settings, verifyPassword } = useSecurity();
  const { colors } = useTheme();

  const runImpactHaptic = async () => {
    if (Platform.OS === "web") return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const runErrorHaptic = async () => {
    if (Platform.OS === "web") return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const unlock = async () => {
    const ok = await verifyPassword(password);
    if (ok) {
      await runImpactHaptic();
      router.replace("/(tabs)");
      return;
    }
    setError(t("lock.wrongMasterPassword"));
    await runErrorHaptic();
  };

  const unlockWithBiometrics = async () => {
    const ok = await authenticateWithBiometrics();
    if (ok) {
      await runImpactHaptic();
      router.replace("/(tabs)");
      return;
    }

    setError(t("lock.biometricUnavailable"));
    await runErrorHaptic();
  };

  const biometricEnabled = settings.biometricUnlock && biometricAvailable;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.brandBlock}>
          <View style={styles.shield}>
            <ShieldChevron size={58} color={colors.primary} weight="regular" />
          </View>
          <Text style={[styles.brand, { color: colors.textMuted }]}>SecureVault</Text>
        </View>

        <Pressable style={[styles.fingerprint, !biometricEnabled && styles.disabled]} onPress={unlockWithBiometrics} disabled={!biometricEnabled}>
          <View style={[styles.fingerprintIcon, { backgroundColor: colors.primarySoft }]}>
            <Fingerprint size={46} color={biometricEnabled ? colors.primary : colors.textSubtle} weight="regular" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t("lock.touchToUnlock")}</Text>
          <Text style={[styles.subtitle, { color: colors.textSubtle }]}>{t("lock.useFingerprint")}</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSubtle }]}>{t("lock.orUseMasterPassword")}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <PasswordField
          containerStyle={styles.inputWrap}
          value={password}
          onChangeText={setPassword}
          placeholder={t("lock.masterPasswordPlaceholder")}
          onSubmitEditing={unlock}
        />
        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <Button onPress={unlock}>{t("lock.unlock")}</Button>
        <Button variant="ghost">{t("lock.forgotPassword")}</Button>
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
  brandBlock: {
    alignItems: "center",
    marginBottom: 64,
  },
  shield: {
    alignItems: "center",
    height: 112,
    justifyContent: "center",
    width: 112,
  },
  brand: {
    fontSize: 13,
  },
  fingerprint: {
    alignItems: "center",
  },
  disabled: {
    opacity: 0.48,
  },
  fingerprintIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xl,
    width: 72,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: spacing.sm,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    marginVertical: 44,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 12,
  },
  inputWrap: {
    marginBottom: spacing.md,
  },
  error: {
    fontSize: 12,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
});
