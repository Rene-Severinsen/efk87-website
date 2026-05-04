import { NextResponse } from "next/server";
import { getServerViewerForClub } from "../../../../../lib/auth/viewer";
import { addMemberImagesToGallery } from "../../../../../lib/gallery/galleryMemberService";
import { getMemberProfileIdentity } from "../../../../../lib/members/memberProfileIdentityService";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
    albumSlug: string;
  }>;
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug, albumSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await getServerViewerForClub(club.id);

    if (!viewer.isMember || !viewer.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at tilføje billeder.",
        },
        { status: 403 },
      );
    }

    const memberIdentity = await getMemberProfileIdentity(club.id, viewer.userId);

    if (!memberIdentity) {
      return NextResponse.json(
        {
          success: false,
          error: "Kunne ikke finde din medlemsprofil.",
        },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const files = getFiles(formData, "images");

    await addMemberImagesToGallery({
      clubId: club.id,
      clubSlug,
      albumSlug,
      files,
      memberProfileId: memberIdentity.id,
      memberName: memberIdentity.displayName,
      memberEmail: memberIdentity.email,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Billederne kunne ikke uploades.",
      },
      { status: 500 },
    );
  }
}
