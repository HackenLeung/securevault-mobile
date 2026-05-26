import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export type SupportedLanguage = "zh" | "en";
export type LanguagePreference = "system" | SupportedLanguage;

type TranslationKey =
  | "tabs.home"
  | "tabs.settings"
  | "common.save"
  | "common.or"
  | "common.website"
  | "common.username"
  | "common.password"
  | "common.delete"
  | "common.favorite"
  | "common.today"
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
  | "settings.security.screenshotProtection"
  | "settings.password.generatorDefaults"
  | "settings.data.export"
  | "settings.data.import"
  | "settings.data.recycleBin"
  | "settings.other.checkUpdates"
  | "settings.other.changelog"
  | "lock.touchToUnlock"
  | "lock.useFingerprint"
  | "lock.orUseMasterPassword"
  | "lock.masterPasswordPlaceholder"
  | "lock.unlock"
  | "lock.forgotPassword"
  | "lock.wrongMasterPassword"
  | "home.passwordsStored"
  | "home.searchPlaceholder"
  | "home.pinned"
  | "common.hide"
  | "common.show"
  | "home.quickEntry"
  | "home.addPassword"
  | "common.copy"
  | "common.note"
  | "quickEntry.title"
  | "quickEntry.pasteText"
  | "quickEntry.pasteDescription"
  | "quickEntry.pasteDetail"
  | "quickEntry.pasteAction"
  | "quickEntry.scanTitle"
  | "quickEntry.scanDescription"
  | "quickEntry.scanDetail"
  | "quickEntry.scanAction"
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
  | "addPassword.title"
  | "addPassword.category"
  | "addPassword.field.ssid"
  | "addPassword.field.title"
  | "addPassword.field.websiteUrl"
  | "addPassword.field.security"
  | "addPassword.field.usernameEmail"
  | "addPassword.field.secret"
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
  | "addPassword.expiryTitle"
  | "addPassword.expirySubtitle"
  | "addPassword.favoriteTitle"
  | "addPassword.favoriteSubtitle"
  | "addPassword.notesOptional"
  | "addPassword.notesPlaceholder"
  | "addPassword.savePassword"
  | "addPassword.passwordStrong"
  | "addPassword.passwordCharacters"
  | "detail.title"
  | "detail.copyUser"
  | "detail.passwordHealth"
  | "detail.strongPassword"
  | "detail.healthSub"
  | "detail.passwordHistory"
  | "detail.currentPassword"
  | "detail.previousPassword"
  | "detail.olderPassword"
  | "detail.moveToRecycleBin"
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
  | "category.note"
  | "category.website.plural"
  | "category.app.plural"
  | "category.wifi.plural"
  | "category.note.plural"
  | "status.active";

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  zh: {
    "tabs.home": "首页",
    "tabs.settings": "设置",
    "common.save": "保存",
    "common.or": "或",
    "common.website": "网站",
    "common.username": "用户名",
    "common.password": "密码",
    "common.delete": "删除",
    "common.favorite": "收藏",
    "common.today": "今天",
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
    "settings.security.screenshotProtection": "截屏保护",
    "settings.password.generatorDefaults": "密码生成器默认设置",
    "settings.data.export": "导出数据",
    "settings.data.import": "导入数据",
    "settings.data.recycleBin": "回收站",
    "settings.other.checkUpdates": "检查更新",
    "settings.other.changelog": "更新日志",
    "lock.touchToUnlock": "点击解锁",
    "lock.useFingerprint": "使用指纹快速解锁",
    "lock.orUseMasterPassword": "或使用主密码",
    "lock.masterPasswordPlaceholder": "请输入主密码",
    "lock.unlock": "解锁",
    "lock.forgotPassword": "忘记密码？",
    "lock.wrongMasterPassword": "主密码错误",
    "home.passwordsStored": "条密码已保存",
    "home.searchPlaceholder": "搜索密码...",
    "home.pinned": "收藏置顶",
    "common.hide": "收起",
    "common.show": "展开",
    "home.quickEntry": "快速录入",
    "home.addPassword": "新增密码",
    "common.copy": "复制",
    "common.note": "笔记",
    "quickEntry.title": "快速录入",
    "quickEntry.pasteText": "粘贴文本",
    "quickEntry.pasteDescription": "粘贴账号信息，自动提取",
    "quickEntry.pasteDetail": "用户名、密码、网站",
    "quickEntry.pasteAction": "粘贴  >",
    "quickEntry.scanTitle": "扫描截图",
    "quickEntry.scanDescription": "OCR 识别图片中的文字",
    "quickEntry.scanDetail": "自动识别登录表单",
    "quickEntry.scanAction": "扫描  >",
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
    "addPassword.title": "新增密码",
    "addPassword.category": "分类",
    "addPassword.field.ssid": "SSID",
    "addPassword.field.title": "标题",
    "addPassword.field.websiteUrl": "网站地址",
    "addPassword.field.security": "安全类型",
    "addPassword.field.usernameEmail": "用户名 / 邮箱",
    "addPassword.field.secret": "私密内容",
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
    "addPassword.expiryTitle": "密码过期提醒",
    "addPassword.expirySubtitle": "密码需要更换时提醒我",
    "addPassword.favoriteTitle": "加入收藏",
    "addPassword.favoriteSubtitle": "置顶显示，便于快速访问",
    "addPassword.notesOptional": "备注（可选）",
    "addPassword.notesPlaceholder": "补充其他说明信息...",
    "addPassword.savePassword": "保存密码",
    "addPassword.passwordStrong": "强",
    "addPassword.passwordCharacters": "个字符",
    "detail.title": "密码详情",
    "detail.copyUser": "复制账号",
    "detail.passwordHealth": "密码健康度",
    "detail.strongPassword": "强密码",
    "detail.healthSub": "更新于 {date}。未开启过期提醒。",
    "detail.passwordHistory": "密码历史",
    "detail.currentPassword": "当前密码",
    "detail.previousPassword": "上一个密码",
    "detail.olderPassword": "更早密码",
    "detail.moveToRecycleBin": "移入回收站",
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
    "category.note": "笔记",
    "category.website.plural": "网站",
    "category.app.plural": "应用",
    "category.wifi.plural": "WiFi",
    "category.note.plural": "笔记",
    "status.active": "使用中",
  },
  en: {
    "tabs.home": "Home",
    "tabs.settings": "Settings",
    "common.save": "Save",
    "common.or": "or",
    "common.website": "Website",
    "common.username": "Username",
    "common.password": "Password",
    "common.delete": "Delete",
    "common.favorite": "Favorite",
    "common.today": "Today",
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
    "settings.security.screenshotProtection": "Screenshot Protection",
    "settings.password.generatorDefaults": "Password Generator Defaults",
    "settings.data.export": "Export Data",
    "settings.data.import": "Import Data",
    "settings.data.recycleBin": "Recycle Bin",
    "settings.other.checkUpdates": "Check for Updates",
    "settings.other.changelog": "Changelog",
    "lock.touchToUnlock": "Touch to unlock",
    "lock.useFingerprint": "Use your fingerprint to quickly unlock",
    "lock.orUseMasterPassword": "or use master password",
    "lock.masterPasswordPlaceholder": "Enter master password",
    "lock.unlock": "Unlock",
    "lock.forgotPassword": "Forgot password?",
    "lock.wrongMasterPassword": "Wrong master password",
    "home.passwordsStored": "passwords stored",
    "home.searchPlaceholder": "Search passwords...",
    "home.pinned": "Pinned",
    "common.hide": "Hide",
    "common.show": "Show",
    "home.quickEntry": "Quick Entry",
    "home.addPassword": "Add Password",
    "common.copy": "Copy",
    "common.note": "Note",
    "quickEntry.title": "Quick Entry",
    "quickEntry.pasteText": "Paste text",
    "quickEntry.pasteDescription": "Paste account info, auto extract",
    "quickEntry.pasteDetail": "username, password, website",
    "quickEntry.pasteAction": "Paste  >",
    "quickEntry.scanTitle": "Scan screenshot",
    "quickEntry.scanDescription": "OCR recognize text from image",
    "quickEntry.scanDetail": "Auto detect login forms",
    "quickEntry.scanAction": "Scan  >",
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
    "addPassword.title": "Add Password",
    "addPassword.category": "Category",
    "addPassword.field.ssid": "SSID",
    "addPassword.field.title": "Title",
    "addPassword.field.websiteUrl": "Website URL",
    "addPassword.field.security": "Security",
    "addPassword.field.usernameEmail": "Username / Email",
    "addPassword.field.secret": "Secret",
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
    "addPassword.expiryTitle": "Password expiry reminder",
    "addPassword.expirySubtitle": "Get notified when password needs changing",
    "addPassword.favoriteTitle": "Add to favorites",
    "addPassword.favoriteSubtitle": "Pin to top for quick access",
    "addPassword.notesOptional": "Notes (optional)",
    "addPassword.notesPlaceholder": "Add any extra information here...",
    "addPassword.savePassword": "Save Password",
    "addPassword.passwordStrong": "Strong",
    "addPassword.passwordCharacters": "characters",
    "detail.title": "Password Detail",
    "detail.copyUser": "Copy user",
    "detail.passwordHealth": "Password Health",
    "detail.strongPassword": "Strong password",
    "detail.healthSub": "Updated {date}. No expiry reminder enabled.",
    "detail.passwordHistory": "Password History",
    "detail.currentPassword": "Current password",
    "detail.previousPassword": "Previous password",
    "detail.olderPassword": "Older password",
    "detail.moveToRecycleBin": "Move to Recycle Bin",
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
    "category.note": "Note",
    "category.website.plural": "Websites",
    "category.app.plural": "Apps",
    "category.wifi.plural": "WiFi",
    "category.note.plural": "Notes",
    "status.active": "Active",
  },
};

type LanguageContextValue = {
  languagePreference: LanguagePreference;
  language: SupportedLanguage;
  setLanguagePreference: (language: LanguagePreference) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const resolveSystemLanguage = (): SupportedLanguage => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith("zh") ? "zh" : "en";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [languagePreference, setLanguagePreference] = useState<LanguagePreference>("zh");

  const value = useMemo<LanguageContextValue>(() => {
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
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
