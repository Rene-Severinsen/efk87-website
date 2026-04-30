import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import FlightSchoolAdminPage from "../../../../components/admin/flightSchool/FlightSchoolAdminPage";
import * as flightSchoolAdminService from "../../../../lib/admin/flightSchoolAdminService";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/flyveskole`);

  const [page, documents, instructors, sessions] = await Promise.all([
    flightSchoolAdminService.getAdminFlightSchoolPage(club.id),
    flightSchoolAdminService.getAdminFlightSchoolDocuments(club.id),
    flightSchoolAdminService.getFlightSchoolInstructors(club.id),
    flightSchoolAdminService.getAdminFlightSchoolSessions(club.id),
  ]);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <FlightSchoolAdminPage
        clubSlug={clubSlug}
        page={page}
        documents={documents}
        instructors={instructors}
        sessions={sessions}
      />
    </AdminShell>
  );
}
