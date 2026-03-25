import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { moviesRouter } from "./routes/movies";
import favoritesRouter from "./routes/favorites";
import authRouter from "./routes/auth"; // For Registration/Login

export function createApp(opts: { corsOrigin?: string | undefined }) {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  const origin = opts.corsOrigin?.trim();
  app.use(
    cors({
      origin: origin === "*" || !origin ? true : origin.split(",").map((s) => s.trim()),
      credentials: false
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Route Handlers
  app.use("/api/movies", moviesRouter);
  app.use("/api/users", favoritesRouter);
  app.use("/api/auth", authRouter); // Handles /api/auth/register

  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  // Error Handler
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Internal server error", message });
  });

  return app;
}