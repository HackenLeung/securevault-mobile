import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { MagnifyingGlass, Lightning, Plus, Star, Gear } from "phosphor-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Card } from "@/components/ui";
import { useFabMenu } from "@/providers/fab-menu";
import { useLanguage } from "@/providers/language";
import { categoryMeta, maskAccount, VaultCategory, vaultItems } from "@/data/vault";
import { colors, radii, shadow, spacing } from "@/theme/tokens";

const tabs: Array<"all" | VaultCategory> = ["all", "website", "app", "wifi", "note"];

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [category, setCategory] = useState<"all" | VaultCategory>("all");
  const [query, setQuery] = useState("");
  const [showPinned, setShowPinned] = useState(true);
  const [tabsWidth, setTabsWidth] = useState(0);
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { fabOpen, setFabOpen } = useFabMenu();

  const pinnedAnim = useRef(new Animated.Value(1)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const floatingBottom = Math.max(insets.bottom + 36, 36);

  const filtered = useMemo(() => {
    return vaultItems.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const search = `${item.title} ${item.username ?? ""} ${item.url ?? ""}`.toLowerCase();
      return categoryMatch && search.includes(query.toLowerCase());
    });
  }, [category, query]);

  const pinned = vaultItems.filter((item) => item.favorite);

  useEffect(() => {
    Animated.timing(pinnedAnim, {
      toValue: showPinned ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pinnedAnim, showPinned]);

  useEffect(() => {
    const tabIndex = tabs.indexOf(category);

    Animated.timing(tabIndicatorAnim, {
      toValue: tabsWidth > 0 ? (tabsWidth / tabs.length) * tabIndex : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [category, tabIndicatorAnim, tabsWidth]);

  const copyPassword = async (password?: string) => {
    if (password) await Clipboard.setStringAsync(password);
  };

  const togglePinned = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowPinned((value) => !value);
  };

  const selectCategory = (tab: "all" | VaultCategory) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCategory(tab);
  };

  const toggleFab = () => {
    setFabOpen(!fabOpen);
  };

  const navigateFromFab = (path: "/quick-entry" | "/add-password" | "/settings") => {
    setFabOpen(false);
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.fixedTop}>
          <View style={styles.search}>
            <MagnifyingGlass size={18} color={colors.textSubtle} weight="regular" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t("home.searchPlaceholder")}
              placeholderTextColor={colors.textSubtle}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.pinned")}</Text>
            <Pressable onPress={togglePinned} hitSlop={8}>
              <Text style={styles.link}>{showPinned ? t("common.hide") : t("common.show")}</Text>
            </Pressable>
          </View>

          <Animated.View
            style={[
              styles.pinnedWrap,
              {
                height: pinnedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 80],
                }),
                opacity: pinnedAnim,
                marginBottom: pinnedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, spacing.lg],
                }),
              },
            ]}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedRow}>
              {pinned.map((item) => (
                <Pressable key={item.id} onPress={() => router.push(`/password-detail/${item.id}`)}>
                  <Card style={styles.pinnedCard}>
                    <View style={[styles.initial, { backgroundColor: categoryMeta[item.category].soft }]}>
                      <Text style={[styles.initialText, { color: categoryMeta[item.category].color }]}>{item.title[0]}</Text>
                    </View>
                    <View style={styles.pinnedText}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemSub} numberOfLines={1}>
                        {maskAccount(item.username)}
                      </Text>
                    </View>
                    <Star size={18} color={colors.favorite} weight="regular" />
                  </Card>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          <View style={styles.tabs} onLayout={(event) => setTabsWidth(event.nativeEvent.layout.width)}>
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
                              : tab === "wifi"
                                ? "category.wifi.plural"
                                : "category.note.plural",
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
          renderItem={({ item, index }) => {
            const meta = categoryMeta[item.category];
            return (
              <Animated.View
                style={{
                  opacity: 1,
                  transform: [{ translateY: 0 }],
                }}
              >
                <Pressable onPress={() => router.push(`/password-detail/${item.id}`)}>
                  <Card style={[styles.listItem, index === 0 && styles.firstListItem]}>
                    <View style={[styles.iconBox, { backgroundColor: meta.soft }]}>
                      <Text style={[styles.initialText, { color: meta.color }]}>{item.title[0]}</Text>
                    </View>
                    <View style={styles.itemText}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemSub} numberOfLines={1}>
                        {item.category === "note" ? item.note : item.username}
                      </Text>
                    </View>
                    {item.status ? (
                      <Badge color={colors.green} soft={colors.greenSoft}>{t("status.active")}</Badge>
                    ) : item.category === "note" ? (
                      <Badge color={colors.warning} soft={colors.warningSoft}>{t("common.note")}</Badge>
                    ) : (
                      <Pressable onPress={() => copyPassword(item.password)} style={styles.copyPill}>
                        <Text style={styles.copyText}>{t("common.copy")}</Text>
                      </Pressable>
                    )}
                  </Card>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      </View>

      <View pointerEvents="box-none" style={styles.fabLayer}>
        {fabOpen ? (
          <Pressable style={styles.overlay} onPress={() => setFabOpen(false)} />
        ) : null}

        <View pointerEvents="box-none" style={[styles.floatingActions, { bottom: floatingBottom }]}>
          {fabOpen ? (
            <View style={styles.fabMenu}>
              <Pressable style={styles.menuItem} onPress={() => navigateFromFab("/quick-entry")}>
                <View style={[styles.menuIcon, { backgroundColor: colors.purpleSoft }]}>
                  <Lightning size={16} color={colors.purple} weight="regular" />
                </View>
                <Text style={styles.menuText}>{t("home.quickEntry")}</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={() => navigateFromFab("/add-password")}>
                <View style={[styles.menuIcon, { backgroundColor: colors.primarySoft }]}>
                  <Plus size={17} color={colors.primary} weight="bold" />
                </View>
                <Text style={styles.menuText}>{t("home.addPassword")}</Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={() => navigateFromFab("/settings")}>
                <View style={[styles.menuIcon, { backgroundColor: colors.warningSoft }]}>
                  <Gear size={16} color={colors.warning} weight="regular" />
                </View>
                <Text style={styles.menuText}>{t("tabs.settings")}</Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable style={styles.fab} onPress={toggleFab}>
            <Plus color="#FFFFFF" size={30} weight="bold" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.xl },
  fixedTop: {
    zIndex: 1,
  },
  search: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  searchInput: { color: colors.text, flex: 1, fontSize: 14 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    marginTop: spacing.xxxl,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  link: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  pinnedWrap: {
    overflow: "hidden",
  },
  pinnedRow: { gap: spacing.md, paddingRight: spacing.xl },
  pinnedCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    height: 80,
    shadowOpacity: 0,
    width: 180,
  },
  initial: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  initialText: { fontSize: 16, fontWeight: "800" },
  pinnedText: { flex: 1 },
  tabs: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    position: "relative",
    padding: 2,
  },
  tabIndicator: {
    backgroundColor: colors.primary,
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
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  activeTabText: { color: "#FFFFFF" },
  listScroller: {
    flex: 1,
    marginTop: spacing.xxl,
  },
  list: { gap: spacing.md, paddingBottom: 152 },
  firstListItem: {
    marginTop: 0,
  },
  listItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    minHeight: 72,
    paddingVertical: spacing.md,
  },
  iconBox: {
    alignItems: "center",
    borderRadius: radii.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  itemText: { flex: 1 },
  itemTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  itemSub: { color: colors.textSubtle, fontSize: 13, marginTop: 4 },
  copyPill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  copyText: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.14)",
  },
  fabLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  floatingActions: {
    alignItems: "flex-end",
    position: "absolute",
    right: spacing.xl,
    zIndex: 21,
  },
  fabMenu: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  menuItem: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.md,
    height: 52,
    paddingHorizontal: spacing.md,
    width: 180,
    ...shadow,
  },
  menuIcon: {
    alignItems: "center",
    borderRadius: radii.sm,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  menuText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  fab: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
    ...shadow,
  },
});
