import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPagePrimitives";
import ArticleForm from "../../../../../../components/admin/articles/ArticleForm";
import { getAdminArticleById, getAdminArticleFormOptions } from "../../../../../../lib/admin/articleAdminService";
import { updateArticleAction } from "../../../../../../lib/admin/articleActions";
import { listClubMediaAssets } from "../../../../../../lib/media/mediaStorageService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    articleId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug, articleId } = await params;

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
    `/${clubSlug}/admin/artikler/${articleId}/rediger`,
  );

  const [article, { tags }, mediaAssets] = await Promise.all([
    getAdminArticleById(club.id, articleId),
    getAdminArticleFormOptions(club.id),
    listClubMediaAssets(club.id),
  ]);

  if (!article) {
    notFound();
  }

  const boundAction = updateArticleAction.bind(null, clubSlug, articleId);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Rediger artikel"
        description="Opdater artikelens indhold, status og synlighed."
      />

      <div className="pt-6">
        <ArticleForm
          clubSlug={clubSlug}
          initialData={article}
          tags={tags}
          action={boundAction}
          mediaAssets={mediaAssets}
        />
      </div>
    </AdminShell>
  );
}
