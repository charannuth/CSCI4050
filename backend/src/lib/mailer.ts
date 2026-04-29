import nodemailer from "nodemailer";

import { getEnv } from "../env";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeAppPassword(pass: string): string {
  return pass.replace(/\s+/g, "");
}

function getSmtpTransport() {
  const env = getEnv();
  const hostRaw = env.SMTP_HOST?.trim() ?? "";
  const user = env.SMTP_USER?.trim() ?? "";
  const pass = normalizeAppPassword(env.SMTP_PASS != null ? String(env.SMTP_PASS) : "");
  if (!hostRaw || !user || !pass) {
    throw new Error(
      "SMTP is misconfigured: set SMTP_HOST, SMTP_USER, and SMTP_PASS when MAIL_TRANSPORT=smtp"
    );
  }

  const host = hostRaw.toLowerCase();
  const useGmailService = host === "smtp.gmail.com" || host.endsWith(".gmail.com");

  if (useGmailService) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host: hostRaw,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user, pass },
    requireTLS: !env.SMTP_SECURE && env.SMTP_PORT === 587,
    tls: {
      minVersion: "TLSv1.2" as const
    }
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

  const transport = getSmtpTransport();
  try {
    const info = await transport.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html
    });
    // eslint-disable-next-line no-console
    console.log(`[mail] queued/sent: to=${to} subject="${subject}" messageId=${info.messageId ?? "n/a"}`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to send email via SMTP (${env.SMTP_HOST}:${env.SMTP_PORT}). ${detail} — check MAIL_TRANSPORT=smtp, Gmail App Password, and that MAIL_FROM matches your SMTP_USER address.`
    );
  }
}

export async function sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
  const env = getEnv();
  const base = env.PUBLIC_APP_URL.replace(/\/$/, "");
  const verifyUrl = `${base}/?verifyEmailToken=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(firstName);
  const html = `<p>Hello ${safeName},</p><p>Thanks for registering. Please confirm your email address to activate your account:</p><p><a href="${verifyUrl}">Confirm my email</a></p><p>If the button does not work, copy this link into your browser:</p><p>${verifyUrl}</p>`;
  const text = `Hello ${firstName},\n\nThanks for registering. Open this link to confirm your email:\n${verifyUrl}\n`;

  if (env.MAIL_TRANSPORT === "console") {
    await sendEmail(email, "Confirm your Cinema E-Booking account", html);
    return;
  }

  const transport = getSmtpTransport();
  try {
    const info = await transport.sendMail({
      from: env.MAIL_FROM,
      to: email,
      subject: "Confirm your Cinema E-Booking account",
      text,
      html
    });
    // eslint-disable-next-line no-console
    console.log(`[mail] verification: to=${email} messageId=${info.messageId ?? "n/a"}`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to send email via SMTP (${env.SMTP_HOST}:${env.SMTP_PORT}). ${detail} — check MAIL_TRANSPORT=smtp, Gmail App Password, and that MAIL_FROM matches your SMTP_USER address.`
    );
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const env = getEnv();
  const resetUrl = `${env.PUBLIC_APP_URL.replace(/\/$/, "")}/?resetToken=${encodeURIComponent(token)}`;
  await sendEmail(
    email,
    "Reset your Cinema E-Booking password",
    `<p>We received a password reset request for your account.</p><p><a href="${resetUrl}">Set a new password</a> (opens the login page with your token).</p><p>This link expires in 30 minutes. If you did not request a reset, you can ignore this email.</p><p>Alternatively, open the app, choose &quot;Forgot my password&quot; → &quot;Already have reset token?&quot;, and paste this token:</p><p><strong>${token}</strong></p>`
  );
}

export async function sendProfileUpdatedEmail(email: string, name: string): Promise<void> {
  await sendEmail(
    email,
    "Your profile was updated",
    `<p>Hello ${name},</p><p>Your profile information was changed. If this was not you, please reset your password immediately.</p>`
  );
}

export interface OrderDetails {
  email: string;
  firstName: string;
  movieTitle: string;
  showtime: string; // e.g., "Friday, Oct 27 at 7:00 PM"
  seats: string[]; // e.g., ["A1", "A2"]
  totalAmount: number;
  bookingId: string;
}

export async function sendOrderConfirmationEmail(order: OrderDetails): Promise<void> {
  const safeName = escapeHtml(order.firstName);
  const safeTitle = escapeHtml(order.movieTitle);
  const safeShowtime = escapeHtml(order.showtime);
  const safeSeats = escapeHtml(order.seats.join(", "));
  const safeBookingId = escapeHtml(order.bookingId.slice(-6).toUpperCase());

  const subject = `🎟️ Order Confirmation: ${safeTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111; color: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #333;">
      <div style="background-color: #dc2626; padding: 20px; text-align: center;">
        <h1 style="margin: 0; color: #fff; font-size: 24px;">Tickets Confirmed!</h1>
      </div>
      <div style="padding: 30px;">
        <p style="font-size: 16px;">Hi ${safeName},</p>
        <p style="font-size: 16px;">Thank you for your purchase. Here are your ticket details for your upcoming movie:</p>
        
        <div style="background-color: #222; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h2 style="margin: 0 0 10px 0; color: #dc2626;">${safeTitle}</h2>
          <p style="margin: 5px 0; color: #ccc;"><strong>Showtime:</strong> ${safeShowtime}</p>
          <p style="margin: 5px 0; color: #ccc;"><strong>Seats:</strong> ${safeSeats}</p>
          <p style="margin: 5px 0; color: #ccc;"><strong>Order ID:</strong> #${safeBookingId}</p>
        </div>

        <p style="font-size: 18px; text-align: right; border-top: 1px solid #444; padding-top: 10px;">
          <strong>Total Paid:</strong> $${order.totalAmount.toFixed(2)}
        </p>
        
        <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
          Please present this email or your Order ID at the box office. Enjoy the show!
        </p>
      </div>
    </div>
  `;

  await sendEmail(order.email, subject, html);
}
