import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import {
  AdminPageHeader,
  AdminPageSection,
  AdminStatTile,
  AdminStatTileGrid,
} from "../../../../components/admin/AdminPagePrimitives";
import { getAdminFlightIntentOverview } from "../../../../lib/admin/flightIntentAdminService";
import { cancelFlightIntentAsAdminAction } from "../../../../lib/admin/cancelFlightIntentAsAdminAction";
import { formatAdminDateTime, formatAdminDate, formatAdminTime } from "../../../../lib/format/adminDateFormat";

interface FlyvemeldingerPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    cancelled?: string;
  }>;
}

function ActivityTypeBadge({ value }: { value: string }) {
  return (
    <span className="admin-badge admin-badge-muted">
      {value}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") {
    return <span className="admin-badge admin-badge-success">Aktiv</span>;
  }

  if (status === "CANCELLED") {
    return <span className="admin-badge admin-badge-danger">Aflyst</span>;
  }

  return <span className="admin-badge admin-badge-muted">{status}</span>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <AdminPageSection>
      <p className="admin-muted" style={{ margin: 0 }}>
        {children}
      </p>
    </AdminPageSection>
  );
}

export default async function FlyvemeldingerPage({ params, searchParams }: FlyvemeldingerPageProps) {
  const { clubSlug } = await params;
  const { cancelled } = await searchParams;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/flyvemeldinger`);

  const { todayActive, todayCancelled, recent } = await getAdminFlightIntentOverview(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Flyvemeldinger"
        description="Overblik og moderation af dagens Jeg flyver-meldinger."
      />

      <div className="admin-page-content">
        {cancelled === "1" ? (
          <AdminPageSection>
            <span className="admin-badge admin-badge-success">
              Flyvemeldingen er aflyst.
            </span>
          </AdminPageSection>
        ) : null}

        <AdminStatTileGrid columns="four">
          <AdminStatTile label="Aktive i dag" value={todayActive.length} tone="green" />
          <AdminStatTile label="Aflyste i dag" value={todayCancelled.length} tone="rose" />
          <AdminStatTile label="Seneste 25" value={recent.length} tone="blue" />
          <AdminStatTile label="Moderation" value="Klar" tone="slate" />
        </AdminStatTileGrid>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className="admin-section-title">Aktive i dag</h2>
          {todayActive.length === 0 ? (
            <EmptyState>
              Der er ingen aktive flyvemeldinger for i dag.
            </EmptyState>
          ) : (
            <AdminPageSection className="admin-table-card">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Oprettet</th>
                      <th>Dato</th>
                      <th>Navn</th>
                      <th>Besked</th>
                      <th>Type</th>
                      <th>Tidspunkt</th>
                      <th>Handling</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayActive.map((item) => (
                      <tr key={item.id}>
                        <td>{formatAdminDateTime(item.createdAt)}</td>
                        <td>{formatAdminDate(item.flightDate)}</td>
                        <td>
                          <span className="admin-strong">{item.displayName}</span>
                        </td>
                        <td>{item.message || "—"}</td>
                        <td>
                          <ActivityTypeBadge value={item.activityType} />
                        </td>
                        <td>{formatAdminTime(item.plannedAt)}</td>
                        <td>
                          <form action={async () => {
                            "use server";
                            await cancelFlightIntentAsAdminAction(clubSlug, item.id);
                          }}>
                            <button
                              type="submit"
                              className="admin-btn admin-btn-danger"
                            >
                              Aflys
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminPageSection>
          )}
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className="admin-section-title">Aflyste i dag</h2>
          {todayCancelled.length === 0 ? (
            <EmptyState>
              Ingen aflyste meldinger i dag.
            </EmptyState>
          ) : (
            <AdminPageSection className="admin-table-card">
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Oprettet</th>
                      <th>Dato</th>
                      <th>Navn</th>
                      <th>Besked</th>
                      <th>Type</th>
                      <th>Tidspunkt</th>
                      <th>Aflyst kl.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayCancelled.map((item) => (
                      <tr key={item.id}>
                        <td>{formatAdminDateTime(item.createdAt)}</td>
                        <td>{formatAdminDate(item.flightDate)}</td>
                        <td>
                          <span className="admin-strong">{item.displayName}</span>
                        </td>
                        <td>{item.message || "—"}</td>
                        <td>
                          <ActivityTypeBadge value={item.activityType} />
                        </td>
                        <td>{formatAdminTime(item.plannedAt)}</td>
                        <td>{formatAdminDateTime(item.cancelledAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminPageSection>
          )}
        </section>

        <section>
          <h2 className="admin-section-title">Seneste meldinger</h2>
          <AdminPageSection className="admin-table-card">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Oprettet</th>
                    <th>Dato</th>
                    <th>Navn</th>
                    <th>Besked</th>
                    <th>Type</th>
                    <th>Tidspunkt</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <tr key={item.id}>
                      <td>{formatAdminDateTime(item.createdAt)}</td>
                      <td>{formatAdminDate(item.flightDate)}</td>
                      <td>
                        <span className="admin-strong">{item.displayName}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "block",
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.message || "—"}
                        </span>
                      </td>
                      <td>
                        <ActivityTypeBadge value={item.activityType} />
                      </td>
                      <td>{formatAdminTime(item.plannedAt)}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminPageSection>
        </section>
      </div>
    </AdminShell>
  );
}
