import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type SupportedLanguage = "zh" | "en";
export type LanguagePreference = "system" | SupportedLanguage;

// 翻译 key 用联合类型收紧，新增文案时 TypeScript 会提醒中英文是否都补齐。
type TranslationKey =
  | "tabs.home"
  | "tabs.settings"
  | "common.save"
  | "common.cancel"
  | "common.or"
  | "common.website"
  | "common.username"
  | "common.password"
  | "common.delete"
  | "common.favorite"
  | "common.back"
  | "common.today"
  | "common.copied"
  | "settings.title"
  | "settings.group.appearance"
  | "settings.group.security"
  | "settings.group.password"
  | "settings.group.data"
  | "settings.group.other"
  | "settings.language.label"
  | "settings.theme.label"
  | "settings.followSystem"
  | "settings.security.changeMasterPassword"
  | "settings.security.biometricUnlock"
  | "settings.security.autoLock"
  | "settings.security.autoLock.1"
  | "settings.security.autoLock.5"
  | "settings.security.autoLock.15"
  | "settings.security.autoLock.30"
  | "settings.security.autoLock.never"
  | "settings.security.screenshotProtection"
  | "settings.security.currentPassword"
  | "settings.security.newPassword"
  | "settings.security.confirmPassword"
  | "settings.security.passwordTooShort"
  | "settings.security.passwordMismatch"
  | "settings.security.currentPasswordWrong"
  | "settings.security.passwordChanged"
  | "settings.security.saving"
  | "settings.security.biometricUnavailable"
  | "settings.security.screenshotProtectionUnavailable"
  | "settings.password.generatorDefaults"
  | "generatorDefaults.description"
  | "generatorDefaults.preview"
  | "generatorDefaults.strength"
  | "generatorDefaults.save"
  | "settings.data.export"
  | "settings.data.import"
  | "settings.data.recycleBin"
  | "settings.data.exportDone"
  | "settings.data.importDone"
  | "settings.data.importEmpty"
  | "settings.data.importInvalid"
  | "settings.data.recycleEmpty"
  | "settings.data.restore"
  | "settings.data.deleteForever"
  | "settings.data.deleteForeverTitle"
  | "settings.data.deleteForeverMessage"
  | "settings.other.checkUpdates"
  | "settings.other.changelog"
  | "lock.touchToUnlock"
  | "lock.useFingerprint"
  | "lock.orUseMasterPassword"
  | "lock.masterPasswordPlaceholder"
  | "lock.unlock"
  | "lock.forgotPassword"
  | "lock.wrongMasterPassword"
  | "lock.biometricUnavailable"
  | "home.passwordsStored"
  | "home.title"
  | "home.searchPlaceholder"
  | "home.pinned"
  | "common.hide"
  | "common.show"
  | "home.quickEntry"
  | "home.addPassword"
  | "common.copy"
  | "quickEntry.title"
  | "quickEntry.pasteText"
  | "quickEntry.pasteDescription"
  | "quickEntry.pasteDetail"
  | "quickEntry.pasteAction"
  | "quickEntry.manualEntry"
  | "quickEntry.manualDescription"
  | "quickEntry.resultTitle"
  | "quickEntry.foundCount"
  | "quickEntry.originalText"
  | "quickEntry.rerecognize"
  | "quickEntry.confirmSave"
  | "quickEntry.autoFilled"
  | "quickEntry.confirmDetailView"
  | "quickEntry.swapFields"
  | "quickEntry.detectedWebsite"
  | "quickEntry.recognizing"
  | "quickEntry.emptyClipboard"
  | "quickEntry.missingField"
  | "addPassword.title"
  | "addPassword.editTitle"
  | "addPassword.category"
  | "addPassword.field.ssid"
  | "addPassword.field.title"
  | "addPassword.field.websiteUrl"
  | "addPassword.field.security"
  | "addPassword.field.usernameEmail"
  | "addPassword.field.password"
  | "addPassword.generatePassword"
  | "addPassword.generator.length"
  | "addPassword.generator.characters"
  | "addPassword.generator.uppercase"
  | "addPassword.generator.lowercase"
  | "addPassword.generator.numbers"
  | "addPassword.generator.symbols"
  | "addPassword.generator.usePassword"
  | "addPassword.advanced"
  | "addPassword.favoriteTitle"
  | "addPassword.favoriteSubtitle"
  | "addPassword.savePassword"
  | "addPassword.passwordStrong"
  | "addPassword.passwordCharacters"
  | "detail.title"
  | "detail.copyUser"
  | "detail.passwordHealth"
  | "detail.strongPassword"
  | "detail.mediumPassword"
  | "detail.weakPassword"
  | "detail.healthSub"
  | "detail.passwordHistory"
  | "detail.currentPassword"
  | "detail.previousPassword"
  | "detail.olderPassword"
  | "detail.moveToRecycleBin"
  | "detail.recycleConfirmTitle"
  | "detail.recycleConfirmMessage"
  | "detail.security"
  | "detail.updatedApr10"
  | "detail.updatedMar2"
  | "language.title"
  | "language.applyImmediately"
  | "language.followSystem"
  | "language.followSystemDescription"
  | "language.chinese"
  | "language.chineseDescription"
  | "language.english"
  | "language.englishDescription"
  | "language.currentValue"
  | "theme.title"
  | "theme.light"
  | "theme.lightDescription"
  | "theme.dark"
  | "theme.darkDescription"
  | "theme.system"
  | "theme.systemDescription"
  | "theme.applyImmediately"
  | "theme.currentValue.light"
  | "theme.currentValue.dark"
  | "theme.currentValue.system"
  | "category.all"
  | "category.website"
  | "category.app"
  | "category.wifi"
  | "category.website.plural"
  | "category.app.plural"
  | "category.wifi.plural";

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  zh: {
    "tabs.home": "首页",
    "tabs.settings": "设置",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.or": "或",
    "common.website": "网站",
    "common.username": "用户名",
    "common.password": "密码",
    "common.delete": "删除",
    "common.favorite": "收藏",
    "common.back": "返回",
    "common.today": "今天",
    "common.copied": "已复制",
    "settings.title": "设置",
    "settings.group.appearance": "外观",
    "settings.group.security": "安全",
    "settings.group.password": "密码",
    "settings.group.data": "数据",
    "settings.group.other": "其他",
    "settings.language.label": "语言",
    "settings.theme.label": "主题",
    "settings.followSystem": "跟随系统",
    "settings.security.changeMasterPassword": "修改主密码",
    "settings.security.biometricUnlock": "生物识别解锁",
    "settings.security.autoLock": "自动锁定",
    "settings.security.autoLock.1": "1 分钟",
    "settings.security.autoLock.5": "5 分钟",
    "settings.security.autoLock.15": "15 分钟",
    "settings.security.autoLock.30": "30 分钟",
    "settings.security.autoLock.never": "永不",
    "settings.security.screenshotProtection": "截屏保护",
    "settings.security.currentPassword": "当前主密码",
    "settings.security.newPassword": "新主密码",
    "settings.security.confirmPassword": "确认新主密码",
    "settings.security.passwordTooShort": "新主密码至少需要 4 位",
    "settings.security.passwordMismatch": "两次输入的新主密码不一致",
    "settings.security.currentPasswordWrong": "当前主密码错误",
    "settings.security.passwordChanged": "主密码已修改",
    "settings.security.saving": "保存中",
    "settings.security.biometricUnavailable": "当前设备未启用可用的生物识别",
    "settings.security.screenshotProtectionUnavailable": "当前平台暂不支持截屏保护",
    "settings.password.generatorDefaults": "密码生成器默认设置",
    "generatorDefaults.description": "新密码将默认使用此配置",
    "generatorDefaults.preview": "实时预览",
    "generatorDefaults.strength": "强度",
    "generatorDefaults.save": "保存默认设置",
    "settings.data.export": "导出数据",
    "settings.data.import": "导入数据",
    "settings.data.recycleBin": "回收站",
    "settings.data.exportDone": "已导出到剪贴板",
    "settings.data.importDone": "已从剪贴板导入 {count} 条数据",
    "settings.data.importEmpty": "剪贴板为空",
    "settings.data.importInvalid": "剪贴板内容不是有效的密码库数据",
    "settings.data.recycleEmpty": "回收站为空",
    "settings.data.restore": "恢复",
    "settings.data.deleteForever": "删除",
    "settings.data.deleteForeverTitle": "永久删除",
    "settings.data.deleteForeverMessage": "删除后无法恢复，确定继续吗？",
    "settings.other.checkUpdates": "检查更新",
    "settings.other.changelog": "更新日志",
    "lock.touchToUnlock": "点击解锁",
    "lock.useFingerprint": "使用指纹快速解锁",
    "lock.orUseMasterPassword": "或使用主密码",
    "lock.masterPasswordPlaceholder": "请输入主密码",
    "lock.unlock": "解锁",
    "lock.forgotPassword": "忘记密码？",
    "lock.wrongMasterPassword": "主密码错误",
    "lock.biometricUnavailable": "生物识别不可用，请使用主密码",
    "home.passwordsStored": "条密码已保存",
    "home.title": "密码管理器",
    "home.searchPlaceholder": "搜索密码...",
    "home.pinned": "收藏置顶",
    "common.hide": "收起",
    "common.show": "展开",
    "home.quickEntry": "快速录入",
    "home.addPassword": "新增密码",
    "common.copy": "复制",
    "quickEntry.title": "快速录入",
    "quickEntry.pasteText": "粘贴文本",
    "quickEntry.pasteDescription": "粘贴账号信息，自动提取",
    "quickEntry.pasteDetail": "用户名、密码、网站",
    "quickEntry.pasteAction": "粘贴  >",
    "quickEntry.manualEntry": "手动录入",
    "quickEntry.manualDescription": "按步骤填写表单",
    "quickEntry.resultTitle": "识别结果",
    "quickEntry.foundCount": "发现 2 条",
    "quickEntry.originalText": "原始文本",
    "quickEntry.rerecognize": "重新识别",
    "quickEntry.confirmSave": "确认并保存",
    "quickEntry.autoFilled": "已自动填充",
    "quickEntry.confirmDetailView": "确认详情视图",
    "quickEntry.swapFields": "交换字段",
    "quickEntry.detectedWebsite": "网站（识别）",
    "quickEntry.recognizing": "识别中...",
    "quickEntry.emptyClipboard": "暂无可识别文本",
    "quickEntry.missingField": "未识别",
    "addPassword.title": "新增密码",
    "addPassword.editTitle": "编辑密码",
    "addPassword.category": "分类",
    "addPassword.field.ssid": "SSID",
    "addPassword.field.title": "标题",
    "addPassword.field.websiteUrl": "网站地址",
    "addPassword.field.security": "安全类型",
    "addPassword.field.usernameEmail": "用户名 / 邮箱",
    "addPassword.field.password": "密码",
    "addPassword.generatePassword": "生成新密码",
    "addPassword.generator.length": "长度",
    "addPassword.generator.characters": "字符类型",
    "addPassword.generator.uppercase": "A-Z 大写字母",
    "addPassword.generator.lowercase": "a-z 小写字母",
    "addPassword.generator.numbers": "0-9 数字",
    "addPassword.generator.symbols": "!@#$ 符号",
    "addPassword.generator.usePassword": "使用此密码",
    "addPassword.advanced": "高级选项",
    "addPassword.favoriteTitle": "加入收藏",
    "addPassword.favoriteSubtitle": "置顶显示，便于快速访问",
    "addPassword.savePassword": "保存密码",
    "addPassword.passwordStrong": "强",
    "addPassword.passwordCharacters": "个字符",
    "detail.title": "密码详情",
    "detail.copyUser": "复制全部",
    "detail.passwordHealth": "密码健康度",
    "detail.strongPassword": "强密码",
    "detail.mediumPassword": "中等密码",
    "detail.weakPassword": "弱密码",
    "detail.healthSub": "更新于 {date}。未开启过期提醒。",
    "detail.passwordHistory": "密码历史",
    "detail.currentPassword": "当前密码",
    "detail.previousPassword": "上一个密码",
    "detail.olderPassword": "更早密码",
    "detail.moveToRecycleBin": "移入回收站",
    "detail.recycleConfirmTitle": "移入回收站",
    "detail.recycleConfirmMessage": "该条目会从首页列表隐藏。",
    "detail.security": "安全类型",
    "detail.updatedApr10": "4月10日",
    "detail.updatedMar2": "3月2日",
    "language.title": "语言 Language",
    "language.applyImmediately": "切换语言后即刻生效",
    "language.followSystem": "跟随系统",
    "language.followSystemDescription": "Follow system",
    "language.chinese": "中文",
    "language.chineseDescription": "简体中文",
    "language.english": "English",
    "language.englishDescription": "English (US)",
    "language.currentValue": "中文",
    "theme.title": "主题",
    "theme.light": "浅色模式",
    "theme.lightDescription": "始终使用浅色外观",
    "theme.dark": "深色模式",
    "theme.darkDescription": "始终使用深色外观",
    "theme.system": "跟随系统",
    "theme.systemDescription": "自动匹配系统外观设置",
    "theme.applyImmediately": "切换主题后即刻生效",
    "theme.currentValue.light": "浅色模式",
    "theme.currentValue.dark": "深色模式",
    "theme.currentValue.system": "跟随系统",
    "category.all": "全部",
    "category.website": "网站",
    "category.app": "应用",
    "category.wifi": "WiFi",
    "category.website.plural": "网站",
    "category.app.plural": "应用",
    "category.wifi.plural": "WiFi",
  },
  en: {
    "tabs.home": "Home",
    "tabs.settings": "Settings",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.or": "or",
    "common.website": "Website",
    "common.username": "Username",
    "common.password": "Password",
    "common.delete": "Delete",
    "common.favorite": "Favorite",
    "common.back": "Back",
    "common.today": "Today",
    "common.copied": "Copied",
    "settings.title": "Settings",
    "settings.group.appearance": "Appearance",
    "settings.group.security": "Security",
    "settings.group.password": "Password",
    "settings.group.data": "Data",
    "settings.group.other": "Other",
    "settings.language.label": "Language",
    "settings.theme.label": "Theme",
    "settings.followSystem": "Follow system",
    "settings.security.changeMasterPassword": "Change Master Password",
    "settings.security.biometricUnlock": "Biometric Unlock",
    "settings.security.autoLock": "Auto-Lock",
    "settings.security.autoLock.1": "1 minute",
    "settings.security.autoLock.5": "5 minutes",
    "settings.security.autoLock.15": "15 minutes",
    "settings.security.autoLock.30": "30 minutes",
    "settings.security.autoLock.never": "Never",
    "settings.security.screenshotProtection": "Screenshot Protection",
    "settings.security.currentPassword": "Current master password",
    "settings.security.newPassword": "New master password",
    "settings.security.confirmPassword": "Confirm new master password",
    "settings.security.passwordTooShort": "New master password must be at least 4 characters",
    "settings.security.passwordMismatch": "The new passwords do not match",
    "settings.security.currentPasswordWrong": "Current master password is wrong",
    "settings.security.passwordChanged": "Master password changed",
    "settings.security.saving": "Saving",
    "settings.security.biometricUnavailable": "Biometric unlock is not available on this device",
    "settings.security.screenshotProtectionUnavailable": "Screenshot protection is not supported on this platform",
    "settings.password.generatorDefaults": "Password Generator Defaults",
    "generatorDefaults.description": "New passwords will use this configuration by default",
    "generatorDefaults.preview": "Live Preview",
    "generatorDefaults.strength": "Strength",
    "generatorDefaults.save": "Save Defaults",
    "settings.data.export": "Export Data",
    "settings.data.import": "Import Data",
    "settings.data.recycleBin": "Recycle Bin",
    "settings.data.exportDone": "Exported to clipboard",
    "settings.data.importDone": "{count} items imported from clipboard",
    "settings.data.importEmpty": "Clipboard is empty",
    "settings.data.importInvalid": "Clipboard content is not valid vault data",
    "settings.data.recycleEmpty": "Recycle bin is empty",
    "settings.data.restore": "Restore",
    "settings.data.deleteForever": "Delete",
    "settings.data.deleteForeverTitle": "Delete permanently",
    "settings.data.deleteForeverMessage": "This cannot be undone. Continue?",
    "settings.other.checkUpdates": "Check for Updates",
    "settings.other.changelog": "Changelog",
    "lock.touchToUnlock": "Touch to unlock",
    "lock.useFingerprint": "Use your fingerprint to quickly unlock",
    "lock.orUseMasterPassword": "or use master password",
    "lock.masterPasswordPlaceholder": "Enter master password",
    "lock.unlock": "Unlock",
    "lock.forgotPassword": "Forgot password?",
    "lock.wrongMasterPassword": "Wrong master password",
    "lock.biometricUnavailable": "Biometric unlock is unavailable. Use your master password.",
    "home.passwordsStored": "passwords stored",
    "home.title": "Password Manager",
    "home.searchPlaceholder": "Search passwords...",
    "home.pinned": "Pinned",
    "common.hide": "Hide",
    "common.show": "Show",
    "home.quickEntry": "Quick Entry",
    "home.addPassword": "Add Password",
    "common.copy": "Copy",
    "quickEntry.title": "Quick Entry",
    "quickEntry.pasteText": "Paste text",
    "quickEntry.pasteDescription": "Paste account info, auto extract",
    "quickEntry.pasteDetail": "username, password, website",
    "quickEntry.pasteAction": "Paste  >",
    "quickEntry.manualEntry": "Manual entry",
    "quickEntry.manualDescription": "Fill in the form step by step",
    "quickEntry.resultTitle": "Recognition Result",
    "quickEntry.foundCount": "2 found",
    "quickEntry.originalText": "Original text",
    "quickEntry.rerecognize": "Re-recognize",
    "quickEntry.confirmSave": "Confirm and Save",
    "quickEntry.autoFilled": "Auto-filled",
    "quickEntry.confirmDetailView": "Confirm detail view",
    "quickEntry.swapFields": "Swap fields",
    "quickEntry.detectedWebsite": "Website (detected)",
    "quickEntry.recognizing": "Recognizing...",
    "quickEntry.emptyClipboard": "No recognizable text yet.",
    "quickEntry.missingField": "Not detected",
    "addPassword.title": "Add Password",
    "addPassword.editTitle": "Edit Password",
    "addPassword.category": "Category",
    "addPassword.field.ssid": "SSID",
    "addPassword.field.title": "Title",
    "addPassword.field.websiteUrl": "Website URL",
    "addPassword.field.security": "Security",
    "addPassword.field.usernameEmail": "Username / Email",
    "addPassword.field.password": "Password",
    "addPassword.generatePassword": "Generate new password",
    "addPassword.generator.length": "Length",
    "addPassword.generator.characters": "Characters",
    "addPassword.generator.uppercase": "A-Z Uppercase",
    "addPassword.generator.lowercase": "a-z Lowercase",
    "addPassword.generator.numbers": "0-9 Numbers",
    "addPassword.generator.symbols": "!@#$ Symbols",
    "addPassword.generator.usePassword": "Use this password",
    "addPassword.advanced": "Advanced",
    "addPassword.favoriteTitle": "Add to favorites",
    "addPassword.favoriteSubtitle": "Pin to top for quick access",
    "addPassword.savePassword": "Save Password",
    "addPassword.passwordStrong": "Strong",
    "addPassword.passwordCharacters": "characters",
    "detail.title": "Password Detail",
    "detail.copyUser": "Copy all",
    "detail.passwordHealth": "Password Health",
    "detail.strongPassword": "Strong password",
    "detail.mediumPassword": "Medium password",
    "detail.weakPassword": "Weak password",
    "detail.healthSub": "Updated {date}. No expiry reminder enabled.",
    "detail.passwordHistory": "Password History",
    "detail.currentPassword": "Current password",
    "detail.previousPassword": "Previous password",
    "detail.olderPassword": "Older password",
    "detail.moveToRecycleBin": "Move to Recycle Bin",
    "detail.recycleConfirmTitle": "Move to Recycle Bin",
    "detail.recycleConfirmMessage": "This item will be hidden from the home list.",
    "detail.security": "Security",
    "detail.updatedApr10": "Apr 10",
    "detail.updatedMar2": "Mar 2",
    "language.title": "语言 Language",
    "language.applyImmediately": "Language changes apply immediately",
    "language.followSystem": "Follow system",
    "language.followSystemDescription": "Follow system",
    "language.chinese": "中文",
    "language.chineseDescription": "简体中文",
    "language.english": "English",
    "language.englishDescription": "English (US)",
    "language.currentValue": "English",
    "theme.title": "Theme",
    "theme.light": "Light",
    "theme.lightDescription": "Always use light appearance",
    "theme.dark": "Dark",
    "theme.darkDescription": "Always use dark appearance",
    "theme.system": "Follow system",
    "theme.systemDescription": "Match your device appearance automatically",
    "theme.applyImmediately": "Theme changes apply immediately",
    "theme.currentValue.light": "Light",
    "theme.currentValue.dark": "Dark",
    "theme.currentValue.system": "Follow system",
    "category.all": "All",
    "category.website": "Website",
    "category.app": "App",
    "category.wifi": "WiFi",
    "category.website.plural": "Websites",
    "category.app.plural": "Apps",
    "category.wifi.plural": "WiFi",
  },
};

type LanguageContextValue = {
  languagePreference: LanguagePreference;
  language: SupportedLanguage;
  setLanguagePreference: (language: LanguagePreference) => void;
  t: (key: TranslationKey) => string;
};

const defaultLanguageContext: LanguageContextValue = {
  languagePreference: "zh",
  language: "zh",
  setLanguagePreference: () => {},
  t: (key) => translations.zh[key],
};

const LanguageContext = createContext<LanguageContextValue>(defaultLanguageContext);

const resolveSystemLanguage = (): SupportedLanguage => {
  // 当前只区分中文和英文，非中文系统统一回退到英文。
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith("zh") ? "zh" : "en";
};

// 语言 Provider：保存语言偏好，并提供类型安全的 t(key) 翻译函数。
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference>("zh");

  const value = useMemo<LanguageContextValue>(() => {
    // preference 是用户选择，language 是最终生效语言，system 会在这里解析。
    const language = languagePreference === "system" ? resolveSystemLanguage() : languagePreference;

    return {
      languagePreference,
      language,
      setLanguagePreference,
      t: (key) => translations[language][key],
    };
  }, [languagePreference]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
