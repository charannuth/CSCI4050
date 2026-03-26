import type { Request, Response } from "express";

import { getEnv } from "../env";
import { signSessionToken } from "./jwt";

export function getSessionTokenFromRequest(req: Request): string | undefined {
  const env = getEnv();
  const raw = req.cookies?.[env.SESSION_COOKIE_NAME];
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

export function setSessionCookie(res: Response, userId: string, tokenVersion: number) {
  const env = getEnv();
  const token = signSessionToken(env, { sub: userId, v: tokenVersion });
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: "/"
  });
}

export function clearSessionCookie(res: Response) {
  const env = getEnv();
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
}
