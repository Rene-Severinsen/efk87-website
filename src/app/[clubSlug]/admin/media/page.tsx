import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import MediaLibraryClient from "./MediaLibraryClient";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
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
    `/${clubSlug}/admin/media`,
  );

  const assets = await listClubMediaAssets(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Media"
        description="Upload og administrér billeder til klubsite, galleri, artikler og fremtidige billedsektioner."
      />

      <div className="py-8">
        <MediaLibraryClient
          clubSlug={clubSlug}
          assets={assets}
        />
      </div>
    </AdminShell>
  );
}
