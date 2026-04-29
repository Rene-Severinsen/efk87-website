"use server";

import { redirect } from "next/navigation";
import prisma from "../db/prisma";
import { requireClubBySlug } from "../tenancy/tenantService";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";

export async function cancelFlightIntentAsAdminAction(
  clubSlug: string,
  flightIntentId: string
) {
  // resolve club by slug
  const club = await requireClubBySlug(clubSlug);

  // require admin via requireClubAdminForClub
  await requireClubAdminForClub(club.id, clubSlug);

  // find ClubFlightIntent by id
  const flightIntent = await prisma.clubFlightIntent.findUnique({
    where: { id: flightIntentId },
  });

  if (!flightIntent) {
    throw new Error("Flight intent not found");
  }

  // verify clubId matches current club
  if (flightIntent.clubId !== club.id) {
    throw new Error("Unauthorized");
  }

  // only allow cancelling ACTIVE rows
  if (flightIntent.status !== "ACTIVE") {
    throw new Error("Only active flight intents can be cancelled");
  }

  // set status = CANCELLED, cancelledAt = current server time
  await prisma.clubFlightIntent.update({
    where: { id: flightIntentId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  // redirect back to: /{clubSlug}/admin/flyvemeldinger?cancelled=1
  redirect(`/${clubSlug}/admin/flyvemeldinger?cancelled=1`);
}
