import { MovieStatus, Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../db";

export const moviesRouter = Router();

const createMovieSchema = z.object({
  title: z.string().min(1),
  rating: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  posterUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  genre: z.string().min(1),
  status: z.nativeEnum(MovieStatus).optional(),
  showtimes: z
    .array(
      z.object({
        startsAt: z.coerce.date()
      })
    )
    .optional()
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
      // YYYY-MM-DD in UTC
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

moviesRouter.post("/", async (req, res, next) => {
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
        showtimes: body.showtimes?.length
          ? {
              create: body.showtimes.map((s) => ({
                startsAt: s.startsAt
              }))
            }
          : undefined
      },
      include: { showtimes: { orderBy: { startsAt: "asc" } } }
    });

    res.status(201).json({ movie });
  } catch (err) {
    next(err);
  }
});

moviesRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = z.string().min(1).parse(req.params.id);

    await prisma.movie.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

