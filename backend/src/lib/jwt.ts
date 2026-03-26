import jwt, { type SignOptions } from "jsonwebtoken";

import type { Env } from "../env";

export type SessionClaims = {
  sub: string;
  v: number;
};

export function signSessionToken(env: Env, claims: SessionClaims): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_SEC };
  return jwt.sign(claims, env.JWT_SECRET, options);
}

export function verifySessionToken(env: Env, token: string): SessionClaims {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }
  const sub = (decoded as { sub?: unknown }).sub;
  const v = (decoded as { v?: unknown }).v;
  if (typeof sub !== "string" || typeof v !== "number") {
    throw new Error("Invalid token shape");
  }
  return { sub, v };
}
