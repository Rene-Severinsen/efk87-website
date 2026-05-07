import prisma from "../db/prisma";
import { env } from "../config/env";
import { ClubFlightIntent, ClubFlightIntentStatus } from "../../generated/prisma";
import { getFlightIntentMailingListForClub } from "../mailingLists/clubMailingListService";
import { getDefaultMailRecipient, sendMail } from "../email/mailService";
import { renderFlightIntentCreatedMailTemplate } from "../email/mailTemplates";

function formatDateLabel(value: Date): string {
  return new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatTimeLabel(value: Date | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function getLocalDayRange(value: Date): { start: Date; end: Date } {
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);

  const end = new Date(value);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getFlightIntentListUrl(clubSlug: string): string {
  const path = `/${clubSlug}/jeg-flyver/liste`;
  const baseUrl = env.APP_BASE_URL?.replace(/\/$/, "");

  return baseUrl ? `${baseUrl}${path}` : path;
}

export async function sendFlightIntentCreatedNotification(params: {
  clubId: string;
  clubSlug: string;
  clubName: string;
  createdIntent: ClubFlightIntent;
}): Promise<void> {
  const mailingList = await getFlightIntentMailingListForClub(params.clubId);

  if (!mailingList) {
    console.log("[FlightIntentNotification] No active FLIGHT_INTENT mailing list configured. Mail skipped.", {
      clubId: params.clubId,
      clubSlug: params.clubSlug,
      flightIntentId: params.createdIntent.id,
    });
    return;
  }

  const { start, end } = getLocalDayRange(params.createdIntent.flightDate);

  const todayIntents = await prisma.clubFlightIntent.findMany({
    where: {
      clubId: params.clubId,
      status: ClubFlightIntentStatus.ACTIVE,
      flightDate: {
        gte: start,
        lte: end,
      },
    },
    orderBy: [
      { plannedAt: "asc" },
      { createdAt: "asc" },
    ],
    select: {
      id: true,
      displayName: true,
      message: true,
      plannedAt: true,
    },
  });

  const template = renderFlightIntentCreatedMailTemplate({
    clubName: params.clubName,
    createdByName: params.createdIntent.displayName,
    flightDateLabel: formatDateLabel(params.createdIntent.flightDate),
    plannedTimeLabel: formatTimeLabel(params.createdIntent.plannedAt),
    message: params.createdIntent.message,
    listUrl: getFlightIntentListUrl(params.clubSlug),
    todayIntents: todayIntents.map((intent) => ({
      displayName: intent.displayName,
      plannedTimeLabel: formatTimeLabel(intent.plannedAt),
      message: intent.message,
    })),
  });

  const result = await sendMail({
    to: getDefaultMailRecipient(params.clubName),
    bcc: mailingList.emailAddress,
    subject: template.subject,
    text: template.text,
    html: template.html,
    fromName: params.clubName,
  });

  if (!result.success) {
    console.error("[FlightIntentNotification] Mail send failed.", {
      clubId: params.clubId,
      clubSlug: params.clubSlug,
      flightIntentId: params.createdIntent.id,
      mailingListId: mailingList.id,
      mailingListEmail: mailingList.emailAddress,
      message: result.message,
    });
  }
}
