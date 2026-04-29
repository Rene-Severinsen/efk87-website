import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import AdminPlaceholderPage from "../../../../components/admin/AdminPlaceholderPage";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/medlemmer`);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPlaceholderPage 
        title="Medlemmer"
        description="Fremtidig medlemsliste, roller, status og invitationer."
        futureItems={[
          "Oversigt over alle klubmedlemmer",
          "Håndtering af roller og rettigheder",
          "Invitation af nye medlemmer",
          "Eksport af medlemsdata"
        ]}
      />
    </AdminShell>
  );
}
