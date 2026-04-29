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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Kalender</h1>
          <p style={{ color: '#666', marginTop: '4px' }}>Administrer klubbens kalenderindslag.</p>
        </div>
        <Link href={`/${clubSlug}/admin/kalender/ny`} className="admin-btn admin-btn-primary">
          Opret kalenderindslag
        </Link>
      </div>

      <div className="admin-card" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Dato & Tid</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Titel</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Marquee</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Handling</th>
            </tr>
          </thead>
          <tbody>
            {entries.length > 0 ? entries.map((entry) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: '500' }}>{formatDate(entry.startsAt)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{formatTime(entry.startsAt)}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: '500' }}>{entry.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>{entry.location || 'Ingen lokation'}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    background: entry.isPublished ? '#e6f7ff' : '#fff1f0',
                    color: entry.isPublished ? '#1890ff' : '#ff4d4f'
                  }}>
                    {entry.isPublished ? 'Publiceret' : 'Kladde'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {entry.forceShowInMarquee && (
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.72rem', 
                      fontWeight: '600',
                      background: '#f6ffed',
                      color: '#52c41a',
                      border: '1px solid #b7eb8f'
                    }}>
                      Forceret
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Link href={`/${clubSlug}/admin/kalender/${entry.id}/rediger`} style={{ color: '#1890ff', fontSize: '0.875rem' }}>
                      Rediger
                    </Link>
                    <form action={toggleCalendarEntryPublishedAction.bind(null, clubSlug, entry.id, !entry.isPublished)}>
                      <button type="submit" style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: entry.isPublished ? '#fa8c16' : '#52c41a', 
                        fontSize: '0.875rem', 
                        cursor: 'pointer',
                        padding: 0
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
                        padding: 0
                      }}>
                        Slet
                      </button>
                    </DeleteCalendarEntryForm>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                  Ingen kalenderindslag fundet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
