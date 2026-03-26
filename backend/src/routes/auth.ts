import { AccountStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import { getApiPublicOrigin, getEnv } from "../env";
import { clearSessionCookie, getSessionTokenFromRequest, setSessionCookie } from "../lib/cookieSession";
import { sendEmail } from "../lib/mailer";
import { hashPassword, verifyPassword } from "../lib/password";
import { randomUrlToken } from "../lib/randomToken";
import { verifySessionToken } from "../lib/jwt";

export const authRouter = Router();

const registerSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    phone: z.string().trim().optional()
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match."
      });
    }
  });

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required.")
});

const forgotSchema = z.object({
  email: z.string().trim().email()
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1)
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match."
      });
    }
  });

authRouter.get("/me", async (req, res, next) => {
  try {
    const env = getEnv();
    const token = getSessionTokenFromRequest(req);
    if (!token) {
      res.json({ user: null });
      return;
    }

    let claims;
    try {
      claims = verifySessionToken(env, token);
    } catch {
      res.json({ user: null });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        status: true,
        tokenVersion: true
      }
    });

    if (!user || user.tokenVersion !== claims.v) {
      res.json({ user: null });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const env = getEnv();

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }

    const passwordHash = await hashPassword(body.password);
    const verifyToken = randomUrlToken();
    const verifyExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone?.length ? body.phone : undefined,
        status: AccountStatus.INACTIVE,
        pendingEmailVerification: {
          create: { token: verifyToken, expiresAt: verifyExpires }
        }
      },
      select: { id: true, email: true }
    });

    const verifyUrl = `${getApiPublicOrigin(env)}/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`;

    await sendEmail(env, {
      to: user.email,
      subject: "Confirm your Cinema CES account",
      text: `Welcome! Please confirm your email within 24 hours by opening this link:\n\n${verifyUrl}\n\nIf you did not create this account, you can ignore this message.`
    });

    res.status(201).json({
      message: "Registration successful. Check your email to confirm your account before signing in.",
      userId: user.id
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/verify-email", async (req, res, next) => {
  try {
    const env = getEnv();
    const token = z.string().min(1).safeParse(req.query.token);
    if (!token.success) {
      res.redirect(`${env.PUBLIC_APP_URL}/login?verified=0`);
      return;
    }

    const pending = await prisma.pendingEmailVerification.findFirst({
      where: {
        token: token.data,
        expiresAt: { gt: new Date() }
      }
    });

    if (!pending) {
      res.redirect(`${env.PUBLIC_APP_URL}/login?verified=0`);
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: pending.userId },
        data: { status: AccountStatus.ACTIVE }
      }),
      prisma.pendingEmailVerification.delete({ where: { userId: pending.userId } })
    ]);

    res.redirect(`${env.PUBLIC_APP_URL}/login?verified=1`);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() }
    });

    const genericError = "Invalid email or password.";

    if (!user) {
      res.status(401).json({ error: genericError });
      return;
    }

    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok) {
      res.status(401).json({ error: genericError });
      return;
    }

    if (user.status !== AccountStatus.ACTIVE) {
      res.status(403).json({
        error: "Please confirm your email before signing in. Check your inbox for the verification link."
      });
      return;
    }

    setSessionCookie(res, user.id, user.tokenVersion);

    res.json({
      message: "Signed in successfully.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status
      },
      redirectTo: user.role === "ADMIN" ? "/admin" : "/"
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req, res, next) => {
  try {
    clearSessionCookie(res);
    res.json({ message: "You have been signed out." });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const body = forgotSchema.parse(req.body);
    const env = getEnv();

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });

    const ack =
      "If an account exists for that email, we sent instructions to reset your password.";

    if (!user || user.status !== AccountStatus.ACTIVE) {
      res.json({ message: ack });
      return;
    }

    const resetToken = randomUrlToken();
    const resetExpires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.pendingPasswordReset.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        token: resetToken,
        expiresAt: resetExpires
      },
      update: {
        token: resetToken,
        expiresAt: resetExpires
      }
    });

    const resetUrl = `${env.PUBLIC_APP_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    await sendEmail(env, {
      to: user.email,
      subject: "Reset your Cinema CES password",
      text: `We received a request to reset your password. Use the link below within one hour:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`
    });

    res.json({ message: ack });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const pending = await prisma.pendingPasswordReset.findFirst({
      where: {
        token: body.token,
        expiresAt: { gt: new Date() }
      }
    });

    if (!pending) {
      res.status(400).json({ error: "This reset link is invalid or has expired. Please request a new one." });
      return;
    }

    const passwordHash = await hashPassword(body.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: pending.userId },
        data: {
          passwordHash,
          tokenVersion: { increment: 1 }
        }
      }),
      prisma.pendingPasswordReset.delete({ where: { userId: pending.userId } })
    ]);

    res.json({ message: "Your password has been updated. You can sign in with your new password." });
  } catch (err) {
    next(err);
  }
});
