import crypto from "crypto";

import { getEnv } from "../env";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = getEnv().CARD_ENCRYPTION_KEY;
  if (/^[a-fA-F0-9]{64}$/.test(key)) {
    return Buffer.from(key, "hex");
  }
  return crypto.createHash("sha256").update(key, "utf8").digest();
}

export function encryptPaymentCard(payload: Record<string, unknown>): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}
