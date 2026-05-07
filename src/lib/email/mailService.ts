import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { renderMagicLinkMailTemplate, renderPasswordResetMailTemplate, renderSystemTestMailTemplate } from "./mailTemplates";

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
  cc?: string;
  bcc?: string;
}

export interface MailSendResult {
  success: boolean;
  message: string;
}

export function getDefaultMailRecipient(): string {
  return resolveFromEmail();
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
export async function sendMail({ to, subject, text, html, cc, bcc }: SendMailOptions): Promise<MailSendResult> {
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
    if (cc) console.log(`[DEV EMAIL] Cc: ${cc}`);
    if (bcc) console.log(`[DEV EMAIL] Bcc: ${bcc}`);
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
      cc,
      bcc,
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
  const template = renderSystemTestMailTemplate({
    clubSlug: params.clubSlug,
    requestedBy: params.requestedBy,
    provider: status.provider,
    smtpHost: status.host,
    smtpPort: status.port,
  });

  return sendMail({
    to: params.to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

/**
 * Sends a magic link login email.
 * This can be used as a custom sendVerificationRequest for Auth.js.
 */
export async function sendMagicLinkEmail(params: { identifier: string; url: string }) {
  const { identifier: to, url } = params;
  const template = renderMagicLinkMailTemplate({
    loginUrl: url,
    clubName: "EFK87",
  });

  await sendMail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}

/**
 * Sends a password reset email to the user.
 */
export async function sendPasswordResetEmail(email: string, token: string, clubSlug: string) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/${clubSlug}/login/nulstil-adgangskode?token=${token}`;
  const template = renderPasswordResetMailTemplate({
    resetUrl,
    clubName: "EFK87",
  });

  await sendMail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
}
