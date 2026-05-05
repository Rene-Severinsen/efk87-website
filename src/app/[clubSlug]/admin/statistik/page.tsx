import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import { getAdminStatisticsOverview } from "../../../../lib/admin/adminStatisticsService";
import "../../../../components/admin/AdminDashboard.css";
import { AdminStatTile, AdminStatTileGrid } from "@/components/admin/AdminPagePrimitives";

interface AdminStatistikPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function AdminStatistikPage({ params }: AdminStatistikPageProps) {
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
  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/statistik`);

  const stats = await getAdminStatisticsOverview(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Statistik"
        description="Overblik over medlemsaktivitet og flyvemeldinger."
      />

      <div className="admin-workspace pt-6">

        <AdminStatTileGrid columns="four">
          <AdminStatTile label="Aktive medlemmer i dag" value={stats.today.uniqueActiveMembersToday} tone="green" />
          <AdminStatTile label="Flyvemeldinger i dag" value={stats.today.flightIntentCountToday} tone="blue" />
          <AdminStatTile label="Flyvemeldinger i år" value={stats.year.flightIntentCountThisYear} tone="amber" />
          <AdminStatTile label="Aktive medlemmer i klubben" value={stats.club.activeMemberCount} tone="slate" />
        </AdminStatTileGrid>

        <div className="admin-card" style={{ marginBottom: '24px' }}>
          <h2 className="admin-section-title">Aktivitetstrend (Sidste 14 dage)</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dato</th>
                  <th>Aktive medlemmer</th>
                  <th>Flyvemeldinger</th>
                  <th style={{ width: '40%' }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {stats.dailySeries.map((day) => {
                  const maxVal = Math.max(...stats.dailySeries.map(d => Math.max(d.uniqueActiveMembers, d.flightIntentCount)), 1);
                  const memberWidth = (day.uniqueActiveMembers / maxVal) * 100;
                  const intentWidth = (day.flightIntentCount / maxVal) * 100;
                  
                  return (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.uniqueActiveMembers}</td>
                      <td>{day.flightIntentCount}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ 
                            height: '8px', 
                            width: `${memberWidth}%`, 
                            backgroundColor: '#1890ff', 
                            borderRadius: '4px',
                            minWidth: day.uniqueActiveMembers > 0 ? '2px' : '0'
                          }} title="Aktive medlemmer" />
                          <div style={{ 
                            height: '8px', 
                            width: `${intentWidth}%`, 
                            backgroundColor: '#52c41a', 
                            borderRadius: '4px',
                            minWidth: day.flightIntentCount > 0 ? '2px' : '0'
                          }} title="Flyvemeldinger" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#8c8c8c' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#1890ff', borderRadius: '2px' }} />
              Aktive medlemmer
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#52c41a', borderRadius: '2px' }} />
              Flyvemeldinger
            </div>
          </div>
        </div>

        <div className="admin-dashboard-grid">
          <div>
            <div className="admin-card">
              <h2 className="admin-section-title">Besøgende i dag</h2>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Navn</th>
                      <th>Sidst set</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.latestActiveMembersToday.length > 0 ? (
                      stats.latestActiveMembersToday.map((member, idx) => (
                        <tr key={idx}>
                          <td>{member.displayName}</td>
                          <td>{new Date(member.lastSeenAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={2} style={{ textAlign: 'center', color: '#8c8c8c' }}>Ingen aktivitet i dag endnu.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="admin-card">
              <h2 className="admin-section-title">Dagens flyvemeldinger</h2>
              <div className="admin-quick-links">
                <div className="admin-quick-link" style={{ backgroundColor: '#e6f7ff', color: '#0050b3' }}>
                  <strong>{stats.today.activeFlightIntentCountToday}</strong> Aktive
                </div>
                <div className="admin-quick-link" style={{ backgroundColor: '#fff1f0', color: '#a80710' }}>
                  <strong>{stats.today.cancelledFlightIntentCountToday}</strong> Aflyst
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="admin-section-title">Top flyvemeldinger i år</h2>
              <ul className="admin-activity-list">
                {stats.topFlightIntentUsersThisYear.length > 0 ? (
                  stats.topFlightIntentUsersThisYear.map((user, idx) => (
                    <li key={idx} className="admin-activity-item">
                      <span className="admin-activity-text">
                        <strong>{user.count}</strong> - {user.displayName}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="admin-activity-item">
                    <span className="admin-activity-text" style={{ color: '#8c8c8c' }}>Ingen flyvemeldinger i år.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
