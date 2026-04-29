import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { getAdminCalendarEntries } from "../../../../lib/admin/calendarAdminService";
import Link from "next/link";
import { toggleCalendarEntryPublishedAction, deleteCalendarEntryAction } from "../../../../lib/admin/calendarActions";
import DeleteCalendarEntryForm from "../../../../components/admin/calendar/DeleteCalendarEntryForm";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

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
      <div className="admin-page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-section-title" style={{ margin: 0 }}>Kalender</h1>
          <p className="admin-form-help">Administrer klubbens kalenderindslag.</p>
        </div>
        <Link href={`/${clubSlug}/admin/kalender/ny`} className="admin-btn admin-btn-primary">
          Opret kalenderindslag
        </Link>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dato & Tid</th>
              <th>Titel</th>
              <th>Status</th>
              <th>Marquee</th>
              <th style={{ textAlign: 'right' }}>Handling</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <div style={{ fontWeight: '600' }}>{formatDate(entry.startsAt)}</div>
                  <div className="admin-form-help">{formatTime(entry.startsAt)}</div>
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{entry.title}</div>
                  <div className="admin-form-help">{entry.location || 'Ingen lokation'}</div>
                </td>
                <td>
                  <span className={`admin-badge ${entry.isPublished ? 'admin-badge-info' : 'admin-badge-error'}`}>
                    {entry.isPublished ? 'Publiceret' : 'Kladde'}
                  </span>
                </td>
                <td>
                  {entry.forceShowInMarquee && (
                    <span className="admin-badge admin-badge-success">
                      Forceret
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Link href={`/${clubSlug}/admin/kalender/${entry.id}/rediger`} style={{ color: '#1890ff', fontSize: '0.875rem', fontWeight: '500' }}>
                      Rediger
                    </Link>
                    <form action={toggleCalendarEntryPublishedAction.bind(null, clubSlug, entry.id, !entry.isPublished)}>
                      <button type="submit" style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: entry.isPublished ? '#fa8c16' : '#52c41a', 
                        fontSize: '0.875rem', 
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: '500'
                      }}>
                        {entry.isPublished ? 'Afpublicer' : 'Publicer'}
                      </button>
                    </form>
                    <DeleteCalendarEntryForm 
                      clubSlug={clubSlug} 
                      entryId={entry.id} 
                      action={deleteCalendarEntryAction}
                    >
                      <button type="submit" style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#ff4d4f', 
                        fontSize: '0.875rem', 
                        cursor: 'pointer',
                        padding: 0,
                        fontWeight: '500'
                      }}>
                        Slet
                      </button>
                    </DeleteCalendarEntryForm>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}>
                  <p className="admin-form-help">Ingen kalenderindslag fundet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
