import { z } from "zod";

const envSchema = z
  .object({
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
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z.preprocess((v) => v === true || v === "true" || v === "1", z.boolean()).default(false),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM: z.string().min(1).default("Cinema CES <noreply@localhost>")
  })
  .superRefine((data, ctx) => {
    if (data.MAIL_TRANSPORT !== "smtp") {
      return;
    }
    const host = data.SMTP_HOST?.trim();
    const user = data.SMTP_USER?.trim();
    const pass = data.SMTP_PASS;
    if (!host) {
      ctx.addIssue({
        code: "custom",
        message: "SMTP_HOST is required when MAIL_TRANSPORT=smtp (e.g. smtp.gmail.com)",
        path: ["SMTP_HOST"]
      });
    }
    if (!user) {
      ctx.addIssue({
        code: "custom",
        message: "SMTP_USER is required when MAIL_TRANSPORT=smtp (usually your full Gmail address)",
        path: ["SMTP_USER"]
      });
    }
    if (!pass || !String(pass).trim()) {
      ctx.addIssue({
        code: "custom",
        message:
          "SMTP_PASS is required when MAIL_TRANSPORT=smtp (for Gmail use a 16-character App Password, not your normal login password)",
        path: ["SMTP_PASS"]
      });
    }
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

