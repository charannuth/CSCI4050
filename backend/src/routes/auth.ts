import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import { hashPassword, signToken, verifyPassword } from "../lib/auth";
import { sendPasswordResetEmail } from "../lib/mailer";
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
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const hashedPassword = await hashPassword(body.password);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        status: "ACTIVE",
        role: "CUSTOMER"
      }
    });

    res.status(201).json({
      message: "Registration successful. You can now log in."
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

    if (user.status !== "ACTIVE") {
      res.status(403).json({ error: "Account is inactive. Verify your email first." });
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
    if (user) {
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