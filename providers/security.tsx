import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { updateMasterPassword, verifyMasterPassword } from "@/services/security";

export type AutoLockMinutes = 1 | 5 | 15 | 30 | 0;

type SecuritySettings = {
  biometricUnlock: boolean;
  autoLockMinutes: AutoLockMinutes;
  screenshotProtection: boolean;
};

type SecurityContextValue = {
  settings: SecuritySettings;
  ready: boolean;
  biometricAvailable: boolean;
  setBiometricUnlock: (enabled: boolean) => Promise<boolean>;
  setAutoLockMinutes: (minutes: AutoLockMinutes) => Promise<void>;
  setScreenshotProtection: (enabled: boolean) => Promise<boolean>;
  verifyPassword: (password: string) => Promise<boolean>;
  changeMasterPassword: (currentPassword: string, nextPassword: string) => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
};

const SECURITY_SETTINGS_KEY = "securevault.securitySettings.v1";
const SCREEN_CAPTURE_KEY = "securevault.screenshotProtection";

const defaultSettings: SecuritySettings = {
  biometricUnlock: true,
  autoLockMinutes: 5,
  screenshotProtection: true,
};

const defaultSecurityContext: SecurityContextValue = {
  settings: defaultSettings,
  ready: true,
  biometricAvailable: false,
  setBiometricUnlock: async () => false,
  setAutoLockMinutes: async () => {},
  setScreenshotProtection: async () => false,
  verifyPassword: verifyMasterPassword,
  changeMasterPassword: async () => false,
  authenticateWithBiometrics: async () => false,
};

const SecurityContext = createContext<SecurityContextValue>(defaultSecurityContext);

const parseSettings = (stored: string | null): SecuritySettings => {
  // 存储内容损坏时回退默认设置，避免安全配置解析失败导致应用不可用。
  if (!stored) return defaultSettings;

  try {
    return { ...defaultSettings, ...(JSON.parse(stored) as Partial<SecuritySettings>) };
  } catch {
    return defaultSettings;
  }
};

const readStoredValue = async (key: string) => {
  // Expo SecureStore 不支持 Web，这里用 localStorage 兜底保证网页预览可用。
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
};

const writeStoredValue = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const persistSettings = async (settings: SecuritySettings) => {
  await writeStoredValue(SECURITY_SETTINGS_KEY, JSON.stringify(settings));
};

const loadScreenCapture = async () => {
  try {
    return require("expo-screen-capture") as typeof import("expo-screen-capture");
  } catch {
    return null;
  }
};

// 安全 Provider：集中管理主密码、生物识别、自动锁定和截屏保护等跨页面能力。
export function SecurityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const inactiveAtRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // 设置读取和生物识别能力检测互不依赖，并行执行减少启动等待时间。
      const [storedSettings, hasHardware, isEnrolled] = await Promise.all([
        readStoredValue(SECURITY_SETTINGS_KEY),
        LocalAuthentication.hasHardwareAsync().catch(() => false),
        LocalAuthentication.isEnrolledAsync().catch(() => false),
      ]);

      if (!mounted) return;

      setSettings(parseSettings(storedSettings));
      setBiometricAvailable(hasHardware && isEnrolled);
      setReady(true);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const applyScreenshotProtection = async () => {
      if (Platform.OS === "web") return;

      try {
        const ScreenCapture = await loadScreenCapture();
        if (!ScreenCapture) {
          if (settings.screenshotProtection) {
            setSettings((current) => ({ ...current, screenshotProtection: false }));
          }
          return;
        }

        if (settings.screenshotProtection) {
          await ScreenCapture.preventScreenCaptureAsync(SCREEN_CAPTURE_KEY);
          return;
        }

        await ScreenCapture.allowScreenCaptureAsync(SCREEN_CAPTURE_KEY);
      } catch {
        // 系统 API 调用失败时关闭开关，保证 UI 状态和实际保护能力一致。
        setSettings((current) => ({ ...current, screenshotProtection: false }));
      }
    };

    applyScreenshotProtection();
  }, [settings.screenshotProtection]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      // 记录进入后台的时间，回到前台后再判断是否超过自动锁定阈值。
      if (nextState === "inactive" || nextState === "background") {
        inactiveAtRef.current = Date.now();
        return;
      }

      if (nextState !== "active" || settings.autoLockMinutes === 0 || inactiveAtRef.current === null) return;

      const elapsed = Date.now() - inactiveAtRef.current;
      inactiveAtRef.current = null;

      if (elapsed >= settings.autoLockMinutes * 60 * 1000) {
        // 超时后回到锁屏，不在这里清空业务数据，避免演示数据丢失。
        router.replace("/");
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [settings.autoLockMinutes]);

  const updateSettings = useCallback(async (nextSettings: SecuritySettings) => {
    // 先更新本地状态再持久化，界面响应更快；失败场景后续可在这里补错误回滚。
    setSettings(nextSettings);
    await persistSettings(nextSettings);
  }, []);

  const setBiometricUnlock = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        // 开启生物识别前必须确认设备支持且已有录入，否则不写入启用状态。
        const [hasHardware, isEnrolled] = await Promise.all([
          LocalAuthentication.hasHardwareAsync().catch(() => false),
          LocalAuthentication.isEnrolledAsync().catch(() => false),
        ]);
        const available = hasHardware && isEnrolled;
        setBiometricAvailable(available);

        if (!available) return false;
      }

      await updateSettings({ ...settings, biometricUnlock: enabled });
      return true;
    },
    [settings, updateSettings],
  );

  const setAutoLockMinutes = useCallback(
    async (minutes: AutoLockMinutes) => {
      await updateSettings({ ...settings, autoLockMinutes: minutes });
    },
    [settings, updateSettings],
  );

  const setScreenshotProtection = useCallback(
    async (enabled: boolean) => {
      if (Platform.OS === "web") {
        // Web 无法调用原生截屏保护，强制保持关闭并告知调用方失败。
        await updateSettings({ ...settings, screenshotProtection: false });
        return false;
      }

      const ScreenCapture = await loadScreenCapture();
      if (!ScreenCapture) {
        await updateSettings({ ...settings, screenshotProtection: false });
        return false;
      }

      await updateSettings({ ...settings, screenshotProtection: enabled });
      return true;
    },
    [settings, updateSettings],
  );

  const authenticateWithBiometrics = useCallback(async () => {
    // 未开启或设备不可用时直接失败，避免弹出无效认证框。
    if (!settings.biometricUnlock || !biometricAvailable) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock SecureVault",
      cancelLabel: "Cancel",
      disableDeviceFallback: false,
    }).catch(() => ({ success: false }));

    return result.success;
  }, [biometricAvailable, settings.biometricUnlock]);

  const changeMasterPassword = useCallback(async (currentPassword: string, nextPassword: string) => {
    // 主密码最低长度先在 Provider 兜底，页面也会做更友好的表单校验。
    if (nextPassword.trim().length < 4) return false;
    return updateMasterPassword(currentPassword, nextPassword);
  }, []);

  const value = useMemo<SecurityContextValue>(
    () => ({
      settings,
      ready,
      biometricAvailable,
      setBiometricUnlock,
      setAutoLockMinutes,
      setScreenshotProtection,
      verifyPassword: verifyMasterPassword,
      changeMasterPassword,
      authenticateWithBiometrics,
    }),
    [
      authenticateWithBiometrics,
      biometricAvailable,
      changeMasterPassword,
      ready,
      setAutoLockMinutes,
      setBiometricUnlock,
      setScreenshotProtection,
      settings,
    ],
  );

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurity() {
  return useContext(SecurityContext);
}
