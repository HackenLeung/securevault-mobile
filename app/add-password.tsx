import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowClockwise, CaretLeft, CheckCircle, Copy, Star } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, GestureResponderEvent, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Field, PasswordField, SectionLabel } from "@/components/ui";
import { addVaultItem, findVaultItem, updateVaultItem, VaultCategory } from "@/data/vault";
import { useLanguage } from "@/providers/language";
import { colors, radii, spacing } from "@/theme/tokens";

const categories: VaultCategory[] = ["website", "app", "wifi"];
const MIN_LENGTH = 8;
const MAX_LENGTH = 30;
const DEFAULT_LENGTH = 16;

const CHARACTER_SETS = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%&*",
} as const;

type CharacterType = keyof typeof CHARACTER_SETS;
type CharacterState = Record<CharacterType, boolean>;

const CHARACTER_TYPES: CharacterType[] = ["uppercase", "lowercase", "numbers", "symbols"];
const defaultCharacters: CharacterState = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// 分类字段文案集中映射，避免 JSX 里到处散落三元判断。
const getCategoryLabelKey = (category: VaultCategory) => {
  if (category === "website") return "category.website";
  if (category === "app") return "category.app";
  return "category.wifi";
};

const getCharacterLabelKey = (type: CharacterType) => {
  if (type === "uppercase") return "addPassword.generator.uppercase";
  if (type === "lowercase") return "addPassword.generator.lowercase";
  if (type === "numbers") return "addPassword.generator.numbers";
  return "addPassword.generator.symbols";
};

