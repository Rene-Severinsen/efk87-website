import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../components/admin/AdminShell";
import ArticleForm from "../../../../../components/admin/articles/ArticleForm";
import { getAdminArticleFormOptions } from "../../../../../lib/admin/articleAdminService";
import { createArticleAction } from "../../../../../lib/admin/articleActions";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/artikler/ny`);
  const { tags } = await getAdminArticleFormOptions(club.id);

  const boundAction = createArticleAction.bind(null, clubSlug);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Opret ny artikel</h1>
        <p style={{ color: '#666', marginTop: '4px' }}>Udfyld felterne for at oprette en ny artikel.</p>
      </div>

      <ArticleForm 
        clubSlug={clubSlug}
        tags={tags}
        action={boundAction}
      />
    </AdminShell>
  );
}
