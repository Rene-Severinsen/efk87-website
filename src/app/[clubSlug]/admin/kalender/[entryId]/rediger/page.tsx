import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../../../components/admin/AdminPagePrimitives";
import CalendarEntryForm from "../../../../../../components/admin/calendar/CalendarEntryForm";
import { updateCalendarEntryAction } from "../../../../../../lib/admin/calendarActions";
import { getAdminCalendarEntryById } from "../../../../../../lib/admin/calendarAdminService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    entryId: string;
  }>;
}

export default async function EditCalendarEntryPage({ params }: PageProps) {
  const { clubSlug, entryId } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/kalender/${entryId}/rediger`);
  
  const entry = await getAdminCalendarEntryById(club.id, entryId);

  if (!entry) {
    notFound();
  }

  const boundAction = updateCalendarEntryAction.bind(null, clubSlug, entryId);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Rediger kalenderindslag"
        description="Opdater detaljerne for kalenderindslaget."
      />

      <div className="admin-page-content">
        <div className="max-w-[1200px] mx-auto">
          <CalendarEntryForm 
            clubSlug={clubSlug}
            initialData={entry}
            action={boundAction}
          />
        </div>
      </div>
    </AdminShell>
  );
}
