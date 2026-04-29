import { redirect } from "next/navigation";
import prisma from "../db/prisma";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireActiveMemberForClub } from "../auth/accessGuards";
import { ClubFlightIntentStatus } from "../../generated/prisma";

export async function cancelFlightIntentAction(formData: FormData) {
  "use server";

  const clubSlug = formData.get("clubSlug") as string;
  const flightIntentId = formData.get("flightIntentId") as string;

  if (!clubSlug) throw new Error("Missing clubSlug");
  if (!flightIntentId) throw new Error("Missing flightIntentId");

  const club = await requireClubBySlug(clubSlug);
  const viewer = await requireActiveMemberForClub(club.id, club.slug);

  if (!viewer.userId) {
    throw new Error("Viewer must have a userId");
  }

  const intent = await prisma.clubFlightIntent.findUnique({
    where: { id: flightIntentId },
  });

  if (!intent) {
    throw new Error("Flight intent not found");
  }

  if (intent.clubId !== club.id) {
    throw new Error("Unauthorized: Club mismatch");
  }

  if (intent.userId !== viewer.userId) {
    throw new Error("Unauthorized: Ownership mismatch");
  }

  if (intent.status !== ClubFlightIntentStatus.ACTIVE) {
    throw new Error("Only ACTIVE rows may be cancelled");
  }

  await prisma.clubFlightIntent.update({
    where: { id: flightIntentId },
    data: {
      status: ClubFlightIntentStatus.CANCELLED,
      cancelledAt: new Date(),
    },
  });

  redirect(`/${clubSlug}/jeg-flyver?cancelled=1`);
}
