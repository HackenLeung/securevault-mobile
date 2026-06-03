import { router } from "expo-router";
import {
  ArrowsClockwise,
  CameraSlash,
  CaretLeft,
  CaretRight,
  Check,
  Clock,
  Download,
  Fingerprint,
  Globe,
  Key,
  ListBullets,
  Moon,
  Sliders,
  Trash,
  Upload,
} from "phosphor-react-native";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, PasswordField, SectionLabel } from "@/components/ui";
import { useLanguage } from "@/providers/language";
import { AutoLockMinutes, useSecurity } from "@/providers/security";
import { ThemePreference, useTheme } from "@/providers/theme";
import { radii, spacing } from "@/theme/tokens";

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

type SettingItem = {
  icon: keyof typeof settingIcons;
  label: string;
  color: string;
  soft: string;
  value?: string;
  toggle?: boolean;
  active?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
};

type SettingGroup = {
  title: string;
  items: SettingItem[];
};

const themeValueKey: Record<ThemePreference, "theme.currentValue.system" | "theme.currentValue.light" | "theme.currentValue.dark"> = {
  system: "theme.currentValue.system",
  light: "theme.currentValue.light",
  dark: "theme.currentValue.dark",
};

const autoLockOptions: AutoLockMinutes[] = [1, 5, 15, 30, 0];

const getDangerSoft = (isDark: boolean) => (isDark ? "#3C1D24" : "#FCEBEB");

