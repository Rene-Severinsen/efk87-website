import prisma from "../db/prisma";
import { env } from "../config/env";
import nodemailer, { Transporter } from "nodemailer";

/**
 * Forum Notification Service
 * 
 * Handles sending emails for forum activities:
 * 1. Notify thread author of new replies.
 * 2. Notify category contact email of new threads.
 * 3. Notify category contact email of new replies.
 */

// Configure transporter (lazy loaded)
let transporter: Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.AUTH_EMAIL_SERVER) {
    transporter = nodemailer.createTransport(env.AUTH_EMAIL_SERVER);
  } else {
    console.log("[ForumNotificationService] No e-mail provider configured (AUTH_EMAIL_SERVER missing). Emails will be logged to console in dev.");
  }
  return transporter;
}

const FROM_EMAIL = env.AUTH_EMAIL_FROM || "no-reply@efk87.dk";

/**
 * Strips HTML tags and limits length for a plain text preview.
 */
function createPreview(html: string, limit: number = 300): string {
  if (!html) return "";
  const plainText = html
    .replace(/<[^>]*>?/gm, " ") // Basic HTML strip
    .replace(/\s+/g, " ")       // Collapse whitespace
    .trim();
  
  if (plainText.length <= limit) return plainText;
  return plainText.substring(0, limit) + "...";
}

async function sendEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
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
      console.error("[ForumNotificationService] Error sending email:", error);
    }
  } else if (!env.isDevelopment) {
    console.warn("[ForumNotificationService] Email transport not available and not in development mode.");
  }
}

function getBaseUrl() {
  // Use a hardcoded default or env if available. 
  // Next.js doesn't always have the full URL on server side without headers.
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (env.isDevelopment) return "http://localhost:3000";
  return ""; // Fallback to relative paths if absolutely necessary, though emails need absolute URLs
}

export async function notifyThreadAuthorOfReply(params: {
  clubSlug: string;
  categorySlug: string;
  threadId: string;
  replyAuthorName: string;
  replyAuthorId: string;
  replyBodyHtml: string;
}) {
  try {
    const thread = await prisma.clubForumThread.findUnique({
      where: { id: params.threadId },
      include: {
        author: {
          select: { id: true, email: true }
        },
        category: {
          select: { title: true, notificationEmail: true }
        }
      }
    });

    if (!thread || !thread.author.email) return;

    // Do not notify if reply author is the thread author
    if (params.replyAuthorId === thread.authorUserId) return;

    // De-duplicate if category email is the same as author email
    if (thread.category.notificationEmail === thread.author.email) {
        // We will send only one email to this address later in the other function or skip here.
        // Business rules say "sending both is acceptable only if they are conceptually different recipients",
        // but "Prefer de-duplicate exact same email address within the same event to avoid double mail."
        // We handle category notification separately. If they are the same, let's skip here to avoid double mail.
        return;
    }

    const baseUrl = getBaseUrl();
    const threadUrl = `${baseUrl}/${params.clubSlug}/forum/${params.categorySlug}/${thread.slug}`;
    const preview = createPreview(params.replyBodyHtml);

    const subject = `Nyt svar på din tråd: ${thread.title}`;
    const body = `Hej.

${params.replyAuthorName} har svaret på din tråd "${thread.title}" i forummet.

Svar:
"${preview}"

Du kan se hele tråden og svare her:
${threadUrl}

Venlig hilsen,
Forummet`;

    await sendEmail({
      to: thread.author.email,
      subject,
      body
    });
  } catch (error) {
    console.error("[ForumNotificationService] notifyThreadAuthorOfReply failed:", error);
  }
}

export async function notifyCategoryEmailOfNewThread(params: {
  clubSlug: string;
  categorySlug: string;
  threadId: string;
  authorName: string;
  bodyHtml: string;
}) {
  try {
    const thread = await prisma.clubForumThread.findUnique({
      where: { id: params.threadId },
      include: {
        category: {
          select: { title: true, notificationEmail: true }
        }
      }
    });

    if (!thread || !thread.category.notificationEmail) return;

    const baseUrl = getBaseUrl();
    const threadUrl = `${baseUrl}/${params.clubSlug}/forum/${params.categorySlug}/${thread.slug}`;
    const preview = createPreview(params.bodyHtml);

    const subject = `Ny forumtråd i ${thread.category.title}: ${thread.title}`;
    const body = `Der er oprettet en ny tråd i kategorien "${thread.category.title}".

Oprettet af: ${params.authorName}
Titel: ${thread.title}

Indhold:
"${preview}"

Se tråden her:
${threadUrl}`;

    await sendEmail({
      to: thread.category.notificationEmail,
      subject,
      body
    });
  } catch (error) {
    console.error("[ForumNotificationService] notifyCategoryEmailOfNewThread failed:", error);
  }
}

export async function notifyCategoryEmailOfNewReply(params: {
  clubSlug: string;
  categorySlug: string;
  threadId: string;
  replyAuthorName: string;
  replyBodyHtml: string;
}) {
  try {
    const thread = await prisma.clubForumThread.findUnique({
      where: { id: params.threadId },
      include: {
        category: {
          select: { title: true, notificationEmail: true }
        }
      }
    });

    if (!thread || !thread.category.notificationEmail) return;

    const baseUrl = getBaseUrl();
    const threadUrl = `${baseUrl}/${params.clubSlug}/forum/${params.categorySlug}/${thread.slug}`;
    const preview = createPreview(params.replyBodyHtml);

    const subject = `Nyt svar i ${thread.category.title}: ${thread.title}`;
    const body = `Der er kommet et nyt svar i tråden "${thread.title}" under kategorien "${thread.category.title}".

Svar fra: ${params.replyAuthorName}

Svar:
"${preview}"

Se tråden her:
${threadUrl}`;

    await sendEmail({
      to: thread.category.notificationEmail,
      subject,
      body
    });
  } catch (error) {
    console.error("[ForumNotificationService] notifyCategoryEmailOfNewReply failed:", error);
  }
}
