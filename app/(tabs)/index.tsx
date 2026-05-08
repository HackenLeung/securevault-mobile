import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { MagnifyingGlass, Lightning, Plus, Star, User } from "phosphor-react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge, Card } from "@/components/ui";
import { categoryMeta, maskAccount, VaultCategory, vaultItems } from "@/data/vault";
import { colors, radii, shadow, spacing } from "@/theme/tokens";

const tabs: Array<"all" | VaultCategory> = ["all", "website", "app", "wifi", "note"];

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const [category, setCategory] = useState<"all" | VaultCategory>("all");
  const [query, setQuery] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [showPinned, setShowPinned] = useState(true);

  const pinnedAnim = useRef(new Animated.Value(1)).current;
  const fabAnim = useRef(new Animated.Value(0)).current;

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
    Animated.timing(fabAnim, {
      toValue: fabOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fabAnim, fabOpen]);

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFabOpen((value) => !value);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.fixedTop}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SecureVault</Text>
              <Text style={styles.subtitle}>{vaultItems.length} passwords stored</Text>
            </View>
            <View style={styles.avatar}>
              <User size={22} color={colors.textMuted} weight="regular" />
            </View>
          </View>

          <View style={styles.search}>
            <MagnifyingGlass size={18} color={colors.textSubtle} weight="regular" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search passwords..."
              placeholderTextColor={colors.textSubtle}
              style={styles.searchInput}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pinned</Text>
            <Pressable onPress={togglePinned} hitSlop={8}>
              <Text style={styles.link}>{showPinned ? "Hide" : "Show"}</Text>
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
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSub}>{maskAccount(item.username)}</Text>
                    </View>
                    <Star size={18} color={colors.favorite} weight="regular" />
                  </Card>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const active = tab === category;
              return (
                <Pressable key={tab} onPress={() => selectCategory(tab)} style={[styles.tab, active && styles.activeTab]}>
                  <Text style={[styles.tabText, active && styles.activeTabText]}>
                    {tab === "all" ? "All" : categoryMeta[tab].label + (tab === "website" ? "s" : tab === "app" ? "s" : tab === "note" ? "s" : "")}
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
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemSub}>{item.category === "note" ? item.note : item.username}</Text>
                    </View>
                    {item.status ? (
                      <Badge color={colors.green} soft={colors.greenSoft}>{item.status}</Badge>
                    ) : item.category === "note" ? (
                      <Badge color={colors.warning} soft={colors.warningSoft}>Note</Badge>
                    ) : (
                      <Pressable onPress={() => copyPassword(item.password)} style={styles.copyPill}>
                        <Text style={styles.copyText}>Copy</Text>
                      </Pressable>
                    )}
                  </Card>
                </Pressable>
              </Animated.View>
            );
          }}
        />
      </View>

      <Animated.View
        pointerEvents={fabOpen ? "auto" : "none"}
        style={[
          styles.overlay,
          {
            opacity: fabAnim,
          },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setFabOpen(false)} />
        <Animated.View
          style={[
            styles.fabMenu,
            {
              opacity: fabAnim,
              transform: [
                {
                  translateY: fabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
                {
                  scale: fabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Pressable style={styles.menuItem} onPress={() => router.push("/quick-entry")}>
            <View style={[styles.menuIcon, { backgroundColor: colors.purpleSoft }]}>
              <Lightning size={16} color={colors.purple} weight="regular" />
            </View>
            <Text style={styles.menuText}>Quick Entry</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => router.push("/add-password")}>
            <View style={[styles.menuIcon, { backgroundColor: colors.primarySoft }]}>
              <Plus size={17} color={colors.primary} weight="bold" />
            </View>
            <Text style={styles.menuText}>Add Password</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      <Pressable style={styles.fab} onPress={toggleFab}>
        <Plus color="#FFFFFF" size={30} weight="bold" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.xl },
  fixedTop: {
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxl,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.textSubtle, fontSize: 13, marginTop: 2 },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
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
    padding: 2,
  },
  tab: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    height: 38,
    justifyContent: "center",
  },
  activeTab: { backgroundColor: colors.primary },
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
    backgroundColor: "rgba(15, 23, 42, 0.32)",
  },
  fabMenu: {
    bottom: 84,
    gap: spacing.sm,
    position: "absolute",
    right: spacing.xl,
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
    bottom: 24,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: spacing.xl,
    width: 56,
    ...shadow,
  },
});
