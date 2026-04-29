import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../components/admin/AdminShell";
import CalendarEntryForm from "../../../../../components/admin/calendar/CalendarEntryForm";
import { createCalendarEntryAction } from "../../../../../lib/admin/calendarActions";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function NewCalendarEntryPage({ params }: PageProps) {
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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/kalender/ny`);
  const boundAction = createCalendarEntryAction.bind(null, clubSlug);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="min-h-screen bg-[#0b1220] -m-6 p-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Opret kalenderindslag</h1>
            <p className="text-slate-400 text-lg">Udfyld felterne for at oprette et nyt indslag i kalenderen.</p>
          </div>

          <CalendarEntryForm 
            clubSlug={clubSlug}
            action={boundAction}
          />
        </div>
      </div>
    </AdminShell>
  );
}
