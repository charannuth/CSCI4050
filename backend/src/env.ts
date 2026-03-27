import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3002),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(16).default("dev-secret-change-me-please"),
  JWT_EXPIRES_SEC: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  CARD_ENCRYPTION_KEY: z
    .string()
    .min(1)
    .default("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
  PUBLIC_APP_URL: z.string().url().default("http://localhost:5173"),
  API_PUBLIC_URL: z.string().url().optional(),
  MAIL_TRANSPORT: z.enum(["console", "smtp"]).default("console"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.preprocess((v) => v === true || v === "true" || v === "1", z.boolean()).default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().min(1).default("Cinema CES <noreply@localhost>")
});

export type Env = z.infer<typeof envSchema>;

export function getApiPublicOrigin(env: Env): string {
  return env.API_PUBLIC_URL ?? `http://localhost:${env.PORT}`;
}

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${msg}`);
  }
  return parsed.data;
}

