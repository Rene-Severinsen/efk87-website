import { redirect } from "next/navigation";
import prisma from "../db/prisma";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireActiveMemberForClub } from "../auth/accessGuards";
import { getActiveFlightIntentForMemberDate } from "./memberFlightIntentService";
import { 
  ClubFlightIntentType, 
  ClubFlightIntentStatus, 
  ClubFlightIntentSource, 
  ClubFlightIntentVisibility 
} from "../../generated/prisma";

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

  const flightDate = new Date(flightDateStr);
  flightDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (flightDate < today) {
    throw new Error("flightDate must be today or future");
  }

  // Enforce one active entry per member per day
  const existingActive = await getActiveFlightIntentForMemberDate(club.id, viewer.userId, flightDate);
  if (existingActive) {
    redirect(`/${clubSlug}/jeg-flyver?duplicate=1`);
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

  await prisma.clubFlightIntent.create({
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

  // Future: lookup getFlightIntentMailingListForClub(club.id) and enqueue notification after successful create.

  redirect(`/${clubSlug}/jeg-flyver?created=1`);
}
