import { VaultCategory } from "@/data/vault";

export type DetectedRecord = {
  id: string;
  title: string;
  category: VaultCategory;
  username: string;
  password: string;
  url: string;
};

const toTitle = (value: string) => {
  const clean = value.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
  const first = clean.split(".")[0] || "New Password";
  return first.charAt(0).toUpperCase() + first.slice(1);
};

const normalizeUrl = (value: string) => {
  if (!value.trim()) return "";
  return value.startsWith("http://") || value.startsWith("https://") ? value.trim() : `https://${value.trim()}`;
};

const getValueAfterColon = (line: string) => (line.includes(":") || line.includes("：") ? line.split(/[:：]/).slice(1).join(":").trim() : "");

const getValueAfterLabel = (line: string, labelPattern: RegExp) => {
  const colonValue = getValueAfterColon(line);
  if (colonValue) return colonValue;

  return line.replace(labelPattern, "").replace(/^[:：\s-]+/, "").trim();
};

// 快速录入只处理普通网站/应用账号，不做 WiFi 类型识别。
export const parseCredentialRecords = (text: string): DetectedRecord[] => {
  const blocks = text
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.flatMap((block, blockIndex) => {
    const lines = block
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const joined = lines.join(" ");
    const urlMatch = joined.match(/(?:https?:\/\/)?(?:www\.)?[\w.-]+\.[a-z]{2,}(?:\/[^\s]*)?/i);
    const emailMatch = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const phoneMatch = joined.match(/\b1[3-9]\d{9}\b/);
    const labeledTitle = lines.find((line) => /标题|名称|title|name/i.test(line) && /[:：]/.test(line));
    const labeledUsername = lines.find((line) => /用户名|账号|用户|username|login|email|邮箱|手机|phone|user/i.test(line) && !/密码|password|pass|pwd/i.test(line));
    const labeledPassword = lines.find((line) => /密码|password|pass|pwd/i.test(line));
    const titleLine = lines.find((line) => !/账号|用户|邮箱|手机|密码|网址|网站|标题|名称|username|email|phone|password|pass|pwd|site|url|title|name/i.test(line));
    const urlLine = lines.find((line) => /网址|网站|site|url/i.test(line));
    const rawUrl = urlLine ? getValueAfterLabel(urlLine, /网址|网站|site|url/i) : urlMatch?.[0] ?? "";
    const password = labeledPassword ? getValueAfterLabel(labeledPassword, /密码|password|pass|pwd/i) : "";
    const username = labeledUsername ? getValueAfterLabel(labeledUsername, /用户名|账号|用户|username|login|email|邮箱|手机|phone|user/i) : emailMatch?.[0] ?? phoneMatch?.[0] ?? "";
    const url = normalizeUrl(rawUrl);
    const title = (labeledTitle ? getValueAfterColon(labeledTitle) : titleLine) || (url ? toTitle(url) : `Account ${blockIndex + 1}`);

    if (!username && !password && !url) return [];

    return [
      {
        id: `${blockIndex}-${title}-${username}`,
        title,
        category: "website" as const,
        username,
        password,
        url,
      },
    ];
  });
};
