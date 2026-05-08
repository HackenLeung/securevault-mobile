import { colors } from "@/theme/tokens";

export type VaultCategory = "website" | "app" | "wifi" | "note";

export type VaultItem = {
  id: string;
  title: string;
  category: VaultCategory;
  username?: string;
  password?: string;
  url?: string;
  note?: string;
  favorite?: boolean;
  status?: string;
  updatedAt: string;
};

export const categoryMeta: Record<VaultCategory, { label: string; color: string; soft: string }> = {
  website: { label: "Website", color: colors.primary, soft: colors.primarySoft },
  app: { label: "App", color: colors.purple, soft: colors.purpleSoft },
  wifi: { label: "WiFi", color: colors.green, soft: colors.greenSoft },
  note: { label: "Note", color: colors.warning, soft: colors.warningSoft },
};

export const vaultItems: VaultItem[] = [
  {
    id: "taobao",
    title: "Taobao",
    category: "website",
    username: "13800138000",
    password: "xK#9mP$2wLq&4Rn",
    url: "https://taobao.com",
    favorite: true,
    updatedAt: "Today",
  },
  {
    id: "wechat",
    title: "WeChat",
    category: "app",
    username: "zhangsan",
    password: "Mima#2026!",
    favorite: true,
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
    status: "Active",
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
  {
    id: "office-note",
    title: "Office Safe Code",
    category: "note",
    note: "Security note",
    password: "42-17-09",
    updatedAt: "Mar 12",
  },
];

export const maskAccount = (value?: string) => {
  if (!value) return "Secure note";
  if (value.includes("@")) return value.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  if (value.length <= 6) return value;
  return `${value.slice(0, 3)}****${value.slice(-4)}`;
};
