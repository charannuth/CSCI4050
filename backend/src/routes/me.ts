import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import { getEnv } from "../env";
import { encryptPan } from "../lib/cardCrypto";
import { setSessionCookie } from "../lib/cookieSession";
import { sendEmail } from "../lib/mailer";
import { hashPassword, verifyPassword } from "../lib/password";
import { requireAuth } from "../middleware/auth";

export const meRouter = Router();

meRouter.use(requireAuth);

function normalizeDigits(input: string): string {
  return input.replace(/\D/g, "");
}

function profileFingerprint(input: {
  firstName: string;
  lastName: string;
  phone: string | null;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}): string {
  return JSON.stringify(input);
}

meRouter.get("/", async (req, res, next) => {
  try {
    const uid = req.authUser!.id;

    const user = await prisma.user.findUnique({
      where: { id: uid },
      include: {
        address: true,
        paymentCards: { orderBy: { createdAt: "asc" } },
        favoriteMovies: {
          include: {
            movie: {
              include: { showtimes: { orderBy: { startsAt: "asc" } } }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        status: user.status
      },
      address: user.address,
      paymentCards: user.paymentCards.map((c) => ({
        id: c.id,
        nickname: c.nickname,
        last4: c.last4,
        expiryMonth: c.expiryMonth,
        expiryYear: c.expiryYear,
        cardholderName: c.cardholderName
      })),
      favoriteMovies: user.favoriteMovies.map((f) => f.movie)
    });
  } catch (err) {
    next(err);
  }
});

const patchProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    phone: z.union([z.string().trim(), z.null()]).optional(),
    address: z
      .object({
        line1: z.string().min(1),
        line2: z.union([z.string(), z.null()]).optional(),
        city: z.string().min(1),
        state: z.string().min(1),
        postalCode: z.string().min(1),
        country: z.string().min(1).optional()
      })
      .nullish()
  })
  .strict();

meRouter.patch("/", async (req, res, next) => {
  try {
    const env = getEnv();
    const body = patchProfileSchema.parse(req.body);
    const uid = req.authUser!.id;

    const before = await prisma.user.findUnique({
      where: { id: uid },
      include: { address: true }
    });

    if (!before) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const beforePrint = profileFingerprint({
      firstName: before.firstName,
      lastName: before.lastName,
      phone: before.phone,
      address: before.address
        ? {
            line1: before.address.line1,
            line2: before.address.line2,
            city: before.address.city,
            state: before.address.state,
            postalCode: before.address.postalCode,
            country: before.address.country
          }
        : null
    });

    if (body.firstName !== undefined || body.lastName !== undefined || body.phone !== undefined) {
      await prisma.user.update({
        where: { id: uid },
        data: {
          ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
          ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
          ...(body.phone !== undefined ? { phone: body.phone === null ? null : body.phone || null } : {})
        }
      });
    }

    if (body.address !== undefined) {
      if (body.address === null) {
        await prisma.userAddress.deleteMany({ where: { userId: uid } });
      } else {
        const a = body.address;
        const addressFields = {
          line1: a.line1,
          line2: a.line2 ?? null,
          city: a.city,
          state: a.state,
          postalCode: a.postalCode,
          country: a.country ?? "US"
        };
        await prisma.userAddress.upsert({
          where: { userId: uid },
          create: { userId: uid, ...addressFields },
          update: addressFields
        });
      }
    }

    const after = await prisma.user.findUnique({
      where: { id: uid },
      include: { address: true }
    });

    if (!after) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const afterPrint = profileFingerprint({
      firstName: after.firstName,
      lastName: after.lastName,
      phone: after.phone,
      address: after.address
        ? {
            line1: after.address.line1,
            line2: after.address.line2,
            city: after.address.city,
            state: after.address.state,
            postalCode: after.address.postalCode,
            country: after.address.country
          }
        : null
    });

    if (afterPrint !== beforePrint) {
      await sendEmail(env, {
        to: after.email,
        subject: "Your Cinema CES profile was updated",
        text: `Hello ${after.firstName},\n\nWe saved changes to your profile (name, phone, or address). If you did not make this change, please reset your password and contact support.\n`
      });
    }

    res.json({
      message: "Profile updated.",
      user: {
        id: after.id,
        email: after.email,
        firstName: after.firstName,
        lastName: after.lastName,
        phone: after.phone,
        role: after.role,
        status: after.status
      },
      address: after.address,
      paymentCards:
        (
          await prisma.paymentCard.findMany({
            where: { userId: uid },
            orderBy: { createdAt: "asc" }
          })
        ).map((c) => ({
          id: c.id,
          nickname: c.nickname,
          last4: c.last4,
          expiryMonth: c.expiryMonth,
          expiryYear: c.expiryYear,
          cardholderName: c.cardholderName
        })),
      favoriteMovies: (
        await prisma.userFavorite.findMany({
          where: { userId: uid },
          include: {
            movie: { include: { showtimes: { orderBy: { startsAt: "asc" } } } }
          },
          orderBy: { createdAt: "desc" }
        })
      ).map((f) => f.movie)
    });
  } catch (err) {
    next(err);
  }
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmNewPassword: z.string().min(1)
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "New passwords do not match."
      });
    }
  });

