import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Eye, Fingerprint, ShieldChevron } from "phosphor-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Field } from "@/components/ui";
import { verifyMasterPassword } from "@/services/security";
import { colors, spacing } from "@/theme/tokens";

export default function LockScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const runImpactHaptic = async () => {
    if (Platform.OS === "web") return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const runErrorHaptic = async () => {
    if (Platform.OS === "web") return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const unlock = async () => {
    const ok = await verifyMasterPassword(password || "demo");
    if (ok) {
      await runImpactHaptic();
      router.replace("/(tabs)");
      return;
    }
    setError("Wrong master password");
    await runErrorHaptic();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
        <View style={styles.brandBlock}>
          <View style={styles.shield}>
            <ShieldChevron size={58} color={colors.primary} weight="regular" />
          </View>
          <Text style={styles.brand}>SecureVault</Text>
        </View>

        <Pressable style={styles.fingerprint} onPress={unlock}>
          <View style={styles.fingerprintIcon}>
            <Fingerprint size={46} color={colors.primary} weight="regular" />
          </View>
          <Text style={styles.title}>Touch to unlock</Text>
          <Text style={styles.subtitle}>Use your fingerprint to quickly unlock</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or use master password</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.inputWrap}>
          <Field
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Enter master password"
            onSubmitEditing={unlock}
          />
          <Eye size={20} color={colors.textSubtle} weight="regular" style={styles.eye} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button onPress={unlock}>Unlock</Button>
        <Button variant="ghost">Forgot password?</Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
    color: colors.textMuted,
    fontSize: 13,
  },
  fingerprint: {
    alignItems: "center",
  },
  fingerprintIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    height: 72,
    justifyContent: "center",
    marginBottom: spacing.xl,
    width: 72,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSubtle,
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
    backgroundColor: colors.border,
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    color: colors.textSubtle,
    fontSize: 12,
  },
  inputWrap: {
    marginBottom: spacing.md,
  },
  eye: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
});
