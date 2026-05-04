import { NextResponse } from "next/server";
import { PublicSurfaceVisibility } from "../../../../../generated/prisma";
import { getServerViewerForClub } from "../../../../../lib/auth/viewer";
import { createMemberGalleryWithImages } from "../../../../../lib/gallery/galleryMemberService";
import { getMemberProfileIdentity } from "../../../../../lib/members/memberProfileIdentityService";
import { publicRoutes } from "../../../../../lib/publicRoutes";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFiles(formData: FormData, key: string): File[] {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function normalizeVisibility(value: string): PublicSurfaceVisibility {
  return value === PublicSurfaceVisibility.MEMBERS_ONLY
    ? PublicSurfaceVisibility.MEMBERS_ONLY
    : PublicSurfaceVisibility.PUBLIC;
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await getServerViewerForClub(club.id);

    if (!viewer.isMember || !viewer.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Du skal være logget ind som medlem for at oprette galleri.",
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
    const title = getText(formData, "title");
    const description = getText(formData, "description");
    const visibility = normalizeVisibility(getText(formData, "visibility"));
    const coverImageIndex = Number.parseInt(getText(formData, "coverImageIndex"), 10);
    const files = getFiles(formData, "images");

    const gallery = await createMemberGalleryWithImages({
      clubId: club.id,
      clubSlug,
      title,
      description,
      visibility,
      files,
      coverImageIndex,
      memberProfileId: memberIdentity.id,
      memberName: memberIdentity.displayName,
      memberEmail: memberIdentity.email,
    });

    return NextResponse.json({
      success: true,
      galleryUrl: publicRoutes.galleryAlbum(clubSlug, gallery.slug),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Galleriet kunne ikke oprettes.",
      },
      { status: 500 },
    );
  }
}
