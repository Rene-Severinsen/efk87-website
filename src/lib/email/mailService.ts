import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

/**
 * Initializes and returns a nodemailer transporter based on environment configuration.
 * Prioritizes SMTP_* variables, then falls back to AUTH_EMAIL_SERVER.
 */
function getTransporter() {
  if (transporter) return transporter;

  const smtpConfig = env.SMTP_HOST ? {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    } : undefined,
  } : null;

  if (smtpConfig) {
    transporter = nodemailer.createTransport(smtpConfig);
  } else if (env.AUTH_EMAIL_SERVER) {
    transporter = nodemailer.createTransport(env.AUTH_EMAIL_SERVER);
  } else {
    const errorMsg = "[MailService] No e-mail provider configured (SMTP_HOST or AUTH_EMAIL_SERVER missing).";
    if (env.isProduction) {
      console.error(errorMsg);
    } else {
      console.log(`${errorMsg} Emails will be logged to console in development.`);
    }
  }
  return transporter;
}

const FROM_EMAIL = env.MAIL_FROM || env.AUTH_EMAIL_FROM || "EFK87 <no-reply@efk87.dk>";

function getBaseUrl() {
  if (env.APP_BASE_URL) return env.APP_BASE_URL;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (env.isDevelopment) return "http://localhost:3000";
  return ""; 
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Generic mail sender used by both magic link and password reset.
 */
export async function sendMail({ to, subject, text, html }: SendMailOptions) {
  if (!to) {
    console.error("[MailService] Cannot send mail: 'to' address is missing.");
    return;
  }

  if (env.isDevelopment) {
    console.log("-----------------------------------------");
    console.log(`[DEV EMAIL] To: ${to}`);
    console.log(`[DEV EMAIL] Subject: ${subject}`);
    console.log(`[DEV EMAIL] Body (text):\n${text}`);
    if (html) {
      console.log(`[DEV EMAIL] Body (html):\n${html.substring(0, 100)}...`);
    }
    console.log("-----------------------------------------");
  }

  const transport = getTransporter();
  if (transport) {
    try {
      await transport.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      console.error("[MailService] Error sending email:", error);
    }
  } else if (!env.isDevelopment) {
    console.warn("[MailService] Email transport not available and not in development mode.");
  }
}

/**
 * Sends a magic link login email.
 * This can be used as a custom sendVerificationRequest for Auth.js.
 */
export async function sendMagicLinkEmail(params: { identifier: string; url: string }) {
  const { identifier: to, url } = params;
  const subject = "Log ind på EFK87";
  
  const text = `Log ind på EFK87 ved at klikke på dette link:\n\n${url}\n\nLinket er gyldigt i 24 timer.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Log ind på EFK87</h2>
      <p>Klik på knappen nedenfor for at logge ind på din konto.</p>
      <div style="margin: 30px 0;">
        <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; rounded: 8px; font-weight: bold;">Log ind</a>
      </div>
      <p>Eller kopier og indsæt dette link i din browser:</p>
      <p style="word-break: break-all; color: #666;">${url}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999;">Linket er gyldigt i 24 timer. Hvis du ikke har anmodet om at logge ind, kan du blot ignorere denne e-mail.</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}

/**
 * Sends a password reset email to the user.
 */
export async function sendPasswordResetEmail(email: string, token: string, clubSlug: string) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/${clubSlug}/login/nulstil-adgangskode?token=${token}`;
  
  const subject = "Nulstil din adgangskode til EFK87";
  const text = `Hej.

Du har anmodet om at nulstille din adgangskode til EFK87.

Du kan nulstille din adgangskode ved at klikke på nedenstående link:
${resetUrl}

Linket er gyldigt i 60 minutter.

Hvis du ikke har anmodet om at nulstille din adgangskode, kan du blot ignorere denne e-mail.

Venlig hilsen,
EFK87`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nulstil adgangskode</h2>
      <p>Du har anmodet om at nulstille din adgangskode til EFK87.</p>
      <div style="margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; rounded: 8px; font-weight: bold;">Nulstil adgangskode</a>
      </div>
      <p>Eller kopier og indsæt dette link i din browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #999;">Linket er gyldigt i 60 minutter. Hvis du ikke har anmodet om at nulstille din adgangskode, kan du blot ignorere denne e-mail.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject,
    text,
    html,
  });
}
