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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/artikler`);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPlaceholderPage 
        title="Artikler"
        description="Fremtidig udgivelse og moderering af artikler."
        futureItems={[
          "Oprettelse af nyheder og artikler",
          "Kategorisering og tagging",
          "Moderering af kommentarer",
          "Tidsindstillet udgivelse"
        ]}
      />
    </AdminShell>
  );
}
