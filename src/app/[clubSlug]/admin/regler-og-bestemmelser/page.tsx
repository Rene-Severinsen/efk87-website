import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";
import RulesPageAdminForm from "./RulesPageAdminForm";

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
    `/${clubSlug}/admin/regler-og-bestemmelser`,
  );

  const [content, mediaAssets] = await Promise.all([
    getClubRulesPageContent(club.id),
    listClubMediaAssets(club.id),
  ]);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Regler og bestemmelser"
        description="Vedligehold offentlige regler, dokumenter og praktiske bestemmelser."
      />

      <div className="py-8">
        <RulesPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
          mediaAssets={mediaAssets}
        />
      </div>
    </AdminShell>
  );
}
