import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(16),
  CARD_ENCRYPTION_KEY: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().min(1).default("ces_session"),
  /** JWT `exp` duration in seconds (default 7 days). */
  JWT_EXPIRES_SEC: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  COOKIE_MAX_AGE_MS: z.coerce.number().int().positive().default(1000 * 60 * 60 * 24 * 7),
  COOKIE_SECURE: z.preprocess((v) => v === true || v === "true" || v === "1", z.boolean()).default(false),
  PUBLIC_APP_URL: z.string().url().default("http://localhost:5173"),
  /**
   * Public origin of this API for absolute URLs in outbound email (e.g. verify-email).
   * Never derive from request Host — set explicitly in production (e.g. https://api.example.com).
   */
  API_PUBLIC_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().min(1).default("Cinema CES <noreply@localhost>")
});

export type Env = z.infer<typeof envSchema>;

/** Trusted base URL for this API (no user-controlled Host header). */
export function getApiPublicOrigin(env: Env): string {
  return env.API_PUBLIC_URL ?? `http://localhost:${env.PORT}`;
}

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) {
    return cached;
  }
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${msg}`);
  }
  cached = parsed.data;
  return cached;
}
