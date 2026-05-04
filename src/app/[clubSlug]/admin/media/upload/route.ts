import { NextResponse } from "next/server";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import { uploadClubMediaAsset } from "../../../../../lib/media/mediaStorageService";
import { requireClubBySlug } from "../../../../../lib/tenancy/tenantService";

interface RouteContext {
  params: Promise<{
    clubSlug: string;
  }>;
}

function getText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  return typeof value === "string" ? value : null;
}

export async function POST(request: Request, context: RouteContext) {
  const { clubSlug } = await context.params;

  try {
    const club = await requireClubBySlug(clubSlug);
    const viewer = await requireClubAdminForClub(
      club.id,
      clubSlug,
      `/${clubSlug}/admin/media`,
    );

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Vælg et billede der skal uploades.",
        },
        { status: 400 },
      );
    }

    await uploadClubMediaAsset({
      clubId: club.id,
      clubSlug,
      file,
      title: getText(formData, "title"),
      altText: getText(formData, "altText"),
      uploadedByName: viewer.name || null,
      uploadedByEmail: viewer.email || null,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Billedet kunne ikke uploades.",
      },
      { status: 500 },
    );
  }
}
