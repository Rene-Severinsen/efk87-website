import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPagePrimitives";
import { MessageCircle } from "lucide-react";
import ForumCategoryForm from "../../../../../../components/admin/forum/ForumCategoryForm";
import { createForumCategory } from "../../../../../../lib/forum/actions/adminForumActions";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/forum/kategorier/ny`);

  const createAction = createForumCategory.bind(null, clubSlug);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Ny forumkategori"
        description="Opret en ny kategori i klubbens forum."
      />

      <div className="mt-8">
        <ForumCategoryForm 
          clubSlug={clubSlug} 
          action={createAction} 
        />
      </div>
    </AdminShell>
  );
}
