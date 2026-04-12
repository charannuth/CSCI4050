import { MovieStatus, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";
import { requireAdmin, requireAuth } from "../middleware/auth";

export const moviesRouter = Router();

// ==========================================
// SCHEMAS
// ==========================================
const createMovieSchema = z.object({
  title: z.string().min(1),
  rating: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  posterUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  genre: z.string().min(1),
  status: z.nativeEnum(MovieStatus).optional(),
  cast: z.string().min(1).optional(),
  director: z.string().min(1).optional(),
  producer: z.string().min(1).optional(),
});

const listQuerySchema = z.object({
  q: z.string().optional(),
  genre: z.string().optional(),
  status: z.nativeEnum(MovieStatus).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
});

const scheduleSchema = z.object({
  auditoriumId: z.string().min(1),
  startsAt: z.coerce.date(),
});

// ==========================================
// STATIC ROUTES (Must come first!)
// ==========================================

moviesRouter.get("/meta", async (_req, res, next) => {
  try {
    const [genresRaw, showtimesRaw] = await Promise.all([
      prisma.movie.findMany({
        select: { genre: true },
        distinct: ["genre"],
        orderBy: { genre: "asc" }
      }),
      prisma.showtime.findMany({
        select: { startsAt: true },
        orderBy: { startsAt: "asc" }
      })
    ]);

    const genres = genresRaw.map((g) => g.genre);

    const showDatesSet = new Set<string>();
    for (const s of showtimesRaw) {
      showDatesSet.add(s.startsAt.toISOString().slice(0, 10));
    }

    const showDates = Array.from(showDatesSet).sort();

    res.json({ genres, showDates });
  } catch (err) {
    next(err);
  }
});

moviesRouter.get("/home", async (_req, res, next) => {
  try {
    const [currentlyRunning, comingSoon] = await Promise.all([
      prisma.movie.findMany({
        where: { status: MovieStatus.CURRENTLY_RUNNING },
        include: { showtimes: { orderBy: { startsAt: "asc" } } },
        orderBy: { title: "asc" }
      }),
      prisma.movie.findMany({
        where: { status: MovieStatus.COMING_SOON },
        include: { showtimes: { orderBy: { startsAt: "asc" } } },
        orderBy: { title: "asc" }
      })
    ]);

    res.json({ currentlyRunning, comingSoon });
  } catch (err) {
    next(err);
  }
});

moviesRouter.get("/admin/scheduling-data", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const [movies, auditoriums] = await Promise.all([
      prisma.movie.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      prisma.auditorium.findMany({ orderBy: { name: 'asc' } })
    ]);
    res.json({ movies, auditoriums });
  } catch (err) {
    next(err);
  }
});

moviesRouter.get("/", async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const where: Prisma.MovieWhereInput = {};

    if (query.q?.trim()) {
      where.title = { contains: query.q.trim() };
    }
    if (query.genre?.trim()) {
      where.genre = { equals: query.genre.trim() };
    }
    if (query.status) {
      where.status = query.status;
    }

    if (query.date) {
      const start = new Date(`${query.date}T00:00:00.000Z`);
      const end = new Date(`${query.date}T23:59:59.999Z`);
      where.showtimes = { some: { startsAt: { gte: start, lte: end } } };
    }

    const movies = await prisma.movie.findMany({
      where,
      include: { showtimes: { orderBy: { startsAt: "asc" } } },
      orderBy: [{ title: "asc" }]
    });

    res.json({ movies });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// DYNAMIC ROUTES (Must come last!)
// ==========================================

moviesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: { showtimes: { orderBy: { startsAt: "asc" } } }
    });

    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
      return;
    }

    res.json({ movie });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN MUTATION ROUTES
// ==========================================

moviesRouter.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const body = createMovieSchema.parse(req.body);

    const movie = await prisma.movie.create({
      data: {
        title: body.title,
        rating: body.rating,
        description: body.description,
        posterUrl: body.posterUrl,
        trailerUrl: body.trailerUrl,
        genre: body.genre,
        status: body.status ?? MovieStatus.CURRENTLY_RUNNING,
        cast: body.cast,
        director: body.director,
        producer: body.producer,
      },
      include: { showtimes: { orderBy: { startsAt: "asc" } } }
    });

    res.status(201).json({ movie });
  } catch (err) {
    next(err);
  }
});

// NEW: Sprint 3 Showtime Scheduling with Conflict Prevention (20 pts)
moviesRouter.post("/:id/showtimes", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    // 1. Pass the ID through Zod to guarantee to TypeScript that it is a valid string!
    const movieId = z.string().min(1).parse(req.params.id);
    const { auditoriumId, startsAt } = scheduleSchema.parse(req.body);

    // CONFLICT PREVENTION: Check a 3-hour window for the same auditorium
    const conflict = await prisma.showtime.findFirst({
      where: {
        auditoriumId: auditoriumId,
        startsAt: {
          gte: new Date(startsAt.getTime() - 3 * 60 * 60 * 1000), 
          lte: new Date(startsAt.getTime() + 3 * 60 * 60 * 1000)
        }
      },
      include: { movie: true }
    });

    if (conflict) {
      res.status(400).json({ 
        error: `Scheduling Conflict: "${conflict.movie.title}" is already scheduled in this showroom near that time.` 
      });
      return;
    }

    // 2. Use the direct scalar fields exactly as they are named in your schema!
    const showtime = await prisma.showtime.create({
      data: { 
        startsAt,
        movieId: movieId,
        auditoriumId: auditoriumId
      }
    });

    res.status(201).json({ showtime });
  } catch (err) {
    next(err);
  }
});

moviesRouter.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);

    await prisma.movie.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});