meRouter.post("/password", async (req, res, next) => {
  try {
    const env = getEnv();
    const body = changePasswordSchema.parse(req.body);
    const uid = req.authUser!.id;

    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const ok = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!ok) {
      res.status(400).json({ error: "Current password is incorrect." });
      return;
    }

    const passwordHash = await hashPassword(body.newPassword);

    const updated = await prisma.user.update({
      where: { id: uid },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 }
      },
      select: { id: true, tokenVersion: true, email: true, firstName: true }
    });

    await sendEmail(env, {
      to: user.email,
      subject: "Your Cinema CES password was changed",
      text: `Hello ${updated.firstName},\n\nYour account password was changed. If you did not do this, contact support immediately.\n`
    });

    setSessionCookie(res, updated.id, updated.tokenVersion);

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
});

const addCardSchema = z
  .object({
    pan: z.string().min(12),
    expiryMonth: z.coerce.number().int().min(1).max(12),
    expiryYear: z.coerce.number().int().min(2000).max(2100),
    cardholderName: z.string().trim().optional(),
    nickname: z.string().trim().optional()
  })
  .strict();

meRouter.post("/payment-cards", async (req, res, next) => {
  try {
    const env = getEnv();
    const body = addCardSchema.parse(req.body);
    const uid = req.authUser!.id;

    const count = await prisma.paymentCard.count({ where: { userId: uid } });
    if (count >= 3) {
      res.status(400).json({
        error: "You can store at most three payment cards. Remove a card before adding another."
      });
      return;
    }

    const pan = normalizeDigits(body.pan);
    if (pan.length < 12 || pan.length > 19) {
      res.status(400).json({ error: "Card number must be between 12 and 19 digits." });
      return;
    }

    const now = new Date();
    // Date.UTC month is 0–11; card expiry uses 1–12.
    const expStartUtc = new Date(Date.UTC(body.expiryYear, body.expiryMonth - 1, 1));
    if (expStartUtc < new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))) {
      res.status(400).json({ error: "This card appears to be expired." });
      return;
    }

    const encryptedPan = encryptPan(env, pan);
    const last4 = pan.slice(-4);

    const card = await prisma.paymentCard.create({
      data: {
        userId: uid,
        nickname: body.nickname?.length ? body.nickname : null,
        last4,
        encryptedPan,
        expiryMonth: body.expiryMonth,
        expiryYear: body.expiryYear,
        cardholderName: body.cardholderName?.length ? body.cardholderName : null
      },
      select: {
        id: true,
        nickname: true,
        last4: true,
        expiryMonth: true,
        expiryYear: true,
        cardholderName: true
      }
    });

    await sendEmail(env, {
      to: req.authUser!.email,
      subject: "A payment card was added to your Cinema CES profile",
      text: `Hello ${req.authUser!.firstName},\n\nA payment card ending in ${card.last4} was saved on your profile. If this was not you, remove the card and change your password.\n`
    });

    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
});

meRouter.delete("/payment-cards/:id", async (req, res, next) => {
  try {
    const env = getEnv();
    const id = z.string().min(1).parse(req.params.id);
    const uid = req.authUser!.id;

    const existing = await prisma.paymentCard.findFirst({ where: { id, userId: uid } });
    if (!existing) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    await prisma.paymentCard.delete({ where: { id } });

    await sendEmail(env, {
      to: req.authUser!.email,
      subject: "A payment card was removed from your Cinema CES profile",
      text: `Hello ${req.authUser!.firstName},\n\nA payment card ending in ${existing.last4} was removed from your profile.\n`
    });

    res.json({ message: "Card removed." });
  } catch (err) {
    next(err);
  }
});

meRouter.post("/favorites/:movieId", async (req, res, next) => {
  try {
    const movieId = z.string().min(1).parse(req.params.movieId);
    const uid = req.authUser!.id;

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      res.status(404).json({ error: "Movie not found." });
      return;
    }

    await prisma.userFavorite.upsert({
      where: { userId_movieId: { userId: uid, movieId } },
      create: { userId: uid, movieId },
      update: {}
    });

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: uid },
      include: {
        movie: { include: { showtimes: { orderBy: { startsAt: "asc" } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ favoriteMovies: favorites.map((f) => f.movie) });
  } catch (err) {
    next(err);
  }
});

meRouter.delete("/favorites/:movieId", async (req, res, next) => {
  try {
    const movieId = z.string().min(1).parse(req.params.movieId);
    const uid = req.authUser!.id;

    await prisma.userFavorite.deleteMany({ where: { userId: uid, movieId } });

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: uid },
      include: {
        movie: { include: { showtimes: { orderBy: { startsAt: "asc" } } } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ favoriteMovies: favorites.map((f) => f.movie) });
  } catch (err) {
    next(err);
  }
});