// 前端演示用密码生成器：确保每个启用的字符类型至少出现一次，再打乱顺序。
const generatePassword = (length: number, characters: CharacterState) => {
  const activeTypes = CHARACTER_TYPES.filter((type) => characters[type]);
  const pool = activeTypes.map((type) => CHARACTER_SETS[type]).join("");
  const required = activeTypes.map((type) => {
    const set = CHARACTER_SETS[type];
    return set[Math.floor(Math.random() * set.length)];
  });

  for (let index = required.length; index < length; index += 1) {
    required.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return required
    .map((char) => ({ char, sort: Math.random() }))
    .sort((left, right) => left.sort - right.sort)
    .map((item) => item.char)
    .join("");
};

// 简单强度评分用于界面反馈，不替代真实安全审计或泄露库检测。
const getPasswordStrength = (password: string) => {
  if (!password) return 0;

  let score = password.length >= 8 ? 1 : 0;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return clamp(score, 1, 4);
};

// 新增密码页：按分类动态展示字段，并内置一个可直接套用的密码生成器。
export default function AddPasswordScreen() {
  const { t, language } = useLanguage();
  const params = useLocalSearchParams<{
    id?: string;
    category?: VaultCategory;
    title?: string;
    username?: string;
    password?: string;
    url?: string;
  }>();
  const editingItem = useMemo(() => findVaultItem(params.id), [params.id]);
  const isEditing = Boolean(editingItem);
  const initialCategory =
    params.category && categories.includes(params.category)
      ? params.category
      : editingItem?.category ?? "website";
  const [category, setCategory] = useState<VaultCategory>(initialCategory);
  const [title, setTitle] = useState(params.title ?? editingItem?.title ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(params.url ?? editingItem?.url ?? "");
  const [account, setAccount] = useState(params.username ?? editingItem?.username ?? "");
  const [password, setPassword] = useState(params.password ?? editingItem?.password ?? "");
  const [favorite, setFavorite] = useState(editingItem?.favorite ?? false);
  const [passwordLength, setPasswordLength] = useState(DEFAULT_LENGTH);
  const [generatedLength, setGeneratedLength] = useState(DEFAULT_LENGTH);
  const [isSliding, setIsSliding] = useState(false);
  const [characters, setCharacters] = useState<CharacterState>(defaultCharacters);
  const [generated, setGenerated] = useState(() => generatePassword(DEFAULT_LENGTH, defaultCharacters));
  const sliderTouchRef = useRef<View>(null);
  const sliderMetricsRef = useRef({ pageX: 0, width: 0 });

  const enabledCount = useMemo(() => Object.values(characters).filter(Boolean).length, [characters]);
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthProgress = passwordStrength === 0 ? 0 : passwordStrength / 4;
  const sliderProgress = (passwordLength - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH);
  const strengthLabel =
    passwordStrength <= 1
      ? language === "zh"
        ? "弱"
        : "Weak"
      : passwordStrength <= 2
        ? language === "zh"
          ? "中"
          : "Medium"
        : t("addPassword.passwordStrong");

  useEffect(() => {
    // 拖动长度时先更新滑块，松手后再生成候选密码，避免预览区高频闪烁。
    setGenerated(generatePassword(generatedLength, characters));
  }, [characters, generatedLength]);

  const measureSlider = useCallback(() => {
    sliderTouchRef.current?.measure((_, __, width, ___, pageX) => {
      sliderMetricsRef.current = { pageX, width };
    });
  }, []);

  const handleSliderLayout = useCallback(
    (width: number) => {
      sliderMetricsRef.current = { ...sliderMetricsRef.current, width };
      requestAnimationFrame(measureSlider);
    },
    [measureSlider],
  );

  const setLengthFromPosition = useCallback((event: GestureResponderEvent, commitGenerated = false, metrics = sliderMetricsRef.current) => {
    if (metrics.width <= 0) return;

    // 使用固定的页面坐标计算滑块位置，避免命中圆点/填充条时 locationX 抖动。
    const offsetX = metrics.pageX > 0 ? event.nativeEvent.pageX - metrics.pageX : event.nativeEvent.locationX;
    const nextProgress = clamp(offsetX / metrics.width, 0, 1);
    const nextLength = Math.round(MIN_LENGTH + nextProgress * (MAX_LENGTH - MIN_LENGTH));
    setPasswordLength((current) => (current === nextLength ? current : nextLength));
    if (commitGenerated) {
      setGeneratedLength((current) => (current === nextLength ? current : nextLength));
    }
  }, []);

  const startSliding = useCallback(
    (event: GestureResponderEvent) => {
      setIsSliding(true);
      sliderTouchRef.current?.measure((_, __, width, ___, pageX) => {
        const metrics = { pageX, width };
        sliderMetricsRef.current = metrics;
        setLengthFromPosition(event, false, metrics);
      });
    },
    [setLengthFromPosition],
  );

  const finishSliding = useCallback(
    (event: GestureResponderEvent) => {
      setLengthFromPosition(event, true);
      setIsSliding(false);
    },
    [setLengthFromPosition],
  );

  const toggleCharacter = useCallback(
    (type: CharacterType) => {
      setCharacters((current) => {
        // 至少保留一种字符类型，否则生成池会为空。
        if (current[type] && enabledCount <= 1) return current;
        return { ...current, [type]: !current[type] };
      });
    },
    [enabledCount],
  );

  const regeneratePassword = useCallback(() => {
    setGenerated(generatePassword(passwordLength, characters));
  }, [characters, passwordLength]);

  const copyGeneratedPassword = useCallback(async () => {
    await Clipboard.setStringAsync(generated);
  }, [generated]);

  const useGeneratedPassword = useCallback(() => {
    setPassword(generated);
  }, [generated]);

  const switchCategory = useCallback((nextCategory: VaultCategory) => {
    // 只切换展示分类，保留快速录入/手动输入的内容；切回网站时网址仍可继续编辑。
    setCategory(nextCategory);
  }, []);

  const handleSave = useCallback(() => {
    const trimmedTitle = title.trim();
    const trimmedPassword = password.trim();

    if (!trimmedTitle || !trimmedPassword) {
      Alert.alert(
        language === "zh" ? "请补全信息" : "Missing information",
        language === "zh" ? "标题和密码不能为空。" : "Title and password cannot be empty.",
      );
      return;
    }

    if (editingItem) {
      updateVaultItem(editingItem.id, {
        title: trimmedTitle,
        category,
        username: account.trim() || undefined,
        password: trimmedPassword,
        url: category === "website" ? websiteUrl.trim() || undefined : undefined,
        favorite,
        passwordHistory:
          editingItem.password && editingItem.password !== trimmedPassword
            ? [
                { label: "current", date: "Today" },
                { label: "previous", date: editingItem.updatedAt },
                ...(editingItem.passwordHistory ?? []).filter((entry) => entry.label !== "current").slice(0, 1),
              ]
            : editingItem.passwordHistory,
        updatedAt: "Today",
      });

      router.dismissTo(`/password-detail/${editingItem.id}`);
      return;
    }

    const idBase = trimmedTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const id = `${idBase || "vault"}-${Date.now()}`;

    // 当前数据层是内存演示数据；接真实存储时可从这里替换为 API/SecureStore 写入。
    addVaultItem({
      id,
      title: trimmedTitle,
      category,
      username: account.trim() || undefined,
      password: trimmedPassword,
      url: category === "website" ? websiteUrl.trim() || undefined : undefined,
      favorite,
      updatedAt: "Today",
    });

    router.replace(`/password-detail/${id}`);
  }, [account, category, editingItem, favorite, language, password, title, websiteUrl]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} style={styles.navButton}>
          <CaretLeft size={28} color={colors.text} weight="bold" />
        </Pressable>
        <Text style={styles.navTitle}>{isEditing ? t("addPassword.editTitle") : t("addPassword.title")}</Text>
        <Pressable onPress={handleSave} hitSlop={8}>
          <Text style={styles.save}>{t("common.save")}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} scrollEnabled={!isSliding} showsVerticalScrollIndicator={false}>
        <SectionLabel>{t("addPassword.category")}</SectionLabel>
        <View style={styles.chips}>
          {categories.map((item) => {
            const active = item === category;
            return (
              <Pressable key={item} onPress={() => switchCategory(item)} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(getCategoryLabelKey(item))}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.form}>
          <SectionLabel>{category === "wifi" ? t("addPassword.field.ssid") : t("addPassword.field.title")}</SectionLabel>
          <Field
            value={title}
            onChangeText={setTitle}
            placeholder={category === "wifi" ? t("addPassword.field.ssid") : t("addPassword.field.title")}
          />

          {category === "website" ? (
            <>
              <SectionLabel>{t("addPassword.field.websiteUrl")}</SectionLabel>
              <Field value={websiteUrl} onChangeText={setWebsiteUrl} placeholder="https://example.com" autoCapitalize="none" keyboardType="url" />
            </>
          ) : null}

          <SectionLabel>{category === "wifi" ? t("addPassword.field.security") : t("addPassword.field.usernameEmail")}</SectionLabel>
          <Field
            value={account}
            onChangeText={setAccount}
            placeholder={category === "wifi" ? "WPA2 / WPA3" : t("addPassword.field.usernameEmail")}
            autoCapitalize="none"
          />

          <SectionLabel>{t("addPassword.field.password")}</SectionLabel>
          <PasswordField
            containerStyle={styles.passwordWrap}
            value={password}
            onChangeText={setPassword}
            placeholder={t("addPassword.field.password")}
            autoCapitalize="none"
            style={styles.monoInput}
          />
          <View style={styles.strengthTrack}>
            <View style={[styles.strengthFill, { width: `${strengthProgress * 100}%` }]} />
          </View>
          <View style={styles.strengthRow}>
            <Text style={[styles.strong, passwordStrength <= 2 && styles.medium]}>{strengthLabel}</Text>
            <Text style={styles.length}>
              {password.length} {t("addPassword.passwordCharacters")}
            </Text>
          </View>

          <Button variant="secondary" onPress={regeneratePassword}>{t("addPassword.generatePassword")}</Button>
        </View>

        <Card style={styles.generator}>
          <View style={styles.handle} />
          <View style={styles.generatedBox}>
            <Text style={styles.generated} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
              {generated}
            </Text>
            <View style={styles.generatedActions}>
              <Pressable onPress={regeneratePassword} hitSlop={8}>
                <ArrowClockwise size={18} color={colors.primary} weight="regular" />
              </Pressable>
              <Pressable onPress={copyGeneratedPassword} hitSlop={8}>
                <Copy size={18} color={colors.textMuted} weight="regular" />
              </Pressable>
            </View>
          </View>
          <View style={styles.sliderHeader}>
            <Text style={styles.generatorLabel}>{t("addPassword.generator.length")}</Text>
            <Text style={styles.sliderValue}>{passwordLength}</Text>
          </View>
          <View
            ref={sliderTouchRef}
            onLayout={(event) => handleSliderLayout(event.nativeEvent.layout.width)}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={startSliding}
            onResponderRelease={finishSliding}
            onResponderTerminate={finishSliding}
            onResponderTerminationRequest={() => false}
            onResponderMove={setLengthFromPosition}
            onStartShouldSetResponder={() => true}
            style={styles.sliderTouchArea}
          >
            <View style={styles.slider}>
              <View style={[styles.sliderFill, { width: `${sliderProgress * 100}%` }]} />
              <View style={[styles.sliderKnob, { left: `${sliderProgress * 100}%` }]} />
            </View>
          </View>
          <Text style={styles.generatorLabel}>{t("addPassword.generator.characters")}</Text>
          <View style={styles.optionsGrid}>
            {CHARACTER_TYPES.map((type) => {
              const active = characters[type];
              return (
                <Pressable key={type} onPress={() => toggleCharacter(type)} style={[styles.option, !active && styles.optionInactive]}>
                  <Text style={[styles.optionText, !active && styles.optionTextInactive]} numberOfLines={1}>
                    {t(getCharacterLabelKey(type))}
                  </Text>
                  <CheckCircle size={18} color={active ? colors.primary : colors.textSubtle} weight={active ? "fill" : "regular"} />
                </Pressable>
              );
            })}
          </View>
          <Button onPress={useGeneratedPassword}>{t("addPassword.generator.usePassword")}</Button>
        </Card>

        <SectionLabel>{t("addPassword.advanced")}</SectionLabel>
        <SettingSwitch title={t("addPassword.favoriteTitle")} subtitle={t("addPassword.favoriteSubtitle")} value={favorite} onPress={() => setFavorite(!favorite)} icon="star" />

        <Button onPress={handleSave} style={styles.bottomSave}>{t("addPassword.savePassword")}</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingSwitch({ title, subtitle, value, onPress, icon }: { title: string; subtitle: string; value: boolean; onPress: () => void; icon?: "star" }) {
  // 复用高级选项行：普通开关和收藏星标共用同一行布局。
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
  chipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipTextActive: { color: colors.primary },
  form: { gap: spacing.md },
  monoInput: { fontFamily: "monospace" },
  passwordWrap: { marginBottom: 0 },
  strengthTrack: { backgroundColor: colors.surfaceMuted, borderRadius: 3, height: 6, overflow: "hidden" },
  strengthFill: { backgroundColor: colors.success, borderRadius: 3, height: 6 },
  strengthRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -spacing.xs },
  strong: { color: colors.success, fontSize: 12, fontWeight: "700" },
  medium: { color: colors.warning },
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
  generated: { color: colors.text, flex: 1, fontFamily: "monospace", fontSize: 18, fontWeight: "800", paddingRight: spacing.md },
  generatedActions: { flexDirection: "row", gap: spacing.lg },
  sliderHeader: { flexDirection: "row", justifyContent: "space-between" },
  generatorLabel: { color: colors.text, fontSize: 13, fontWeight: "800" },
  sliderValue: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  sliderTouchArea: { justifyContent: "center", minHeight: 28 },
  slider: { backgroundColor: colors.border, borderRadius: 2, height: 4 },
  sliderFill: { backgroundColor: colors.primary, borderRadius: 2, height: 4 },
  sliderKnob: {
    backgroundColor: colors.primary,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginLeft: -10,
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
    minHeight: 40,
    padding: spacing.md,
    width: "48%",
  },
  optionInactive: { backgroundColor: colors.surfaceMuted },
  optionText: { color: colors.primary, flex: 1, fontSize: 12, fontWeight: "800", paddingRight: spacing.xs },
  optionTextInactive: { color: colors.textSubtle },
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
  bottomSave: { marginTop: spacing.xl },
});
