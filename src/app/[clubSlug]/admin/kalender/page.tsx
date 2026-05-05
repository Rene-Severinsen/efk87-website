import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader, AdminPageSection } from "../../../../components/admin/AdminPagePrimitives";
import { getAdminCalendarEntries } from "../../../../lib/admin/calendarAdminService";
import Link from "next/link";
import { toggleCalendarEntryPublishedAction, deleteCalendarEntryAction } from "../../../../lib/admin/calendarActions";
import DeleteCalendarEntryForm from "../../../../components/admin/calendar/DeleteCalendarEntryForm";
import { PublicSurfaceVisibility } from "../../../../generated/prisma";

function visibilityLabel(visibility: PublicSurfaceVisibility): string {
  switch (visibility) {
    case PublicSurfaceVisibility.PUBLIC:
      return "Offentlig";
    case PublicSurfaceVisibility.MEMBERS_ONLY:
      return "Kun medlemmer";
    default:
      return visibility;
  }
}

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <AdminPageSection className={`admin-table-card ${className}`}>
    {children}
  </AdminPageSection>
);

export default async function AdminCalendarPage({ params }: PageProps) {
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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/kalender`);
  const entries = await getAdminCalendarEntries(club.id);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Kalender"
        description="Administrer klubbens kalenderindslag."
        action={{
          label: "Opret kalenderindslag",
          href: `/${clubSlug}/admin/kalender/ny`,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )
        }}
      />

      <div className="admin-page-content">
        <div className="max-w-[1600px] mx-auto">
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr >
                    <th >Dato & Tid</th>
                    <th >Titel</th>
                    <th >Status</th>
                    <th >Synlighed</th>
                    <th >Marquee</th>
                    <th className="text-right">Handling</th>
                  </tr>
                </thead>
                <tbody >
                  {entries.length > 0 ? entries.map((entry) => (
                    <tr key={entry.id} className="group">
                      <td className="px-6 py-4">
                        <div className="admin-strong">{formatDate(entry.startsAt)}</div>
                        <div className="admin-muted text-sm">{formatTime(entry.startsAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="admin-strong font-semibold">{entry.title}</div>
                        <div className="admin-muted text-xs">{entry.location || 'Ingen lokation'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`admin-badge ${entry.isPublished ? "admin-badge-success" : "admin-badge-warning"}`}>
                          {entry.isPublished ? 'Publiceret' : 'Kladde'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="admin-badge admin-badge-neutral">
                          {visibilityLabel(entry.visibility)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {entry.forceShowInMarquee && (
                          <span className="admin-badge admin-badge-info">
                            Gennemtvinges
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/${clubSlug}/admin/kalender/${entry.id}/rediger`}
                            className="admin-btn"
                          >
                            Rediger
                          </Link>
                          <form action={toggleCalendarEntryPublishedAction.bind(null, clubSlug, entry.id, !entry.isPublished)}>
                            <button 
                              type="submit" 
                              className={`admin-btn ${entry.isPublished ? "admin-btn-danger" : "admin-btn-success"}`}
                            >
                              {entry.isPublished ? 'Afpublicer' : 'Publicer'}
                            </button>
                          </form>
                          <DeleteCalendarEntryForm 
                            clubSlug={clubSlug} 
                            entryId={entry.id} 
                            action={deleteCalendarEntryAction}
                          >
                            <button 
                              type="submit" 
                              className="admin-btn admin-btn-danger"
                            >
                              Slet
                            </button>
                          </DeleteCalendarEntryForm>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="admin-muted px-6 py-12 text-center">
                        Ingen kalenderindslag fundet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </AdminShell>
  );
}
