import { colors } from "@/theme/tokens";

export type VaultCategory = "website" | "app" | "wifi";

export type VaultItem = {
  id: string;
  title: string;
  category: VaultCategory;
  username?: string;
  password?: string;
  url?: string;
  favorite?: boolean;
  passwordHistory?: Array<{
    label: "current" | "previous" | "older";
    date: string;
  }>;
  deletedAt?: string;
  updatedAt: string;
};

export const categoryMeta: Record<VaultCategory, { label: string; color: string; soft: string }> = {
  website: { label: "Website", color: colors.primary, soft: colors.primarySoft },
  app: { label: "App", color: colors.purple, soft: colors.purpleSoft },
  wifi: { label: "WiFi", color: colors.green, soft: colors.greenSoft },
};

// 当前密码库默认从空数据开始；新增项仍保存在内存中，刷新应用会恢复为空。
export const vaultItems: VaultItem[] = [];

export const addVaultItem = (item: VaultItem) => {
  // 新增项插到顶部，让刚保存的记录能立即在首页列表和详情页看到。
  vaultItems.unshift(item);
  return item;
};

export const updateVaultItem = (id: string, nextItem: Omit<VaultItem, "id">) => {
  const index = vaultItems.findIndex((item) => item.id === id && !item.deletedAt);
  if (index < 0) return null;

  vaultItems[index] = {
    ...vaultItems[index],
    ...nextItem,
    id,
  };
  return vaultItems[index];
};

export const getVisibleVaultItems = () => vaultItems.filter((item) => !item.deletedAt);

export const getDeletedVaultItems = () => vaultItems.filter((item) => item.deletedAt);

export const findVaultItem = (id?: string) => getVisibleVaultItems().find((item) => item.id === id);

export const toggleVaultFavorite = (id: string) => {
  const item = vaultItems.find((entry) => entry.id === id && !entry.deletedAt);
  if (!item) return null;

  item.favorite = !item.favorite;
  return item;
};

export const moveVaultItemToRecycleBin = (id: string) => {
  const item = vaultItems.find((entry) => entry.id === id && !entry.deletedAt);
  if (!item) return null;

  item.deletedAt = "Today";
  item.favorite = false;
  return item;
};

export const restoreVaultItem = (id: string) => {
  const item = vaultItems.find((entry) => entry.id === id && entry.deletedAt);
  if (!item) return null;

  delete item.deletedAt;
  return item;
};

export const deleteVaultItemPermanently = (id: string) => {
  const index = vaultItems.findIndex((entry) => entry.id === id && entry.deletedAt);
  if (index < 0) return null;

  const [deleted] = vaultItems.splice(index, 1);
  return deleted;
};

export const exportVaultItems = () => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  items: vaultItems,
});

export const importVaultItems = (items: VaultItem[]) => {
  let importedCount = 0;

  items.forEach((item) => {
    const existingIndex = vaultItems.findIndex((entry) => entry.id === item.id);
    if (existingIndex >= 0) {
      vaultItems[existingIndex] = { ...vaultItems[existingIndex], ...item };
      importedCount += 1;
      return;
    }

    vaultItems.unshift(item);
    importedCount += 1;
  });

  return importedCount;
};

export const maskAccount = (value?: string) => {
  // 首页置顶卡片只展示脱敏账号，邮箱和手机号/普通账号使用不同规则。
  if (!value) return "Secure item";
  if (value.includes("@")) return value.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
};
