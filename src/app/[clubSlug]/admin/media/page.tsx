import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
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
      <div className="py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Media
          </h1>
          <p className="max-w-3xl text-slate-400">
            Upload og administrér billeder til klubsite, galleri, artikler og fremtidige billedsektioner.
            V1 gemmer billeder lokalt. Storage kan senere skiftes til S3/Object Storage uden at ændre brugerfladen.
          </p>
        </div>

        <MediaLibraryClient
          clubSlug={clubSlug}
          assets={assets}
        />
      </div>
    </AdminShell>
  );
}
