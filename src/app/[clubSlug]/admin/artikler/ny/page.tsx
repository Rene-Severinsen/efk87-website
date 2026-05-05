import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../../components/admin/AdminPagePrimitives";
import ArticleForm from "../../../../../components/admin/articles/ArticleForm";
import { getAdminArticleFormOptions } from "../../../../../lib/admin/articleAdminService";
import { createArticleAction } from "../../../../../lib/admin/articleActions";
import { listClubMediaAssets } from "../../../../../lib/media/mediaStorageService";

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
    `/${clubSlug}/admin/artikler/ny`,
  );

  const [{ tags }, mediaAssets] = await Promise.all([
    getAdminArticleFormOptions(club.id),
    listClubMediaAssets(club.id),
  ]);

  const boundAction = createArticleAction.bind(null, clubSlug);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Opret artikel"
        description="Opret en ny artikel til klubben."
      />

      <div className="pt-6">
        <ArticleForm
          clubSlug={clubSlug}
          tags={tags}
          action={boundAction}
          mediaAssets={mediaAssets}
        />
      </div>
    </AdminShell>
  );
}
