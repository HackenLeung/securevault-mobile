import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type EncryptionEnvelope = {
  version: 1;
  algorithm: "AEAD_PLACEHOLDER";
  kdf: "PBKDF2_PLACEHOLDER";
  salt: string;
  nonce: string;
  ciphertext: string;
};

const MASTER_PASSWORD_KEY = "securevault.masterPassword.v1";
const DEFAULT_MASTER_PASSWORD = "demo";

type StoredMasterPassword = {
  version: 1;
  salt: string;
  hash: string;
};

const bytesToHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

// 当前主密码校验是演示级 SHA-256 + salt；生产环境应换成强 KDF，例如 Argon2/PBKDF2。
const hashPassword = async (password: string, salt: string) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);

const readStoredValue = async (key: string) => {
  // Expo SecureStore 不支持 Web，这里用 localStorage 兜底保证网页预览可用。
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
};

const writeStoredValue = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const createPasswordRecord = async (password: string): Promise<StoredMasterPassword> => {
  // 每次创建记录都生成独立 salt，避免相同密码得到相同存储值。
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const hash = await hashPassword(password, salt);

  return {
    version: 1,
    salt,
    hash,
  };
};

const readPasswordRecord = async () => {
  const stored = await readStoredValue(MASTER_PASSWORD_KEY);

  if (!stored) {
    // 首次启动初始化 demo 主密码，方便演示；正式产品应引导用户设置主密码。
    const initial = await createPasswordRecord(DEFAULT_MASTER_PASSWORD);
    await writeStoredValue(MASTER_PASSWORD_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored) as StoredMasterPassword;
  } catch {
    // 存储内容损坏时重置为 demo，保证应用仍可进入。
    const fallback = await createPasswordRecord(DEFAULT_MASTER_PASSWORD);
    await writeStoredValue(MASTER_PASSWORD_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

export const verifyMasterPassword = async (password: string) => {
  const normalized = password.trim();
  if (normalized.length < 4) return false;

  const record = await readPasswordRecord();
  const hash = await hashPassword(normalized, record.salt);

  // 比较 hash 而不是明文密码，避免主密码直接落盘。
  return hash === record.hash;
};

export const updateMasterPassword = async (currentPassword: string, nextPassword: string) => {
  // 修改前必须先验证旧密码，避免已解锁页面被误操作改掉主密码。
  const currentOk = await verifyMasterPassword(currentPassword);
  if (!currentOk) return false;

  const nextRecord = await createPasswordRecord(nextPassword.trim());
  await writeStoredValue(MASTER_PASSWORD_KEY, JSON.stringify(nextRecord));

  return true;
};

export const securityNotes = [
  // 这些是后续安全工程化 TODO，不参与运行时逻辑。
  "Master password must never be persisted in plain text.",
  "Production encryption should use a verified AEAD implementation such as AES-GCM or ChaCha20-Poly1305.",
  "Clipboard contents should be cleared after a short timeout.",
];
