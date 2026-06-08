import * as Clipboard from "expo-clipboard";
import { router, useFocusEffect } from "expo-router";
import { Check, Copy, Gear, Key, Lightning, MagnifyingGlass, Plus, Star } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card } from "@/components/ui";
import { getVisibleVaultItems, maskAccount, VaultCategory, VaultItem } from "@/data/vault";
import { useLanguage } from "@/providers/language";
import { useTheme } from "@/providers/theme";
import { colors as tokenColors, radii, spacing } from "@/theme/tokens";

const tabs: Array<"all" | VaultCategory> = ["all", "website", "app", "wifi"];

// Android 需要显式打开 LayoutAnimation，置顶区和分类切换才会有平滑过渡。
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [category, setCategory] = useState<"all" | VaultCategory>("all");
  const [query, setQuery] = useState("");
  const [showPinned, setShowPinned] = useState(true);
  const [tabsWidth, setTabsWidth] = useState(0);
  const [dataVersion, setDataVersion] = useState(0);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const { t } = useLanguage();
  const { colors, theme } = useTheme();

  const pinnedAnim = useRef(new Animated.Value(1)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = theme === "dark";

  const getAccent = useCallback(
    (item: VaultItem) => {
      const title = item.title.toLowerCase();

      if (title.includes("taobao")) {
        return { color: "#FF6A00", solid: "#FF6A00", soft: isDark ? "#4A1D08" : "#FFF3E8" };
      }

      if (title.includes("wechat")) {
        return { color: "#05C160", solid: "#05C160", soft: isDark ? "#073B22" : "#EAFBF1" };
      }

      if (title.includes("github")) {
        return { color: isDark ? "#FFFFFF" : "#111827", solid: "#111827", soft: isDark ? "#050608" : "#F1F5F9" };
      }

      if (item.category === "app") return { color: colors.purple, solid: colors.purple, soft: colors.purpleSoft };
      if (item.category === "wifi") return { color: colors.green, solid: colors.green, soft: colors.greenSoft };
      return { color: colors.primary, solid: colors.primary, soft: colors.primarySoft };
    },
    [colors, isDark],
  );

  const filtered = useMemo(() => {
    // 搜索范围覆盖标题、账号和 URL；分类筛选与关键词同时满足才展示。
    return getVisibleVaultItems().filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const search = `${item.title} ${item.username ?? ""} ${item.url ?? ""}`.toLowerCase();
      return categoryMatch && search.includes(query.toLowerCase());
    });
  }, [category, dataVersion, query]);

  const visibleItems = getVisibleVaultItems();
  const pinned = visibleItems.filter((item) => item.favorite);
  const hasPinned = pinned.length > 0;
  const isVaultEmpty = visibleItems.length === 0;

  useFocusEffect(
    useCallback(() => {
      setDataVersion((value) => value + 1);
    }, []),
  );

  useEffect(() => {
    // 置顶区折叠时同时收起高度、透明度和底部间距，避免列表产生空白跳动。
    Animated.timing(pinnedAnim, {
      toValue: showPinned ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pinnedAnim, showPinned]);

  useEffect(() => {
    const tabIndex = tabs.indexOf(category);

    // 指示器根据容器实测宽度移动，适配不同屏幕宽度和字体长度。
    Animated.timing(tabIndicatorAnim, {
      toValue: tabsWidth > 0 ? (tabsWidth / tabs.length) * tabIndex : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [category, tabIndicatorAnim, tabsWidth]);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const copyPassword = async (id: string, password?: string) => {
    if (!password) return;
    await Clipboard.setStringAsync(password);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    setCopiedItemId(id);
    copiedTimerRef.current = setTimeout(() => {
      setCopiedItemId(null);
      copiedTimerRef.current = null;
    }, 1000);
  };

  const togglePinned = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPinned((value) => !value);
  };

  const selectCategory = (tab: "all" | VaultCategory) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategory(tab);
  };

  const navigateHeaderAction = (path: "/quick-entry" | "/add-password" | "/settings") => {
    if (path === "/quick-entry") {
      router.push("/quick-entry" as never);
      return;
    }

    router.push(path);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={styles.fixedTop}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t("home.title")}</Text>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => navigateHeaderAction("/quick-entry")}
                style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.purpleSoft }, pressed && styles.pressed]}
              >
                <Lightning size={19} color={colors.purple} weight="bold" />
              </Pressable>
              <Pressable
                onPress={() => navigateHeaderAction("/add-password")}
                style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.primarySoft }, pressed && styles.pressed]}
              >
                <Plus size={19} color={colors.primary} weight="bold" />
              </Pressable>
              <Pressable
                onPress={() => navigateHeaderAction("/settings")}
                style={({ pressed }) => [styles.headerButton, { backgroundColor: colors.surfaceMuted }, pressed && styles.pressed]}
              >
                <Gear size={19} color={colors.textMuted} weight="regular" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MagnifyingGlass size={17} color={colors.textSubtle} weight="regular" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("home.searchPlaceholder")}
              placeholderTextColor={colors.textSubtle}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>

          {hasPinned ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("home.pinned")}</Text>
                <Pressable onPress={togglePinned} hitSlop={8}>
                  <Text style={[styles.link, { color: colors.textSubtle }]}>{showPinned ? t("common.hide") : t("common.show")}</Text>
                </Pressable>
              </View>

              <Animated.View
                style={[
                  styles.pinnedWrap,
                  {
                    height: pinnedAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 58] }),
                    opacity: pinnedAnim,
                    marginBottom: pinnedAnim.interpolate({ inputRange: [0, 1], outputRange: [0, spacing.md] }),
                  },
                ]}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedRow}>
                  {pinned.map((item) => {
                    const accent = getAccent(item);

                    return (
                      <Pressable key={item.id} onPress={() => router.push(`/password-detail/${item.id}`)}>
                        <Card style={[styles.pinnedCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
                          <View style={[styles.initial, { backgroundColor: accent.solid }]}>
                            <Text style={styles.initialTextSolid}>{item.title[0]}</Text>
                          </View>
                          <View style={styles.pinnedText}>
                            <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text style={[styles.itemSub, { color: colors.textSubtle }]} numberOfLines={1}>
                              {maskAccount(item.username)}
                            </Text>
                          </View>
                          <Star size={17} color={colors.favorite} weight="fill" />
                        </Card>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            </>
          ) : null}

          <View style={[styles.tabs, !hasPinned && styles.tabsAfterSearch]} onLayout={(event) => setTabsWidth(event.nativeEvent.layout.width)}>
            {tabsWidth > 0 ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tabIndicator,
                  {
                    width: tabsWidth / tabs.length - 4,
                    transform: [{ translateX: tabIndicatorAnim }],
                  },
                ]}
              />
            ) : null}
            {tabs.map((tab) => {
              const active = tab === category;
              return (
                <Pressable key={tab} onPress={() => selectCategory(tab)} style={styles.tab}>
                  <Text style={[styles.tabText, active && styles.activeTabText]}>
                    {tab === "all"
                      ? t("category.all")
                      : t(
                          tab === "website"
                            ? "category.website.plural"
                            : tab === "app"
                              ? "category.app.plural"
                              : "category.wifi.plural",
                        )}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          style={styles.listScroller}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
                <Key size={28} color={colors.primary} weight="regular" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{isVaultEmpty ? t("home.emptyTitle") : t("home.noResultsTitle")}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSubtle }]}>
                {isVaultEmpty ? t("home.emptySubtitle") : t("home.noResultsSubtitle")}
              </Text>
              {isVaultEmpty ? (
                <Button onPress={() => navigateHeaderAction("/add-password")} style={styles.emptyButton}>
                  {t("home.addPassword")}
                </Button>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const accent = getAccent(item);
            const copied = copiedItemId === item.id;

            return (
              <Animated.View style={styles.listAnimation}>
                <Pressable onPress={() => router.push(`/password-detail/${item.id}`)}>
                  <Card style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.iconBox, { backgroundColor: accent.soft }]}>
                      <Text style={[styles.initialText, { color: accent.color }]}>{item.title[0]}</Text>
                    </View>
                    <View style={styles.itemText}>
                      <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[styles.itemSub, { color: colors.textSubtle }]} numberOfLines={1}>
                        {item.username}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => copyPassword(item.id, item.password)}
                      style={[styles.copyPill, { backgroundColor: copied ? colors.greenSoft : colors.surfaceMuted }]}
                    >
                      {copied ? (
                        <Check size={12} color={colors.green} weight="bold" />
                      ) : (
                        <Copy size={12} color={colors.textMuted} weight="regular" />
                      )}
                      <Text style={[styles.copyText, { color: copied ? colors.green : colors.textMuted }]}>{copied ? t("common.copied") : t("common.copy")}</Text>
                    </Pressable>
                  </Card>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: spacing.xl, paddingTop: spacing.xl },
  fixedTop: {
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.97 }],
  },
  search: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    height: 40,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 13, fontWeight: "600", paddingVertical: 0 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.xxl,
  },
  sectionTitle: { fontSize: 15, fontWeight: "800" },
  link: { fontSize: 12, fontWeight: "600" },
  pinnedWrap: {
    overflow: "hidden",
  },
  pinnedRow: { gap: spacing.sm, paddingRight: spacing.xl },
  pinnedCard: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    height: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowOpacity: 0,
    width: 170,
  },
  initial: {
    alignItems: "center",
    borderRadius: radii.sm,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  initialText: { fontSize: 15, fontWeight: "900" },
  initialTextSolid: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  pinnedText: { flex: 1 },
  tabs: {
    backgroundColor: tokenColors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    padding: 2,
    position: "relative",
  },
  tabsAfterSearch: {
    marginTop: spacing.md,
  },
  tabIndicator: {
    backgroundColor: tokenColors.primary,
    borderRadius: 10,
    bottom: 2,
    left: 2,
    position: "absolute",
    top: 2,
  },
  tab: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    height: 38,
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: { color: tokenColors.textMuted, fontSize: 12, fontWeight: "700" },
  activeTabText: { color: "#FFFFFF" },
  listScroller: {
    flex: 1,
    marginTop: spacing.md,
  },
  list: { gap: spacing.sm, paddingBottom: spacing.xxxl },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 96,
  },
  emptyIcon: {
    alignItems: "center",
    borderRadius: radii.lg,
    height: 64,
    justifyContent: "center",
    marginBottom: spacing.xl,
    width: 64,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  emptyButton: {
    minWidth: 132,
    paddingHorizontal: spacing.xl,
  },
  listAnimation: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  listItem: {
    alignItems: "center",
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.lg,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowOpacity: 0,
  },
  iconBox: {
    alignItems: "center",
    borderRadius: radii.sm,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "800" },
  itemSub: { fontSize: 12, marginTop: 3 },
  copyPill: {
    alignItems: "center",
    borderRadius: radii.sm,
    flexDirection: "row",
    gap: spacing.xs,
    minWidth: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  copyText: { fontSize: 12, fontWeight: "800" },
});
