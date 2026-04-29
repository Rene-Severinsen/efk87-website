import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../components/admin/AdminShell";
import AdminDashboard from "../../../components/admin/AdminDashboard";

interface AdminPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
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

  // Guard: requires authenticated admin/owner with active membership
  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin`);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
    >
      <AdminDashboard clubSlug={clubSlug} clubName={club.name} />
    </AdminShell>
  );
}
