import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ZodError } from "zod";

import { authRouter } from "./routes/auth";
import { meRouter } from "./routes/me";
import { moviesRouter } from "./routes/movies";

export function createApp(opts: { corsOrigin?: string | undefined }) {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  const origin = opts.corsOrigin?.trim();
  app.use(
    cors({
      origin: origin === "*" || !origin ? true : origin.split(",").map((s) => s.trim()),
      credentials: true
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/movies", moviesRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.path });
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: err.flatten()
      });
      return;
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Internal server error", message });
  });

  return app;
}

