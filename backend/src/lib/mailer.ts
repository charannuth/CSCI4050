import nodemailer from "nodemailer";

import type { Env } from "../env";

async function getTransport(env: Env) {
  if (!env.SMTP_HOST) {
    return null;
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
  });
}

export async function sendEmail(
  env: Env,
  opts: { to: string; subject: string; text: string; html?: string }
): Promise<void> {
  const transport = await getTransport(env);
  if (!transport) {
    // eslint-disable-next-line no-console
    console.log(`[email:dev] to=${opts.to} subject=${opts.subject}\n${opts.text}\n`);
    return;
  }

  await transport.sendMail({
    from: env.MAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html ?? opts.text.replace(/\n/g, "<br/>")
  });
}
