import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { getEnv } from "../env";

const SALT_ROUNDS = 12;

export interface AuthTokenPayload {
  sub: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthTokenPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_SEC });
}

export function verifyToken(token: string): AuthTokenPayload {
  const env = getEnv();
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || !decoded || !("sub" in decoded) || !("role" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return {
    sub: String((decoded as { sub: unknown }).sub),
    role: String((decoded as { role: unknown }).role)
  };
}
