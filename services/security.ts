export type EncryptionEnvelope = {
  version: 1;
  algorithm: "AEAD_PLACEHOLDER";
  kdf: "PBKDF2_PLACEHOLDER";
  salt: string;
  nonce: string;
  ciphertext: string;
};

export const verifyMasterPassword = async (password: string) => {
  return password.trim().length >= 4;
};

export const securityNotes = [
  "Master password must never be persisted in plain text.",
  "Production encryption should use a verified AEAD implementation such as AES-GCM or ChaCha20-Poly1305.",
  "Clipboard contents should be cleared after a short timeout.",
];
