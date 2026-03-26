import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const AUTH_TAG_LEN = 16;

function decodeKey(env: { CARD_ENCRYPTION_KEY: string }): Buffer {
  const buf = Buffer.from(env.CARD_ENCRYPTION_KEY, "base64");
  if (buf.length !== 32) {
    throw new Error("CARD_ENCRYPTION_KEY must decode to 32 bytes (base64-encoded)");
  }
  return buf;
}

/** Encrypt PAN and return base64 payload containing iv|ciphertext|tag. */
export function encryptPan(env: { CARD_ENCRYPTION_KEY: string }, panDigits: string): string {
  const key = decodeKey(env);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
  const enc = Buffer.concat([cipher.update(panDigits, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, enc, tag]).toString("base64");
}

/** Decrypt stored payload (for internal integrity checks only; never expose to clients). */
export function decryptPan(env: { CARD_ENCRYPTION_KEY: string }, blobB64: string): string {
  const key = decodeKey(env);
  const buf = Buffer.from(blobB64, "base64");
  if (buf.length < IV_LEN + AUTH_TAG_LEN + 1) {
    throw new Error("Invalid encrypted card payload");
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(buf.length - AUTH_TAG_LEN);
  const data = buf.subarray(IV_LEN, buf.length - AUTH_TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv, { authTagLength: AUTH_TAG_LEN });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
