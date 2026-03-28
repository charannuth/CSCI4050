import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import { hashPassword, signToken, verifyPassword } from "../lib/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "../lib/mailer";
import { createRandomToken } from "../lib/tokens";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
});

router.post("/register", async (req, res, next): Promise<void> => {
  try {
    const body = registerSchema.parse(req.body);
    const email = body.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.status === "PENDING_VERIFICATION") {
        const verificationToken = createRandomToken();
        const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
        try {
          const hashedPassword = await hashPassword(body.password);
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              password: hashedPassword,
              firstName: body.firstName,
              lastName: body.lastName,
              phone: body.phone
            }
          });
          await prisma.pendingEmailVerification.deleteMany({ where: { userId: existingUser.id } });
          await prisma.pendingEmailVerification.create({
            data: {
              userId: existingUser.id,
              token: verificationToken,
              expiresAt: verificationExpiresAt
            }
          });
          await sendVerificationEmail(email, verificationToken, body.firstName);
          res.status(200).json({
            message:
              "We sent another confirmation email. Check your inbox and spam folder, then use the latest link."
          });
        } catch (err) {
          next(err instanceof Error ? err : new Error("Failed to send confirmation email"));
        }
        return;
      }
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await hashPassword(body.password);
    const verificationToken = createRandomToken();
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const created = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        status: "PENDING_VERIFICATION",
        role: "CUSTOMER",
        pendingEmailVerifications: {
          create: {
            token: verificationToken,
            expiresAt: verificationExpiresAt
          }
        }
      }
    });

    try {
      await sendVerificationEmail(email, verificationToken, body.firstName);
    } catch (err) {
      await prisma.user.delete({ where: { id: created.id } });
      next(err instanceof Error ? err : new Error("Failed to send confirmation email"));
      return;
    }

    res.status(201).json({
      message: "Registration successful. Check your email to confirm your account before logging in."
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next): Promise<void> => {
  try {
    const body = loginSchema.parse(req.body);
    const email = body.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { favoriteMovies: true }
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await verifyPassword(body.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (user.status === "PENDING_VERIFICATION") {
      res.status(403).json({
        error: "Please confirm your email before logging in. Check your inbox for the confirmation link."
      });
      return;
    }

    if (user.status !== "ACTIVE") {
      res.status(403).json({ error: "Account is inactive." });
      return;
    }

    const token = signToken({ sub: user.id, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        favoriteMovies: user.favoriteMovies
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (req, res, next): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user && user.password) {
      await prisma.pendingPasswordReset.deleteMany({ where: { userId: user.id } });
      const token = createRandomToken();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
      await prisma.pendingPasswordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt
        }
      });
      await sendPasswordResetEmail(user.email, token);
    }

    res.json({
      message: "If an account with that email exists, we sent a reset link."
    });
  } catch (error) {
    next(error);
  }
});

const verifyEmailSchema = z.object({
  token: z.string().min(1)
});

router.post("/verify-email", async (req, res, next): Promise<void> => {
  try {
    const body = verifyEmailSchema.parse(req.body);
    const pending = await prisma.pendingEmailVerification.findUnique({
      where: { token: body.token }
    });

    if (!pending || pending.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired verification link" });
      return;
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: pending.userId },
        data: { status: "ACTIVE" }
      }),
      prisma.pendingEmailVerification.deleteMany({
        where: { userId: pending.userId }
      })
    ]);

    res.json({ message: "Email confirmed. You can log in now." });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", async (req, res, next): Promise<void> => {
  try {
    const body = resetPasswordSchema.parse(req.body);
    const pending = await prisma.pendingPasswordReset.findUnique({
      where: { token: body.token }
    });

    if (!pending || pending.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const newHash = await hashPassword(body.newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: pending.userId },
        data: { password: newHash }
      }),
      prisma.pendingPasswordReset.deleteMany({
        where: { userId: pending.userId }
      })
    ]);

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
});

router.post("/change-password", requireAuth, async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const body = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const validCurrent = await verifyPassword(body.currentPassword, user.password);
    if (!validCurrent) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    const newHash = await hashPassword(body.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    });

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out. Clear token on client." });
});

export default router;