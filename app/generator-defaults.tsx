import { router } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { GestureResponderEvent, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "@/providers/language";
import { useTheme } from "@/providers/theme";
import { radii, spacing } from "@/theme/tokens";

const MIN_LENGTH = 8;
const MAX_LENGTH = 30;
const DEFAULT_LENGTH = 16;
const LENGTH_PRESETS = [8, 12, 16, 24, 30];
const SLIDER_MARKS = [8, 12, 16, 24, 30];

const CHARACTER_SETS = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijkmnopqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%&*",
} as const;

type CharacterType = keyof typeof CHARACTER_SETS;

const CHARACTER_TYPES: Array<{ id: CharacterType; icon: string }> = [
  { id: "uppercase", icon: "A" },
  { id: "lowercase", icon: "a" },
  { id: "numbers", icon: "1" },
  { id: "symbols", icon: "#" },
];

type CharacterState = Record<CharacterType, boolean>;

const defaultCharacterState: CharacterState = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// 字符类型文案复用新增密码页的翻译 key，保证两个生成器界面口径一致。
const getCharacterLabelKey = (type: CharacterType) => {
  if (type === "uppercase") return "addPassword.generator.uppercase";
  if (type === "lowercase") return "addPassword.generator.lowercase";
  if (type === "numbers") return "addPassword.generator.numbers";
  return "addPassword.generator.symbols";
};

// 默认设置页的预览密码使用确定性算法，便于同一配置下稳定展示预览。
const generatePassword = (length: number, characters: CharacterState) => {
  const activeTypes = CHARACTER_TYPES.map((item) => item.id).filter((type) => characters[type]);
  const pool = activeTypes.map((type) => CHARACTER_SETS[type]).join("");
  const seed = "SecureVault";
  const password = activeTypes.map((type, index) => {
    const set = CHARACTER_SETS[type];
    return set[(length + index * 7) % set.length];
  });

  for (let index = password.length; index < length; index += 1) {
    const seedCode = seed.charCodeAt(index % seed.length);
    password.push(pool[(index * 13 + seedCode + length) % pool.length]);
  }

  return password.join("");
};

// 根据长度和启用字符类型粗略估算强度，用于设置页的即时反馈。
const getStrengthScore = (length: number, enabledCount: number) => {
  let score = 1;
  if (length >= 12) score += 1;
  if (length >= 16 && enabledCount >= 3) score += 1;
  if (length >= 24 && enabledCount >= 4) score += 1;
  return clamp(score, 1, 4);
};

