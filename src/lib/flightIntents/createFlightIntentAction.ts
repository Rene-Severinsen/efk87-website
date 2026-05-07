import { redirect } from "next/navigation";
import prisma from "../db/prisma";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireActiveMemberForClub } from "../auth/accessGuards";
import { getActiveFlightIntentForMemberDate } from "./memberFlightIntentService";
import { publicRoutes } from "../publicRoutes";
import { sendFlightIntentCreatedNotification } from "./flightIntentNotificationService";
import { 
  ClubFlightIntentType, 
  ClubFlightIntentStatus, 
  ClubFlightIntentSource, 
  ClubFlightIntentVisibility 
} from "../../generated/prisma";

function parseLocalDateInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error("Invalid flightDate");
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function createFlightIntentAction(formData: FormData) {
  "use server";

  const clubSlug = formData.get("clubSlug") as string;
  const flightDateStr = formData.get("flightDate") as string;
  const plannedTimeStr = formData.get("plannedTime") as string;
  const activityTypeStr = formData.get("activityType") as string;
  const message = (formData.get("message") as string) || null;

  if (!clubSlug) throw new Error("Missing clubSlug");

  const club = await requireClubBySlug(clubSlug);
  const viewer = await requireActiveMemberForClub(club.id, club.slug);

  if (!viewer.userId) {
    throw new Error("Viewer must have a userId");
  }

  // Validation
  if (!flightDateStr) throw new Error("Missing flightDate");
  if (!activityTypeStr) throw new Error("Missing activityType");
  if (message && message.length > 240) throw new Error("Message too long");

  const flightDate = parseLocalDateInput(flightDateStr);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (flightDate < today) {
    throw new Error("flightDate must be today or future");
  }

  // Enforce one active entry per member per day
  const existingActive = await getActiveFlightIntentForMemberDate(club.id, viewer.userId, flightDate);
  if (existingActive) {
    redirect(publicRoutes.jegFlyver(clubSlug) + "?duplicate=1");
  }

  // Activity type validation
  if (!Object.values(ClubFlightIntentType).includes(activityTypeStr as ClubFlightIntentType)) {
    throw new Error("Invalid activityType");
  }
  const activityType = activityTypeStr as ClubFlightIntentType;

  let plannedAt: Date | null = null;
  if (plannedTimeStr) {
    const [hours, minutes] = plannedTimeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error("Invalid plannedTime");
    }
    plannedAt = new Date(flightDate);
    plannedAt.setHours(hours, minutes, 0, 0);
  }

  const displayName = viewer.name || viewer.email || "Medlem";

  // Expires at end of day
  const expiresAt = new Date(flightDate);
  expiresAt.setHours(23, 59, 59, 999);

  const createdIntent = await prisma.clubFlightIntent.create({
    data: {
      clubId: club.id,
      userId: viewer.userId,
      displayName,
      message,
      activityType,
      status: ClubFlightIntentStatus.ACTIVE,
      source: ClubFlightIntentSource.FUTURE_MEMBER_APP,
      visibility: ClubFlightIntentVisibility.PUBLIC,
      flightDate,
      plannedAt,
      expiresAt,
    },
  });

  try {
    await sendFlightIntentCreatedNotification({
      clubId: club.id,
      clubSlug,
      clubName: club.name,
      createdIntent,
    });
  } catch (error) {
    console.error("[FlightIntent] Created successfully, but notification mail failed.", {
      clubId: club.id,
      clubSlug,
      flightIntentId: createdIntent.id,
      error,
    });
  }

  redirect(publicRoutes.jegFlyver(clubSlug) + "?created=1");
}
