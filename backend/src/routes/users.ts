import { Router } from "express";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { prisma } from "../db";
import { encryptPaymentCard } from "../lib/crypto";
import { sendProfileUpdatedEmail } from "../lib/mailer";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

const router = Router();

const profileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  address: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1).default("US")
    })
    .optional()
});

const paymentCardSchema = z.object({
  cardNumber: z.string().min(12),
  expiresMonth: z.coerce.number().int().min(1).max(12),
  expiresYear: z.coerce.number().int().min(new Date().getFullYear()),
  cvv: z.string().min(3).max(4),
  cardholderName: z.string().min(1),
  brand: z.string().optional()
});

router.use(requireAuth);

router.get("/me", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        favoriteMovies: true,
        address: true,
        paymentCards: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
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
      paymentCards: user.paymentCards.map((card) => ({
        id: card.id,
        brand: card.brand,
        last4: card.last4,
        expiresMonth: card.expiresMonth,
        expiresYear: card.expiresYear,
        cardholderName: card.cardholderName
      })),
      favoriteMovies: user.favoriteMovies
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/me", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const body = profileSchema.parse(req.body);
    if ("email" in req.body) {
      res.status(400).json({ error: "Email cannot be changed from profile edit." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      if (body.firstName !== undefined || body.lastName !== undefined || body.phone !== undefined) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
            ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
            ...(body.phone !== undefined ? { phone: body.phone } : {})
          }
        });
      }

      if (body.address) {
        await tx.userAddress.upsert({
          where: { userId: user.id },
          update: {
            line1: body.address.line1,
            line2: body.address.line2,
            city: body.address.city,
            state: body.address.state,
            postalCode: body.address.postalCode,
            country: body.address.country
          },
          create: {
            userId: user.id,
            line1: body.address.line1,
            line2: body.address.line2,
            city: body.address.city,
            state: body.address.state,
            postalCode: body.address.postalCode,
            country: body.address.country
          }
        });
      }
    });

    await sendProfileUpdatedEmail(user.email, `${user.firstName} ${user.lastName}`.trim());
    res.json({ message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
});

router.post("/me/payment-cards", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const body = paymentCardSchema.parse(req.body);
    const userId = req.userId as string;
    const count = await prisma.paymentCard.count({ where: { userId } });
    if (count >= 3) {
      res.status(400).json({ error: "You can save a maximum of 3 payment cards." });
      return;
    }

    const digits = body.cardNumber.replace(/\D/g, "");
    if (digits.length < 12) {
      res.status(400).json({ error: "Invalid card number." });
      return;
    }

    const encryptedPayload = encryptPaymentCard({
      cardNumber: digits,
      cvv: body.cvv
    });

    const card = await prisma.paymentCard.create({
      data: {
        userId,
        brand: body.brand,
        last4: digits.slice(-4),
        encryptedPayload,
        expiresMonth: body.expiresMonth,
        expiresYear: body.expiresYear,
        cardholderName: body.cardholderName
      }
    });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendProfileUpdatedEmail(user.email, `${user.firstName} ${user.lastName}`.trim());
    }
    res.status(201).json({
      message: "Payment card added.",
      card: {
        id: card.id,
        brand: card.brand,
        last4: card.last4,
        expiresMonth: card.expiresMonth,
        expiresYear: card.expiresYear,
        cardholderName: card.cardholderName
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/me/payment-cards/:cardId", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const cardId = z.string().min(1).parse(req.params.cardId);
    await prisma.paymentCard.deleteMany({
      where: {
        id: cardId,
        userId: req.userId
      }
    });
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user) {
      await sendProfileUpdatedEmail(user.email, `${user.firstName} ${user.lastName}`.trim());
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/me/favorites", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        favoriteMovies: {
          include: {
            showtimes: {
              orderBy: { startsAt: "asc" }
            }
          }
        }
      }
    });
    res.json({ favorites: user?.favoriteMovies ?? [] });
  } catch (error) {
    next(error);
  }
});

router.post("/me/favorites", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const { movieId } = z.object({ movieId: z.string().min(1) }).parse(req.body);
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        favoriteMovies: {
          connect: { id: movieId }
        }
      },
      include: { favoriteMovies: true }
    });

    res.json({ message: "Movie added to favorites.", favorites: updatedUser.favoriteMovies });
  } catch (error) {
    next(error);
  }
});

router.delete("/me/favorites/:movieId", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const movieId = z.string().min(1).parse(req.params.movieId);
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        favoriteMovies: {
          disconnect: { id: movieId }
        }
      },
      include: { favoriteMovies: true }
    });

    res.json({ message: "Movie removed from favorites.", favorites: updatedUser.favoriteMovies });
  } catch (error) {
    next(error);
  }
});

router.get("/me/recommendations", async (req: AuthenticatedRequest, res, next): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { favoriteMovies: true }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // 1. Build the AI Prompt
    let prompt = "You are a cinema recommendation engine. Recommend 3 movies. ";
    if (user.favoriteMovies.length > 0) {
      const titles = user.favoriteMovies.map(m => m.title).join(', ');
      const genres = Array.from(new Set(user.favoriteMovies.map(m => m.genre))).join(', ');
      prompt += `The user loves these movies: ${titles}. They enjoy these genres: ${genres}. `;
      prompt += `Based on this, suggest 3 similar but distinct movies they might like. `;
    } else {
      prompt += `The user is new and has no favorites yet. Suggest 3 universally acclaimed, must-watch movies from different genres. `;
    }
    prompt += `Respond strictly with a raw JSON array of objects. Each object must have 'title', 'genre', and 'reason' (a 1-sentence hook). Do NOT include markdown blocks like \`\`\`json.`;

    // 2. Call the Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    
    const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const recommendations = JSON.parse(cleanedText);

    res.json(recommendations);

  } catch (error) {
    console.error("AI Recommendation Failed (Serving Fallback):", error);
    
    // FAULT TOLERANCE: If the AI crashes or rate-limits, serve these instead of a 500 error!
    const fallbackRecommendations = [
      {
        title: "Interstellar",
        genre: "Sci-Fi / Drama",
        reason: "Since our AI is currently taking a coffee break, we highly recommend this visually stunning masterpiece about the power of love across dimensions."
      },
      {
        title: "The Grand Budapest Hotel",
        genre: "Comedy / Adventure",
        reason: "A delightfully quirky and visually symmetrical adventure that never fails to entertain."
      },
      {
        title: "Parasite",
        genre: "Thriller / Dark Comedy",
        reason: "A gripping, masterfully crafted social thriller that will keep you guessing until the very end."
      }
    ];

    res.json(fallbackRecommendations);
  }
});

export default router;
