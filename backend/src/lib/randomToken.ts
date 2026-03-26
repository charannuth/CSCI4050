import { randomBytes } from "crypto";

/** URL-safe token for email verification and password reset links. */
export function randomUrlToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
