import nodemailer from "nodemailer";

import { getApiPublicOrigin, getEnv } from "../env";

function getTransport() {
  const env = getEnv();
  if (env.MAIL_TRANSPORT === "console") {
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
          }
        : undefined
  });
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const env = getEnv();
  if (env.MAIL_TRANSPORT === "console") {
    // eslint-disable-next-line no-console
    console.log("\n--- EMAIL (console mode) ---");
    // eslint-disable-next-line no-console
    console.log("To:", to);
    // eslint-disable-next-line no-console
    console.log("Subject:", subject);
    // eslint-disable-next-line no-console
    console.log("Body:", html.replace(/<[^>]+>/g, " "));
    // eslint-disable-next-line no-console
    console.log("--- END EMAIL ---\n");
    return;
  }

  const transport = getTransport();
  if (!transport) {
    return;
  }
  await transport.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html
  });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const env = getEnv();
  const verifyUrl = `${getApiPublicOrigin(env)}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await sendEmail(
    email,
    "Verify your Cinema E-Booking account",
    `<p>Welcome to Cinema E-Booking.</p><p>Please verify your email to activate your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
  );
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const env = getEnv();
  const resetUrl = `${env.PUBLIC_APP_URL.replace(/\/$/, "")}/?resetToken=${encodeURIComponent(token)}`;
  await sendEmail(
    email,
    "Reset your Cinema E-Booking password",
    `<p>We received a password reset request for your account.</p><p>Use this reset token in the app: <strong>${token}</strong></p><p>or open <a href="${resetUrl}">${resetUrl}</a></p>`
  );
}

export async function sendProfileUpdatedEmail(email: string, name: string): Promise<void> {
  await sendEmail(
    email,
    "Your profile was updated",
    `<p>Hello ${name},</p><p>Your profile information was changed. If this was not you, please reset your password immediately.</p>`
  );
}
