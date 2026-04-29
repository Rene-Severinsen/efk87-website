"use server";

import prisma from "../db/prisma";
import { revalidatePath } from "next/cache";
import { ClubMemberCertificateType } from "@/generated/prisma";
import { ALL_CERTIFICATE_TYPES } from "./memberConstants";
import { requireActiveMemberForClub } from "../auth/accessGuards";

export interface ProfileActionResponse {
  success: boolean;
  error?: string;
}

export async function updateOwnMemberCertificatesAction(
  clubId: string,
  clubSlug: string,
  selectedCertificates: ClubMemberCertificateType[]
): Promise<ProfileActionResponse> {
  try {
    // 1. Authenticate and ensure the user is an active member of the club
    const viewer = await requireActiveMemberForClub(clubId, clubSlug);
    const userId = viewer.userId;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Validate certificate keys
    const validCerts = selectedCertificates.filter(cert => 
      ALL_CERTIFICATE_TYPES.includes(cert)
    );

    // 3. Update certificates in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove all existing certificates for this user in this club
      await tx.clubMemberCertificate.deleteMany({
        where: {
          clubId,
          userId,
        },
      });

      // Add new ones
      if (validCerts.length > 0) {
        await tx.clubMemberCertificate.createMany({
          data: validCerts.map(certType => ({
            clubId,
            userId,
            certificateType: certType,
          })),
        });
      }
    });

    // 4. Revalidate profile page
    revalidatePath(`/${clubSlug}/profil`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating certificates:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Der opstod en fejl ved gem af certifikater." 
    };
  }
}