// 设置页按业务分组生成列表，真实可交互的安全项通过 SecurityProvider 落地。
export default function SettingsScreen() {
  const { languagePreference, t } = useLanguage();
  const { colors, theme, themePreference } = useTheme();
  const {
    biometricAvailable,
    changeMasterPassword,
    setAutoLockMinutes,
    setBiometricUnlock,
    setScreenshotProtection,
    settings,
  } = useSecurity();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [autoLockModalVisible, setAutoLockModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const getAutoLockValue = (minutes: AutoLockMinutes) => {
    // 自动锁定时长用枚举值存储，展示时再映射到当前语言文案。
    if (minutes === 0) return t("settings.security.autoLock.never");
    if (minutes === 1) return t("settings.security.autoLock.1");
    if (minutes === 5) return t("settings.security.autoLock.5");
    if (minutes === 15) return t("settings.security.autoLock.15");
    return t("settings.security.autoLock.30");
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
  };

  const closePasswordModal = () => {
    setPasswordModalVisible(false);
    resetPasswordForm();
  };

  const handleChangeMasterPassword = async () => {
    if (savingPassword) return;

    // 先做本地表单校验，避免无效输入触发安全服务写入。
    if (nextPassword.trim().length < 4) {
      Alert.alert(t("settings.security.passwordTooShort"));
      return;
    }

    if (nextPassword !== confirmPassword) {
      Alert.alert(t("settings.security.passwordMismatch"));
      return;
    }

    setSavingPassword(true);
    // 当前密码校验和新密码写入都封装在 SecurityProvider，页面只处理表单状态和提示。
    const ok = await changeMasterPassword(currentPassword, nextPassword);
    setSavingPassword(false);

    if (!ok) {
      Alert.alert(t("settings.security.currentPasswordWrong"));
      return;
    }

    closePasswordModal();
    Alert.alert(t("settings.security.passwordChanged"));
  };

  const handleToggleBiometrics = async () => {
    // 开启时会重新检查设备硬件和录入状态，不可用则保持原设置。
    const ok = await setBiometricUnlock(!settings.biometricUnlock);
    if (!ok) Alert.alert(t("settings.security.biometricUnavailable"));
  };

  const handleToggleScreenshotProtection = async () => {
    // Web 端不支持系统级截屏保护，Provider 会返回 false 并回退状态。
    const ok = await setScreenshotProtection(!settings.screenshotProtection);
    if (!ok) Alert.alert(t("settings.security.screenshotProtectionUnavailable"));
  };

  const handleSelectAutoLock = async (minutes: AutoLockMinutes) => {
    await setAutoLockMinutes(minutes);
    setAutoLockModalVisible(false);
  };

  const groups: SettingGroup[] = [
    // 通过数据驱动渲染设置行，减少每个分组重复写卡片/分割线结构。
    {
      title: t("settings.group.appearance"),
      items: [
        {
          icon: "globe",
          label: t("settings.language.label"),
          value: languagePreference === "system" ? t("settings.followSystem") : t("language.currentValue"),
          color: colors.primary,
          soft: colors.primarySoft,
          onPress: () => router.push("/language"),
        },
        {
          icon: "moon",
          label: t("settings.theme.label"),
          value: t(themeValueKey[themePreference]),
          color: colors.primary,
          soft: colors.primarySoft,
          onPress: () => router.push("/theme"),
        },
      ],
    },
    {
      title: t("settings.group.security"),
      items: [
        {
          icon: "key",
          label: t("settings.security.changeMasterPassword"),
          color: colors.danger,
          soft: getDangerSoft(theme === "dark"),
          onPress: () => setPasswordModalVisible(true),
        },
        {
          icon: "fingerprint",
          label: t("settings.security.biometricUnlock"),
          toggle: true,
          active: settings.biometricUnlock && biometricAvailable,
          color: colors.danger,
          soft: getDangerSoft(theme === "dark"),
          onToggle: handleToggleBiometrics,
        },
        {
          icon: "clock",
          label: t("settings.security.autoLock"),
          value: getAutoLockValue(settings.autoLockMinutes),
          color: colors.danger,
          soft: getDangerSoft(theme === "dark"),
          onPress: () => setAutoLockModalVisible(true),
        },
        {
          icon: "camera-off",
          label: t("settings.security.screenshotProtection"),
          toggle: true,
          active: settings.screenshotProtection,
          color: colors.danger,
          soft: getDangerSoft(theme === "dark"),
          onToggle: handleToggleScreenshotProtection,
        },
      ],
    },
    {
      title: t("settings.group.password"),
      items: [
        {
          icon: "sliders",
          label: t("settings.password.generatorDefaults"),
          color: colors.purple,
          soft: colors.purpleSoft,
          onPress: () => router.push("/generator-defaults"),
        },
      ],
    },
    {
      title: t("settings.group.data"),
      items: [
        { icon: "upload", label: t("settings.data.export"), color: colors.green, soft: colors.greenSoft },
        { icon: "download", label: t("settings.data.import"), color: colors.green, soft: colors.greenSoft },
        { icon: "trash-2", label: t("settings.data.recycleBin"), color: colors.green, soft: colors.greenSoft },
      ],
    },
    {
      title: t("settings.group.other"),
      items: [
        { icon: "refresh-cw", label: t("settings.other.checkUpdates"), value: "v1.0.0", color: colors.warning, soft: colors.warningSoft },
        { icon: "list", label: t("settings.other.changelog"), color: colors.warning, soft: colors.warningSoft },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <CaretLeft size={20} color={colors.text} weight="bold" />
          </Pressable>
          <Text style={[styles.navTitle, { color: colors.text }]}>{t("settings.title")}</Text>
          <View style={styles.navSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {groups.map((group) => (
            <View key={group.title} style={styles.groupWrap}>
              <SectionLabel>{group.title}</SectionLabel>
              <Card style={styles.group}>
                {group.items.map((item, index) => {
                  const content = (
                    <>
                      <View style={[styles.rowIcon, { backgroundColor: item.soft }]}>
                        <SettingIcon name={item.icon} color={item.color} />
                      </View>
                      <Text style={[styles.rowText, { color: colors.text }]} numberOfLines={1}>
                        {item.label}
                      </Text>
                      {item.toggle ? (
                        <View style={[styles.toggle, { backgroundColor: item.active ? colors.primary : colors.border }]}>
                          <View style={[styles.knob, item.active && styles.knobActive]} />
                        </View>
                      ) : (
                        <>
                          {item.value ? <Text style={[styles.value, { color: colors.textSubtle }]}>{item.value}</Text> : null}
                          <CaretRight size={18} color={colors.textSubtle} weight="bold" />
                        </>
                      )}
                    </>
                  );

                  const rowStyle = [
                    styles.row,
                    index < group.items.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                  ];

                  if (item.onPress || item.onToggle) {
                    return (
                      <Pressable key={item.label} onPress={item.onPress ?? item.onToggle} style={rowStyle}>
                        {content}
                      </Pressable>
                    );
                  }

                  return (
                    <View key={item.label} style={rowStyle}>
                      {content}
                    </View>
                  );
                })}
              </Card>
            </View>
          ))}
        </ScrollView>

        <Modal animationType="fade" transparent visible={passwordModalVisible} onRequestClose={closePasswordModal}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalLayer}>
            <Pressable style={styles.modalBackdrop} onPress={closePasswordModal} />
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("settings.security.changeMasterPassword")}</Text>
              <PasswordField
                containerStyle={styles.modalField}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={t("settings.security.currentPassword")}
              />
              <PasswordField
                containerStyle={styles.modalField}
                value={nextPassword}
                onChangeText={setNextPassword}
                placeholder={t("settings.security.newPassword")}
              />
              <PasswordField
                containerStyle={styles.modalField}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("settings.security.confirmPassword")}
              />
              <View style={styles.modalActions}>
                <Button variant="secondary" onPress={closePasswordModal} style={styles.modalButton}>
                  {t("common.cancel")}
                </Button>
                <Button onPress={handleChangeMasterPassword} style={styles.modalButton}>
                  {savingPassword ? t("settings.security.saving") : t("common.save")}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal animationType="fade" transparent visible={autoLockModalVisible} onRequestClose={() => setAutoLockModalVisible(false)}>
          <View style={styles.modalLayer}>
            <Pressable style={styles.modalBackdrop} onPress={() => setAutoLockModalVisible(false)} />
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("settings.security.autoLock")}</Text>
              <View style={styles.optionList}>
                {autoLockOptions.map((minutes) => {
                  const active = minutes === settings.autoLockMinutes;
                  return (
                    <Pressable
                      key={minutes}
                      onPress={() => handleSelectAutoLock(minutes)}
                      style={({ pressed }) => [
                        styles.optionRow,
                        { backgroundColor: active ? colors.primarySoft : colors.surfaceMuted },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.optionText, { color: active ? colors.primary : colors.text }]}>{getAutoLockValue(minutes)}</Text>
                      {active ? <Check size={18} color={colors.primary} weight="bold" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  nav: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  backButton: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  navTitle: { flex: 1, fontSize: 17, fontWeight: "800", marginLeft: spacing.md },
  navSpacer: {
    width: 36,
  },
  content: { paddingBottom: 120 },
  groupWrap: { marginBottom: spacing.lg },
  group: { borderRadius: radii.md, padding: 0, shadowOpacity: 0 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: spacing.lg,
  },
  rowIcon: {
    alignItems: "center",
    borderRadius: 6,
    height: 28,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 28,
  },
  rowText: { flex: 1, fontSize: 14, fontWeight: "600", paddingRight: spacing.sm },
  value: { fontSize: 13, marginRight: spacing.xs },
  toggle: {
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    paddingHorizontal: 2,
    width: 44,
  },
  knob: {
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    height: 22,
    width: 22,
  },
  knobActive: { alignSelf: "flex-end" },
  modalLayer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.38)",
  },
  modalCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 420,
    padding: spacing.lg,
    width: "100%",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: spacing.lg,
  },
  modalField: {
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
  },
  optionList: {
    gap: spacing.sm,
  },
  optionRow: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    minHeight: 46,
    paddingHorizontal: spacing.lg,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.78,
  },
});

function SettingIcon({ name, color }: { name: keyof typeof settingIcons; color: string }) {
  // 用字符串映射图标组件，避免每一行设置都写重复的条件渲染。
  const Icon = settingIcons[name];
  return <Icon size={16} color={color} weight="regular" />;
}