// 密码生成器默认设置页：调整未来新密码生成的长度和字符类型偏好。
export default function GeneratorDefaultsScreen() {
  const { t } = useLanguage();
  const { colors, theme } = useTheme();
  const [passwordLength, setPasswordLength] = useState(DEFAULT_LENGTH);
  const [previewLength, setPreviewLength] = useState(DEFAULT_LENGTH);
  const [isSliding, setIsSliding] = useState(false);
  const [characters, setCharacters] = useState<CharacterState>(defaultCharacterState);
  const sliderTouchRef = useRef<View>(null);
  const sliderMetricsRef = useRef({ pageX: 0, width: 0 });

  const enabledCount = useMemo(() => Object.values(characters).filter(Boolean).length, [characters]);
  const previewPassword = useMemo(() => generatePassword(previewLength, characters), [characters, previewLength]);
  const strengthScore = useMemo(() => getStrengthScore(previewLength, enabledCount), [enabledCount, previewLength]);
  const progress = (passwordLength - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH);

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

  const setLengthFromPosition = useCallback((event: GestureResponderEvent, commitPreview = false, metrics = sliderMetricsRef.current) => {
    if (metrics.width <= 0) return;

    // 用页面坐标减去滑块容器起点，避免 locationX 因命中填充条/圆点而切换参考系。
    const offsetX = metrics.pageX > 0 ? event.nativeEvent.pageX - metrics.pageX : event.nativeEvent.locationX;
    const nextProgress = clamp(offsetX / metrics.width, 0, 1);
    const nextLength = Math.round(MIN_LENGTH + nextProgress * (MAX_LENGTH - MIN_LENGTH));
    setPasswordLength((current) => (current === nextLength ? current : nextLength));
    if (commitPreview) {
      setPreviewLength((current) => (current === nextLength ? current : nextLength));
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

  const selectPresetLength = useCallback((preset: number) => {
    setPasswordLength(preset);
    setPreviewLength(preset);
  }, []);

  const toggleCharacter = useCallback(
    (type: CharacterType) => {
      setCharacters((current) => {
        // 至少保留一种字符类型，避免预览密码生成时字符池为空。
        if (current[type] && enabledCount <= 1) return current;
        return { ...current, [type]: !current[type] };
      });
    },
    [enabledCount],
  );

  const saveDefaults = useCallback(() => {
    // 当前版本只保存页面内状态；如需持久化，可在这里接入 SecureStore 或全局设置。
    router.back();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.page}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} style={styles.navButton}>
            <CaretLeft size={24} color={colors.primary} weight="bold" />
          </Pressable>
          <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
            {t("settings.password.generatorDefaults")}
          </Text>
          <View style={styles.navButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content} scrollEnabled={!isSliding} showsVerticalScrollIndicator={false}>
          <View style={[styles.notice, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.noticeText, { color: colors.textMuted }]}>{t("generatorDefaults.description")}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t("addPassword.generator.length")}</Text>
              <View style={[styles.valuePill, { backgroundColor: colors.primarySoft }]}>
                <Text style={[styles.valueText, { color: colors.primary }]}>{passwordLength}</Text>
              </View>
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
              <View style={[styles.sliderTrack, { backgroundColor: theme === "dark" ? "#33435F" : "#E2E8F0" }]}>
                <View style={[styles.sliderFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
                <View
                  style={[
                    styles.sliderKnob,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.primary,
                      left: `${progress * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.markRow}>
              {SLIDER_MARKS.map((mark) => (
                <Text key={mark} style={[styles.markText, { color: mark === passwordLength ? colors.primary : colors.textSubtle }]}>
                  {mark}
                </Text>
              ))}
            </View>

            <View style={styles.presetRow}>
              {LENGTH_PRESETS.map((preset) => {
                const active = preset === passwordLength;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => selectPresetLength(preset)}
                    style={({ pressed }) => [
                      styles.presetButton,
                      { backgroundColor: active ? colors.primary : colors.primarySoft },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.presetText, { color: active ? "#FFFFFF" : colors.primary }]}>{preset}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, styles.sectionTitle, { color: colors.text }]}>{t("addPassword.generator.characters")}</Text>
            <View style={styles.optionList}>
              {CHARACTER_TYPES.map((item) => {
                const active = characters[item.id];
                return (
                  <Pressable key={item.id} onPress={() => toggleCharacter(item.id)} style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}>
                    <View style={[styles.optionIcon, { backgroundColor: active ? colors.primarySoft : colors.surfaceMuted }]}>
                      <Text style={[styles.optionIconText, { color: active ? colors.primary : colors.textSubtle }]}>{item.icon}</Text>
                    </View>
                    <Text style={[styles.optionText, { color: active ? colors.text : colors.textSubtle }]} numberOfLines={1}>
                      {t(getCharacterLabelKey(item.id))}
                    </Text>
                    <ToggleSwitch active={active} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.previewLabel, { color: colors.textSubtle }]}>{t("generatorDefaults.preview")}</Text>
            <View style={[styles.previewBox, { backgroundColor: colors.bg, borderColor: colors.border }]}>
              <Text style={[styles.previewText, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                {previewPassword}
              </Text>
            </View>
            <View style={styles.strengthRow}>
              <Text style={[styles.strengthLabel, { color: colors.textMuted }]}>{t("generatorDefaults.strength")}</Text>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4].map((bar) => (
                  <View
                    key={bar}
                    style={[
                      styles.strengthBar,
                      { backgroundColor: bar <= strengthScore ? colors.success : theme === "dark" ? "#3B465C" : "#DDE4EC" },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthValue, { color: colors.success }]}>{t("addPassword.passwordStrong")}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.bg }]}>
          <Pressable onPress={saveDefaults} style={({ pressed }) => [styles.saveButton, { backgroundColor: colors.primary }, pressed && styles.savePressed]}>
            <Text style={styles.saveText}>{t("generatorDefaults.save")}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ToggleSwitch({ active }: { active: boolean }) {
  // 纯展示型开关，点击事件由父级 optionRow 统一处理。
  const { colors, theme } = useTheme();
  const offColor = theme === "dark" ? "#536174" : "#CBD5E1";

  return (
    <View style={[styles.switchTrack, { backgroundColor: active ? colors.primary : offColor }]}>
      <View style={[styles.switchKnob, active && styles.switchKnobActive]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: { flex: 1 },
  nav: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: spacing.xl,
  },
  navButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  navTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  content: {
    gap: spacing.xxl,
    padding: spacing.xl,
    paddingBottom: 112,
  },
  notice: {
    borderRadius: radii.md,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  valuePill: {
    alignItems: "center",
    borderRadius: 18,
    height: 32,
    justifyContent: "center",
    minWidth: 60,
    paddingHorizontal: spacing.lg,
  },
  valueText: {
    fontSize: 18,
    fontWeight: "900",
  },
  sliderTouchArea: {
    justifyContent: "center",
    marginTop: spacing.xl,
    minHeight: 28,
  },
  sliderTrack: {
    borderRadius: 3,
    height: 6,
  },
  sliderFill: {
    borderRadius: 3,
    height: 6,
  },
  sliderKnob: {
    borderRadius: 13,
    borderWidth: 3,
    height: 26,
    marginLeft: -13,
    position: "absolute",
    top: -10,
    width: 26,
  },
  markRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  markText: {
    fontSize: 12,
    minWidth: 20,
    textAlign: "center",
  },
  presetRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  presetButton: {
    alignItems: "center",
    borderRadius: radii.sm,
    flex: 1,
    height: 32,
    justifyContent: "center",
  },
  presetText: {
    fontSize: 13,
    fontWeight: "800",
  },
  optionList: {
    gap: spacing.md,
  },
  optionRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 36,
  },
  optionIcon: {
    alignItems: "center",
    borderRadius: 7,
    height: 24,
    justifyContent: "center",
    marginRight: spacing.md,
    width: 24,
  },
  optionIconText: {
    fontSize: 15,
    fontWeight: "900",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    paddingRight: spacing.md,
  },
  switchTrack: {
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 3,
    width: 56,
  },
  switchKnob: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    height: 26,
    width: 26,
  },
  switchKnobActive: {
    alignSelf: "flex-end",
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  previewBox: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  previewText: {
    fontFamily: "monospace",
    fontSize: 18,
    fontWeight: "800",
  },
  strengthRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: spacing.sm,
  },
  strengthBars: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
  },
  strengthBar: {
    borderRadius: 3,
    flex: 1,
    height: 6,
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: spacing.sm,
  },
  footer: {
    bottom: 0,
    left: 0,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    position: "absolute",
    right: 0,
  },
  saveButton: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 50,
    justifyContent: "center",
  },
  savePressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.78,
  },
});
