import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../../components/admin/AdminShell";
import { MessageCircle } from "lucide-react";
import ForumCategoryForm from "../../../../../../../components/admin/forum/ForumCategoryForm";
import { updateForumCategory } from "../../../../../../../lib/forum/actions/adminForumActions";
import { getForumCategoryById } from "../../../../../../../lib/forum/forumService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    categoryId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug, categoryId } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/forum/kategorier/${categoryId}/rediger`);

  const category = await getForumCategoryById(club.id, categoryId);

  if (!category) {
    notFound();
  }

  const updateAction = updateForumCategory.bind(null, clubSlug, categoryId);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="admin-page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
          <MessageCircle className="w-6 h-6 text-sky-400" />
          Rediger kategori
        </h1>
        <p style={{ color: '#999', marginTop: '4px' }}>Redigerer {category.title}</p>
      </div>

      <div className="mt-8">
        <ForumCategoryForm 
          clubSlug={clubSlug} 
          initialData={category}
          action={updateAction} 
        />
      </div>
    </AdminShell>
  );
}
