import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { getAdminGalleryOverview } from "../../../../lib/admin/galleryAdminService";
import "../../../../components/admin/AdminDashboard.css";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/galleri`);

  const { albums, stats } = await getAdminGalleryOverview(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="admin-gallery-page">
        <div className="admin-header-section" style={{ marginBottom: '24px' }}>
          <h1 className="admin-section-title">Galleri</h1>
          <p className="admin-section-subtitle">Overblik over albums og billeder. Upload og moderation kommer senere.</p>
        </div>

        <div style={{ 
          backgroundColor: '#e6f7ff', 
          border: '1px solid #91d5ff', 
          padding: '16px', 
          borderRadius: '4px', 
          marginBottom: '24px',
          fontSize: '0.875rem'
        }}>
          <strong>Legacy-import:</strong> Data fra det gamle site skal senere kunne importeres. Denne side viser kun databaseindhold.
        </div>

        <div className="admin-stats-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div className="admin-card">
            <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Albums</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalAlbums}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Billeder</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalImages}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Publicerede albums</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.publishedAlbums}</div>
          </div>
          <div className="admin-card">
            <div style={{ fontSize: '0.875rem', color: '#8c8c8c' }}>Legacy-import</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ikke kørt</div>
          </div>
        </div>

        <div className="admin-card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px' }}>Titel</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Synlighed</th>
                <th style={{ padding: '12px 8px' }}>Billeder</th>
                <th style={{ padding: '12px 8px' }}>Legacy</th>
                <th style={{ padding: '12px 8px' }}>Opdateret</th>
              </tr>
            </thead>
            <tbody>
              {albums.length > 0 ? (
                albums.map((album) => (
                  <tr key={album.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 8px' }}>{album.title}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span className={`admin-badge ${album.status.toLowerCase()}`}>
                        {album.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{album.visibility}</td>
                    <td style={{ padding: '12px 8px' }}>{album.imageCount}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {album.legacySource ? (
                        <span title={`ID: ${album.legacyId}`}>{album.legacySource}</span>
                      ) : (
                        <span style={{ opacity: 0.4 }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '0.875rem' }}>
                      {album.updatedAt.toLocaleDateString('da-DK')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#8c8c8c' }}>
                    Ingen albums fundet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
