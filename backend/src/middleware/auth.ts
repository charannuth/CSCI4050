import type { AccountStatus, UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "../db";
import { getSessionTokenFromRequest } from "../lib/cookieSession";
import { getEnv } from "../env";
import { verifySessionToken } from "../lib/jwt";

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  firstName: string;
  lastName: string;
  tokenVersion: number;
};

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      authUser?: AuthUser;
    }
  }
}


/** Validates session cookie and attaches `req.authUser`. Returns false if a response was already sent. */
export async function attachAuthUser(req: Request, res: Response): Promise<boolean> {
  const env = getEnv();
  const token = getSessionTokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: "Please sign in to continue." });
    return false;
  }

  let claims;
  try {
    claims = verifySessionToken(env, token);
  } catch {
    res.status(401).json({ error: "Your session has expired. Please sign in again." });
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      firstName: true,
      lastName: true,
      tokenVersion: true
    }
  });

  if (!user || user.tokenVersion !== claims.v) {
    res.status(401).json({ error: "Your session is no longer valid. Please sign in again." });
    return false;
  }

  if (user.status !== "ACTIVE") {
    res.status(403).json({
      error: "This account is not active. Verify your email or contact support."
    });
    return false;
  }

  req.authUser = user;
  return true;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await attachAuthUser(req, res);
    if (!ok) {
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const ok = await attachAuthUser(req, res);
    if (!ok) {
      return;
    }
    if (req.authUser!.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
