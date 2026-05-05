import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPagePrimitives";
import HomepageContentForm from "../../HomepageContentForm";
import { getHomepageContentById } from "../../../../../../lib/homepageContent/homepageContentService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    contentId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug, contentId } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/forside-indhold/${contentId}/rediger`);
  
  const content = await getHomepageContentById(contentId, club.id);
  
  if (!content) {
    notFound();
  }

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Rediger forsideindhold"
        description="Opdater opslag, synlighed og tilmeldingsindstillinger."
      />

      <HomepageContentForm
        clubSlug={clubSlug} 
        initialData={content} 
      />
    </AdminShell>
  );
}
