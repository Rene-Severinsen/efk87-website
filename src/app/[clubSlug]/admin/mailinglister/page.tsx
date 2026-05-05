import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import { getAdminClubMailingLists } from "../../../../lib/mailingLists/clubMailingListService";
import { formatAdminDateTime } from "../../../../lib/format/adminDateFormat";
import { ClubMailingListPurpose } from "@/generated/prisma";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/mailinglister`);
  
  const mailingLists = await getAdminClubMailingLists(club.id);

  const activeCount = mailingLists.filter(l => l.isActive).length;
  const inactiveCount = mailingLists.length - activeCount;
  const purposesCount = new Set(mailingLists.map(l => l.purpose)).size;

  const getPurposeLabel = (purpose: ClubMailingListPurpose) => {
    switch (purpose) {
      case ClubMailingListPurpose.GENERAL: return "Generel";
      case ClubMailingListPurpose.FLIGHT_INTENT: return "Flyvermeddelelser";
      case ClubMailingListPurpose.SCHOOL: return "Flyveskole";
      case ClubMailingListPurpose.TRIP: return "Tur";
      case ClubMailingListPurpose.OTHER: return "Andet";
      default: return purpose;
    }
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
        title="Mailinglister"
        description="Overblik over klubbens mailingliste-konfiguration."
      />

      <div className="admin-workspace pt-6">

        <div className="admin-metric-grid">
          <div className="admin-card admin-metric-card">
            <span className="admin-metric-label">Aktive lister</span>
            <span className="admin-metric-value">{activeCount}</span>
          </div>
          <div className="admin-card admin-metric-card">
            <span className="admin-metric-label">Inaktive lister</span>
            <span className="admin-metric-value">{inactiveCount}</span>
          </div>
          <div className="admin-card admin-metric-card">
            <span className="admin-metric-label">Formål registreret</span>
            <span className="admin-metric-value">{purposesCount}</span>
          </div>
          <div className="admin-card admin-metric-card">
            <span className="admin-metric-label">Mailafsendelse</span>
            <span className="admin-metric-value" style={{ color: '#faad14', fontSize: '1.25rem' }}>Ikke aktiveret</span>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#fffbe6', 
          border: '1px solid #ffe58f', 
          padding: '16px 24px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600, color: '#856404' }}>Vigtig information</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404', lineHeight: '1.5' }}>
              Mailafsendelse er ikke aktiveret endnu. SPF, DKIM, DMARC og listeadgang skal afklares før systemet må sende til mailinglister.
            </p>
          </div>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>Konfigurerede lister</h2>
            <span style={{ fontSize: '0.85rem', color: '#8c8c8c', fontStyle: 'italic' }}>
              Redigering kommer senere
            </span>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Navn</th>
                  <th>Formål</th>
                  <th>Adresse</th>
                  <th>Status</th>
                  <th>Nøgle</th>
                  <th>Opdateret</th>
                </tr>
              </thead>
              <tbody>
                {mailingLists.length > 0 ? (
                  mailingLists.map((list) => (
                    <tr key={list.id}>
                      <td style={{ fontWeight: 500 }}>{list.name}</td>
                      <td>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          backgroundColor: '#f0f2f5',
                          color: '#595959',
                          border: '1px solid #d9d9d9'
                        }}>
                          {getPurposeLabel(list.purpose)}
                        </span>
                      </td>
                      <td><code>{list.emailAddress}</code></td>
                      <td>
                        {list.isActive ? (
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            backgroundColor: '#f6ffed',
                            color: '#389e0d',
                            border: '1px solid #b7eb8f'
                          }}>
                            Aktiv
                          </span>
                        ) : (
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            backgroundColor: '#fff1f0',
                            color: '#cf1322',
                            border: '1px solid #ffa39e'
                          }}>
                            Inaktiv
                          </span>
                        )}
                      </td>
                      <td><code style={{ fontSize: '0.75rem' }}>{list.key}</code></td>
                      <td style={{ color: '#8c8c8c' }}>{formatAdminDateTime(list.updatedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#8c8c8c' }}>
                      Ingen mailinglister fundet for denne klub.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
