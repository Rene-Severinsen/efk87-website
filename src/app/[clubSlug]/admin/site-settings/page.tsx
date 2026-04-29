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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/site-settings`);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPlaceholderPage 
        title="Site settings"
        description="Fremtidig konfiguration af klub-indstillinger, domæne og tema."
        futureItems={[
          "Generelle kluboplysninger",
          "Domæne- og DNS-indstillinger",
          "Visuelt tema og logo",
          "Integration af sociale medier"
        ]}
      />
    </AdminShell>
  );
}
