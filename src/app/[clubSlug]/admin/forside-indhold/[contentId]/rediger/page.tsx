import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Rediger forsideindhold</h1>
        <p style={{ color: 'rgba(238, 245, 255, 0.6)', marginTop: '4px' }}>Opdater indholdet for &quot;{content.title}&quot;.</p>
      </div>

      <HomepageContentForm 
        clubSlug={clubSlug} 
        initialData={content} 
      />
    </AdminShell>
  );
}
