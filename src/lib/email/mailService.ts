import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

export interface MailRuntimeStatus {
  provider: "smtp" | "auth-email-server" | "none";
  configured: boolean;
  host?: string;
  port?: number;
  secure: boolean;
  userConfigured: boolean;
  from: string;
  canSendExternalNotifications: boolean;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface MailSendResult {
  success: boolean;
  message: string;
}

function resolveFromEmail(): string {
  if (env.MAIL_FROM) return env.MAIL_FROM;
  if (env.AUTH_EMAIL_FROM) return env.AUTH_EMAIL_FROM;
  if (env.SMTP_USER) return `EFK87 Platform <${env.SMTP_USER}>`;
  return "EFK87 Platform <no-reply@localhost>";
}

/**
 * Initializes and returns a nodemailer transporter based on environment configuration.
 * Prioritizes SMTP_* variables, then falls back to AUTH_EMAIL_SERVER.
 */
function getTransporter() {
  if (transporter) return transporter;

  const smtpConfig = env.SMTP_HOST ? {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: Boolean(env.SMTP_SECURE),
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

export function getMailRuntimeStatus(): MailRuntimeStatus {
  const from = resolveFromEmail();

  if (env.SMTP_HOST) {
    return {
      provider: "smtp",
      configured: true,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: Boolean(env.SMTP_SECURE),
      userConfigured: Boolean(env.SMTP_USER && env.SMTP_PASSWORD),
      from,
      canSendExternalNotifications: env.canSendExternalNotifications,
    };
  }

  if (env.AUTH_EMAIL_SERVER) {
    return {
      provider: "auth-email-server",
      configured: true,
      secure: false,
      userConfigured: false,
      from,
      canSendExternalNotifications: env.canSendExternalNotifications,
    };
  }

  return {
    provider: "none",
    configured: false,
    secure: false,
    userConfigured: false,
    from,
    canSendExternalNotifications: env.canSendExternalNotifications,
  };
}

function getBaseUrl() {
  if (env.APP_BASE_URL) return env.APP_BASE_URL;
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (env.isDevelopment) return "http://localhost:3000";
  return "";
}

/**
 * Generic mail sender used by auth, password reset and controlled admin test flows.
 */
export async function sendMail({ to, subject, text, html }: SendMailOptions): Promise<MailSendResult> {
  if (!to) {
    return {
      success: false,
      message: "Modtageradresse mangler.",
    };
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

  if (!transport) {
    if (env.isDevelopment) {
      return {
        success: true,
        message: "Mail blev logget i development, men ingen transport er konfigureret.",
      };
    }

    return {
      success: false,
      message: "Mailtransport er ikke konfigureret.",
    };
  }

  try {
    const info = await transport.sendMail({
      from: resolveFromEmail(),
      to,
      subject,
      text,
      html,
    });

    console.log("[MailService] Mail accepted by transport:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      response: info.response,
    });

    return {
      success: true,
      message: "Mail blev accepteret af SMTP-serveren.",
    };
  } catch (error) {
    console.error("[MailService] Error sending email:", error);

    return {
      success: false,
      message: "Mail kunne ikke sendes. Tjek SMTP-konfiguration og serverlog.",
    };
  }
}

export async function sendSystemTestEmail(params: {
  to: string;
  clubSlug: string;
  requestedBy: string;
}): Promise<MailSendResult> {
  const status = getMailRuntimeStatus();
  const subject = "EFK87 platform mailtest";
  const text = `Hej.

Dette er en teknisk testmail fra EFK87-platformen.

Klub/tenant: ${params.clubSlug}
Udløst af: ${params.requestedBy}
Mail provider: ${status.provider}
SMTP host: ${status.host ?? "ikke angivet"}
SMTP port: ${status.port ?? "ikke angivet"}

Hvis du modtager denne mail, virker den grundlæggende SMTP-afsendelse.

Venlig hilsen
EFK87 platform`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
      <h1 style="font-size: 22px; margin-bottom: 16px;">EFK87 platform mailtest</h1>
      <p>Dette er en teknisk testmail fra EFK87-platformen.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Klub/tenant</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${params.clubSlug}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Udløst af</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${params.requestedBy}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Mail provider</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${status.provider}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">SMTP host</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${status.host ?? "ikke angivet"}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">SMTP port</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${status.port ?? "ikke angivet"}</td></tr>
      </table>
      <p>Hvis du modtager denne mail, virker den grundlæggende SMTP-afsendelse.</p>
    </div>
  `;

  return sendMail({
    to: params.to,
    subject,
    text,
    html,
  });
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
        <a href="${url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Log ind</a>
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
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Nulstil adgangskode</a>
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
