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

// 演示用密码数据，当前保存在内存中；刷新应用会恢复到这里的初始列表。
export const vaultItems: VaultItem[] = [
  {
    id: "taobao",
    title: "Taobao",
    category: "website",
    username: "13800138000",
    password: "xK#9mP$2wLq&4Rn",
    url: "https://taobao.com",
    favorite: true,
    passwordHistory: [
      { label: "current", date: "Today" },
      { label: "previous", date: "Apr 10" },
      { label: "older", date: "Mar 2" },
    ],
    updatedAt: "Today",
  },
  {
    id: "wechat",
    title: "WeChat",
    category: "app",
    username: "zhangsan",
    password: "Mima#2026!",
    favorite: true,
    passwordHistory: [
      { label: "current", date: "Yesterday" },
      { label: "previous", date: "Apr 10" },
    ],
    updatedAt: "Yesterday",
  },
  {
    id: "github",
    title: "GitHub",
    category: "website",
    username: "zhangsan.dev",
    password: "Gh#4Rn92Lq",
    url: "https://github.com",
    favorite: true,
    updatedAt: "Apr 30",
  },
  {
    id: "bilibili",
    title: "Bilibili",
    category: "website",
    username: "user@example.com",
    password: "Xy#9kL2m",
    url: "https://bilibili.com",
    updatedAt: "Apr 18",
  },
  {
    id: "wifi",
    title: "Home WiFi 5G",
    category: "wifi",
    username: "WPA2",
    password: "Home-5G-2026",
    updatedAt: "Apr 12",
  },
  {
    id: "discord",
    title: "Discord",
    category: "app",
    username: "zhangsan#1234",
    password: "Dc@Vault2026",
    updatedAt: "Mar 28",
  },
];

export const addVaultItem = (item: VaultItem) => {
  // 新增项插到顶部，让刚保存的记录能立即在首页列表和详情页看到。
  vaultItems.unshift(item);
  return item;
};

export const getVisibleVaultItems = () => vaultItems.filter((item) => !item.deletedAt);

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

export const maskAccount = (value?: string) => {
  // 首页置顶卡片只展示脱敏账号，邮箱和手机号/普通账号使用不同规则。
  if (!value) return "Secure item";
  if (value.includes("@")) return value.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
};
