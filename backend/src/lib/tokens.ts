import crypto from "crypto";

export function createRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
