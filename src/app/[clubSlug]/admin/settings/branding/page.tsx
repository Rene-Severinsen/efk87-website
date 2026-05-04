import { notFound } from "next/navigation";
import AdminShell from "../../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import { getClubBranding } from "../../../../../lib/branding/clubBrandingService";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import BrandingSettingsClient from "./BrandingSettingsClient";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function BrandingSettingsPage({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/settings/branding`,
  );

  const branding = await getClubBranding(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Branding
          </h1>
          <p className="max-w-3xl text-slate-400">
            Upload klubbens logo. Favicon og Apple touch icon dannes automatisk fra logoet.
          </p>
        </div>

        <BrandingSettingsClient
          clubSlug={clubSlug}
          initialBranding={branding}
        />
      </div>
    </AdminShell>
  );
}
