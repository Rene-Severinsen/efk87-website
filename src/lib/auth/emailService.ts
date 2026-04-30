import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.AUTH_EMAIL_SERVER) {
    transporter = nodemailer.createTransport(env.AUTH_EMAIL_SERVER);
  } else {
    console.log("[EmailService] No e-mail provider configured (AUTH_EMAIL_SERVER missing). Emails will be logged to console in dev.");
  }
  return transporter;
}

const FROM_EMAIL = env.AUTH_EMAIL_FROM || "no-reply@efk87.dk";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (env.isDevelopment) return "http://localhost:3000";
  return ""; 
}

export async function sendEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
  if (!to) return;

  if (env.isDevelopment) {
    console.log("-----------------------------------------");
    console.log(`[DEV EMAIL] To: ${to}`);
    console.log(`[DEV EMAIL] Subject: ${subject}`);
    console.log(`[DEV EMAIL] Body:\n${body}`);
    console.log("-----------------------------------------");
  }

  const transport = getTransporter();
  if (transport) {
    try {
      await transport.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        text: body,
      });
    } catch (error) {
      console.error("[EmailService] Error sending email:", error);
    }
  } else if (!env.isDevelopment) {
    console.warn("[EmailService] Email transport not available and not in development mode.");
  }
}

/**
 * Sends a password reset email to the user.
 */
export async function sendPasswordResetEmail(email: string, token: string, clubSlug: string) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/${clubSlug}/login/nulstil-adgangskode?token=${token}`;
  
  const subject = "Nulstil din adgangskode til EFK87";
  const body = `Hej.

Du har anmodet om at nulstille din adgangskode til EFK87.

Du kan nulstille din adgangskode ved at klikke på nedenstående link:
${resetUrl}

Linket er gyldigt i 60 minutter.

Hvis du ikke har anmodet om at nulstille din adgangskode, kan du blot ignorere denne e-mail.

Venlig hilsen,
EFK87`;

  await sendEmail({
    to: email,
    subject,
    body,
  });
}
