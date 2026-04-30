import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../components/admin/AdminShell";
import HomepageContentForm from "../HomepageContentForm";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/forside-indhold/ny`);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Opret nyt forsideindhold</h1>
        <p style={{ color: 'rgba(238, 245, 255, 0.6)', marginTop: '4px' }}>Udfyld felterne for at oprette et nyt opslag eller besked på forsiden.</p>
      </div>

      <HomepageContentForm clubSlug={clubSlug} />
    </AdminShell>
  );
}
