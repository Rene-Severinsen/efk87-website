import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
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

  // Guard: requires authenticated admin/owner with active membership
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
      <div className="admin-content-container">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Flyvemeldinger</h1>
          <p className="admin-page-subtitle">Overblik og moderation af dagens &ldquo;Jeg flyver&rdquo;-meldinger.</p>
        </div>

        {cancelled === "1" && (
          <div style={{
            backgroundColor: "#dcfce7",
            color: "#166534",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1.5rem",
            border: "1px solid #bbf7d0"
          }}>
            Flyvemeldingen er aflyst.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ padding: "1.25rem", backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Aktive i dag</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{todayActive.length}</div>
          </div>
          <div style={{ padding: "1.25rem", backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Aflyste i dag</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{todayCancelled.length}</div>
          </div>
          <div style={{ padding: "1.25rem", backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>Seneste 25</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{recent.length}</div>
          </div>
        </div>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Aktive i dag</h2>
          {todayActive.length === 0 ? (
            <p style={{ color: "#6b7280", backgroundColor: "white", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              Der er ingen aktive flyvemeldinger for i dag.
            </p>
          ) : (
            <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <tr>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Oprettet</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Dato</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Navn</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Besked</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Type</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Tidspunkt</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Handling</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: "1px solid #e5e7eb" }}>
                  {todayActive.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>{formatAdminTime(item.createdAt)}</td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem" }}>{formatAdminDate(item.flightDate)}</td>
                      <td style={{ padding: "1rem" }}>{item.displayName}</td>
                      <td style={{ padding: "1rem" }}>{item.message || "-"}</td>
                      <td style={{ padding: "1rem" }}><span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "9999px" }}>{item.activityType}</span></td>
                      <td style={{ padding: "1rem" }}>{formatAdminTime(item.plannedAt)}</td>
                      <td style={{ padding: "1rem" }}>
                        <form action={async () => {
                          "use server";
                          await cancelFlightIntentAsAdminAction(clubSlug, item.id);
                        }}>
                          <button 
                            type="submit"
                            style={{ 
                              color: "#dc2626", 
                              fontSize: "0.875rem", 
                              fontWeight: "500",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0
                            }}
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
          )}
        </section>

        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Aflyste i dag</h2>
          {todayCancelled.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Ingen aflyste meldinger i dag.</p>
          ) : (
            <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <tr>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Oprettet</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Dato</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Navn</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Besked</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Type</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Tidspunkt</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Aflyst kl.</th>
                  </tr>
                </thead>
                <tbody>
                  {todayCancelled.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                        {formatAdminTime(item.createdAt)}
                      </td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem" }}>{formatAdminDate(item.flightDate)}</td>
                      <td style={{ padding: "1rem" }}>{item.displayName}</td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>{item.message || "-"}</td>
                      <td style={{ padding: "1rem" }}><span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "9999px" }}>{item.activityType}</span></td>
                      <td style={{ padding: "1rem" }}>{formatAdminTime(item.plannedAt)}</td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                        {formatAdminDateTime(item.cancelledAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>Seneste meldinger</h2>
          <div style={{ backgroundColor: "white", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <tr>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Oprettet</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Dato</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Navn</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Besked</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Type</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Tidspunkt</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "500", color: "#374151" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#6b7280" }}>
                      {formatAdminDateTime(item.createdAt)}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>{formatAdminDate(item.flightDate)}</td>
                    <td style={{ padding: "1rem" }}>{item.displayName}</td>
                    <td style={{ padding: "1rem", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.message || "-"}</td>
                    <td style={{ padding: "1rem" }}><span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "#f3f4f6", borderRadius: "9999px" }}>{item.activityType}</span></td>
                    <td style={{ padding: "1rem" }}>{formatAdminTime(item.plannedAt)}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ 
                        fontSize: "0.75rem", 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "9999px",
                        backgroundColor: item.status === "ACTIVE" ? "#dcfce7" : item.status === "CANCELLED" ? "#fee2e2" : "#f3f4f6",
                        color: item.status === "ACTIVE" ? "#166534" : item.status === "CANCELLED" ? "#991b1b" : "#374151"
                      }}>
                        {item.status === "ACTIVE" ? "Aktiv" : item.status === "CANCELLED" ? "Aflyst" : item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
