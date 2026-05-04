import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import {
  updateClubBrandingFromLogoUpload,
  updateClubBrandingText,
} from "../../../../../../lib/branding/clubBrandingService";
import { requireClubBySlug } from "../../../../../../lib/tenancy/tenantService";

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
    await requireClubAdminForClub(
      club.id,
      clubSlug,
      `/${clubSlug}/admin/settings/branding`,
    );

    const formData = await request.formData();
    const logoFile = formData.get("logoFile");
    const logoAltText = getText(formData, "logoAltText");

    const branding =
      logoFile instanceof File && logoFile.size > 0
        ? await updateClubBrandingFromLogoUpload({
            clubId: club.id,
            clubSlug,
            logoFile,
            logoAltText,
          })
        : await updateClubBrandingText({
            clubId: club.id,
            logoAltText,
          });

    revalidatePath(`/${clubSlug}`);
    revalidatePath(`/${clubSlug}/admin/settings/branding`);

    return NextResponse.json({
      success: true,
      branding,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Branding kunne ikke gemmes.",
      },
      { status: 500 },
    );
  }
}
