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
  if (!stored) return null;

  try {
    return JSON.parse(stored) as StoredMasterPassword;
  } catch {
    return null;
  }
};

export const hasMasterPassword = async () => {
  const record = await readPasswordRecord();
  return Boolean(record?.salt && record.hash);
};

export const createMasterPassword = async (password: string) => {
  const normalized = password.trim();
  if (normalized.length < 4) return false;

  const record = await createPasswordRecord(normalized);
  await writeStoredValue(MASTER_PASSWORD_KEY, JSON.stringify(record));
  return true;
};

export const verifyMasterPassword = async (password: string) => {
  const normalized = password.trim();
  if (normalized.length < 4) return false;

  const record = await readPasswordRecord();
  if (!record) return false;

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
